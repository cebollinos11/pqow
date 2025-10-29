// ==================== VIEW: RENDERER ====================
// This file contains rendering methods that are mixed into the Game class

Game.prototype.renderEncounter = function() {
    const container = document.getElementById('encounterContainer');
    container.innerHTML = '';

    if (!this.state.currentEncounter) return;

    // Show wound distribution panel if pending
    if (this.state.pendingWounds !== null) {
        this.renderWoundDistribution(container);
        return;
    }

    // Always show encounter text
    const textDiv = document.createElement('div');
    textDiv.className = 'encounter-text';
    textDiv.textContent = this.state.currentEncounter.text;
    container.appendChild(textDiv);

    // Show selected option if one was chosen
    if (this.state.selectedOption) {
        const selectedDiv = document.createElement('div');
        selectedDiv.className = 'selected-option';
        selectedDiv.innerHTML = `<strong>➤ You chose:</strong> ${this.state.selectedOption}`;
        container.appendChild(selectedDiv);
    }

    // Show all completed dice rolls
    this.state.completedRolls.forEach(completedRoll => {
        this.renderCompletedDiceResult(container, completedRoll.skill, completedRoll.rollResult);
    });

    // Show current dice result panel if we're showing roll results
    if (this.state.showingRollResult && this.state.rollResult) {
        this.renderDiceResult(container);
        return;
    }

    // Only show options if no option has been selected yet and no pending roll
    if (!this.state.selectedOption && !this.state.pendingRoll) {
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'options-container';

        this.state.currentEncounter.options.forEach((option, idx) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = option.text;
            btn.addEventListener('click', () => {
                // Store the selected option
                this.state.selectedOption = option.text;
                // Re-render to show selected option and hide buttons
                this.renderEncounter();
                // Execute the action
                option.action(this);
            });
            optionsDiv.appendChild(btn);
        });

        container.appendChild(optionsDiv);
    }
};

Game.prototype.renderDiceResult = function(container) {
    const { roll, bonus, difficulty, result, outcome } = this.state.rollResult;
    const { skill } = this.state.pendingRoll;
    
    const outcomeText = {
        'GS': '✨ GREAT SUCCESS! ✨',
        'MS': '⚠️ Medium Success ⚠️',
        'BS': '❌ Bad Success ❌'
    };
    
    const panel = document.createElement('div');
    panel.className = 'dice-result-panel';
    panel.innerHTML = `
        <div class="dice-result-title">🎲 Dice Roll Result 🎲</div>
        ${skill ? `<div style="font-size: 1.1em; margin-bottom: 10px;">Skill Check: ${skill}</div>` : ''}
        <div class="dice-roll-display">🎲 ${roll}</div>
        <div class="dice-calculation">
            ${roll} (roll) ${bonus > 0 ? `+ ${bonus} (bonus)` : ''} - ${difficulty} (difficulty) = ${result}
        </div>
        <div class="dice-outcome ${outcome}">
            ${outcomeText[outcome]}
        </div>
        <button class="continue-btn" id="continueBtn">Continue →</button>
    `;
    
    container.appendChild(panel);
    
    // Add event listener to continue button
    document.getElementById('continueBtn').addEventListener('click', () => {
        this.continueAfterRoll();
    });
};

Game.prototype.renderCompletedDiceResult = function(container, skill, rollResult) {
    const { roll, bonus, difficulty, result, outcome } = rollResult;

    const outcomeText = {
        'GS': '✨ GREAT SUCCESS! ✨',
        'MS': '⚠️ Medium Success ⚠️',
        'BS': '❌ Bad Success ❌'
    };

    const panel = document.createElement('div');
    panel.className = 'dice-result-panel';
    panel.innerHTML = `
        <div class="dice-result-title">🎲 Dice Roll Result 🎲</div>
        ${skill ? `<div style="font-size: 1.1em; margin-bottom: 10px;">Skill Check: ${skill}</div>` : ''}
        <div class="dice-roll-display">🎲 ${roll}</div>
        <div class="dice-calculation">
            ${roll} (roll) ${bonus > 0 ? `+ ${bonus} (bonus)` : ''} - ${difficulty} (difficulty) = ${result}
        </div>
        <div class="dice-outcome ${outcome}">
            ${outcomeText[outcome]}
        </div>
    `;

    container.appendChild(panel);
};

Game.prototype.renderLuckPrompt = function() {
    const container = document.getElementById('encounterContainer');
    const prompt = document.createElement('div');
    prompt.className = 'luck-prompt';
    prompt.innerHTML = `
        <strong>🍀 Use a Luck Point?</strong>
        <p>You have ${this.state.player.luck} luck remaining. Using luck gives you +1 to your roll.</p>
        <button class="luck-btn" id="useLuckBtn">Use Luck (+1)</button>
        <button class="luck-btn" id="noLuckBtn">Don't Use Luck</button>
    `;
    container.appendChild(prompt);
    
    document.getElementById('useLuckBtn').addEventListener('click', () => this.executeRoll(true));
    document.getElementById('noLuckBtn').addEventListener('click', () => this.executeRoll(false));
};

Game.prototype.renderWoundDistribution = function(container) {
    const allCharacters = [
        { char: this.state.player, id: 'player', name: 'Player (You)' },
        ...this.state.companions.map((c, idx) => ({
            char: c,
            id: `companion-${idx}`,
            name: c.name
        }))
    ];

    const totalAssigned = Object.values(this.state.woundDistribution).reduce((a, b) => a + b, 0);
    const remaining = this.state.pendingWounds - totalAssigned;

    const panel = document.createElement('div');
    panel.className = 'wound-distribution-panel';
    panel.innerHTML = `
        <div class="wound-panel-title">💔 Distribute ${this.state.pendingWounds} Wound${this.state.pendingWounds > 1 ? 's' : ''}</div>
        <div class="wound-remaining">
            Wounds to distribute: <strong>${remaining}</strong>
        </div>
        <div class="wound-characters">
            ${allCharacters.map(({ char, id, name }) => {
                const assigned = this.state.woundDistribution[id] || 0;
                const currentWounds = char.wounds;
                const maxWounds = char.maxWounds;
                const availableSlots = maxWounds - currentWounds;

                // Create checkboxes for existing wounds (non-interactive)
                let existingWoundsHtml = '';
                for (let i = 0; i < currentWounds; i++) {
                    existingWoundsHtml += `<input type="checkbox" class="wound-checkbox" checked disabled title="Existing wound">`;
                }

                // Create checkboxes for assigned wounds (interactive)
                let assignedWoundsHtml = '';
                for (let i = 0; i < assigned; i++) {
                    assignedWoundsHtml += `<input type="checkbox" class="wound-checkbox assigned-wound" data-id="${id}" data-index="${i}" checked title="Assigned wound">`;
                }

                // Create checkboxes for available wounds (interactive)
                let availableWoundsHtml = '';
                for (let i = 0; i < availableSlots - assigned; i++) {
                    availableWoundsHtml += `<input type="checkbox" class="wound-checkbox available-wound" data-id="${id}" data-index="${assigned + i}" title="Click to assign wound">`;
                }

                return `
                    <div class="wound-character-card">
                        <div class="wound-character-name">${name}</div>
                        <div class="wound-character-health">
                            Current: ${currentWounds}/${maxWounds} | Assigning: ${assigned}
                        </div>
                        <div class="wound-checkboxes">
                            <div class="wound-checkbox-group">
                                ${existingWoundsHtml}${assignedWoundsHtml}${availableWoundsHtml}
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        <button class="wound-confirm-btn" id="confirmWounds" ${remaining !== 0 ? 'disabled' : ''}>
            ${remaining === 0 ? 'Confirm Distribution' : `Assign ${remaining} more wound${remaining !== 1 ? 's' : ''}`}
        </button>
    `;

    container.appendChild(panel);

    // Add event listeners for checkboxes
    document.querySelectorAll('.available-wound').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const id = e.target.getAttribute('data-id');
            const index = parseInt(e.target.getAttribute('data-index'));
            if (e.target.checked) {
                this.adjustWoundDistribution(id, 1);
            }
        });
    });

    document.querySelectorAll('.assigned-wound').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const id = e.target.getAttribute('data-id');
            if (!e.target.checked) {
                this.adjustWoundDistribution(id, -1);
            }
        });
    });

    const confirmBtn = document.getElementById('confirmWounds');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            this.confirmWoundDistribution();
        });
    }
};


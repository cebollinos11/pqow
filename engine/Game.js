// ==================== ENGINE: GAME ====================
class Game {
    constructor() {
        this.state = new GameState();
        this.encounterHistory = [];
        this.hexMap = null;
    }

    startGame() {
        // Initialize player
        this.state.player.addSkill('Combat Training');
        this.state.player.addSkill('Survival');
        this.state.player.addFood(3);
        this.state.player.addLuck(2);
        this.state.player.addCoins(50);

        // Hide start panel, show game panels
        document.getElementById('startPanel').style.display = 'none';
        document.getElementById('mapSection').style.display = 'block';
        document.getElementById('sidebar').style.display = 'block';
        document.getElementById('encounterPanel').style.display = 'block';
        document.getElementById('logSidebar').style.display = 'block';

        // Initialize hex map
        this.hexMap = new HexMap('mapContainer', 15, 10);
        this.hexMap.setMode('view');

        // Show sidebar buttons
        document.getElementById('shopBtn').style.display = 'block';
        document.getElementById('inventoryBtn').style.display = 'block';
        document.getElementById('debugBtn').style.display = 'block';
        document.getElementById('debugItemsBtn').style.display = 'block';
        document.getElementById('debugRandomItemBtn').style.display = 'block';
        document.getElementById('encounterBtn').style.display = 'block';
        document.getElementById('sequenceBtn').style.display = 'block';
        document.getElementById('woundsBtn').style.display = 'block';
        document.getElementById('toggleEncounterPanelBtn').style.display = 'block';
        document.getElementById('toggleLogPanelBtn').style.display = 'block';
        document.getElementById('toggleTTSBtn').style.display = 'block';

        this.state.addLog('🎮 Your adventure begins!', 'success');
        this.state.addLog('🐛 DEBUG: No encounter launched. Use the encounter button to start.', 'info');
        this.render();
    }
    
    nextEncounter() {
        // Check if we're in a sequence
        if (this.state.encounterSequence && this.state.encounterSequence.remaining > 0) {
            // Continue the sequence
            this.state.encounterSequence.remaining--;

            if (this.state.encounterSequence.remaining > 0) {
                // More encounters in sequence
                const tag = this.state.encounterSequence.tag;
                const completed = this.state.encounterSequence.total - this.state.encounterSequence.remaining;
                this.state.addLog(`🎯 Sequence: ${completed}/${this.state.encounterSequence.total} completed. Loading next ${tag} encounter...`, 'info');

                // Show retreat option if enabled and not in last 2 encounters
                if (this.state.encounterSequence.retreatable && this.state.encounterSequence.remaining > 2) {
                    this.showRetreatPrompt(tag);
                } else {
                    this.launchRandomEncounterByTag(tag);
                }
            } else {
                // Sequence complete
                this.state.addLog(`✅ Encounter sequence complete! (${this.state.encounterSequence.total} ${this.state.encounterSequence.tag} encounters)`, 'success');
                this.state.encounterSequence = null;
                this.state.currentEncounter = null;
                this.render();
            }
        } else {
            // Not in a sequence - DEBUG mode
            this.state.addLog('🐛 DEBUG: Encounter finished. Use the encounter button to launch a new one.', 'info');
            this.state.currentEncounter = null;
            this.render();
        }
    }

    showRetreatPrompt(tag) {
        // Show retreat option in encounter panel
        const container = document.getElementById('encounterContainer');
        if (container) {
            const promptDiv = document.createElement('div');
            promptDiv.className = 'retreat-prompt';
            promptDiv.innerHTML = `
                <div style="padding: 20px; background: linear-gradient(135deg, #3a2a1a 0%, #2a1a0a 100%); border: 2px solid #8b7355; border-radius: 5px; margin: 10px 0;">
                    <p style="color: #d4af37; font-weight: bold; margin-bottom: 15px;">Continue deeper or retreat to safety?</p>
                    <div style="display: flex; gap: 10px;">
                        <button id="continueSequenceBtn" class="option-btn" style="flex: 1;">⚔️ Continue</button>
                        <button id="retreatSequenceBtn" class="option-btn" style="flex: 1; background: linear-gradient(135deg, #8b4513 0%, #654321 100%);">🏃 Retreat</button>
                    </div>
                </div>
            `;
            container.appendChild(promptDiv);

            // Add event listeners
            document.getElementById('continueSequenceBtn').addEventListener('click', () => {
                promptDiv.remove();
                this.launchRandomEncounterByTag(tag);
            });

            document.getElementById('retreatSequenceBtn').addEventListener('click', () => {
                promptDiv.remove();
                this.retreatFromSequence();
            });

            // Auto-scroll to bottom
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 100);
        }
    }

    startEncounterSequence(tag, count, retreatable = false) {
        // Check if there are enough encounters with this tag
        const taggedEncounters = ENCOUNTERS.filter(e => e.tags && e.tags.includes(tag));

        if (taggedEncounters.length === 0) {
            this.state.addLog(`❌ No encounters found with tag: ${tag}`, 'danger');
            return;
        }

        // Initialize sequence
        this.state.encounterSequence = {
            tag: tag,
            remaining: count,
            total: count,
            retreatable: retreatable
        };

        const retreatMsg = retreatable ? ' (retreat available)' : '';
        this.state.addLog(`🎯 Starting encounter sequence: ${count} ${tag} encounters${retreatMsg}`, 'success');

        // Launch first encounter
        this.launchRandomEncounterByTag(tag);
    }

    retreatFromSequence() {
        if (this.state.encounterSequence) {
            const completed = this.state.encounterSequence.total - this.state.encounterSequence.remaining;
            this.state.addLog(`🏃 Retreated from sequence after ${completed} encounters!`, 'warning');
            this.state.encounterSequence = null;
            this.state.currentEncounter = null;
            this.render();
        }
    }

    addInventoryToParty(itemName, callback = null) {
        // Try to add to player first
        if (this.state.player.addToInventory(itemName)) {
            this.state.addLog(`📦 ${itemName} added to Player's inventory`, 'success');
            this.render();
            if (callback) callback();
            return true;
        }

        // Try to add to any companion with space
        for (let i = 0; i < this.state.companions.length; i++) {
            const companion = this.state.companions[i];
            if (companion.addToInventory(itemName)) {
                this.state.addLog(`📦 ${itemName} added to ${companion.name}'s inventory`, 'success');
                this.render();
                if (callback) callback();
                return true;
            }
        }

        // No space available - open inventory management with pending item
        this.state.addLog(`⚠️ No inventory space! Manage inventory to make room for ${itemName}`, 'warning');
        this.openInventoryForNewItem(itemName, callback);
        return false;
    }

    openInventoryForNewItem(itemName, callback) {
        this.pendingNewItem = itemName;
        this.newItemCallback = callback;
        document.getElementById('inventoryModal').style.display = 'block';
        this.renderInventoryManagementWithNewItem();
    }

    generateCityShopInventory() {
        // Get all item names
        const allItems = Object.keys(ITEMS);

        // Shuffle and pick 10 random items
        const shuffled = allItems.sort(() => Math.random() - 0.5);
        this.state.cityShopInventory = shuffled.slice(0, 10);

        this.state.addLog('🏪 The city shop has new inventory!', 'info');
    }

    closeInventoryWithNewItem() {
        // Clear trash when closing inventory
        if (this.inventoryTrash && this.inventoryTrash.length > 0) {
            this.state.addLog(`🗑️ ${this.inventoryTrash.length} item${this.inventoryTrash.length !== 1 ? 's' : ''} permanently deleted`, 'info');
            this.inventoryTrash = [];
        }

        // Try to add the pending item one more time
        if (this.pendingNewItem) {
            const itemName = this.pendingNewItem;
            this.pendingNewItem = null;

            // Try to add to any character with space
            const allChars = [this.state.player, ...this.state.companions];
            let added = false;

            for (const char of allChars) {
                if (char.addToInventory(itemName)) {
                    this.state.addLog(`📦 ${itemName} added to ${char.name}'s inventory`, 'success');
                    this.render();
                    added = true;
                    break;
                }
            }

            if (!added) {
                this.state.addLog(`❌ ${itemName} was lost - no inventory space!`, 'danger');
            }
        }

        document.getElementById('inventoryModal').style.display = 'none';

        // Execute callback if provided
        if (this.newItemCallback) {
            const callback = this.newItemCallback;
            this.newItemCallback = null;
            callback();
        }
    }

    launchRandomEncounterByTag(tag) {
        const taggedEncounters = ENCOUNTERS.filter(e => e.tags && e.tags.includes(tag));

        if (taggedEncounters.length === 0) {
            this.state.addLog(`❌ No encounters found with tag: ${tag}`, 'danger');
            this.state.encounterSequence = null;
            return;
        }

        // Pick a random encounter from the tagged ones
        const encounter = taggedEncounters[Math.floor(Math.random() * taggedEncounters.length)];
        this.loadEncounter(encounter);
    }
    
    loadEncounter(encounter) {
        this.encounterHistory.push(encounter.id);

        if (this.encounterHistory.length > 10) {
            this.encounterHistory.shift();
        }

        this.state.currentEncounter = encounter;
        this.state.selectedOption = null; // Clear selected option for new encounter
        this.state.completedRolls = []; // Clear completed rolls for new encounter

        // Speak the encounter text if TTS is enabled
        if (this.state.ttsEnabled) {
            this.state.speak(encounter.text);
        }

        this.render();
    }
    
    promptForLuck() {
        if (this.state.player.luck > 0 && this.state.pendingRoll) {
            this.renderLuckPrompt();
        } else {
            this.executeRoll(false);
        }
    }
    
    executeRoll(useLuck) {
        if (!this.state.pendingRoll) return;
        
        const { difficulty, skill, onResult } = this.state.pendingRoll;
        const rollResult = this.state.roll(difficulty, skill, useLuck);
        
        // Store the roll result and callback for later
        this.state.rollResult = rollResult;
        this.state.rollCallback = onResult;
        this.state.showingRollResult = true;
        
        // Show the dice result panel
        this.render();
    }
    
    continueAfterRoll() {
        if (!this.state.rollResult || !this.state.rollCallback) return;

        // Save the completed roll to history
        this.state.completedRolls.push({
            skill: this.state.pendingRoll.skill,
            rollResult: { ...this.state.rollResult }
        });

        // Save the callback and outcome before clearing state
        const callback = this.state.rollCallback;
        const outcome = this.state.rollResult.outcome;

        // Clear the roll state
        this.state.pendingRoll = null;
        this.state.rollResult = null;
        this.state.rollCallback = null;
        this.state.showingRollResult = false;

        // Remove only the continue button from the dice result panel
        const continueBtn = document.getElementById('continueBtn');
        if (continueBtn) {
            continueBtn.remove();
         }
        // Execute the callback with the outcome (this will add encounter info)
        callback(outcome);

        // Update stats and log (but not encounter - callback handles that)
        this.renderStats();
        this.renderLog();
    }
    
    checkGameOver() {
        if (this.state.player.isDead()) {
            this.state.addLog('💀 You have died! Game Over!', 'danger');
            alert('Game Over! You have died.');
            location.reload();
        }
    }
    
    distributeWounds(amount, messageOrCallback, typeOrCallback, callback) {
        // Handle different parameter combinations for backwards compatibility
        let message = null;
        let messageType = 'danger';
        let finalCallback = null;

        // Parse parameters based on types
        if (typeof messageOrCallback === 'string') {
            // New format: distributeWounds(amount, message, type, callback)
            message = messageOrCallback;
            if (typeof typeOrCallback === 'string') {
                messageType = typeOrCallback;
                finalCallback = callback;
            } else {
                // distributeWounds(amount, message, callback)
                finalCallback = typeOrCallback;
            }
        } else if (typeof messageOrCallback === 'function') {
            // Old format: distributeWounds(amount, callback)
            finalCallback = messageOrCallback;
        }

        // If message provided, show it with a "Take wounds" button
        if (message) {
            this.state.addEncounterInfo(message, messageType, () => {
                this.proceedWithWoundDistribution(amount, finalCallback);
            });
        } else {
            // No message, proceed directly
            this.proceedWithWoundDistribution(amount, finalCallback);
        }
    }

    proceedWithWoundDistribution(amount, finalCallback) {
        // If no companions, just apply to player directly
        if (this.state.companions.length === 0) {
            this.state.player.takeWounds(amount);
            this.renderStats(); // Only update stats, don't re-render encounter
            if (finalCallback) finalCallback();
            return;
        }

        // Store pending wounds and callback
        this.state.pendingWounds = amount;
        this.state.woundCallback = finalCallback;

        // Initialize distribution (no preassignment - all wounds unassigned)
        this.state.woundDistribution = { player: 0 };
        this.state.companions.forEach((c, idx) => {
            this.state.woundDistribution[`companion-${idx}`] = 0;
        });

        this.render();
    }
    
    adjustWoundDistribution(characterId, delta) {
        const char = characterId === 'player' 
            ? this.state.player 
            : this.state.companions[parseInt(characterId.split('-')[1])];
        
        const currentAssigned = this.state.woundDistribution[characterId] || 0;
        const newAssigned = currentAssigned + delta;
        
        // Check if character can handle the wounds
        if (delta > 0) {
            if (!char.canTakeWounds(newAssigned)) {
                return; // Can't add more wounds
            }
            
            // Check if we have wounds left to distribute
            const totalAssigned = Object.values(this.state.woundDistribution).reduce((a, b) => a + b, 0);
            if (totalAssigned >= this.state.pendingWounds) {
                return; // No more wounds to distribute
            }
        }
        
        if (newAssigned >= 0) {
            this.state.woundDistribution[characterId] = newAssigned;
            this.render();
        }
    }
    
    confirmWoundDistribution() {
        // Apply wounds to all characters
        const playerWounds = this.state.woundDistribution['player'] || 0;
        this.state.player.takeWounds(playerWounds);

        // Track which companions die
        const deadCompanionIndices = [];

        this.state.companions.forEach((companion, idx) => {
            const wounds = this.state.woundDistribution[`companion-${idx}`] || 0;
            companion.takeWounds(wounds);

            // Check if companion died
            if (companion.isDead()) {
                deadCompanionIndices.push(idx);
            }
        });

        // Log the distribution
        Object.entries(this.state.woundDistribution).forEach(([id, wounds]) => {
            if (wounds > 0) {
                const name = id === 'player'
                    ? 'Player'
                    : this.state.companions[parseInt(id.split('-')[1])].name;
                this.state.addLog(`${name} took ${wounds} wound${wounds > 1 ? 's' : ''}`, 'danger');
            }
        });

        // Move dead companions to deadCompanions array (in reverse order to maintain indices)
        deadCompanionIndices.reverse().forEach(idx => {
            const deadCompanion = this.state.companions.splice(idx, 1)[0];
            this.state.deadCompanions.push(deadCompanion);
            this.state.addLog(`💀 ${deadCompanion.name} has fallen...`, 'danger');
        });

        // Clear pending wounds
        const callback = this.state.woundCallback;
        this.state.pendingWounds = null;
        this.state.woundCallback = null;
        this.state.woundDistribution = {};

        // Update stats but don't re-render encounter (callback will handle that)
        this.renderStats();
        this.renderLog();

        // If any companions died, open inventory for looting
        if (deadCompanionIndices.length > 0) {
            // Track the indices of newly dead companions for looting
            const newlyDeadIndices = this.state.deadCompanions.slice(-deadCompanionIndices.length).map((_, i) =>
                this.state.deadCompanions.length - deadCompanionIndices.length + i
            );
            this.openInventoryForLooting(newlyDeadIndices, () => {
                // Execute callback after looting is done
                if (callback) {
                    callback();
                }
            });
        } else {
            // Execute callback if provided and no looting needed
            if (callback) {
                callback();
            }
        }
    }
    
    // Main render method
    render() {
        this.renderStats();
        this.renderEncounter();
        this.renderLog();
    }
    
    renderStats() {
        document.getElementById('wounds').textContent = `${this.state.player.wounds}/${this.state.player.maxWounds}`;
        document.getElementById('food').textContent = this.state.player.food;
        document.getElementById('luck').textContent = this.state.player.luck;
        document.getElementById('coins').textContent = this.state.player.coins;
        
        const skillsEl = document.getElementById('skills');
        skillsEl.innerHTML = this.state.player.skills.map(s => 
            `<span class="skill-tag">${s}</span>`
        ).join('') || '<span class="skill-tag empty-slot">No skills</span>';
        
        const invEl = document.getElementById('inventory');
        const invSlots = [...this.state.player.inventory];
        while (invSlots.length < this.state.player.maxInventory) {
            invSlots.push(null);
        }
        invEl.innerHTML = invSlots.map(i => 
            i ? `<span class="item-tag">${i}</span>` : '<span class="item-tag empty-slot">Empty</span>'
        ).join('');
        
        const compEl = document.getElementById('companions');
        compEl.innerHTML = this.state.companions.map((c, idx) => 
            `<span class="companion-tag" data-idx="${idx}">${c.name}</span>`
        ).join('') || '<span class="companion-tag empty-slot">No companions</span>';
        
        // Add event listeners for companion tags
        document.querySelectorAll('.companion-tag[data-idx]').forEach(tag => {
            tag.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-idx'));
                this.showCompanionDetails(idx);
            });
        });
    }
    
    showCompanionDetails(index) {
        const companion = this.state.companions[index];
        const detailsEl = document.getElementById('companionDetails');
        detailsEl.innerHTML = `
            <div class="companion-details">
                <strong>${companion.name}</strong><br>
                Wounds: ${companion.wounds}/${companion.maxWounds}<br>
                Skills: ${companion.skills.join(', ')}<br>
                Inventory: ${companion.inventory.join(', ') || 'Empty'}
            </div>
        `;
    }
    
    renderLog() {
        const logEl = document.getElementById('logContainer');
        logEl.innerHTML = this.state.log.slice(0, 10).map(entry => 
            `<div class="log-entry log-${entry.type}">${entry.message}</div>`
        ).join('');
    }
}


// ==================== MODEL: GAME STATE ====================
class GameState {
    constructor() {
        this.player = new Character('Player', 6, 6, 6);
        this.companions = [];
        this.deadCompanions = [];
        this.log = [];
        this.currentEncounter = null;
        this.selectedOption = null; // Track which option was selected
        this.completedRolls = []; // Track completed dice rolls for this encounter
        this.pendingRoll = null;
        this.showingRollResult = false;
        this.pendingWounds = null;
        this.woundDistribution = {};
        this.ttsEnabled = false; // Text-to-speech toggle

        // Encounter sequence tracking
        this.encounterSequence = null; // { tag: 'dungeon', remaining: 5, total: 5 }
    }
    
    addCompanion(companion) {
        this.companions.push(companion);
    }
    
    removeCompanion(companion) {
        const index = this.companions.indexOf(companion);
        if (index > -1) {
            this.companions.splice(index, 1);
        }
    }
    
    addLog(message, type = 'info') {
        this.log.unshift({ message, type, timestamp: Date.now() });
        if (this.log.length > 20) this.log.pop();
    }

    addEncounterInfo(message, type = 'info', callback = null) {
        // Add to log
        this.addLog(message, type);

        // Speak the message if TTS is enabled
        if (this.ttsEnabled) {
            this.speak(message);
        }

        // Add to encounter panel with continue button
        const container = document.getElementById('encounterContainer');
        if (container) {
            const infoDiv = document.createElement('div');
            infoDiv.className = `encounter-info encounter-info-${type}`;
            infoDiv.textContent = message;
            container.appendChild(infoDiv);

            // Add continue button
            const continueBtn = document.createElement('button');
            continueBtn.className = 'continue-btn';
            continueBtn.textContent = '▶ Continue';
            continueBtn.addEventListener('click', () => {
                // Remove the info and button
                infoDiv.remove();
                continueBtn.remove();

                // Execute callback if provided
                if (callback) {
                    callback();
                }
            });
            container.appendChild(continueBtn);

            // Scroll to bottom after adding content
            const panelContent = document.getElementById('encounterPanelContent');
            if (panelContent) {
                setTimeout(() => {
                    panelContent.scrollTop = panelContent.scrollHeight;
                }, 0);
            }
        } else if (callback) {
            // If no container, just execute callback immediately
            callback();
        }
    }

    speak(text) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Create utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Speak
        window.speechSynthesis.speak(utterance);
    }
    
    roll(difficulty, skill = null, useLuck = false) {
        const d20 = Math.floor(Math.random() * 20) + 1;
        let bonus = 0;
        
        if (skill && this.player.hasSkill(skill)) {
            bonus += 1;
        }
        
        if (useLuck && this.player.useLuck()) {
            bonus += 1;
        }
        
        const result = d20 + bonus - difficulty;
        
        let outcome;
        if (result >= 0) {
            outcome = 'GS';
        } else if (result >= -5) {
            outcome = 'MS';
        } else {
            outcome = 'BS';
        }
        
        this.addLog(`🎲 Rolled ${d20} + ${bonus} - ${difficulty} = ${result} (${outcome})`, 
            outcome === 'GS' ? 'success' : outcome === 'MS' ? 'warning' : 'danger');
        
        return { roll: d20, bonus, difficulty, result, outcome };
    }
}


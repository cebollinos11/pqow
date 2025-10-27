// ==================== MODEL: GAME STATE ====================
class GameState {
    constructor() {
        this.player = new Character('Player', 6, 6, 6);
        this.companions = [];
        this.deadCompanions = [];
        this.log = [];
        this.currentEncounter = null;
        this.pendingRoll = null;
        this.showingRollResult = false;
        this.pendingWounds = null;
        this.woundDistribution = {};
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


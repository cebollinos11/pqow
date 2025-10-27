// ==================== MODEL: CHARACTER ====================
class Character {
    constructor(name = 'Player', maxWounds = 6, maxInventory = 6, maxSkills = 6) {
        this.name = name;
        this.wounds = 0;
        this.maxWounds = maxWounds;
        this.food = 0;
        this.luck = 0;
        this.coins = 0;
        this.skills = [];
        this.maxSkills = maxSkills;
        this.inventory = [];
        this.maxInventory = maxInventory;
    }
    
    takeWounds(amount) {
        this.wounds = Math.min(this.wounds + amount, this.maxWounds);
        return this.wounds >= this.maxWounds;
    }
    
    canTakeWounds(amount) {
        return (this.wounds + amount) <= this.maxWounds;
    }
    
    getRemainingWounds() {
        return this.maxWounds - this.wounds;
    }
    
    healWounds(amount) {
        this.wounds = Math.max(0, this.wounds - amount);
    }
    
    addFood(amount) {
        this.food += amount;
    }
    
    removeFood(amount) {
        this.food = Math.max(0, this.food - amount);
        return this.food;
    }
    
    addLuck(amount) {
        this.luck += amount;
    }
    
    useLuck() {
        if (this.luck > 0) {
            this.luck--;
            return true;
        }
        return false;
    }
    
    addCoins(amount) {
        this.coins += amount;
    }
    
    removeCoins(amount) {
        if (this.coins >= amount) {
            this.coins -= amount;
            return true;
        }
        return false;
    }
    
    addSkill(skill) {
        if (this.skills.length < this.maxSkills && !this.skills.includes(skill)) {
            this.skills.push(skill);
            return true;
        }
        return false;
    }
    
    hasSkill(skill) {
        return this.skills.includes(skill);
    }
    
    addToInventory(item) {
        if (this.inventory.length < this.maxInventory) {
            this.inventory.push(item);
            return true;
        }
        return false;
    }
    
    removeFromInventory(item) {
        const index = this.inventory.indexOf(item);
        if (index > -1) {
            this.inventory.splice(index, 1);
            return true;
        }
        return false;
    }
    
    hasItem(item) {
        return this.inventory.includes(item);
    }
    
    isDead() {
        return this.wounds >= this.maxWounds;
    }
}


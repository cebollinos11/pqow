// ==================== MODEL: ENCOUNTER ====================
class Encounter {
    constructor(id, text, options, tags = []) {
        this.id = id;
        this.text = text;
        this.options = options;
        this.tags = tags; // Array of tags like ['swamp', 'city', 'plains', 'dungeon']
    }
}

class EncounterOption {
    constructor(text, action, cost = null) {
        this.text = text;
        this.action = action;
        this.cost = cost; // { type: 'coins'|'food'|'item', amount: number, item: 'itemName' }
    }

    canAfford(game) {
        if (!this.cost) return true;

        const player = game.state.player;

        switch (this.cost.type) {
            case 'coins':
                return player.coins >= this.cost.amount;
            case 'food':
                return player.food >= this.cost.amount;
            case 'item':
                return player.inventory.includes(this.cost.item);
            default:
                return true;
        }
    }

    payCost(game) {
        if (!this.cost) return true;

        const player = game.state.player;

        switch (this.cost.type) {
            case 'coins':
                if (player.coins >= this.cost.amount) {
                    player.coins -= this.cost.amount;
                    return true;
                }
                return false;
            case 'food':
                if (player.food >= this.cost.amount) {
                    player.food -= this.cost.amount;
                    return true;
                }
                return false;
            case 'item':
                const itemIndex = player.inventory.indexOf(this.cost.item);
                if (itemIndex !== -1) {
                    player.inventory.splice(itemIndex, 1);
                    return true;
                }
                return false;
            default:
                return true;
        }
    }

    getCostText() {
        if (!this.cost) return '';

        switch (this.cost.type) {
            case 'coins':
                return ` (💰 ${this.cost.amount} coins)`;
            case 'food':
                return ` (🍞 ${this.cost.amount} food)`;
            case 'item':
                return ` (📦 ${this.cost.item})`;
            default:
                return '';
        }
    }
}


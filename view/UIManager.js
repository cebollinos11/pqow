// ==================== VIEW: UI MANAGER ====================
// This file contains UI management methods that are mixed into the Game class

// Shop methods
Game.prototype.openShop = function() {
    document.getElementById('shopModal').style.display = 'block';
    this.renderShop('buy');
};

Game.prototype.closeShop = function() {
    document.getElementById('shopModal').style.display = 'none';
};

Game.prototype.renderShop = function(tab) {
    const content = document.getElementById('shopContent');
    
    if (tab === 'buy') {
        const availableItems = Object.entries(ITEMS).filter(([name]) => 
            !this.state.player.inventory.includes(name) || 
            ['Health Potion', 'Rations', 'Bandages', 'Healing Water'].includes(name)
        );
        
        content.innerHTML = `
            <div class="shop-items">
                ${availableItems.map(([name, item]) => `
                    <div class="shop-item">
                        <div class="shop-item-name">${name}</div>
                        <div class="shop-item-desc">${item.description}</div>
                        <div class="shop-item-price">💰 ${item.value} coins</div>
                        <button class="shop-item-btn buy-btn" data-item="${name}" data-price="${item.value}"
                            ${this.state.player.coins < item.value || this.state.player.inventory.length >= this.state.player.maxInventory ? 'disabled' : ''}>
                            Buy
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
        
        document.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemName = e.target.getAttribute('data-item');
                const price = parseInt(e.target.getAttribute('data-price'));
                this.buyItem(itemName, price);
            });
        });
    } else {
        content.innerHTML = `
            <div class="shop-items">
                ${this.state.player.inventory.map(itemName => {
                    const item = ITEMS[itemName];
                    const sellPrice = Math.floor(item.value * 0.6);
                    return `
                        <div class="shop-item">
                            <div class="shop-item-name">${itemName}</div>
                            <div class="shop-item-desc">${item.description}</div>
                            <div class="shop-item-price">💰 ${sellPrice} coins</div>
                            <button class="shop-item-btn sell-btn" data-item="${itemName}" data-price="${sellPrice}">
                                Sell
                            </button>
                        </div>
                    `;
                }).join('') || '<p style="text-align: center; padding: 20px;">No items to sell</p>'}
            </div>
        `;
        
        document.querySelectorAll('.sell-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemName = e.target.getAttribute('data-item');
                const price = parseInt(e.target.getAttribute('data-price'));
                this.sellItem(itemName, price);
            });
        });
    }
};

Game.prototype.buyItem = function(itemName, price) {
    if (this.state.player.coins >= price) {
        if (this.state.player.addToInventory(itemName)) {
            this.state.player.removeCoins(price);
            this.state.addLog(`Bought ${itemName} for ${price} coins.`, 'success');
            this.render();
            this.renderShop('buy');
        } else {
            this.state.addLog('Inventory is full!', 'danger');
        }
    } else {
        this.state.addLog('Not enough coins!', 'danger');
    }
};

Game.prototype.sellItem = function(itemName, price) {
    if (this.state.player.removeFromInventory(itemName)) {
        this.state.player.addCoins(price);
        this.state.addLog(`Sold ${itemName} for ${price} coins.`, 'success');
        this.render();
        this.renderShop('sell');
    }
};

// Inventory management methods
Game.prototype.openInventory = function() {
    document.getElementById('inventoryModal').style.display = 'block';
    this.renderInventoryManagement();
};

Game.prototype.closeInventory = function() {
    document.getElementById('inventoryModal').style.display = 'none';
};

Game.prototype.renderInventoryManagement = function() {
    const content = document.getElementById('inventoryContent');
    
    // Create a list of all characters (player + companions)
    const allCharacters = [
        { char: this.state.player, name: 'Player', isPlayer: true },
        ...this.state.companions.map((c, idx) => ({ char: c, name: c.name, idx, isPlayer: false }))
    ];
    
    content.innerHTML = `
        <div class="inventory-grid">
            ${allCharacters.map((charData) => {
                const { char, name, isPlayer } = charData;
                return `
                    <div class="character-inventory ${isPlayer ? 'player' : ''}">
                        <h3>${isPlayer ? '👤 ' : '🤝 '}${name}</h3>
                        <div style="font-size: 0.9em; color: #666; margin-bottom: 10px;">
                            Slots: ${char.inventory.length}/${char.maxInventory}
                        </div>
                        <div class="inventory-items" id="inv-${isPlayer ? 'player' : charData.idx}">
                            ${char.inventory.length === 0 ? 
                                '<div class="empty-inventory">No items</div>' :
                                char.inventory.map((item, itemIdx) => `
                                    <div class="inventory-item-row">
                                        <span class="inventory-item-name">${item}</span>
                                        <div>
                                            ${allCharacters.filter(other => 
                                                (isPlayer ? !other.isPlayer : other.isPlayer || other.idx !== charData.idx)
                                            ).map(targetChar => {
                                                const targetId = targetChar.isPlayer ? 'player' : targetChar.idx;
                                                const targetName = targetChar.isPlayer ? 'Player' : targetChar.name;
                                                const canTransfer = targetChar.char.inventory.length < targetChar.char.maxInventory;
                                                return `
                                                    <button 
                                                        class="transfer-btn" 
                                                        data-from="${isPlayer ? 'player' : charData.idx}"
                                                        data-to="${targetId}"
                                                        data-item="${item}"
                                                        ${!canTransfer ? 'disabled' : ''}
                                                        title="Transfer to ${targetName}">
                                                        → ${targetChar.isPlayer ? '👤' : targetChar.name.substring(0, 2)}
                                                    </button>
                                                `;
                                            }).join('')}
                                        </div>
                                    </div>
                                `).join('')
                            }
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    // Add event listeners to all transfer buttons
    document.querySelectorAll('.transfer-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const fromId = e.target.getAttribute('data-from');
            const toId = e.target.getAttribute('data-to');
            const item = e.target.getAttribute('data-item');
            this.transferItem(fromId, toId, item);
        });
    });
};

Game.prototype.transferItem = function(fromId, toId, itemName) {
    let fromChar, toChar;
    
    // Get source character
    if (fromId === 'player') {
        fromChar = this.state.player;
    } else {
        fromChar = this.state.companions[parseInt(fromId)];
    }
    
    // Get destination character
    if (toId === 'player') {
        toChar = this.state.player;
    } else {
        toChar = this.state.companions[parseInt(toId)];
    }
    
    // Check if destination has space
    if (toChar.inventory.length >= toChar.maxInventory) {
        this.state.addLog(`${toChar.name}'s inventory is full!`, 'danger');
        return;
    }
    
    // Transfer the item
    if (fromChar.removeFromInventory(itemName)) {
        if (toChar.addToInventory(itemName)) {
            this.state.addLog(`Transferred ${itemName} from ${fromChar.name} to ${toChar.name}`, 'success');
            this.render();
            this.renderInventoryManagement();
        } else {
            // Rollback if add fails
            fromChar.addToInventory(itemName);
            this.state.addLog(`Failed to transfer ${itemName}`, 'danger');
        }
    }
};

// Debug methods
Game.prototype.debugAddCompanion = function() {
    const companionNames = [
        'Brave Knight', 'Wise Mage', 'Swift Rogue', 'Holy Cleric',
        'Fierce Warrior', 'Cunning Thief', 'Noble Paladin', 'Wild Ranger',
        'Mysterious Assassin', 'Friendly Bard', 'Ancient Druid', 'Battle Monk'
    ];
    
    const randomName = companionNames[Math.floor(Math.random() * companionNames.length)];
    const companion = new Character(randomName, 3, 3, 1);
    
    const randomSkill = SKILLS[Math.floor(Math.random() * SKILLS.length)];
    companion.addSkill(randomSkill);
    
    this.state.addCompanion(companion);
    this.state.addLog(`${randomName} with ${randomSkill} skill has joined your party!`, 'success');
    this.render();
};

// Encounter selector methods
Game.prototype.openEncounterSelector = function() {
    document.getElementById('encounterModal').style.display = 'block';
    this.renderEncounterSelector();
};

Game.prototype.closeEncounterSelector = function() {
    document.getElementById('encounterModal').style.display = 'none';
};

Game.prototype.renderEncounterSelector = function() {
    const content = document.getElementById('encounterContent');
    
    content.innerHTML = `
        <div class="encounter-list">
            ${ENCOUNTERS.map((encounter, idx) => `
                <div class="encounter-list-item" data-encounter-id="${encounter.id}">
                    <div class="encounter-list-title">
                        ${encounter.id.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                    </div>
                    <div class="encounter-list-preview">
                        ${encounter.text.substring(0, 100)}${encounter.text.length > 100 ? '...' : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Add click listeners
    document.querySelectorAll('.encounter-list-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const encounterId = e.currentTarget.getAttribute('data-encounter-id');
            this.launchSpecificEncounter(encounterId);
        });
    });
};

Game.prototype.launchSpecificEncounter = function(encounterId) {
    const encounter = ENCOUNTERS.find(e => e.id === encounterId);
    if (encounter) {
        this.closeEncounterSelector();
        this.state.addLog(`🎭 Launching encounter: ${encounterId}`, 'info');
        this.loadEncounter(encounter);
    }
};


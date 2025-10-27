// ==================== VIEW: UI MANAGER ====================
// This file contains UI management methods that are mixed into the Game class

// Wounds Testing methods
Game.prototype.testWounds = function(amount = 3) {
    this.state.addLog(`🧪 Testing wound distribution with ${amount} wounds...`, 'info');
    this.distributeWounds(amount, () => {
        this.state.addLog(`✅ Wound distribution test complete!`, 'success');
    });
};

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
    // Clear trash when closing inventory
    if (this.inventoryTrash && this.inventoryTrash.length > 0) {
        this.state.addLog(`🗑️ ${this.inventoryTrash.length} item${this.inventoryTrash.length !== 1 ? 's' : ''} permanently deleted`, 'info');
        this.inventoryTrash = [];
    }
    document.getElementById('inventoryModal').style.display = 'none';
};

Game.prototype.renderInventoryManagement = function() {
    const content = document.getElementById('inventoryContent');

    // Create a list of all characters (player + companions)
    const allCharacters = [
        { char: this.state.player, name: 'Player', isPlayer: true },
        ...this.state.companions.map((c, idx) => ({ char: c, name: c.name, idx, isPlayer: false }))
    ];

    // Initialize trash if it doesn't exist
    if (!this.inventoryTrash) {
        this.inventoryTrash = [];
    }

    const trashCount = this.inventoryTrash.length;

    content.innerHTML = `
        <div class="inventory-grid">
            ${allCharacters.map((charData) => {
                const { char, name, isPlayer } = charData;
                const slotUsage = char.inventory.length;
                const maxSlots = char.maxInventory;
                const slotPercentage = (slotUsage / maxSlots) * 100;

                return `
                    <div class="character-inventory ${isPlayer ? 'player' : ''}">
                        <div class="character-header">
                            <h3>${isPlayer ? '👤 ' : '🤝 '}${name}</h3>
                            <div class="character-stats-mini">
                                <span title="Wounds">💔 ${char.wounds}/${char.maxWounds}</span>
                                <span title="Food">🍖 ${char.food}</span>
                                <span title="Luck">✨ ${char.luck}</span>
                            </div>
                        </div>

                        <div class="inventory-slot-bar">
                            <div class="slot-usage" style="width: ${slotPercentage}%"></div>
                        </div>
                        <div class="slot-info">${slotUsage}/${maxSlots} slots</div>

                        <div class="inventory-items" id="inv-${isPlayer ? 'player' : charData.idx}">
                            ${char.inventory.length === 0 ?
                                '<div class="empty-inventory">📭 No items</div>' :
                                char.inventory.map((item) => {
                                    const itemData = ITEMS[item];
                                    return `
                                        <div class="inventory-item-row">
                                            <div class="item-info">
                                                <span class="inventory-item-name">${item}</span>
                                                <span class="item-description">${itemData ? itemData.description : ''}</span>
                                            </div>
                                            <div class="transfer-buttons">
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
                                                            ${targetChar.isPlayer ? '👤' : '🤝'} ${targetName}
                                                        </button>
                                                    `;
                                                }).join('')}
                                                <button
                                                    class="transfer-btn trash-btn"
                                                    data-from="${isPlayer ? 'player' : charData.idx}"
                                                    data-to="trash"
                                                    data-item="${item}"
                                                    title="Delete item">
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </div>
                                    `;
                                }).join('')
                            }
                        </div>
                    </div>
                `;
            }).join('')}

            <!-- Trash/Delete Bin -->
            <div class="character-inventory trash-inventory">
                <div class="character-header">
                    <h3>🗑️ Delete Items</h3>
                    <div class="character-stats-mini">
                        <span title="Items to delete">${trashCount} item${trashCount !== 1 ? 's' : ''}</span>
                    </div>
                </div>

                <div class="inventory-items" id="inv-trash">
                    ${trashCount === 0 ?
                        '<div class="empty-inventory">📭 No items marked for deletion</div>' :
                        this.inventoryTrash.map((item) => {
                            const itemData = ITEMS[item];
                            return `
                                <div class="inventory-item-row">
                                    <div class="item-info">
                                        <span class="inventory-item-name">${item}</span>
                                        <span class="item-description">${itemData ? itemData.description : ''}</span>
                                    </div>
                                    <div class="transfer-buttons">
                                        ${allCharacters.map(targetChar => {
                                            const targetId = targetChar.isPlayer ? 'player' : targetChar.idx;
                                            const targetName = targetChar.isPlayer ? 'Player' : targetChar.name;
                                            const canTransfer = targetChar.char.inventory.length < targetChar.char.maxInventory;
                                            return `
                                                <button
                                                    class="transfer-btn restore-btn"
                                                    data-from="trash"
                                                    data-to="${targetId}"
                                                    data-item="${item}"
                                                    ${!canTransfer ? 'disabled' : ''}
                                                    title="Restore to ${targetName}">
                                                    ↩️ ${targetName}
                                                </button>
                                            `;
                                        }).join('')}
                                    </div>
                                </div>
                            `;
                        }).join('')
                    }
                </div>
            </div>
        </div>
    `;

    // Add event listeners to all transfer buttons
    document.querySelectorAll('.transfer-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const fromId = e.target.getAttribute('data-from');
            const toId = e.target.getAttribute('data-to');
            const item = e.target.getAttribute('data-item');

            if (toId === 'trash') {
                this.deleteItem(fromId, item);
            } else if (fromId === 'trash') {
                this.restoreItem(toId, item);
            } else {
                this.transferItem(fromId, toId, item);
            }
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

Game.prototype.deleteItem = function(fromId, itemName) {
    let fromChar;

    // Get source character
    if (fromId === 'player') {
        fromChar = this.state.player;
    } else {
        fromChar = this.state.companions[parseInt(fromId)];
    }

    // Remove from character inventory
    if (fromChar.removeFromInventory(itemName)) {
        // Add to trash
        if (!this.inventoryTrash) {
            this.inventoryTrash = [];
        }
        this.inventoryTrash.push(itemName);
        this.state.addLog(`${itemName} marked for deletion`, 'info');
        this.render();
        this.renderInventoryManagement();
    }
};

Game.prototype.restoreItem = function(toId, itemName) {
    let toChar;

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

    // Remove from trash
    const trashIndex = this.inventoryTrash.indexOf(itemName);
    if (trashIndex > -1) {
        this.inventoryTrash.splice(trashIndex, 1);

        // Add to character inventory
        if (toChar.addToInventory(itemName)) {
            this.state.addLog(`Restored ${itemName} to ${toChar.name}`, 'success');
            this.render();
            this.renderInventoryManagement();
        } else {
            // Rollback if add fails
            this.inventoryTrash.push(itemName);
            this.state.addLog(`Failed to restore ${itemName}`, 'danger');
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


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
    this.renderInventoryManagement(false); // false = don't show corpses
};

Game.prototype.openInventoryForLooting = function(newlyDeadIndices, callback) {
    this.lootingCallback = callback;
    this.lootingCorpseIndices = newlyDeadIndices; // Track which corpses to show
    document.getElementById('inventoryModal').style.display = 'block';
    this.renderInventoryManagement(true); // true = show corpses
};

Game.prototype.closeInventory = function() {
    // Clear trash when closing inventory
    if (this.inventoryTrash && this.inventoryTrash.length > 0) {
        this.state.addLog(`🗑️ ${this.inventoryTrash.length} item${this.inventoryTrash.length !== 1 ? 's' : ''} permanently deleted`, 'info');
        this.inventoryTrash = [];
    }
    document.getElementById('inventoryModal').style.display = 'none';

    // Clear looting state
    this.lootingCorpseIndices = null;

    // If there was a looting callback, execute it
    if (this.lootingCallback) {
        const callback = this.lootingCallback;
        this.lootingCallback = null;
        callback();
    }
};

Game.prototype.renderInventoryManagement = function(showCorpses = false) {
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

    // Debug: Log if there are dead companions
    if (this.state.deadCompanions && this.state.deadCompanions.length > 0) {
        console.log('Dead companions found:', this.state.deadCompanions.length, 'Show corpses:', showCorpses);
    }

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

            <!-- Dead Companions' Corpses -->
            ${(() => {
                if (!showCorpses || !this.state.deadCompanions || this.state.deadCompanions.length === 0) {
                    return '';
                }
                // Only show corpses that are being looted (newly dead)
                const corpsesToShow = this.lootingCorpseIndices ?
                    this.lootingCorpseIndices :
                    this.state.deadCompanions.map((_, i) => i);

                return corpsesToShow.map((corpseIdx) => {
                    const corpse = this.state.deadCompanions[corpseIdx];
                    const corpseItemCount = corpse.inventory.length;
                    const itemsHtml = corpseItemCount === 0 ?
                        '<div class="empty-inventory">📭 No items to loot</div>' :
                        corpse.inventory.map((item) => {
                            const itemData = ITEMS[item];
                            const buttonsHtml = allCharacters.map(targetChar => {
                                const targetId = targetChar.isPlayer ? 'player' : targetChar.idx;
                                const targetName = targetChar.isPlayer ? 'Player' : targetChar.name;
                                const canTransfer = targetChar.char.inventory.length < targetChar.char.maxInventory;
                                return `
                                    <button
                                        class="transfer-btn loot-btn"
                                        data-from="corpse-${corpseIdx}"
                                        data-to="${targetId}"
                                        data-item="${item}"
                                        ${!canTransfer ? 'disabled' : ''}
                                        title="Loot to ${targetName}">
                                        🪦 ${targetName}
                                    </button>
                                `;
                            }).join('');
                            return `
                                <div class="inventory-item-row">
                                    <div class="item-info">
                                        <span class="inventory-item-name">${item}</span>
                                        <span class="item-description">${itemData ? itemData.description : ''}</span>
                                    </div>
                                    <div class="transfer-buttons">
                                        ${buttonsHtml}
                                    </div>
                                </div>
                            `;
                        }).join('');
                    return `
                        <div class="character-inventory corpse-inventory">
                            <div class="character-header">
                                <h3>💀 ${corpse.name}'s Corpse</h3>
                                <div class="character-stats-mini">
                                    <span title="Items">${corpseItemCount} item${corpseItemCount !== 1 ? 's' : ''}</span>
                                </div>
                            </div>
                            <div class="inventory-items" id="inv-corpse-${corpseIdx}">
                                ${itemsHtml}
                            </div>
                        </div>
                    `;
                }).join('');
            })()}
        </div>
    `;

    // Add event listeners to all transfer buttons
    document.querySelectorAll('.transfer-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const fromId = e.target.getAttribute('data-from');
            const toId = e.target.getAttribute('data-to');
            const item = e.target.getAttribute('data-item');

            console.log('Transfer button clicked:', { fromId, toId, item });

            if (toId === 'trash') {
                this.deleteItem(fromId, item);
            } else if (fromId === 'trash') {
                this.restoreItem(toId, item);
            } else if (fromId && fromId.startsWith('corpse-')) {
                console.log('Looting from corpse:', fromId);
                this.lootCorpse(fromId, toId, item);
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
            // Keep showing corpses if we're in looting mode
            const showCorpses = this.lootingCorpseIndices !== null && this.lootingCorpseIndices !== undefined;
            this.renderInventoryManagement(showCorpses);
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
        // Keep showing corpses if we're in looting mode
        const showCorpses = this.lootingCorpseIndices !== null && this.lootingCorpseIndices !== undefined;
        this.renderInventoryManagement(showCorpses);
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
            // Keep showing corpses if we're in looting mode
            const showCorpses = this.lootingCorpseIndices !== null && this.lootingCorpseIndices !== undefined;
            this.renderInventoryManagement(showCorpses);
        } else {
            // Rollback if add fails
            this.inventoryTrash.push(itemName);
            this.state.addLog(`Failed to restore ${itemName}`, 'danger');
        }
    }
};

Game.prototype.lootCorpse = function(fromId, toId, itemName) {
    // Extract corpse index from "corpse-X" format
    const corpseIdx = parseInt(fromId.split('-')[1]);
    const corpse = this.state.deadCompanions[corpseIdx];

    if (!corpse) {
        this.state.addLog(`Corpse not found!`, 'danger');
        return;
    }

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

    // Remove from corpse inventory
    if (corpse.removeFromInventory(itemName)) {
        // Add to character inventory
        if (toChar.addToInventory(itemName)) {
            this.state.addLog(`🪦 Looted ${itemName} from ${corpse.name}'s corpse to ${toChar.name}`, 'success');
            this.render();
            // Keep showing corpses while looting
            this.renderInventoryManagement(true);
        } else {
            // Rollback if add fails
            corpse.addToInventory(itemName);
            this.state.addLog(`Failed to loot ${itemName}`, 'danger');
        }
    }
};

Game.prototype.renderInventoryManagementWithNewItem = function() {
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
    const pendingItem = this.pendingNewItem;
    const itemData = ITEMS[pendingItem];

    content.innerHTML = `
        <div style="background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); padding: 15px; margin-bottom: 20px; border-radius: 5px; border: 2px solid #e65100;">
            <h3 style="margin: 0 0 10px 0; color: #fff;">📦 New Item Found!</h3>
            <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 3px;">
                <div style="font-size: 1.2em; font-weight: bold; color: #d4af37; margin-bottom: 5px;">${pendingItem}</div>
                <div style="color: #ccc; font-size: 0.9em;">${itemData ? itemData.description : ''}</div>
            </div>
            <p style="margin: 10px 0 0 0; color: #fff; font-size: 0.9em;">⚠️ Make room in someone's inventory or delete items to make space!</p>
        </div>

        <div class="inventory-grid">
            ${allCharacters.map((charData) => {
                const { char, name, isPlayer } = charData;
                const slotUsage = char.inventory.length;
                const maxSlots = char.maxInventory;
                const slotPercentage = (slotUsage / maxSlots) * 100;
                const hasSpace = slotUsage < maxSlots;

                return `
                    <div class="character-inventory ${isPlayer ? 'player' : ''} ${hasSpace ? 'has-space' : ''}">
                        <div class="character-header">
                            <h3>${isPlayer ? '👤 ' : '🤝 '}${name} ${hasSpace ? '✅' : '❌'}</h3>
                            <div class="character-stats-mini">
                                <span title="Wounds">💔 ${char.wounds}/${char.maxWounds}</span>
                                <span title="Food">🍖 ${char.food}</span>
                                <span title="Luck">✨ ${char.luck}</span>
                            </div>
                        </div>

                        <div class="inventory-slot-bar">
                            <div class="slot-usage" style="width: ${slotPercentage}%"></div>
                        </div>
                        <div class="slot-info">${slotUsage}/${maxSlots} slots ${hasSpace ? '(has space)' : '(full)'}</div>

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
                                                    class="delete-btn"
                                                    data-from="${isPlayer ? 'player' : charData.idx}"
                                                    data-item="${item}"
                                                    title="Delete item">
                                                    🗑️
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

            ${trashCount > 0 ? `
                <div class="character-inventory trash-inventory">
                    <div class="character-header">
                        <h3>🗑️ Trash (${trashCount})</h3>
                    </div>
                    <div class="inventory-items" id="inv-trash">
                        ${this.inventoryTrash.map((item) => {
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
                                            const canRestore = targetChar.char.inventory.length < targetChar.char.maxInventory;
                                            return `
                                                <button
                                                    class="restore-btn"
                                                    data-to="${targetId}"
                                                    data-item="${item}"
                                                    ${!canRestore ? 'disabled' : ''}
                                                    title="Restore to ${targetName}">
                                                    ↩️ ${targetName}
                                                </button>
                                            `;
                                        }).join('')}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;

    // Add event listeners for transfer buttons
    document.querySelectorAll('.transfer-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const fromId = e.currentTarget.getAttribute('data-from');
            const toId = e.currentTarget.getAttribute('data-to');
            const itemName = e.currentTarget.getAttribute('data-item');
            this.transferItem(fromId, toId, itemName);
        });
    });

    // Add event listeners for delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const fromId = e.currentTarget.getAttribute('data-from');
            const itemName = e.currentTarget.getAttribute('data-item');
            this.deleteItem(fromId, itemName);
        });
    });

    // Add event listeners for restore buttons
    document.querySelectorAll('.restore-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const toId = e.currentTarget.getAttribute('data-to');
            const itemName = e.currentTarget.getAttribute('data-item');
            this.restoreItem(toId, itemName);
        });
    });
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

Game.prototype.debugGiveItemsAndCompanion = function() {
    // Get all item names
    const itemNames = Object.keys(ITEMS);

    // Add 4 random items to player
    const itemsAdded = [];
    for (let i = 0; i < 4; i++) {
        const randomItem = itemNames[Math.floor(Math.random() * itemNames.length)];
        if (this.state.player.addToInventory(randomItem)) {
            itemsAdded.push(randomItem);
        }
    }

    if (itemsAdded.length > 0) {
        this.state.addLog(`📦 Added to inventory: ${itemsAdded.join(', ')}`, 'success');
    }

    // Create "carry" companion with 2 random items
    const carry = new Character('carry', 3, 6, 1);

    const companionItemsAdded = [];
    for (let i = 0; i < 2; i++) {
        const randomItem = itemNames[Math.floor(Math.random() * itemNames.length)];
        if (carry.addToInventory(randomItem)) {
            companionItemsAdded.push(randomItem);
        }
    }

    this.state.addCompanion(carry);
    this.state.addLog(`🤝 Companion "carry" joined with: ${companionItemsAdded.join(', ')}`, 'success');

    this.render();
};

Game.prototype.debugAddRandomItem = function() {
    // Get all item names
    const itemNames = Object.keys(ITEMS);

    // Pick a random item
    const randomItem = itemNames[Math.floor(Math.random() * itemNames.length)];

    // Use the party inventory system
    this.addInventoryToParty(randomItem);
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

// Sequence selector methods
Game.prototype.openSequenceSelector = function() {
    document.getElementById('sequenceModal').style.display = 'block';
};

Game.prototype.closeSequenceSelector = function() {
    document.getElementById('sequenceModal').style.display = 'none';
};

Game.prototype.startSequenceFromUI = function() {
    const tag = document.getElementById('sequenceTag').value;
    const count = parseInt(document.getElementById('sequenceCount').value);
    const retreatable = document.getElementById('sequenceRetreatable').checked;

    if (count < 1 || count > 20) {
        this.state.addLog('❌ Count must be between 1 and 20', 'danger');
        return;
    }

    this.closeSequenceSelector();
    this.startEncounterSequence(tag, count, retreatable);
};

// Panel toggle methods
Game.prototype.toggleEncounterPanel = function() {
    const panel = document.getElementById('encounterPanel');
    if (panel) {
        if (panel.style.display === 'none') {
            panel.style.display = 'block';
            this.state.addLog('📜 Encounter panel shown', 'info');
        } else {
            panel.style.display = 'none';
            this.state.addLog('📜 Encounter panel hidden', 'info');
        }
    }
};

Game.prototype.toggleLogPanel = function() {
    const panel = document.getElementById('logSidebar');
    if (panel) {
        if (panel.style.display === 'none') {
            panel.style.display = 'block';
            this.state.addLog('📋 Event log shown', 'info');
        } else {
            panel.style.display = 'none';
            this.state.addLog('📋 Event log hidden', 'info');
        }
    }
};

Game.prototype.toggleEncounterCollapse = function() {
    const panel = document.getElementById('encounterPanel');
    const btn = document.getElementById('toggleEncounterBtn');
    if (panel && btn) {
        if (panel.classList.contains('collapsed')) {
            panel.classList.remove('collapsed');
            btn.textContent = '−';
        } else {
            panel.classList.add('collapsed');
            btn.textContent = '+';
        }
    }
};

Game.prototype.toggleLogCollapse = function() {
    const panel = document.getElementById('logSidebar');
    const btn = document.getElementById('toggleLogBtn');
    if (panel && btn) {
        if (panel.classList.contains('collapsed')) {
            panel.classList.remove('collapsed');
            btn.textContent = '−';
        } else {
            panel.classList.add('collapsed');
            btn.textContent = '+';
        }
    }
};

Game.prototype.toggleTTS = function() {
    this.state.ttsEnabled = !this.state.ttsEnabled;
    const btn = document.getElementById('toggleTTSBtn');
    if (btn) {
        if (this.state.ttsEnabled) {
            btn.textContent = '🔊 Text-to-Speech: ON';
            btn.style.background = '#4caf50';
            this.state.addLog('🔊 Text-to-speech enabled', 'success');
        } else {
            btn.textContent = '🔇 Text-to-Speech: OFF';
            btn.style.background = '#9c27b0';
            this.state.addLog('🔇 Text-to-speech disabled', 'info');
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();
        }
    }
};

// Map methods
Game.prototype.setMapMode = function(mode) {
    if (this.hexMap) {
        this.hexMap.setMode(mode);
        this.state.addLog(`🗺️ Map mode: ${mode}`, 'info');
    }
};

Game.prototype.setPlayerMapPosition = function(col, row) {
    if (this.hexMap) {
        this.hexMap.setPlayerPosition(col, row);
        this.state.addLog(`📍 Player moved to hex (${col}, ${row})`, 'success');
    }
};

Game.prototype.saveMap = function() {
    if (this.hexMap) {
        const mapJSON = this.hexMap.exportJSON();
        const blob = new Blob([mapJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'game-map.json';
        link.click();
        URL.revokeObjectURL(url);
        this.state.addLog('💾 Map exported as JSON!', 'success');
    }
};

Game.prototype.loadMap = function() {
    if (this.hexMap) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const jsonString = event.target.result;
                        if (this.hexMap.importJSON(jsonString)) {
                            this.state.addLog('📂 Map loaded from JSON!', 'success');
                        } else {
                            this.state.addLog('❌ Failed to load map', 'danger');
                        }
                    } catch (err) {
                        this.state.addLog('❌ Invalid JSON file', 'danger');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }
};

Game.prototype.exportMapPNG = function() {
    if (this.hexMap) {
        const canvas = this.hexMap.canvas;
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'game-map.png';
        link.click();
        this.state.addLog('📥 Map exported as PNG!', 'success');
    }
};

Game.prototype.resizeMap = function() {
    try {
        if (!this.hexMap) {
            console.log('No hexMap');
            return;
        }

        const widthInput = document.getElementById('mapWidthInput');
        const heightInput = document.getElementById('mapHeightInput');

        console.log('Width input:', widthInput);
        console.log('Height input:', heightInput);

        if (!widthInput || !heightInput) {
            console.log('Inputs not found');
            this.state.addLog('❌ Error: Input fields not found', 'danger');
            return;
        }

        const newWidth = parseInt(widthInput.value, 10);
        const newHeight = parseInt(heightInput.value, 10);

        console.log('New dimensions:', newWidth, newHeight);

        if (isNaN(newWidth) || isNaN(newHeight)) {
            this.state.addLog('❌ Invalid input values', 'danger');
            return;
        }

        if (newWidth < 5 || newWidth > 50 || newHeight < 5 || newHeight > 50) {
            this.state.addLog('❌ Map size must be between 5 and 50', 'danger');
            return;
        }

        console.log('Calling hexMap.resize...');
        this.hexMap.resize(newWidth, newHeight);
        this.state.addLog(`🔄 Map resized to ${newWidth}x${newHeight}!`, 'success');
    } catch (error) {
        console.error('Error in resizeMap:', error);
        this.state.addLog('❌ Error resizing map', 'danger');
    }
};

Game.prototype.importMap = function(jsonString) {
    if (this.hexMap) {
        if (this.hexMap.importJSON(jsonString)) {
            this.state.addLog('📤 Map imported!', 'success');
            return true;
        } else {
            this.state.addLog('❌ Failed to import map', 'danger');
            return false;
        }
    }
    return false;
};

// Map editing methods
Game.prototype.setMapTerrain = function(terrain) {
    if (this.hexMap) {
        this.hexMap.setCurrentTerrain(terrain);
        this.state.addLog(`🎨 Terrain selected: ${terrain}`, 'info');
    }
};

Game.prototype.setMapLocation = function(location) {
    if (this.hexMap) {
        this.hexMap.setCurrentLocation(location);
        this.state.addLog(`📍 Location selected: ${location}`, 'info');
    }
};

Game.prototype.openMapEditor = function() {
    document.getElementById('mapEditorSidebar').style.display = 'block';
    this.renderMapEditor();
};

Game.prototype.closeMapEditor = function() {
    document.getElementById('mapEditorSidebar').style.display = 'none';
};

Game.prototype.renderMapEditor = function() {
    const content = document.getElementById('mapEditorContent');

    const terrains = ['plains', 'forest', 'swamp', 'mountain', 'water'];
    const locations = ['city', 'ruins', 'temple', 'tavern', 'dungeon', 'none'];

    const terrainIcons = {
        plains: '🌾',
        forest: '🌲',
        swamp: '🌿',
        mountain: '⛰️',
        water: '💧'
    };

    const locationIcons = {
        city: '🏰',
        ruins: '🏛️',
        temple: '⛩️',
        tavern: '🍺',
        dungeon: '🕳️',
        none: '❌'
    };

    const currentTerrain = this.hexMap ? this.hexMap.getCurrentTerrain() : null;
    const currentLocation = this.hexMap ? this.hexMap.getCurrentLocation() : null;
    const mapWidth = this.hexMap ? this.hexMap.mapData.width : 15;
    const mapHeight = this.hexMap ? this.hexMap.mapData.height : 10;

    content.innerHTML = `
        <div class="map-editor-panel">
            <h3>📏 Map Size</h3>
            <div class="map-size-controls">
                <div class="size-input-group">
                    <label>Width:</label>
                    <input type="number" id="mapWidthInput" value="${mapWidth}" min="5" max="50" class="size-input">
                </div>
                <div class="size-input-group">
                    <label>Height:</label>
                    <input type="number" id="mapHeightInput" value="${mapHeight}" min="5" max="50" class="size-input">
                </div>
                <button class="map-action-btn" id="resizeMapBtn">🔄 Resize</button>
            </div>

            <h3>🔍 View</h3>
            <div class="map-size-controls">
                <button class="map-action-btn" id="zoomInBtn">🔍+ Zoom In</button>
                <button class="map-action-btn" id="zoomOutBtn">🔍- Zoom Out</button>
                <button class="map-action-btn" id="resetViewBtn">↺ Reset View</button>
            </div>

            <h3>🎨 Terrain</h3>
            <div class="terrain-buttons">
                ${terrains.map(terrain => `
                    <button class="map-tool-btn terrain-tool ${currentTerrain === terrain ? 'active' : ''}"
                            data-terrain="${terrain}"
                            onclick="game.setMapTerrain('${terrain}')">
                        ${terrainIcons[terrain]} ${terrain.charAt(0).toUpperCase() + terrain.slice(1)}
                    </button>
                `).join('')}
            </div>

            <h3>📍 Locations</h3>
            <div class="location-buttons">
                ${locations.map(location => `
                    <button class="map-tool-btn location-tool ${currentLocation === location ? 'active' : ''}"
                            data-location="${location}"
                            onclick="game.setMapLocation('${location}')">
                        ${locationIcons[location]} ${location.charAt(0).toUpperCase() + location.slice(1)}
                    </button>
                `).join('')}
            </div>

            <h3>💾 Actions</h3>
            <div class="map-actions">
                <button class="map-action-btn" onclick="game.saveMap()">💾 Save JSON</button>
                <button class="map-action-btn" onclick="game.loadMap()">📂 Load JSON</button>
                <button class="map-action-btn" onclick="game.exportMapPNG()">📥 Export PNG</button>
            </div>

            <p>
                <strong>How to use:</strong><br>
                • Click a tool<br>
                • Click or drag on map<br>
                • Click 👁️ View Mode to exit
            </p>
        </div>
    `;

    // Setup button listeners
    setTimeout(() => {
        const resizeBtn = document.getElementById('resizeMapBtn');
        if (resizeBtn) {
            resizeBtn.onclick = () => this.resizeMap();
        }

        const zoomInBtn = document.getElementById('zoomInBtn');
        if (zoomInBtn) {
            zoomInBtn.onclick = () => {
                if (this.hexMap) {
                    this.hexMap.zoomIn();
                }
            };
        }

        const zoomOutBtn = document.getElementById('zoomOutBtn');
        if (zoomOutBtn) {
            zoomOutBtn.onclick = () => {
                if (this.hexMap) {
                    this.hexMap.zoomOut();
                }
            };
        }

        const resetViewBtn = document.getElementById('resetViewBtn');
        if (resetViewBtn) {
            resetViewBtn.onclick = () => {
                if (this.hexMap) {
                    this.hexMap.resetZoomAndPan();
                }
            };
        }
    }, 0);
};



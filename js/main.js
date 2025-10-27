// ==================== INITIALIZATION ====================
let game;

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

function initGame() {
    game = new Game();
    
    // Start button
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            game.startGame();
            setTimeout(setupGameButtons, 100);
        });
    }
    
    setupModalListeners();
}

function setupGameButtons() {
    const shopBtn = document.getElementById('shopBtn');
    if (shopBtn) {
        shopBtn.onclick = () => game.openShop();
    }

    const inventoryBtn = document.getElementById('inventoryBtn');
    if (inventoryBtn) {
        inventoryBtn.onclick = () => game.openInventory();
    }

    const debugBtn = document.getElementById('debugBtn');
    if (debugBtn) {
        debugBtn.onclick = () => game.debugAddCompanion();
    }

    const encounterBtn = document.getElementById('encounterBtn');
    if (encounterBtn) {
        encounterBtn.onclick = () => game.openEncounterSelector();
    }

    const woundsBtn = document.getElementById('woundsBtn');
    if (woundsBtn) {
        woundsBtn.onclick = () => game.testWounds(3);
    }
}

function setupModalListeners() {
    const closeShop = document.getElementById('closeShop');
    if (closeShop) {
        closeShop.addEventListener('click', () => game.closeShop());
    }

    const closeInventory = document.getElementById('closeInventory');
    if (closeInventory) {
        closeInventory.addEventListener('click', () => game.closeInventory());
    }

    const closeEncounter = document.getElementById('closeEncounter');
    if (closeEncounter) {
        closeEncounter.addEventListener('click', () => game.closeEncounterSelector());
    }
    
    const buyTab = document.getElementById('buyTab');
    const sellTab = document.getElementById('sellTab');
    
    if (buyTab) {
        buyTab.addEventListener('click', () => {
            buyTab.classList.add('active');
            sellTab.classList.remove('active');
            game.renderShop('buy');
        });
    }
    
    if (sellTab) {
        sellTab.addEventListener('click', () => {
            sellTab.classList.add('active');
            buyTab.classList.remove('active');
            game.renderShop('sell');
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        const shopModal = document.getElementById('shopModal');
        const inventoryModal = document.getElementById('inventoryModal');
        const encounterModal = document.getElementById('encounterModal');

        if (e.target === shopModal) {
            game.closeShop();
        }
        if (e.target === inventoryModal) {
            game.closeInventory();
        }
        if (e.target === encounterModal) {
            game.closeEncounterSelector();
        }
    });
}


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

    const debugItemsBtn = document.getElementById('debugItemsBtn');
    if (debugItemsBtn) {
        debugItemsBtn.onclick = () => game.debugGiveItemsAndCompanion();
    }

    const encounterBtn = document.getElementById('encounterBtn');
    if (encounterBtn) {
        encounterBtn.onclick = () => game.openEncounterSelector();
    }

    const sequenceBtn = document.getElementById('sequenceBtn');
    if (sequenceBtn) {
        sequenceBtn.onclick = () => game.openSequenceSelector();
    }

    const woundsBtn = document.getElementById('woundsBtn');
    if (woundsBtn) {
        woundsBtn.onclick = () => game.testWounds(3);
    }

    // Map control buttons
    const mapViewBtn = document.getElementById('mapViewBtn');
    if (mapViewBtn) {
        mapViewBtn.style.display = 'block';
        mapViewBtn.onclick = () => {
            game.setMapMode('view');
            game.closeMapEditor();
        };
    }

    const mapEditBtn = document.getElementById('mapEditBtn');
    if (mapEditBtn) {
        mapEditBtn.style.display = 'block';
        mapEditBtn.onclick = () => {
            game.setMapMode('edit');
            game.openMapEditor();
        };
    }

    // UI toggle buttons
    const toggleEncounterPanelBtn = document.getElementById('toggleEncounterPanelBtn');
    if (toggleEncounterPanelBtn) {
        toggleEncounterPanelBtn.onclick = () => {
            game.toggleEncounterPanel();
        };
    }

    const toggleLogPanelBtn = document.getElementById('toggleLogPanelBtn');
    if (toggleLogPanelBtn) {
        toggleLogPanelBtn.onclick = () => {
            game.toggleLogPanel();
        };
    }

    const toggleTTSBtn = document.getElementById('toggleTTSBtn');
    if (toggleTTSBtn) {
        toggleTTSBtn.onclick = () => {
            game.toggleTTS();
        };
    }

    // Panel header toggle buttons
    const toggleEncounterBtn = document.getElementById('toggleEncounterBtn');
    if (toggleEncounterBtn) {
        toggleEncounterBtn.onclick = () => {
            game.toggleEncounterCollapse();
        };
    }

    const toggleLogBtn = document.getElementById('toggleLogBtn');
    if (toggleLogBtn) {
        toggleLogBtn.onclick = () => {
            game.toggleLogCollapse();
        };
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

    const closeSequence = document.getElementById('closeSequence');
    if (closeSequence) {
        closeSequence.addEventListener('click', () => game.closeSequenceSelector());
    }

    const startSequenceBtn = document.getElementById('startSequenceBtn');
    if (startSequenceBtn) {
        startSequenceBtn.addEventListener('click', () => game.startSequenceFromUI());
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
        const sequenceModal = document.getElementById('sequenceModal');

        if (e.target === shopModal) {
            game.closeShop();
        }
        if (e.target === inventoryModal) {
            game.closeInventory();
        }
        if (e.target === encounterModal) {
            game.closeEncounterSelector();
        }
        if (e.target === sequenceModal) {
            game.closeSequenceSelector();
        }
    });
}


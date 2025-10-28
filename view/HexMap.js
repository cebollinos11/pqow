// ==================== HEX MAP VIEWER & EDITOR ====================
// This file contains hex map functionality for viewing and editing the game world

class HexMap {
    constructor(containerId, width = 15, height = 10) {
        this.container = document.getElementById(containerId);
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);

        this.hexSize = 40;
        this.width = width;
        this.height = height;
        this.mode = 'view'; // 'view' or 'edit'
        this.playerPos = { col: 0, row: 0 };

        // Zoom and pan properties
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.isPanning = false;
        this.panStartX = 0;
        this.panStartY = 0;

        this.mapData = {
            width: width,
            height: height,
            hexes: [],
            roads: [],
            rivers: []
        };

        this.currentTerrain = 'plains';
        this.currentLocation = null;
        this.isDragging = false;
        
        this.terrainColors = {
            plains: '#90EE90',
            forest: '#228B22',
            swamp: '#556B2F',
            mountain: '#8B7355',
            water: '#4A90E2'
        };
        
        this.locationIcons = {
            city: '🏰',
            ruins: '🏛️',
            temple: '⛩️',
            tavern: '🍺',
            dungeon: '🕳️'
        };
        
        this.initializeMap();
        this.setupEventListeners();
        this.draw();
    }
    
    initializeMap() {
        this.mapData.hexes = [];
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                this.mapData.hexes.push({
                    col: col,
                    row: row,
                    terrain: 'plains',
                    location: null,
                    text: ''
                });
            }
        }
        this.resizeCanvas();
    }
    
    resizeCanvas() {
        const hexWidth = this.hexSize * 2;
        const hexHeight = Math.sqrt(3) * this.hexSize;
        
        this.canvas.width = (this.width * hexWidth * 0.75) + hexWidth * 0.5;
        this.canvas.height = (this.height * hexHeight) + hexHeight * 0.5;
    }
    
    hexToPixel(col, row) {
        const hexWidth = this.hexSize * 2;
        const hexHeight = Math.sqrt(3) * this.hexSize;
        
        const x = hexWidth * 0.75 * col + this.hexSize;
        const y = hexHeight * row + hexHeight * 0.5 + (col % 2) * hexHeight * 0.5;
        
        return { x, y };
    }
    
    pixelToHex(px, py) {
        // Account for zoom and pan
        px = (px - this.panX) / this.zoom;
        py = (py - this.panY) / this.zoom;

        const hexWidth = this.hexSize * 2;
        const hexHeight = Math.sqrt(3) * this.hexSize;

        let col = Math.round((px - this.hexSize) / (hexWidth * 0.75));
        let row = Math.round((py - hexHeight * 0.5 - (col % 2) * hexHeight * 0.5) / hexHeight);

        col = Math.max(0, Math.min(this.width - 1, col));
        row = Math.max(0, Math.min(this.height - 1, row));

        return { col, row };
    }
    
    getHexCorners(x, y) {
        const corners = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            corners.push({
                x: x + this.hexSize * Math.cos(angle),
                y: y + this.hexSize * Math.sin(angle)
            });
        }
        return corners;
    }
    
    drawHex(x, y, terrain, location, isPlayerPos = false) {
        const corners = this.getHexCorners(x, y);
        
        // Draw hex base
        this.ctx.fillStyle = this.terrainColors[terrain] || '#90EE90';
        this.ctx.beginPath();
        this.ctx.moveTo(corners[0].x, corners[0].y);
        for (let i = 1; i < 6; i++) {
            this.ctx.lineTo(corners[i].x, corners[i].y);
        }
        this.ctx.closePath();
        this.ctx.fill();
        
        // Draw border
        this.ctx.strokeStyle = isPlayerPos ? '#FFD700' : '#34495e';
        this.ctx.lineWidth = isPlayerPos ? 3 : 2;
        this.ctx.stroke();
        
        // Draw location icon
        if (location && this.locationIcons[location]) {
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(this.locationIcons[location], x, y - 5);
        }
        
        // Draw player token
        if (isPlayerPos) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 8, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.strokeStyle = '#FFF';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            this.ctx.fillStyle = '#000';
            this.ctx.font = 'bold 10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('P', x, y);
        }
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Save context state
        this.ctx.save();

        // Apply zoom and pan transformations
        this.ctx.translate(this.panX, this.panY);
        this.ctx.scale(this.zoom, this.zoom);

        // Draw all hexes
        for (const hex of this.mapData.hexes) {
            const pos = this.hexToPixel(hex.col, hex.row);
            const isPlayerPos = hex.col === this.playerPos.col && hex.row === this.playerPos.row;
            this.drawHex(pos.x, pos.y, hex.terrain, hex.location, isPlayerPos);
        }

        // Restore context state
        this.ctx.restore();
    }
    
    getHexAt(col, row) {
        return this.mapData.hexes.find(h => h.col === col && h.row === row);
    }
    
    setPlayerPosition(col, row) {
        this.playerPos = { col, row };
        this.draw();
    }
    
    setTerrain(col, row, terrain) {
        const hex = this.getHexAt(col, row);
        if (hex) {
            hex.terrain = terrain;
            this.draw();
        }
    }
    
    setLocation(col, row, location) {
        const hex = this.getHexAt(col, row);
        if (hex) {
            hex.location = location;
            this.draw();
        }
    }
    
    setMode(mode) {
        this.mode = mode;
    }

    setCurrentTerrain(terrain) {
        this.currentTerrain = terrain;
        this.currentLocation = null;
    }

    setCurrentLocation(location) {
        this.currentLocation = location;
        this.currentTerrain = null;
    }

    getCurrentTerrain() {
        return this.currentTerrain;
    }

    getCurrentLocation() {
        return this.currentLocation;
    }

    resetZoomAndPan() {
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.draw();
    }

    zoomIn() {
        this.zoom = Math.min(3, this.zoom * 1.2);
        this.draw();
    }

    zoomOut() {
        this.zoom = Math.max(0.5, this.zoom / 1.2);
        this.draw();
    }

    resize(newWidth, newHeight) {
        this.width = newWidth;
        this.height = newHeight;
        this.mapData.width = newWidth;
        this.mapData.height = newHeight;

        // Keep existing hexes that fit in the new size
        this.mapData.hexes = this.mapData.hexes.filter(hex =>
            hex.col < newWidth && hex.row < newHeight
        );

        // Add new hexes for the expanded area
        for (let row = 0; row < newHeight; row++) {
            for (let col = 0; col < newWidth; col++) {
                if (!this.getHexAt(col, row)) {
                    this.mapData.hexes.push({
                        col: col,
                        row: row,
                        terrain: 'plains',
                        location: null,
                        text: ''
                    });
                }
            }
        }

        this.resizeCanvas();
        this.draw();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => {
            if (this.isPanning) return; // Don't click if we were panning

            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const hexCoord = this.pixelToHex(x, y);

            if (this.mode === 'view') {
                this.setPlayerPosition(hexCoord.col, hexCoord.row);
            } else if (this.mode === 'edit') {
                this.handleEditClick(hexCoord.col, hexCoord.row);
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isPanning) {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                this.panX += x - this.panStartX;
                this.panY += y - this.panStartY;

                this.panStartX = x;
                this.panStartY = y;

                this.draw();
            } else if (this.mode === 'edit' && this.isDragging) {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const hexCoord = this.pixelToHex(x, y);
                this.handleEditClick(hexCoord.col, hexCoord.row);
            }
        });

        this.canvas.addEventListener('mousedown', (e) => {
            if (e.button === 2 || e.ctrlKey) { // Right click or Ctrl+Left click for panning
                this.isPanning = true;
                const rect = this.canvas.getBoundingClientRect();
                this.panStartX = e.clientX - rect.left;
                this.panStartY = e.clientY - rect.top;
                e.preventDefault();
            } else if (this.mode === 'edit') {
                this.isDragging = true;
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.isPanning = false;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
            this.isPanning = false;
        });

        // Zoom with mouse wheel
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();

            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            const oldZoom = this.zoom;
            this.zoom *= zoomFactor;

            // Clamp zoom between 0.5 and 3
            this.zoom = Math.max(0.5, Math.min(3, this.zoom));

            // Adjust pan to zoom towards mouse position
            this.panX = x - (x - this.panX) * (this.zoom / oldZoom);
            this.panY = y - (y - this.panY) * (this.zoom / oldZoom);

            this.draw();
        }, { passive: false });

        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    handleEditClick(col, row) {
        const hex = this.getHexAt(col, row);
        if (!hex) return;

        if (this.currentTerrain) {
            hex.terrain = this.currentTerrain;
            this.draw();
        } else if (this.currentLocation) {
            hex.location = this.currentLocation === 'none' ? null : this.currentLocation;
            this.draw();
        }
    }
    
    exportJSON() {
        return JSON.stringify(this.mapData, null, 2);
    }
    
    importJSON(jsonString) {
        try {
            this.mapData = JSON.parse(jsonString);
            this.width = this.mapData.width;
            this.height = this.mapData.height;
            this.resizeCanvas();
            this.draw();
            return true;
        } catch (error) {
            console.error('Error importing map:', error);
            return false;
        }
    }
    
    saveToLocalStorage(key = 'hexMapData') {
        localStorage.setItem(key, this.exportJSON());
    }
    
    loadFromLocalStorage(key = 'hexMapData') {
        const data = localStorage.getItem(key);
        if (data) {
            return this.importJSON(data);
        }
        return false;
    }
}


/**
 * DebugOverlay Module - Performance monitoring and debugging
 * Shows FPS, object counts, and other diagnostic information
 */

export class DebugOverlay {
    constructor() {
        this.enabled = false;
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = performance.now();
        this.stats = {};
    }
    
    /**
     * Toggle debug overlay visibility
     */
    toggle() {
        this.enabled = !this.enabled;
    }
    
    /**
     * Update FPS calculation
     * @param {number} currentTime - Current timestamp
     */
    updateFPS(currentTime) {
        this.frameCount++;
        
        const elapsed = currentTime - this.lastFpsUpdate;
        if (elapsed >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / elapsed);
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
        }
    }
    
    /**
     * Set a stat value
     * @param {string} key - Stat name
     * @param {*} value - Stat value
     */
    setStat(key, value) {
        this.stats[key] = value;
    }
    
    /**
     * Draw debug overlay on canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        if (!this.enabled) return;
        
        const x = 10;
        let y = 180; // Position below HUD
        const lineHeight = 18;
        
        ctx.save();
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x - 5, y - 15, 180, (Object.keys(this.stats).length + 2) * lineHeight + 10);
        
        // Title
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('DEBUG MODE (D to hide)', x, y);
        y += lineHeight;
        
        // FPS
        const fpsColor = this.fps >= 55 ? '#00ff00' : this.fps >= 30 ? '#ffff00' : '#ff0000';
        ctx.fillStyle = fpsColor;
        ctx.fillText(`FPS: ${this.fps}`, x, y);
        y += lineHeight;
        
        // Other stats
        ctx.fillStyle = '#00ff00';
        for (const [key, value] of Object.entries(this.stats)) {
            ctx.fillText(`${key}: ${value}`, x, y);
            y += lineHeight;
        }
        
        ctx.restore();
    }
    
    /**
     * Check if debug mode is enabled
     * @returns {boolean}
     */
    isEnabled() {
        return this.enabled;
    }
}

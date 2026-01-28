/**
 * ComboSystem Module - Track and reward consecutive hits
 * Provides score bonuses for maintaining hit streaks
 */

export class ComboSystem {
    constructor() {
        this.combo = 0;
        this.maxCombo = 0;
        this.comboTimer = 0;
        this.comboTimeout = 180; // 3 seconds at 60fps to maintain combo
        this.multiplier = 1.0;
        this.lastHitTime = 0;
    }
    
    /**
     * Register a successful hit
     * @returns {number} Current combo multiplier
     */
    registerHit() {
        this.combo++;
        this.comboTimer = this.comboTimeout;
        this.lastHitTime = performance.now();
        
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }
        
        // Calculate multiplier: 1x -> 1.5x -> 2x -> 2.5x -> 3x (caps at 10 combo)
        this.multiplier = 1 + Math.min(this.combo, 10) * 0.2;
        
        return this.multiplier;
    }
    
    /**
     * Update combo timer
     */
    update() {
        if (this.combo > 0 && this.comboTimer > 0) {
            this.comboTimer--;
            
            if (this.comboTimer === 0) {
                this.resetCombo();
            }
        }
    }
    
    /**
     * Reset combo streak
     */
    resetCombo() {
        this.combo = 0;
        this.multiplier = 1.0;
        this.comboTimer = 0;
    }
    
    /**
     * Get combo display info
     * @returns {Object} Combo state for rendering
     */
    getComboState() {
        return {
            combo: this.combo,
            maxCombo: this.maxCombo,
            multiplier: this.multiplier,
            timerPercent: this.comboTimer / this.comboTimeout,
            isActive: this.combo > 0
        };
    }
    
    /**
     * Draw combo indicator on screen
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} canvasWidth - Canvas width
     * @param {number} canvasHeight - Canvas height
     */
    draw(ctx, canvasWidth, canvasHeight) {
        if (this.combo <= 1) return; // Only show for 2+ combo
        
        const x = canvasWidth / 2;
        const y = 100;
        
        ctx.save();
        
        // Draw combo text with scaling animation
        const scale = 1 + (1 - this.comboTimer / this.comboTimeout) * 0.2;
        ctx.translate(x, y);
        ctx.scale(scale, scale);
        
        // Combo number
        ctx.fillStyle = this.getComboColor();
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = this.getComboColor();
        ctx.shadowBlur = 20;
        ctx.fillText(`${this.combo}x COMBO!`, 0, 0);
        
        // Multiplier
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`${this.multiplier.toFixed(1)}x SCORE`, 0, 35);
        
        ctx.shadowBlur = 0;
        ctx.restore();
        
        // Draw timer bar
        const barWidth = 200;
        const barHeight = 6;
        const barX = x - barWidth / 2;
        const barY = y + 50;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        const timerPercent = this.comboTimer / this.comboTimeout;
        ctx.fillStyle = timerPercent > 0.5 ? '#4ade80' : timerPercent > 0.25 ? '#fbbf24' : '#ef4444';
        ctx.fillRect(barX, barY, barWidth * timerPercent, barHeight);
    }
    
    /**
     * Get color based on combo level
     * @returns {string} Color string
     */
    getComboColor() {
        if (this.combo >= 10) return '#ff1744'; // Red for mega combo
        if (this.combo >= 7) return '#ff9100'; // Orange for great combo
        if (this.combo >= 5) return '#ffd600'; // Yellow for good combo
        return '#00e676'; // Green for basic combo
    }
    
    /**
     * Reset combo and max combo
     */
    reset() {
        this.combo = 0;
        this.maxCombo = 0;
        this.multiplier = 1.0;
        this.comboTimer = 0;
        this.lastHitTime = 0;
    }
}

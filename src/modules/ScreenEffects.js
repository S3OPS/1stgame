/**
 * ScreenEffects Module - Visual feedback effects
 * Handles screen shake, flash, and other camera effects
 */

export class ScreenEffects {
    constructor() {
        this.shakeIntensity = 0;
        this.shakeDecay = 0.9;
        this.offsetX = 0;
        this.offsetY = 0;
        
        // Wave announcement
        this.waveAnnouncement = null;
        this.waveAnnouncementTimer = 0;
        this.waveAnnouncementDuration = 120; // frames
    }
    
    /**
     * Trigger screen shake effect
     * @param {number} intensity - Shake intensity (default 8)
     */
    shake(intensity = 8) {
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    }
    
    /**
     * Update screen effects
     */
    update() {
        // Update shake
        if (this.shakeIntensity > 0.5) {
            this.offsetX = (Math.random() - 0.5) * this.shakeIntensity;
            this.offsetY = (Math.random() - 0.5) * this.shakeIntensity;
            this.shakeIntensity *= this.shakeDecay;
        } else {
            this.shakeIntensity = 0;
            this.offsetX = 0;
            this.offsetY = 0;
        }
        
        // Update wave announcement
        if (this.waveAnnouncementTimer > 0) {
            this.waveAnnouncementTimer--;
        }
    }
    
    /**
     * Show wave announcement
     * @param {number} wave - Wave number to announce
     */
    announceWave(wave) {
        this.waveAnnouncement = wave;
        this.waveAnnouncementTimer = this.waveAnnouncementDuration;
    }
    
    /**
     * Apply screen offset transform
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    applyTransform(ctx) {
        if (this.offsetX !== 0 || this.offsetY !== 0) {
            ctx.translate(this.offsetX, this.offsetY);
        }
    }
    
    /**
     * Draw wave announcement overlay
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} canvasWidth - Canvas width
     * @param {number} canvasHeight - Canvas height
     */
    drawAnnouncements(ctx, canvasWidth, canvasHeight) {
        if (this.waveAnnouncementTimer > 0 && this.waveAnnouncement) {
            const alpha = Math.min(1, this.waveAnnouncementTimer / 30);
            const scale = 1 + (1 - this.waveAnnouncementTimer / this.waveAnnouncementDuration) * 0.3;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#FFD700';
            ctx.font = `bold ${Math.floor(56 * scale)}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Shadow effect
            ctx.shadowColor = 'rgba(255, 200, 0, 0.8)';
            ctx.shadowBlur = 20;
            
            ctx.fillText(`WAVE ${this.waveAnnouncement}`, canvasWidth / 2, canvasHeight / 2 - 100);
            
            ctx.restore();
        }
    }
    
    /**
     * Get current shake offsets
     * @returns {{x: number, y: number}}
     */
    getOffset() {
        return { x: this.offsetX, y: this.offsetY };
    }
}

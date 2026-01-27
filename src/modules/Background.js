/**
 * Background Module - Space environment rendering
 * Handles starfield, nebula, atmosphere, and ground rendering
 */

import {
    STAR_COUNT,
    STAR_RESET_BOUNDARY,
    STAR_SPAWN_OFFSET,
    STAR_MOVEMENT_SPEED,
    TWINKLE_BASE,
    TWINKLE_AMPLITUDE,
    ATMOSPHERIC_LINE_SPACING,
    GROUND_DECORATION_START,
    GROUND_DECORATION_SPACING,
    GROUND_DECORATION_WIDTH,
    GROUND_DECORATION_HEIGHT
} from './constants.js';

/**
 * Create initial star field
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @returns {Array} Array of star objects
 */
export function createStarField(canvasWidth, canvasHeight) {
    return Array.from({ length: STAR_COUNT }, () => {
        const layer = 0.5 + Math.random() * 0.8;
        return {
            x: Math.random() * canvasWidth,
            y: Math.random() * canvasHeight,
            radius: (0.6 + Math.random() * 1.6) * layer,
            alpha: 0.3 + Math.random() * 0.7,
            twinkle: Math.random() * Math.PI * 2,
            twinkleSpeed: 0.0006 + Math.random() * 0.0016,
            layer
        };
    });
}

/**
 * Update star positions for parallax scrolling
 * @param {Array} stars - Star array to update
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 */
export function updateStars(stars, canvasWidth, canvasHeight) {
    stars.forEach((star) => {
        star.y += STAR_MOVEMENT_SPEED * star.layer;
        if (star.y > canvasHeight + STAR_RESET_BOUNDARY) {
            star.y = STAR_SPAWN_OFFSET;
            star.x = Math.random() * canvasWidth;
        }
    });
}

/**
 * Draw the complete background
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @param {Array} stars - Star array
 * @param {number} time - Current frame time
 */
export function drawBackground(ctx, canvasWidth, canvasHeight, stars, time) {
    // Main gradient background
    const gradient = ctx.createRadialGradient(
        canvasWidth / 2,
        canvasHeight * 0.2,
        100,
        canvasWidth / 2,
        canvasHeight,
        canvasWidth
    );
    gradient.addColorStop(0, '#20325c');
    gradient.addColorStop(0.55, '#0b152c');
    gradient.addColorStop(1, '#04060d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Nebula overlay
    const nebula = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    nebula.addColorStop(0, 'rgba(90,130,255,0.18)');
    nebula.addColorStop(0.45, 'rgba(20,40,90,0)');
    nebula.addColorStop(1, 'rgba(255,120,220,0.12)');
    ctx.fillStyle = nebula;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Atmospheric scan lines
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = 'rgba(120, 200, 255, 0.08)';
    for (let y = 0; y < canvasHeight; y += ATMOSPHERIC_LINE_SPACING) {
        ctx.fillRect(0, y, canvasWidth, 1);
    }
    ctx.restore();
    
    // Stars with twinkling
    drawStars(ctx, stars, time);
    
    // Horizon glow
    const horizonGlow = ctx.createRadialGradient(
        canvasWidth / 2,
        canvasHeight - 80,
        20,
        canvasWidth / 2,
        canvasHeight - 60,
        canvasWidth * 0.6
    );
    horizonGlow.addColorStop(0, 'rgba(120,200,255,0.25)');
    horizonGlow.addColorStop(1, 'rgba(10,20,35,0)');
    ctx.fillStyle = horizonGlow;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Ground
    drawGround(ctx, canvasWidth, canvasHeight);
}

/**
 * Draw twinkling stars
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} stars - Star array
 * @param {number} time - Current time
 */
function drawStars(ctx, stars, time) {
    stars.forEach((star) => {
        const twinkle = TWINKLE_BASE + TWINKLE_AMPLITUDE * Math.sin(time * star.twinkleSpeed + star.twinkle);
        ctx.fillStyle = `rgba(220,235,255,${star.alpha * twinkle})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

/**
 * Draw the ground area
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 */
function drawGround(ctx, canvasWidth, canvasHeight) {
    const groundGradient = ctx.createLinearGradient(0, canvasHeight - 90, 0, canvasHeight);
    groundGradient.addColorStop(0, '#0b1a1e');
    groundGradient.addColorStop(1, '#040609');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, canvasHeight - 60, canvasWidth, 60);
    
    // Ground decorations (landing pads/lights)
    ctx.fillStyle = 'rgba(120,200,255,0.2)';
    for (let x = GROUND_DECORATION_START; x < canvasWidth; x += GROUND_DECORATION_SPACING) {
        ctx.fillRect(x, canvasHeight - 55, GROUND_DECORATION_WIDTH, GROUND_DECORATION_HEIGHT);
    }
}

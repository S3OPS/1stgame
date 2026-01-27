/**
 * HUD Module - Heads-Up Display management
 * Handles all UI element updates
 */

import { CROSSHAIR_RADIUS } from './constants.js';

/**
 * Update all HUD elements
 * @param {Object} state - Game state object
 */
export function updateHUD(state) {
    const scoreEl = document.getElementById('score');
    const integrityEl = document.getElementById('integrity');
    const waveEl = document.getElementById('wave');
    const dronesEl = document.getElementById('drones');
    
    if (scoreEl) scoreEl.textContent = state.score;
    if (integrityEl) integrityEl.textContent = Math.round(state.integrity);
    if (waveEl) waveEl.textContent = state.wave;
    if (dronesEl) dronesEl.textContent = state.droneCount;
}

/**
 * Draw the crosshair on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - Crosshair X position
 * @param {number} y - Crosshair Y position
 */
export function drawCrosshair(ctx, x, y) {
    const radius = CROSSHAIR_RADIUS;
    
    ctx.save();
    
    // Outer ring with glow
    ctx.strokeStyle = '#bfe6ff';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(140,200,255,0.6)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Crosshair lines
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - radius - 6, y);
    ctx.lineTo(x + radius + 6, y);
    ctx.moveTo(x, y - radius - 6);
    ctx.lineTo(x, y + radius + 6);
    ctx.stroke();
    
    ctx.restore();
}

/**
 * Draw game over screen
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 */
export function drawGameOver(ctx, canvasWidth, canvasHeight) {
    // Dark overlay
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Game over text
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Defense Breached', canvasWidth / 2, canvasHeight / 2 - 10);
    
    // Restart instruction
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText('Press R to restart', canvasWidth / 2, canvasHeight / 2 + 30);
    ctx.textAlign = 'start';
}

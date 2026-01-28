/**
 * PowerUp Module - Collectible power-ups that enhance gameplay
 * Types: Shield, Rapid Fire, Triple Laser, Score Multiplier
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants.js';

// Power-up types
export const PowerUpType = {
    SHIELD: 'shield',
    RAPID_FIRE: 'rapidFire',
    TRIPLE_LASER: 'tripleLaser',
    SCORE_MULTIPLIER: 'scoreMultiplier'
};

/**
 * Create power-up template for object pool
 * @returns {Object} Power-up template
 */
export function createPowerUpTemplate() {
    return {
        x: 0,
        y: 0,
        radius: 20,
        type: PowerUpType.SHIELD,
        active: false,
        lifeTime: 0,
        maxLifeTime: 600, // 10 seconds at 60fps
        velocity: { x: 0, y: 0.5 },
        rotation: 0,
        collected: false
    };
}

/**
 * Initialize a power-up
 * @param {Object} powerUp - Power-up to initialize
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 */
export function initializePowerUp(powerUp, canvasWidth, canvasHeight) {
    powerUp.x = 100 + Math.random() * (canvasWidth - 200);
    powerUp.y = -50;
    powerUp.type = selectRandomPowerUpType();
    powerUp.active = true;
    powerUp.lifeTime = 0;
    powerUp.maxLifeTime = 600;
    powerUp.velocity = { x: (Math.random() - 0.5) * 0.3, y: 0.5 + Math.random() * 0.3 };
    powerUp.rotation = 0;
    powerUp.collected = false;
}

/**
 * Select random power-up type with weighted probability
 * @returns {string} Power-up type
 */
function selectRandomPowerUpType() {
    const types = [
        { type: PowerUpType.SHIELD, weight: 0.25 },
        { type: PowerUpType.RAPID_FIRE, weight: 0.35 },
        { type: PowerUpType.TRIPLE_LASER, weight: 0.25 },
        { type: PowerUpType.SCORE_MULTIPLIER, weight: 0.15 }
    ];
    
    const totalWeight = types.reduce((sum, t) => sum + t.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const item of types) {
        random -= item.weight;
        if (random <= 0) return item.type;
    }
    
    return PowerUpType.RAPID_FIRE;
}

/**
 * Update power-up position and lifetime
 * @param {Object} powerUp - Power-up to update
 * @returns {boolean} True if power-up is still active
 */
export function updatePowerUp(powerUp) {
    if (!powerUp.active) return false;
    
    powerUp.x += powerUp.velocity.x;
    powerUp.y += powerUp.velocity.y;
    powerUp.rotation += 0.02;
    powerUp.lifeTime++;
    
    // Deactivate if expired or off screen
    if (powerUp.lifeTime >= powerUp.maxLifeTime || 
        powerUp.y > CANVAS_HEIGHT + 50 ||
        powerUp.x < -50 || 
        powerUp.x > CANVAS_WIDTH + 50) {
        powerUp.active = false;
        return false;
    }
    
    return true;
}

/**
 * Check if crosshair collides with power-up
 * @param {Object} powerUp - Power-up to check
 * @param {number} crosshairX - Crosshair X position
 * @param {number} crosshairY - Crosshair Y position
 * @returns {boolean} True if collision detected
 */
export function checkPowerUpCollision(powerUp, crosshairX, crosshairY) {
    if (!powerUp.active || powerUp.collected) return false;
    
    const dx = powerUp.x - crosshairX;
    const dy = powerUp.y - crosshairY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < powerUp.radius + 10; // 10 is crosshair radius tolerance
}

/**
 * Get power-up visual configuration
 * @param {string} type - Power-up type
 * @returns {Object} Visual config
 */
function getPowerUpVisuals(type) {
    const visuals = {
        [PowerUpType.SHIELD]: {
            color: '#60a5fa',
            symbol: '🛡️',
            icon: 'shield',
            glow: 'rgba(96, 165, 250, 0.5)'
        },
        [PowerUpType.RAPID_FIRE]: {
            color: '#f59e0b',
            symbol: '⚡',
            icon: 'lightning',
            glow: 'rgba(245, 158, 11, 0.5)'
        },
        [PowerUpType.TRIPLE_LASER]: {
            color: '#8b5cf6',
            symbol: '✨',
            icon: 'triple',
            glow: 'rgba(139, 92, 246, 0.5)'
        },
        [PowerUpType.SCORE_MULTIPLIER]: {
            color: '#10b981',
            symbol: '💎',
            icon: 'multiplier',
            glow: 'rgba(16, 185, 129, 0.5)'
        }
    };
    
    return visuals[type] || visuals[PowerUpType.RAPID_FIRE];
}

/**
 * Draw power-up on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} powerUp - Power-up to draw
 * @param {number} time - Current time for animation
 */
export function drawPowerUp(ctx, powerUp, time) {
    if (!powerUp.active || powerUp.collected) return;
    
    const visuals = getPowerUpVisuals(powerUp.type);
    const pulse = 1 + Math.sin(time * 0.005) * 0.1;
    
    ctx.save();
    ctx.translate(powerUp.x, powerUp.y);
    ctx.rotate(powerUp.rotation);
    
    // Draw glow effect
    const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, powerUp.radius * 2 * pulse);
    glowGradient.addColorStop(0, visuals.glow);
    glowGradient.addColorStop(0.5, visuals.glow.replace('0.5', '0.2'));
    glowGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = glowGradient;
    ctx.fillRect(-powerUp.radius * 2, -powerUp.radius * 2, powerUp.radius * 4, powerUp.radius * 4);
    
    // Draw power-up container
    ctx.fillStyle = visuals.color;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    
    // Draw hexagon shape
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = Math.cos(angle) * powerUp.radius * pulse;
        const y = Math.sin(angle) * powerUp.radius * pulse;
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Draw icon based on type
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 1;
    
    drawPowerUpIcon(ctx, visuals.icon, powerUp.radius * 0.6);
    
    ctx.restore();
}

/**
 * Draw power-up icon
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} iconType - Icon type to draw
 * @param {number} size - Icon size
 */
function drawPowerUpIcon(ctx, iconType, size) {
    ctx.save();
    
    switch (iconType) {
        case 'shield':
            // Draw shield icon
            ctx.beginPath();
            ctx.moveTo(0, -size);
            ctx.quadraticCurveTo(size, -size * 0.5, size, size * 0.2);
            ctx.quadraticCurveTo(size * 0.5, size, 0, size);
            ctx.quadraticCurveTo(-size * 0.5, size, -size, size * 0.2);
            ctx.quadraticCurveTo(-size, -size * 0.5, 0, -size);
            ctx.fill();
            ctx.stroke();
            break;
            
        case 'lightning':
            // Draw lightning bolt
            ctx.beginPath();
            ctx.moveTo(-size * 0.3, -size);
            ctx.lineTo(size * 0.3, -size * 0.2);
            ctx.lineTo(-size * 0.1, -size * 0.2);
            ctx.lineTo(size * 0.3, size);
            ctx.lineTo(-size * 0.2, size * 0.3);
            ctx.lineTo(size * 0.1, size * 0.3);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
            
        case 'triple':
            // Draw triple laser icon
            for (let i = -1; i <= 1; i++) {
                ctx.fillRect(i * size * 0.4 - 1, -size, 2, size * 2);
            }
            break;
            
        case 'multiplier':
            // Draw x2 text
            ctx.font = `bold ${size * 1.2}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('x2', 0, 0);
            break;
    }
    
    ctx.restore();
}

/**
 * Get power-up duration in frames
 * @param {string} type - Power-up type
 * @returns {number} Duration in frames
 */
export function getPowerUpDuration(type) {
    const durations = {
        [PowerUpType.SHIELD]: 600,        // 10 seconds
        [PowerUpType.RAPID_FIRE]: 450,    // 7.5 seconds
        [PowerUpType.TRIPLE_LASER]: 300,  // 5 seconds
        [PowerUpType.SCORE_MULTIPLIER]: 900 // 15 seconds
    };
    
    return durations[type] || 300;
}

/**
 * Get power-up description for display
 * @param {string} type - Power-up type
 * @returns {string} Description text
 */
export function getPowerUpDescription(type) {
    const descriptions = {
        [PowerUpType.SHIELD]: 'Shield Active!',
        [PowerUpType.RAPID_FIRE]: 'Rapid Fire!',
        [PowerUpType.TRIPLE_LASER]: 'Triple Laser!',
        [PowerUpType.SCORE_MULTIPLIER]: '2x Score!'
    };
    
    return descriptions[type] || 'Power Up!';
}

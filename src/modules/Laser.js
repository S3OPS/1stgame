/**
 * Laser Module - Twin corner laser weapons
 * Handles laser creation, physics, and rendering
 */

import {
    LASER_SPEED,
    LASER_LIFE,
    LASER_COLLISION_RADIUS
} from './constants.js';

/**
 * Factory function to create a laser template
 * @returns {Object} Laser object with default values
 */
export function createLaserTemplate() {
    return {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        originX: 0,
        originY: 0,
        active: false
    };
}

/**
 * Initialize a laser from a corner toward a target
 * @param {Object} laser - Laser object to initialize
 * @param {Object} corner - Origin corner {x, y}
 * @param {Object} target - Target position {x, y}
 */
export function initializeLaser(laser, corner, target) {
    const angle = Math.atan2(target.y - corner.y, target.x - corner.x);
    
    laser.x = corner.x;
    laser.y = corner.y;
    laser.vx = Math.cos(angle) * LASER_SPEED;
    laser.vy = Math.sin(angle) * LASER_SPEED;
    laser.life = LASER_LIFE;
    laser.originX = corner.x;
    laser.originY = corner.y;
    laser.active = true;
}

/**
 * Update laser position and lifetime
 * @param {Object} laser - Laser to update
 */
export function updateLaser(laser) {
    laser.x += laser.vx;
    laser.y += laser.vy;
    laser.life -= 1;
}

/**
 * Check if laser should be removed
 * @param {Object} laser - Laser to check
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @returns {boolean}
 */
export function isLaserExpired(laser, canvasWidth, canvasHeight) {
    const outOfBounds = laser.x < -50 || 
                       laser.x > canvasWidth + 50 || 
                       laser.y < -50 || 
                       laser.y > canvasHeight + 50;
    return laser.life <= 0 || outOfBounds;
}

/**
 * Check collision between laser and drone
 * @param {Object} laser - Laser position
 * @param {Object} drone - Drone position and radius
 * @returns {boolean}
 */
export function checkLaserDroneCollision(laser, drone) {
    const dx = drone.x - laser.x;
    const dy = drone.y - laser.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < drone.radius + LASER_COLLISION_RADIUS;
}

/**
 * Draw lasers on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} lasers - Array of active lasers
 */
export function drawLasers(ctx, lasers) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Draw glow layer
    ctx.strokeStyle = 'rgba(255,80,120,0.45)';
    ctx.lineWidth = 8;
    ctx.shadowColor = 'rgba(255,80,120,0.6)';
    ctx.shadowBlur = 18;
    
    lasers.forEach((laser) => {
        ctx.beginPath();
        ctx.moveTo(laser.originX, laser.originY);
        ctx.lineTo(laser.x, laser.y);
        ctx.stroke();
        
        // Laser tip
        ctx.fillStyle = 'rgba(255,200,220,0.7)';
        ctx.beginPath();
        ctx.arc(laser.x, laser.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Draw core layer
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#fff4f7';
    ctx.lineWidth = 2;
    
    lasers.forEach((laser) => {
        ctx.beginPath();
        ctx.moveTo(laser.originX, laser.originY);
        ctx.lineTo(laser.x, laser.y);
        ctx.stroke();
    });
    
    ctx.restore();
}

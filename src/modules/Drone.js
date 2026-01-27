/**
 * Drone Module - AI-controlled enemy drones
 * Handles drone creation, movement AI, and rendering
 */

import {
    SPAWN_EDGES,
    SPAWN_PADDING,
    DRONE_MIN_RADIUS,
    DRONE_RADIUS_VARIANCE,
    DRONE_BASE_SPEED,
    DRONE_SPEED_VARIANCE,
    DRONE_BASE_HEALTH,
    GROUND_LEVEL_OFFSET,
    DRONE_HUE_BASE,
    DRONE_HUE_VARIANCE,
    DRONE_SATURATION,
    DRONE_LIGHTNESS
} from './constants.js';

/**
 * Factory function to create a new drone object
 * @returns {Object} Drone object with default values
 */
export function createDroneTemplate() {
    return {
        x: 0,
        y: 0,
        radius: 0,
        speed: 0,
        wobble: 0,
        color: '',
        health: 0,
        drift: 0,
        active: false
    };
}

/**
 * Initialize a drone with spawn parameters
 * @param {Object} drone - Drone object to initialize
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @param {number} wave - Current wave number
 */
export function initializeDrone(drone, canvasWidth, canvasHeight, wave) {
    const edge = Math.floor(Math.random() * SPAWN_EDGES);
    
    // Spawn from top, left, or right edges
    if (edge === 0) {
        drone.x = Math.random() * canvasWidth;
        drone.y = -SPAWN_PADDING;
    } else if (edge === 1) {
        drone.x = -SPAWN_PADDING;
        drone.y = Math.random() * canvasHeight * 0.6;
    } else {
        drone.x = canvasWidth + SPAWN_PADDING;
        drone.y = Math.random() * canvasHeight * 0.6;
    }
    
    drone.radius = DRONE_MIN_RADIUS + Math.random() * DRONE_RADIUS_VARIANCE;
    drone.speed = DRONE_BASE_SPEED + Math.random() * DRONE_SPEED_VARIANCE + wave * 0.05;
    drone.wobble = Math.random() * Math.PI * 2;
    drone.color = `hsl(${DRONE_HUE_BASE + Math.random() * DRONE_HUE_VARIANCE}, ${DRONE_SATURATION}%, ${DRONE_LIGHTNESS}%)`;
    drone.health = DRONE_BASE_HEALTH + Math.floor(wave / 2);
    drone.drift = (Math.random() - 0.5) * 0.6;
    drone.active = true;
}

/**
 * Update drone position with AI steering
 * @param {Object} drone - Drone to update
 * @param {number} targetX - Target X position
 * @param {number} targetY - Target Y position
 * @param {number} time - Current time for wobble calculation
 */
export function updateDrone(drone, targetX, targetY, time) {
    const angle = Math.atan2(targetY - drone.y, targetX - drone.x);
    const wobbleOffset = Math.sin(drone.wobble + time * 0.002) * 0.6;
    
    drone.x += Math.cos(angle + wobbleOffset) * drone.speed;
    drone.y += Math.sin(angle + wobbleOffset) * drone.speed;
    drone.x += drone.drift;
}

/**
 * Check if drone has reached the ground
 * @param {Object} drone - Drone to check
 * @param {number} canvasHeight - Canvas height
 * @returns {boolean}
 */
export function hasReachedGround(drone, canvasHeight) {
    return drone.y > canvasHeight - GROUND_LEVEL_OFFSET;
}

/**
 * Draw a drone on the canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} drone - Drone to draw
 * @param {number} time - Current frame time
 */
export function drawDrone(ctx, drone, time) {
    const tilt = Math.sin(time * 0.002 + drone.wobble) * 0.18;
    
    ctx.save();
    ctx.translate(drone.x, drone.y);
    ctx.rotate(tilt);
    
    // Body gradient
    const bodyGradient = ctx.createRadialGradient(
        -drone.radius * 0.3,
        -drone.radius * 0.2,
        drone.radius * 0.2,
        0,
        0,
        drone.radius
    );
    bodyGradient.addColorStop(0, '#f2fbff');
    bodyGradient.addColorStop(0.4, drone.color);
    bodyGradient.addColorStop(1, 'rgba(20,40,60,0.95)');
    
    ctx.fillStyle = bodyGradient;
    ctx.shadowColor = 'rgba(120,200,255,0.35)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.ellipse(0, 0, drone.radius, drone.radius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Central stripe
    ctx.strokeStyle = 'rgba(120,200,255,0.45)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-drone.radius * 0.6, 0);
    ctx.lineTo(drone.radius * 0.6, 0);
    ctx.stroke();
    
    // Cockpit
    ctx.fillStyle = 'rgba(200,240,255,0.9)';
    ctx.beginPath();
    ctx.ellipse(0, -drone.radius * 0.2, drone.radius * 0.35, drone.radius * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Thruster glow
    const thrusterGradient = ctx.createRadialGradient(
        0,
        drone.radius * 0.35,
        2,
        0,
        drone.radius * 0.45,
        drone.radius * 0.6
    );
    thrusterGradient.addColorStop(0, 'rgba(130,220,255,0.9)');
    thrusterGradient.addColorStop(1, 'rgba(20,60,120,0)');
    ctx.fillStyle = thrusterGradient;
    ctx.beginPath();
    ctx.ellipse(0, drone.radius * 0.4, drone.radius * 0.5, drone.radius * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

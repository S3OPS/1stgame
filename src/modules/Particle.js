/**
 * Particle Module - Visual effects system
 * Handles particle creation, physics, and rendering
 */

import {
    PARTICLE_MIN_SIZE,
    PARTICLE_SIZE_VARIANCE,
    EXPLOSION_PARTICLE_MIN_SIZE,
    EXPLOSION_PARTICLE_SIZE_VARIANCE,
    HIT_PARTICLE_COUNT,
    EXPLOSION_PARTICLE_COUNT,
    HIT_PARTICLE_LIFE,
    EXPLOSION_PARTICLE_LIFE
} from './constants.js';

/**
 * Factory function to create a particle template
 * @returns {Object} Particle object with default values
 */
export function createParticleTemplate() {
    return {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 0,
        color: '',
        size: 0,
        active: false
    };
}

/**
 * Initialize a hit particle
 * @param {Object} particle - Particle to initialize
 * @param {number} x - Origin X
 * @param {number} y - Origin Y
 * @param {string} color - Particle color
 */
export function initializeHitParticle(particle, x, y, color) {
    particle.x = x;
    particle.y = y;
    particle.vx = (Math.random() - 0.5) * 3;
    particle.vy = (Math.random() - 0.5) * 3;
    particle.life = HIT_PARTICLE_LIFE;
    particle.maxLife = HIT_PARTICLE_LIFE;
    particle.color = color;
    particle.size = PARTICLE_MIN_SIZE + Math.random() * PARTICLE_SIZE_VARIANCE;
    particle.active = true;
}

/**
 * Initialize an explosion particle
 * @param {Object} particle - Particle to initialize
 * @param {number} x - Origin X
 * @param {number} y - Origin Y
 */
export function initializeExplosionParticle(particle, x, y) {
    particle.x = x;
    particle.y = y;
    particle.vx = (Math.random() - 0.5) * 5;
    particle.vy = (Math.random() - 0.5) * 5;
    particle.life = EXPLOSION_PARTICLE_LIFE;
    particle.maxLife = EXPLOSION_PARTICLE_LIFE;
    particle.color = 'rgba(255,180,80,0.95)';
    particle.size = EXPLOSION_PARTICLE_MIN_SIZE + Math.random() * EXPLOSION_PARTICLE_SIZE_VARIANCE;
    particle.active = true;
}

/**
 * Update particle position and lifetime
 * @param {Object} particle - Particle to update
 */
export function updateParticle(particle) {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.life -= 1;
    particle.vx *= 0.98;
    particle.vy *= 0.98;
}

/**
 * Check if particle should be removed
 * @param {Object} particle - Particle to check
 * @returns {boolean}
 */
export function isParticleExpired(particle) {
    return particle.life <= 0;
}

/**
 * Get hit particle count constant
 * @returns {number}
 */
export function getHitParticleCount() {
    return HIT_PARTICLE_COUNT;
}

/**
 * Get explosion particle count constant
 * @returns {number}
 */
export function getExplosionParticleCount() {
    return EXPLOSION_PARTICLE_COUNT;
}

/**
 * Draw particles on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} particles - Array of active particles
 */
export function drawParticles(ctx, particles) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    
    particles.forEach((particle) => {
        const lifeRatio = Math.max(0, particle.life / particle.maxLife);
        
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = lifeRatio;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Outer glow
        ctx.globalAlpha = lifeRatio * 0.4;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 2.2, 0, Math.PI * 2);
        ctx.fill();
    });
    
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
}

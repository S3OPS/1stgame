/**
 * EnhancedEffects Module - Advanced visual effects
 * Smoke trails, enhanced explosions, laser charge effects
 */

/**
 * Create smoke trail particle for damaged drones
 * @param {Object} particle - Particle to initialize
 * @param {number} x - X position
 * @param {number} y - Y position
 */
export function initializeSmokeParticle(particle, x, y) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.3 + Math.random() * 0.5;
    
    particle.x = x + (Math.random() - 0.5) * 10;
    particle.y = y + (Math.random() - 0.5) * 10;
    particle.vx = Math.cos(angle) * speed * 0.5;
    particle.vy = Math.sin(angle) * speed * 0.5 - 0.2; // Float upward
    particle.size = 3 + Math.random() * 4;
    particle.life = 0;
    particle.maxLife = 40 + Math.floor(Math.random() * 30);
    particle.alpha = 0.4 + Math.random() * 0.3;
    particle.color = '#555';
    particle.type = 'smoke';
    particle.active = true;
}

/**
 * Update smoke particle
 * @param {Object} particle - Particle to update
 */
export function updateSmokeParticle(particle) {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vx *= 0.98;
    particle.vy *= 0.98;
    particle.size += 0.2; // Expand over time
    particle.life++;
    
    // Fade out
    const lifePercent = particle.life / particle.maxLife;
    particle.alpha = (1 - lifePercent) * 0.4;
}

/**
 * Draw smoke particle
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} particle - Particle to draw
 */
export function drawSmokeParticle(ctx, particle) {
    ctx.save();
    ctx.globalAlpha = particle.alpha;
    
    const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size
    );
    gradient.addColorStop(0, 'rgba(80, 80, 80, 0.6)');
    gradient.addColorStop(0.5, 'rgba(60, 60, 60, 0.3)');
    gradient.addColorStop(1, 'rgba(40, 40, 40, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

/**
 * Create debris particle for explosions
 * @param {Object} particle - Particle to initialize
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} color - Base color
 */
export function initializeDebrisParticle(particle, x, y, color) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
    
    particle.x = x;
    particle.y = y;
    particle.vx = Math.cos(angle) * speed;
    particle.vy = Math.sin(angle) * speed;
    particle.size = 2 + Math.random() * 4;
    particle.life = 0;
    particle.maxLife = 30 + Math.floor(Math.random() * 20);
    particle.alpha = 1;
    particle.color = color;
    particle.rotation = Math.random() * Math.PI * 2;
    particle.rotationSpeed = (Math.random() - 0.5) * 0.3;
    particle.gravity = 0.15;
    particle.type = 'debris';
    particle.active = true;
}

/**
 * Update debris particle
 * @param {Object} particle - Particle to update
 */
export function updateDebrisParticle(particle) {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += particle.gravity; // Apply gravity
    particle.vx *= 0.98;
    particle.rotation += particle.rotationSpeed;
    particle.life++;
    
    // Fade out
    const lifePercent = particle.life / particle.maxLife;
    particle.alpha = 1 - lifePercent;
}

/**
 * Draw debris particle
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} particle - Particle to draw
 */
export function drawDebrisParticle(ctx, particle) {
    ctx.save();
    ctx.globalAlpha = particle.alpha;
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation);
    
    ctx.fillStyle = particle.color;
    ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
    
    ctx.restore();
}

/**
 * Create shockwave effect for explosions
 * @returns {Object} Shockwave effect object
 */
export function createShockwave(x, y) {
    return {
        x,
        y,
        radius: 0,
        maxRadius: 60,
        life: 0,
        maxLife: 20,
        active: true,
        type: 'shockwave'
    };
}

/**
 * Update shockwave effect
 * @param {Object} shockwave - Shockwave to update
 */
export function updateShockwave(shockwave) {
    shockwave.life++;
    const lifePercent = shockwave.life / shockwave.maxLife;
    shockwave.radius = shockwave.maxRadius * lifePercent;
    
    if (shockwave.life >= shockwave.maxLife) {
        shockwave.active = false;
    }
}

/**
 * Draw shockwave effect
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} shockwave - Shockwave to draw
 */
export function drawShockwave(ctx, shockwave) {
    const lifePercent = shockwave.life / shockwave.maxLife;
    const alpha = (1 - lifePercent) * 0.5;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(shockwave.x, shockwave.y, shockwave.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}

/**
 * Create laser charge effect
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {Object} Charge effect object
 */
export function createLaserCharge(x, y) {
    return {
        x,
        y,
        radius: 15,
        life: 0,
        maxLife: 10,
        active: true,
        type: 'laserCharge'
    };
}

/**
 * Update laser charge effect
 * @param {Object} charge - Charge effect to update
 */
export function updateLaserCharge(charge) {
    charge.life++;
    if (charge.life >= charge.maxLife) {
        charge.active = false;
    }
}

/**
 * Draw laser charge effect
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} charge - Charge effect to draw
 */
export function drawLaserCharge(ctx, charge) {
    const lifePercent = charge.life / charge.maxLife;
    const alpha = 1 - lifePercent;
    const radius = charge.radius * (1 - lifePercent * 0.5);
    
    ctx.save();
    ctx.globalAlpha = alpha * 0.6;
    
    const gradient = ctx.createRadialGradient(charge.x, charge.y, 0, charge.x, charge.y, radius);
    gradient.addColorStop(0, '#00ffff');
    gradient.addColorStop(0.5, '#0080ff');
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(charge.x, charge.y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

/**
 * Create screen flash effect for big explosions
 * @returns {Object} Flash effect object
 */
export function createScreenFlash() {
    return {
        alpha: 0.3,
        life: 0,
        maxLife: 15,
        active: true,
        type: 'flash'
    };
}

/**
 * Update screen flash
 * @param {Object} flash - Flash effect to update
 */
export function updateScreenFlash(flash) {
    flash.life++;
    const lifePercent = flash.life / flash.maxLife;
    flash.alpha = (1 - lifePercent) * 0.3;
    
    if (flash.life >= flash.maxLife) {
        flash.active = false;
    }
}

/**
 * Draw screen flash
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @param {Object} flash - Flash effect to draw
 */
export function drawScreenFlash(ctx, canvasWidth, canvasHeight, flash) {
    ctx.save();
    ctx.globalAlpha = flash.alpha;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();
}

/**
 * Check if drone should emit smoke (low health)
 * @param {Object} drone - Drone to check
 * @returns {boolean} True if should emit smoke
 */
export function shouldEmitSmoke(drone) {
    if (!drone.maxHealth) return false;
    const healthPercent = drone.health / drone.maxHealth;
    return healthPercent < 0.5 && Math.random() < 0.3;
}

/**
 * Create enhanced explosion with multiple effect types
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} color - Base color
 * @param {boolean} isLarge - Whether this is a large explosion
 * @returns {Object} Collection of effect objects
 */
export function createEnhancedExplosion(x, y, color, isLarge = false) {
    const effects = {
        shockwave: createShockwave(x, y),
        particles: [],
        flash: isLarge ? createScreenFlash() : null
    };
    
    // Create debris particles
    const particleCount = isLarge ? 25 : 18;
    for (let i = 0; i < particleCount; i++) {
        effects.particles.push({
            x,
            y,
            vx: 0,
            vy: 0,
            size: 0,
            life: 0,
            maxLife: 0,
            alpha: 0,
            color,
            rotation: 0,
            rotationSpeed: 0,
            gravity: 0,
            type: 'debris',
            active: false
        });
        initializeDebrisParticle(effects.particles[i], x, y, color);
    }
    
    return effects;
}

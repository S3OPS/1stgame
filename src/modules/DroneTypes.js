/**
 * DroneTypes Module - Different enemy drone variants
 * Defines characteristics for Scout, Tank, and Swarm drones
 */

// Drone type definitions
export const DroneType = {
    NORMAL: 'normal',
    SCOUT: 'scout',
    TANK: 'tank',
    SWARM: 'swarm',
    BOSS: 'boss'
};

/**
 * Get drone type configuration
 * @param {string} type - Drone type
 * @param {number} wave - Current wave number
 * @returns {Object} Drone configuration
 */
export function getDroneConfig(type, wave) {
    const configs = {
        [DroneType.NORMAL]: {
            radius: 16 + Math.random() * 6,
            speed: 0.7 + Math.random() * 0.5 + wave * 0.05,
            health: 2 + Math.floor(wave / 2),
            color: `hsl(${180 + Math.random() * 40}, 70%, 60%)`,
            score: 50,
            spawnWeight: 0.5
        },
        [DroneType.SCOUT]: {
            radius: 10 + Math.random() * 4,
            speed: 1.5 + Math.random() * 0.6 + wave * 0.08,
            health: 1,
            color: `hsl(${120 + Math.random() * 30}, 80%, 65%)`,
            score: 75,
            spawnWeight: 0.25
        },
        [DroneType.TANK]: {
            radius: 24 + Math.random() * 8,
            speed: 0.4 + Math.random() * 0.2 + wave * 0.03,
            health: 5 + Math.floor(wave / 1.5),
            color: `hsl(${0 + Math.random() * 20}, 75%, 55%)`,
            score: 150,
            spawnWeight: 0.15
        },
        [DroneType.SWARM]: {
            radius: 6 + Math.random() * 3,
            speed: 0.9 + Math.random() * 0.4 + wave * 0.06,
            health: 1,
            color: `hsl(${280 + Math.random() * 40}, 70%, 60%)`,
            score: 25,
            spawnWeight: 0.1,
            groupSize: 3 + Math.floor(Math.random() * 3) // 3-5 in a group
        }
    };
    
    return configs[type] || configs[DroneType.NORMAL];
}

/**
 * Select a random drone type based on wave and weighted probabilities
 * @param {number} wave - Current wave number
 * @returns {string} Selected drone type
 */
export function selectRandomDroneType(wave) {
    // Introduce new types gradually
    let availableTypes = [DroneType.NORMAL];
    
    if (wave >= 2) availableTypes.push(DroneType.SCOUT);
    if (wave >= 3) availableTypes.push(DroneType.SWARM);
    if (wave >= 4) availableTypes.push(DroneType.TANK);
    
    // Get configs and build weighted array
    const weights = availableTypes.map(type => getDroneConfig(type, wave).spawnWeight);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    
    // Random selection based on weights
    let random = Math.random() * totalWeight;
    for (let i = 0; i < availableTypes.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            return availableTypes[i];
        }
    }
    
    return DroneType.NORMAL;
}

/**
 * Get visual rendering parameters for drone type
 * @param {string} type - Drone type
 * @returns {Object} Rendering configuration
 */
export function getDroneRenderConfig(type) {
    const renderConfigs = {
        [DroneType.NORMAL]: {
            shape: 'circle',
            glowIntensity: 0.4,
            bladeCount: 3
        },
        [DroneType.SCOUT]: {
            shape: 'triangle',
            glowIntensity: 0.6,
            bladeCount: 2
        },
        [DroneType.TANK]: {
            shape: 'square',
            glowIntensity: 0.3,
            bladeCount: 4,
            armorPlates: true
        },
        [DroneType.SWARM]: {
            shape: 'circle',
            glowIntensity: 0.5,
            bladeCount: 2,
            size: 'small'
        }
    };
    
    return renderConfigs[type] || renderConfigs[DroneType.NORMAL];
}

/**
 * Draw drone with type-specific visuals
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} drone - Drone object
 * @param {string} type - Drone type
 * @param {number} time - Current time for animation
 */
export function drawDroneByType(ctx, drone, type, time) {
    const renderConfig = getDroneRenderConfig(type);
    
    ctx.save();
    ctx.translate(drone.x, drone.y);
    
    // Draw glow effect
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, drone.radius * 1.5);
    gradient.addColorStop(0, drone.color);
    gradient.addColorStop(0.6, drone.color.replace('60%', '30%'));
    gradient.addColorStop(1, 'transparent');
    
    ctx.globalAlpha = renderConfig.glowIntensity;
    ctx.fillStyle = gradient;
    ctx.fillRect(-drone.radius * 1.5, -drone.radius * 1.5, drone.radius * 3, drone.radius * 3);
    ctx.globalAlpha = 1;
    
    // Draw main body based on shape
    ctx.fillStyle = drone.color;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    
    switch (renderConfig.shape) {
        case 'triangle':
            // Scout - triangle shape
            ctx.beginPath();
            ctx.moveTo(0, -drone.radius);
            ctx.lineTo(drone.radius * 0.866, drone.radius * 0.5);
            ctx.lineTo(-drone.radius * 0.866, drone.radius * 0.5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
            
        case 'square':
            // Tank - square with armor plates
            ctx.fillRect(-drone.radius * 0.8, -drone.radius * 0.8, drone.radius * 1.6, drone.radius * 1.6);
            ctx.strokeRect(-drone.radius * 0.8, -drone.radius * 0.8, drone.radius * 1.6, drone.radius * 1.6);
            
            if (renderConfig.armorPlates) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.lineWidth = 1;
                ctx.strokeRect(-drone.radius * 0.5, -drone.radius * 0.5, drone.radius, drone.radius);
            }
            break;
            
        default:
            // Normal/Swarm - circle shape
            ctx.beginPath();
            ctx.arc(0, 0, drone.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;
    }
    
    // Draw rotating blades/propellers
    const bladeRotation = time * 0.015;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1.5;
    
    for (let i = 0; i < renderConfig.bladeCount; i++) {
        const angle = (Math.PI * 2 / renderConfig.bladeCount) * i + bladeRotation;
        const x1 = Math.cos(angle) * drone.radius * 0.3;
        const y1 = Math.sin(angle) * drone.radius * 0.3;
        const x2 = Math.cos(angle) * drone.radius * 0.8;
        const y2 = Math.sin(angle) * drone.radius * 0.8;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    
    // Draw health indicator for tanks
    if (type === DroneType.TANK && drone.maxHealth) {
        const healthPercent = drone.health / drone.maxHealth;
        const barWidth = drone.radius * 1.6;
        const barHeight = 4;
        const barY = -drone.radius - 8;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);
        
        ctx.fillStyle = healthPercent > 0.5 ? '#4ade80' : healthPercent > 0.25 ? '#fbbf24' : '#ef4444';
        ctx.fillRect(-barWidth / 2, barY, barWidth * healthPercent, barHeight);
    }
    
    ctx.restore();
}

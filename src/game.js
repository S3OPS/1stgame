/**
 * Laser Defense: AI Drone Assault
 * Modular game engine with optimized object pooling
 * 
 * Architecture:
 * - Drone.js: Enemy AI and rendering
 * - Laser.js: Weapon system
 * - Particle.js: Visual effects
 * - Background.js: Environment rendering
 * - InputManager.js: User input handling
 * - HUD.js: UI management
 * - GameState.js: State management
 * - ObjectPool.js: Memory optimization
 * - constants.js: Configuration
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT, LASER_FIRE_COOLDOWN_MS, GROUND_LEVEL_OFFSET } from './modules/constants.js';
import { ObjectPool } from './modules/ObjectPool.js';
import { GameState } from './modules/GameState.js';
import { InputManager } from './modules/InputManager.js';
import { createStarField, updateStars, drawBackground } from './modules/Background.js';
import { createDroneTemplate, initializeDrone, updateDrone, hasReachedGround, drawDrone } from './modules/Drone.js';
import { createLaserTemplate, initializeLaser, updateLaser, isLaserExpired, checkLaserDroneCollision, drawLasers } from './modules/Laser.js';
import { createParticleTemplate, initializeHitParticle, initializeExplosionParticle, updateParticle, isParticleExpired, getHitParticleCount, getExplosionParticleCount, drawParticles } from './modules/Particle.js';
import { updateHUD, drawCrosshair, drawGameOver } from './modules/HUD.js';

/**
 * Main Game Class - Orchestrates all modules
 */
class LaserDefenseGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Canvas setup
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        
        // Initialize core systems
        this.state = new GameState();
        this.input = new InputManager(this.canvas);
        
        // Object pools for memory optimization
        this.dronePool = new ObjectPool(createDroneTemplate, 30);
        this.laserPool = new ObjectPool(createLaserTemplate, 100);
        this.particlePool = new ObjectPool(createParticleTemplate, 200);
        
        // Star field (static array, not pooled)
        this.stars = createStarField(this.canvas.width, this.canvas.height);
        
        // Laser corner positions
        this.laserCorners = [
            { x: 0, y: this.canvas.height },
            { x: this.canvas.width, y: this.canvas.height }
        ];
        
        // Setup input and start game
        this.input.init();
        this.input.onRestart(() => this.resetGame());
        
        this.spawnWave();
        this.gameLoop();
    }
    
    /**
     * Reset game to initial state
     */
    resetGame() {
        this.dronePool.releaseAll();
        this.laserPool.releaseAll();
        this.particlePool.releaseAll();
        this.state.reset();
        this.spawnWave();
    }
    
    /**
     * Spawn a new wave of drones
     */
    spawnWave() {
        const droneCount = this.state.getDronesForWave();
        for (let i = 0; i < droneCount; i++) {
            this.spawnDrone();
        }
    }
    
    /**
     * Spawn a single drone from the pool
     */
    spawnDrone() {
        const drone = this.dronePool.acquire();
        initializeDrone(drone, this.canvas.width, this.canvas.height, this.state.wave);
    }
    
    /**
     * Fire lasers from corner positions
     */
    fireLasers() {
        const now = performance.now();
        if (!this.input.getIsFiring()) return;
        
        if (!this.state.lastLaserTime) {
            this.state.lastLaserTime = now;
        }
        
        if (now - this.state.lastLaserTime < LASER_FIRE_COOLDOWN_MS) return;
        
        this.state.lastLaserTime = now;
        const target = this.input.getCrosshair();
        
        this.laserCorners.forEach((corner) => {
            const laser = this.laserPool.acquire();
            initializeLaser(laser, corner, target);
        });
    }
    
    /**
     * Update all lasers
     */
    updateLasers() {
        this.laserPool.processActive((laser) => {
            updateLaser(laser);
            return isLaserExpired(laser, this.canvas.width, this.canvas.height);
        });
    }
    
    /**
     * Update all drones
     */
    updateDrones() {
        const target = this.input.getCrosshair();
        const time = performance.now();
        
        this.dronePool.processActive((drone) => {
            updateDrone(drone, target.x, target.y, time);
            
            if (hasReachedGround(drone, this.canvas.height)) {
                this.state.applyGroundDamage();
                this.spawnExplosion(drone.x, this.canvas.height - GROUND_LEVEL_OFFSET);
                return true; // Release back to pool
            }
            return false;
        });
    }
    
    /**
     * Handle laser-drone collisions
     */
    handleCollisions() {
        const drones = this.dronePool.getActive();
        const lasers = this.laserPool.getActive();
        
        for (let i = drones.length - 1; i >= 0; i--) {
            const drone = drones[i];
            
            for (let j = lasers.length - 1; j >= 0; j--) {
                const laser = lasers[j];
                
                if (checkLaserDroneCollision(laser, drone)) {
                    // Release laser
                    this.laserPool.release(laser);
                    
                    // Damage drone
                    drone.health -= 1;
                    this.spawnHitParticles(drone.x, drone.y, drone.color);
                    
                    if (drone.health <= 0) {
                        this.dronePool.release(drone);
                        this.state.addDroneDestroyScore();
                        this.spawnExplosion(drone.x, drone.y);
                    }
                    break;
                }
            }
        }
    }
    
    /**
     * Spawn hit particles at position
     */
    spawnHitParticles(x, y, color) {
        const count = getHitParticleCount();
        for (let i = 0; i < count; i++) {
            const particle = this.particlePool.acquire();
            initializeHitParticle(particle, x, y, color);
        }
    }
    
    /**
     * Spawn explosion particles at position
     */
    spawnExplosion(x, y) {
        const count = getExplosionParticleCount();
        for (let i = 0; i < count; i++) {
            const particle = this.particlePool.acquire();
            initializeExplosionParticle(particle, x, y);
        }
    }
    
    /**
     * Update all particles
     */
    updateParticles() {
        this.particlePool.processActive((particle) => {
            updateParticle(particle);
            return isParticleExpired(particle);
        });
    }
    
    /**
     * Update wave state and spawning
     */
    updateWave() {
        if (this.state.gameOver) return;
        
        // Check for wave completion
        if (this.dronePool.getActiveCount() === 0) {
            this.state.advanceWave();
            this.spawnWave();
        }
        
        // Continuous spawning
        if (this.state.updateSpawnTimer()) {
            this.spawnDrone();
        }
    }
    
    /**
     * Update background elements
     */
    updateBackground() {
        updateStars(this.stars, this.canvas.width, this.canvas.height);
    }
    
    /**
     * Main game loop
     */
    gameLoop(currentTime = performance.now()) {
        this.state.updateTiming(currentTime);
        
        // Update phase
        if (!this.state.gameOver) {
            this.fireLasers();
            this.updateLasers();
            this.updateDrones();
            this.handleCollisions();
            this.updateParticles();
            this.updateWave();
            this.updateBackground();
        }
        
        // Update HUD
        updateHUD(this.state.getHUDState(this.dronePool.getActiveCount()));
        
        // Render phase
        drawBackground(this.ctx, this.canvas.width, this.canvas.height, this.stars, this.state.frameTime);
        drawLasers(this.ctx, this.laserPool.getActive());
        
        // Draw drones
        const drones = this.dronePool.getActive();
        drones.forEach(drone => drawDrone(this.ctx, drone, this.state.frameTime));
        
        drawParticles(this.ctx, this.particlePool.getActive());
        
        const crosshair = this.input.getCrosshair();
        drawCrosshair(this.ctx, crosshair.x, crosshair.y);
        
        if (this.state.gameOver) {
            drawGameOver(this.ctx, this.canvas.width, this.canvas.height);
        }
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new LaserDefenseGame();
});

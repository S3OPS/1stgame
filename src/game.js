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
 * - ScreenEffects.js: Screen shake and announcements
 * - DebugOverlay.js: Performance monitoring
 * - AudioManager.js: Sound effects and music
 * - DroneTypes.js: Different enemy types
 * - PowerUp.js: Collectible power-ups
 * - HighScore.js: Score tracking
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
import { ScreenEffects } from './modules/ScreenEffects.js';
import { DebugOverlay } from './modules/DebugOverlay.js';
import { AudioManager } from './modules/AudioManager.js';
import { selectRandomDroneType, getDroneConfig, drawDroneByType } from './modules/DroneTypes.js';
import { createPowerUpTemplate, initializePowerUp, updatePowerUp, checkPowerUpCollision, drawPowerUp, getPowerUpDuration, getPowerUpDescription, PowerUpType } from './modules/PowerUp.js';
import { isHighScore, addHighScore, drawHighScoreTable, drawInitialsPrompt } from './modules/HighScore.js';

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
        this.screenEffects = new ScreenEffects();
        this.debugOverlay = new DebugOverlay();
        this.audio = new AudioManager();
        this.isPaused = false;
        
        // Audio initialization flag
        this.audioInitialized = false;
        
        // Object pools for memory optimization
        this.dronePool = new ObjectPool(createDroneTemplate, 30);
        this.laserPool = new ObjectPool(createLaserTemplate, 100);
        this.particlePool = new ObjectPool(createParticleTemplate, 200);
        this.powerUpPool = new ObjectPool(createPowerUpTemplate, 10);
        
        // Power-up state tracking
        this.activePowerUps = {
            shield: 0,
            rapidFire: 0,
            tripleLaser: 0,
            scoreMultiplier: 0
        };
        this.powerUpSpawnTimer = 0;
        this.powerUpSpawnInterval = 900; // 15 seconds at 60fps
        
        // High score state
        this.enteringInitials = false;
        this.currentInitials = '';
        this.viewingScores = false;
        this.playerHighScorePosition = null;
        
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
        
        // Initialize audio on first mousedown
        this.canvas.addEventListener('mousedown', () => {
            if (!this.audioInitialized) {
                this.audio.init();
                this.audio.playBackgroundMusic();
                this.audioInitialized = true;
            }
        }, { once: true });
        
        // Additional key bindings
        window.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
        
        this.spawnWave();
        this.screenEffects.announceWave(1);
        this.gameLoop();
    }
    
    /**
     * Handle keyboard input
     */
    handleKeyDown(e) {
        const key = e.key.toLowerCase();
        
        // High score initials entry
        if (this.enteringInitials) {
            if (key === 'enter' && this.currentInitials.length === 3) {
                this.playerHighScorePosition = addHighScore(
                    this.currentInitials,
                    this.state.score,
                    this.state.wave
                );
                this.enteringInitials = false;
                this.viewingScores = true;
                this.currentInitials = '';
            } else if (key === 'backspace') {
                this.currentInitials = this.currentInitials.slice(0, -1);
            } else if (key.length === 1 && /[a-z]/i.test(key) && this.currentInitials.length < 3) {
                this.currentInitials += key.toUpperCase();
            }
            return;
        }
        
        // Exit high score view
        if (this.viewingScores && key === 'escape') {
            this.viewingScores = false;
            this.playerHighScorePosition = null;
            return;
        }
        
        // Standard key bindings
        if (key === 'p') this.togglePause();
        if (key === 'd') this.debugOverlay.toggle();
        if (key === 'm') {
            const enabled = this.audio.toggle();
            console.log(`Audio ${enabled ? 'enabled' : 'disabled'}`);
        }
        if (key === 'h' && !this.enteringInitials) {
            this.viewingScores = !this.viewingScores;
            if (!this.viewingScores) {
                this.playerHighScorePosition = null;
            }
        }
    }
    
    /**
     * Toggle pause state
     */
    togglePause() {
        if (!this.state.gameOver) {
            this.isPaused = !this.isPaused;
        }
    }
    
    /**
     * Reset game to initial state
     */
    resetGame() {
        this.dronePool.releaseAll();
        this.laserPool.releaseAll();
        this.particlePool.releaseAll();
        this.powerUpPool.releaseAll();
        this.state.reset();
        this.isPaused = false;
        this.enteringInitials = false;
        this.currentInitials = '';
        this.viewingScores = false;
        this.playerHighScorePosition = null;
        this.powerUpSpawnTimer = 0;
        this.activePowerUps = {
            shield: 0,
            rapidFire: 0,
            tripleLaser: 0,
            scoreMultiplier: 0
        };
        this.spawnWave();
        this.screenEffects.announceWave(1);
        this.audio.playWaveStart();
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
        const droneType = selectRandomDroneType(this.state.wave);
        const config = getDroneConfig(droneType, this.state.wave);
        
        // Store type and config on drone
        drone.droneType = droneType;
        drone.radius = config.radius;
        drone.speed = config.speed;
        drone.health = config.health;
        drone.maxHealth = config.health;
        drone.color = config.color;
        drone.score = config.score;
        
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
        
        // Apply rapid fire power-up
        const cooldown = this.activePowerUps.rapidFire > 0 ? 
            LASER_FIRE_COOLDOWN_MS * 0.5 : LASER_FIRE_COOLDOWN_MS;
        
        if (now - this.state.lastLaserTime < cooldown) return;
        
        this.state.lastLaserTime = now;
        const target = this.input.getCrosshair();
        
        // Play laser fire sound
        this.audio.playLaserFire();
        
        // Triple laser power-up
        if (this.activePowerUps.tripleLaser > 0) {
            // Fire three lasers from each corner with spread
            this.laserCorners.forEach((corner) => {
                for (let i = -1; i <= 1; i++) {
                    const offset = i * 40;
                    const adjustedTarget = {
                        x: target.x + offset,
                        y: target.y
                    };
                    const laser = this.laserPool.acquire();
                    initializeLaser(laser, corner, adjustedTarget);
                }
            });
        } else {
            // Normal firing
            this.laserCorners.forEach((corner) => {
                const laser = this.laserPool.acquire();
                initializeLaser(laser, corner, target);
            });
        }
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
                // Shield protects from ground damage
                if (this.activePowerUps.shield <= 0) {
                    this.state.applyGroundDamage();
                }
                this.spawnExplosion(drone.x, this.canvas.height - GROUND_LEVEL_OFFSET);
                this.screenEffects.shake(12);
                this.audio.playGroundImpact();
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
                    this.audio.playDroneHit();
                    
                    if (drone.health <= 0) {
                        this.dronePool.release(drone);
                        
                        // Apply score multiplier if active
                        const baseScore = drone.score || 50;
                        const finalScore = this.activePowerUps.scoreMultiplier > 0 ? 
                            baseScore * 2 : baseScore;
                        this.state.score += finalScore;
                        
                        this.spawnExplosion(drone.x, drone.y);
                        this.audio.playExplosion();
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
            this.screenEffects.announceWave(this.state.wave);
            this.audio.playWaveStart();
            this.spawnWave();
        }
        
        // Continuous spawning
        if (this.state.updateSpawnTimer()) {
            this.spawnDrone();
        }
    }
    
    /**
     * Update power-ups
     */
    updatePowerUps() {
        if (this.state.gameOver) return;
        
        // Update spawn timer
        this.powerUpSpawnTimer++;
        if (this.powerUpSpawnTimer >= this.powerUpSpawnInterval) {
            this.spawnPowerUp();
            this.powerUpSpawnTimer = 0;
        }
        
        // Update active power-ups
        this.powerUpPool.processActive((powerUp) => {
            const stillActive = updatePowerUp(powerUp);
            if (!stillActive) return true;
            
            // Check collision with crosshair
            const crosshair = this.input.getCrosshair();
            if (checkPowerUpCollision(powerUp, crosshair.x, crosshair.y)) {
                this.activatePowerUp(powerUp.type);
                this.audio.playPowerUp();
                return true; // Release power-up
            }
            
            return false;
        });
        
        // Decrease active power-up durations
        for (const key in this.activePowerUps) {
            if (this.activePowerUps[key] > 0) {
                this.activePowerUps[key]--;
            }
        }
    }
    
    /**
     * Spawn a new power-up
     */
    spawnPowerUp() {
        const powerUp = this.powerUpPool.acquire();
        initializePowerUp(powerUp, this.canvas.width, this.canvas.height);
    }
    
    /**
     * Activate a power-up effect
     */
    activatePowerUp(type) {
        const duration = getPowerUpDuration(type);
        
        switch (type) {
            case PowerUpType.SHIELD:
                this.activePowerUps.shield = duration;
                break;
            case PowerUpType.RAPID_FIRE:
                this.activePowerUps.rapidFire = duration;
                break;
            case PowerUpType.TRIPLE_LASER:
                this.activePowerUps.tripleLaser = duration;
                break;
            case PowerUpType.SCORE_MULTIPLIER:
                this.activePowerUps.scoreMultiplier = duration;
                break;
        }
        
        this.screenEffects.announceWave(this.state.wave, getPowerUpDescription(type));
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
        this.debugOverlay.updateFPS(currentTime);
        
        // Check for high score entry after game over
        if (this.state.gameOver && !this.enteringInitials && !this.viewingScores) {
            if (isHighScore(this.state.score)) {
                this.enteringInitials = true;
            }
        }
        
        // Update phase (skip if paused, except effects)
        if (!this.state.gameOver && !this.isPaused) {
            this.fireLasers();
            this.updateLasers();
            this.updateDrones();
            this.handleCollisions();
            this.updateParticles();
            this.updateWave();
            this.updatePowerUps();
            this.updateBackground();
        }
        
        // Always update screen effects
        this.screenEffects.update();
        
        // Update debug stats
        this.debugOverlay.setStat('Drones', this.dronePool.getActiveCount());
        this.debugOverlay.setStat('Lasers', this.laserPool.getActiveCount());
        this.debugOverlay.setStat('Particles', this.particlePool.getActiveCount());
        this.debugOverlay.setStat('PowerUps', this.powerUpPool.getActiveCount());
        this.debugOverlay.setStat('Wave', this.state.wave);
        
        // Update HUD
        updateHUD(this.state.getHUDState(this.dronePool.getActiveCount()));
        
        // Render phase with screen shake
        this.ctx.save();
        this.screenEffects.applyTransform(this.ctx);
        
        drawBackground(this.ctx, this.canvas.width, this.canvas.height, this.stars, this.state.frameTime);
        drawLasers(this.ctx, this.laserPool.getActive());
        
        // Draw drones with type-specific rendering
        const drones = this.dronePool.getActive();
        drones.forEach(drone => {
            if (drone.droneType) {
                drawDroneByType(this.ctx, drone, drone.droneType, this.state.frameTime);
            } else {
                drawDrone(this.ctx, drone, this.state.frameTime);
            }
        });
        
        drawParticles(this.ctx, this.particlePool.getActive());
        
        // Draw power-ups
        const powerUps = this.powerUpPool.getActive();
        powerUps.forEach(powerUp => drawPowerUp(this.ctx, powerUp, this.state.frameTime));
        
        const crosshair = this.input.getCrosshair();
        drawCrosshair(this.ctx, crosshair.x, crosshair.y);
        
        this.ctx.restore();
        
        // Draw overlays (after restore to avoid shake)
        this.screenEffects.drawAnnouncements(this.ctx, this.canvas.width, this.canvas.height);
        
        // Draw active power-up indicators
        this.drawPowerUpIndicators();
        
        // High score screens (highest priority)
        if (this.enteringInitials) {
            drawInitialsPrompt(
                this.ctx,
                this.canvas.width,
                this.canvas.height,
                this.state.score,
                this.state.wave,
                this.currentInitials
            );
        } else if (this.viewingScores) {
            drawHighScoreTable(
                this.ctx,
                this.canvas.width,
                this.canvas.height,
                this.playerHighScorePosition
            );
        } else if (this.state.gameOver) {
            drawGameOver(this.ctx, this.canvas.width, this.canvas.height);
        }
        
        // Draw pause screen
        if (this.isPaused) {
            this.drawPauseScreen();
        }
        
        // Draw debug overlay
        this.debugOverlay.draw(this.ctx);
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    /**
     * Draw active power-up indicators
     */
    drawPowerUpIndicators() {
        const indicators = [];
        
        if (this.activePowerUps.shield > 0) {
            indicators.push({ type: PowerUpType.SHIELD, duration: this.activePowerUps.shield, color: '#60a5fa', text: '🛡️ Shield' });
        }
        if (this.activePowerUps.rapidFire > 0) {
            indicators.push({ type: PowerUpType.RAPID_FIRE, duration: this.activePowerUps.rapidFire, color: '#f59e0b', text: '⚡ Rapid Fire' });
        }
        if (this.activePowerUps.tripleLaser > 0) {
            indicators.push({ type: PowerUpType.TRIPLE_LASER, duration: this.activePowerUps.tripleLaser, color: '#8b5cf6', text: '✨ Triple Laser' });
        }
        if (this.activePowerUps.scoreMultiplier > 0) {
            indicators.push({ type: PowerUpType.SCORE_MULTIPLIER, duration: this.activePowerUps.scoreMultiplier, color: '#10b981', text: '💎 2x Score' });
        }
        
        // Draw indicators in top-right corner
        this.ctx.save();
        const startX = this.canvas.width - 180;
        let y = 80;
        
        indicators.forEach(indicator => {
            const seconds = Math.ceil(indicator.duration / 60);
            
            // Background
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(startX, y, 170, 30);
            
            // Border
            this.ctx.strokeStyle = indicator.color;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(startX, y, 170, 30);
            
            // Duration bar
            const barWidth = 170 * (indicator.duration / getPowerUpDuration(indicator.type));
            this.ctx.fillStyle = indicator.color;
            this.ctx.globalAlpha = 0.3;
            this.ctx.fillRect(startX, y, barWidth, 30);
            this.ctx.globalAlpha = 1;
            
            // Text
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(indicator.text, startX + 5, y + 20);
            
            // Time remaining
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`${seconds}s`, startX + 165, y + 20);
            
            y += 35;
        });
        
        this.ctx.restore();
    }
    
    /**
     * Draw pause screen overlay
     */
    drawPauseScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Press P to resume', this.canvas.width / 2, this.canvas.height / 2 + 40);
        this.ctx.textAlign = 'start';
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new LaserDefenseGame();
});

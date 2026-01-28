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
import { ComboSystem } from './modules/ComboSystem.js';
import { DifficultyManager, Difficulty } from './modules/DifficultyManager.js';
import { 
    initializeSmokeParticle, updateSmokeParticle, drawSmokeParticle,
    initializeDebrisParticle, updateDebrisParticle, drawDebrisParticle,
    createShockwave, updateShockwave, drawShockwave,
    createLaserCharge, updateLaserCharge, drawLaserCharge,
    createScreenFlash, updateScreenFlash, drawScreenFlash,
    shouldEmitSmoke, createEnhancedExplosion
} from './modules/EnhancedEffects.js';

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
        this.comboSystem = new ComboSystem();
        this.difficultyManager = new DifficultyManager();
        this.isPaused = false;
        
        // Game state modes
        this.showingDifficultySelector = true;
        this.selectedDifficulty = Difficulty.NORMAL;
        
        // Audio initialization flag
        this.audioInitialized = false;
        
        // Object pools for memory optimization
        this.dronePool = new ObjectPool(createDroneTemplate, 30);
        this.laserPool = new ObjectPool(createLaserTemplate, 100);
        this.particlePool = new ObjectPool(createParticleTemplate, 200);
        this.powerUpPool = new ObjectPool(createPowerUpTemplate, 10);
        
        // Enhanced effects pools
        this.smokePool = new ObjectPool(() => ({ 
            x: 0, y: 0, vx: 0, vy: 0, size: 0, life: 0, maxLife: 0, 
            alpha: 0, color: '', type: 'smoke', active: false 
        }), 100);
        this.debrisPool = new ObjectPool(() => ({ 
            x: 0, y: 0, vx: 0, vy: 0, size: 0, life: 0, maxLife: 0, 
            alpha: 0, color: '', rotation: 0, rotationSpeed: 0, gravity: 0,
            type: 'debris', active: false 
        }), 150);
        this.shockwaves = [];
        this.laserCharges = [];
        this.screenFlashes = [];
        
        // Power-up state tracking (camelCase keys map to PowerUpType constants)
        this.activePowerUps = {
            shield: 0,              // PowerUpType.SHIELD
            rapidFire: 0,           // PowerUpType.RAPID_FIRE
            tripleLaser: 0,         // PowerUpType.TRIPLE_LASER
            scoreMultiplier: 0      // PowerUpType.SCORE_MULTIPLIER
        };
        this.powerUpSpawnTimer = 0;
        this.powerUpSpawnInterval = 900; // 15 seconds at 60fps
        
        // High score state
        this.enteringInitials = false;
        this.currentInitials = '';
        this.viewingScores = false;
        this.playerHighScorePosition = null;
        
        // Wave bonus tracking
        this.waveBonusAnnouncements = [];
        
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
        
        // Don't spawn wave yet - wait for difficulty selection
        // this.spawnWave();
        // this.screenEffects.announceWave(1);
        this.gameLoop();
        
        // Initialize audio on first mousedown
        this.canvas.addEventListener('mousedown', () => {
            if (!this.audioInitialized) {
                try {
                    this.audio.init();
                    this.audio.playBackgroundMusic();
                    this.audioInitialized = true;
                } catch (error) {
                    console.error('Audio initialization failed:', error);
                }
            }
        }, { once: true });
        
        // Also try to init on any key press as fallback
        window.addEventListener('keydown', () => {
            if (!this.audioInitialized) {
                try {
                    this.audio.init();
                    this.audio.playBackgroundMusic();
                    this.audioInitialized = true;
                } catch (error) {
                    console.error('Audio initialization failed:', error);
                }
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
        
        // Difficulty selection
        if (this.showingDifficultySelector) {
            if (key === 'arrowup') {
                const difficulties = [Difficulty.EASY, Difficulty.NORMAL, Difficulty.HARD];
                const currentIndex = difficulties.indexOf(this.selectedDifficulty);
                if (currentIndex > 0) {
                    this.selectedDifficulty = difficulties[currentIndex - 1];
                }
            } else if (key === 'arrowdown') {
                const difficulties = [Difficulty.EASY, Difficulty.NORMAL, Difficulty.HARD];
                const currentIndex = difficulties.indexOf(this.selectedDifficulty);
                if (currentIndex < difficulties.length - 1) {
                    this.selectedDifficulty = difficulties[currentIndex + 1];
                }
            } else if (key === 'enter') {
                this.startGameWithDifficulty(this.selectedDifficulty);
            }
            return;
        }
        
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
        if (key === 'n' && this.state.gameOver) {
            this.showingDifficultySelector = true;
            this.selectedDifficulty = this.difficultyManager.getDifficulty();
        }
    }
    
    /**
     * Start game with selected difficulty
     */
    startGameWithDifficulty(difficulty) {
        this.showingDifficultySelector = false;
        this.difficultyManager.setDifficulty(difficulty);
        
        // Apply difficulty to initial state
        const config = this.difficultyManager.getConfig();
        this.state.integrity = config.baseIntegrity;
        this.powerUpSpawnInterval = config.powerUpFrequency * 60; // Convert to frames
        
        this.spawnWave();
        this.screenEffects.announceWave(1);
        this.audio.playWaveStart();
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
        this.smokePool.releaseAll();
        this.debrisPool.releaseAll();
        this.shockwaves = [];
        this.laserCharges = [];
        this.screenFlashes = [];
        this.waveBonusAnnouncements = [];
        this.state.reset();
        this.comboSystem.reset();
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
        
        // Show difficulty selector
        this.showingDifficultySelector = true;
        this.selectedDifficulty = this.difficultyManager.getDifficulty();
    }
    
    /**
     * Spawn a new wave of drones
     */
    spawnWave() {
        const baseDroneCount = this.state.getDronesForWave();
        const droneCount = this.difficultyManager.getWaveDroneCount(baseDroneCount);
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
        const baseConfig = getDroneConfig(droneType, this.state.wave);
        
        // Apply difficulty modifiers
        const config = this.difficultyManager.applyToDrone(baseConfig);
        
        // Initialize drone first to get base setup
        initializeDrone(drone, this.canvas.width, this.canvas.height, this.state.wave);
        
        // Override with type-specific config after initialization
        drone.droneType = droneType;
        drone.radius = config.radius;
        drone.speed = config.speed;
        drone.health = config.health;
        drone.maxHealth = config.health;
        drone.color = config.color;
        drone.score = config.score;
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
        
        // Create laser charge effects at corners
        this.laserCorners.forEach(corner => {
            this.laserCharges.push(createLaserCharge(corner.x, corner.y));
        });
        
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
            
            // Emit smoke from damaged drones
            if (shouldEmitSmoke(drone)) {
                const smoke = this.smokePool.acquire();
                initializeSmokeParticle(smoke, drone.x, drone.y);
            }
            
            if (hasReachedGround(drone, this.canvas.height)) {
                // Shield protects from ground damage
                if (this.activePowerUps.shield <= 0) {
                    const baseDamage = 10;
                    const damage = this.difficultyManager.getDamage(baseDamage);
                    this.state.integrity = Math.max(0, this.state.integrity - damage);
                    if (this.state.integrity <= 0) {
                        this.state.gameOver = true;
                    }
                }
                
                // Reset combo on ground impact
                this.comboSystem.resetCombo();
                
                // Enhanced ground explosion
                this.spawnEnhancedExplosion(drone.x, this.canvas.height - GROUND_LEVEL_OFFSET, drone.color, true);
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
                    
                    // Register hit with combo system
                    const comboMultiplier = this.comboSystem.registerHit();
                    
                    // Damage drone
                    drone.health -= 1;
                    this.spawnHitParticles(drone.x, drone.y, drone.color);
                    this.audio.playDroneHit();
                    
                    if (drone.health <= 0) {
                        this.dronePool.release(drone);
                        
                        // Calculate score with all multipliers
                        const baseScore = drone.score || 50;
                        const difficultyScore = this.difficultyManager.getScore(baseScore);
                        const comboScore = Math.ceil(difficultyScore * comboMultiplier);
                        const finalScore = this.activePowerUps.scoreMultiplier > 0 ? 
                            comboScore * 2 : comboScore;
                        this.state.score += finalScore;
                        
                        this.spawnEnhancedExplosion(drone.x, drone.y, drone.color, false);
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
     * Spawn enhanced explosion with multiple effects
     */
    spawnEnhancedExplosion(x, y, color, isLarge = false) {
        // Create standard explosion particles
        this.spawnExplosion(x, y);
        
        // Create enhanced effects
        const effects = createEnhancedExplosion(x, y, color, isLarge);
        
        // Add shockwave
        this.shockwaves.push(effects.shockwave);
        
        // Add debris particles
        effects.particles.forEach(p => {
            const debris = this.debrisPool.acquire();
            Object.assign(debris, p);
        });
        
        // Add screen flash for large explosions
        if (effects.flash) {
            this.screenFlashes.push(effects.flash);
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
     * Update enhanced effects
     */
    updateEnhancedEffects() {
        // Update smoke
        this.smokePool.processActive((smoke) => {
            updateSmokeParticle(smoke);
            return smoke.life >= smoke.maxLife;
        });
        
        // Update debris
        this.debrisPool.processActive((debris) => {
            updateDebrisParticle(debris);
            return debris.life >= debris.maxLife;
        });
        
        // Update shockwaves
        this.shockwaves = this.shockwaves.filter(shockwave => {
            updateShockwave(shockwave);
            return shockwave.active;
        });
        
        // Update laser charges
        this.laserCharges = this.laserCharges.filter(charge => {
            updateLaserCharge(charge);
            return charge.active;
        });
        
        // Update screen flashes
        this.screenFlashes = this.screenFlashes.filter(flash => {
            updateScreenFlash(flash);
            return flash.active;
        });
        
        // Update wave bonus announcements
        this.waveBonusAnnouncements = this.waveBonusAnnouncements.filter(bonus => {
            bonus.life++;
            bonus.y -= 2; // Float upward
            bonus.alpha = Math.max(0, 1 - bonus.life / bonus.maxLife);
            return bonus.life < bonus.maxLife;
        });
    }
    
    /**
     * Update wave state and spawning
     */
    updateWave() {
        if (this.state.gameOver) return;
        
        // Check for wave completion
        if (this.dronePool.getActiveCount() === 0) {
            // Calculate wave bonus before advancing
            const baseBonus = 200;
            const waveMultiplier = this.state.wave * 50;
            const integrityBonus = Math.floor(this.state.integrity * 10);
            const totalBonus = baseBonus + waveMultiplier + integrityBonus;
            
            // Create wave bonus announcement
            this.waveBonusAnnouncements.push({
                baseBonus,
                waveMultiplier,
                integrityBonus,
                totalBonus,
                x: this.canvas.width / 2,
                y: this.canvas.height / 2 - 50,
                life: 0,
                maxLife: 120,
                alpha: 1
            });
            
            this.state.advanceWave();
            this.screenEffects.announceWave(this.state.wave);
            this.audio.playWaveStart();
            this.spawnWave();
        }
        
        // Continuous spawning with difficulty modifier
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
        const description = getPowerUpDescription(type);
        
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
        
        // Show power-up name briefly (reuse wave announcement system)
        console.log(`Power-up activated: ${description}`);
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
        
        // Show difficulty selector
        if (this.showingDifficultySelector) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            DifficultyManager.drawDifficultySelector(
                this.ctx, 
                this.canvas.width, 
                this.canvas.height, 
                this.selectedDifficulty
            );
            requestAnimationFrame((time) => this.gameLoop(time));
            return;
        }
        
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
            this.updateEnhancedEffects();
            this.comboSystem.update();
            this.updateWave();
            this.updatePowerUps();
            this.updateBackground();
        } else {
            // Still update effects even when paused/game over
            this.updateEnhancedEffects();
        }
        
        // Always update screen effects
        this.screenEffects.update();
        
        // Update debug stats
        this.debugOverlay.setStat('Drones', this.dronePool.getActiveCount());
        this.debugOverlay.setStat('Lasers', this.laserPool.getActiveCount());
        this.debugOverlay.setStat('Particles', this.particlePool.getActiveCount());
        this.debugOverlay.setStat('PowerUps', this.powerUpPool.getActiveCount());
        this.debugOverlay.setStat('Wave', this.state.wave);
        this.debugOverlay.setStat('Combo', this.comboSystem.combo);
        
        // Update HUD with difficulty
        const hudState = this.state.getHUDState(this.dronePool.getActiveCount());
        hudState.difficulty = this.difficultyManager.getConfig().name;
        hudState.difficultyColor = this.difficultyManager.getConfig().color;
        updateHUD(hudState);
        
        // Render phase with screen shake
        this.ctx.save();
        this.screenEffects.applyTransform(this.ctx);
        
        // Draw screen flashes first (full screen effect)
        this.screenFlashes.forEach(flash => {
            drawScreenFlash(this.ctx, this.canvas.width, this.canvas.height, flash);
        });
        
        drawBackground(this.ctx, this.canvas.width, this.canvas.height, this.stars, this.state.frameTime);
        
        // Draw laser charges at corners
        this.laserCharges.forEach(charge => drawLaserCharge(this.ctx, charge));
        
        // Draw lasers with glow effect
        this.ctx.save();
        this.ctx.shadowColor = '#00ffff';
        this.ctx.shadowBlur = 8;
        drawLasers(this.ctx, this.laserPool.getActive());
        this.ctx.restore();
        
        // Draw smoke trails (behind drones)
        this.smokePool.getActive().forEach(smoke => drawSmokeParticle(this.ctx, smoke));
        
        // Draw drones with health bars
        const drones = this.dronePool.getActive();
        drones.forEach(drone => {
            if (drone.droneType) {
                drawDroneByType(this.ctx, drone, drone.droneType, this.state.frameTime);
            } else {
                drawDrone(this.ctx, drone, this.state.frameTime);
            }
            
            // Draw health bar for damaged drones
            if (drone.maxHealth && drone.health < drone.maxHealth) {
                this.drawDroneHealthBar(drone);
            }
        });
        
        drawParticles(this.ctx, this.particlePool.getActive());
        
        // Draw debris particles
        this.debrisPool.getActive().forEach(debris => drawDebrisParticle(this.ctx, debris));
        
        // Draw shockwaves
        this.shockwaves.forEach(shockwave => drawShockwave(this.ctx, shockwave));
        
        // Draw power-ups
        const powerUps = this.powerUpPool.getActive();
        powerUps.forEach(powerUp => drawPowerUp(this.ctx, powerUp, this.state.frameTime));
        
        // Draw crosshair with pulsing effect when firing
        const crosshair = this.input.getCrosshair();
        const isFiring = this.input.getIsFiring();
        this.drawEnhancedCrosshair(crosshair.x, crosshair.y, isFiring);
        
        this.ctx.restore();
        
        // Draw overlays (after restore to avoid shake)
        this.screenEffects.drawAnnouncements(this.ctx, this.canvas.width, this.canvas.height);
        
        // Draw combo indicator
        this.comboSystem.draw(this.ctx, this.canvas.width, this.canvas.height);
        
        // Draw wave bonus announcements
        this.drawWaveBonusAnnouncements();
        
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
            // Draw game over with max combo
            this.drawGameOverWithCombo();
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
    
    /**
     * Draw enhanced crosshair with pulsing effect
     */
    drawEnhancedCrosshair(x, y, isFiring) {
        const pulseScale = isFiring ? 1.2 : 1.0;
        const pulseAlpha = isFiring ? 0.8 : 0.6;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.scale(pulseScale, pulseScale);
        
        // Outer glow
        if (isFiring) {
            this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 18, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Main crosshair
        this.ctx.strokeStyle = `rgba(0, 255, 255, ${pulseAlpha})`;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 15, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Cross lines
        this.ctx.beginPath();
        this.ctx.moveTo(-20, 0);
        this.ctx.lineTo(-5, 0);
        this.ctx.moveTo(5, 0);
        this.ctx.lineTo(20, 0);
        this.ctx.moveTo(0, -20);
        this.ctx.lineTo(0, -5);
        this.ctx.moveTo(0, 5);
        this.ctx.lineTo(0, 20);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    /**
     * Draw health bar for damaged drone
     */
    drawDroneHealthBar(drone) {
        const barWidth = drone.radius * 2;
        const barHeight = 4;
        const barX = drone.x - barWidth / 2;
        const barY = drone.y - drone.radius - 10;
        
        this.ctx.save();
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Health
        const healthPercent = drone.health / drone.maxHealth;
        const healthColor = healthPercent > 0.5 ? '#4ade80' : healthPercent > 0.25 ? '#fbbf24' : '#ef4444';
        this.ctx.fillStyle = healthColor;
        this.ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        
        // Border
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        this.ctx.restore();
    }
    
    /**
     * Draw wave completion bonus announcements
     */
    drawWaveBonusAnnouncements() {
        this.waveBonusAnnouncements.forEach(bonus => {
            this.ctx.save();
            this.ctx.globalAlpha = bonus.alpha;
            this.ctx.textAlign = 'center';
            
            // Title
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 32px Arial';
            this.ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
            this.ctx.shadowBlur = 10;
            this.ctx.fillText('WAVE COMPLETE!', bonus.x, bonus.y);
            
            // Bonus breakdown
            this.ctx.shadowBlur = 0;
            this.ctx.font = '20px Arial';
            this.ctx.fillStyle = '#fff';
            this.ctx.fillText(`Base Bonus: ${bonus.baseBonus}`, bonus.x, bonus.y + 35);
            this.ctx.fillText(`Wave Multiplier: ${bonus.waveMultiplier}`, bonus.x, bonus.y + 60);
            this.ctx.fillStyle = '#4ade80';
            this.ctx.fillText(`Integrity Bonus: ${bonus.integrityBonus}`, bonus.x, bonus.y + 85);
            
            // Total
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 28px Arial';
            this.ctx.fillText(`+${bonus.totalBonus} POINTS!`, bonus.x, bonus.y + 115);
            
            this.ctx.restore();
        });
    }
    
    /**
     * Draw game over screen with max combo
     */
    drawGameOverWithCombo() {
        // Dark overlay
        this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Game over text
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Defense Breached', this.canvas.width / 2, this.canvas.height / 2 - 40);
        
        // Max combo display
        if (this.comboSystem.maxCombo > 1) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.fillText(
                `MAX COMBO: ${this.comboSystem.maxCombo}x`, 
                this.canvas.width / 2, 
                this.canvas.height / 2 + 10
            );
        }
        
        // Restart instructions
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Press R to restart', this.canvas.width / 2, this.canvas.height / 2 + 50);
        this.ctx.fillText('Press N to change difficulty', this.canvas.width / 2, this.canvas.height / 2 + 80);
        this.ctx.textAlign = 'start';
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new LaserDefenseGame();
});

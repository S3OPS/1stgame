/**
 * GameState Module - Centralized game state management
 * Single source of truth for all game variables
 */

import {
    INITIAL_SPAWN_COOLDOWN,
    MIN_SPAWN_COOLDOWN,
    SPAWN_COOLDOWN_REDUCTION,
    BASE_DRONES_PER_WAVE,
    DRONES_PER_WAVE_INCREASE,
    MAX_DRONES_PER_WAVE,
    DRONE_DESTROY_SCORE,
    GROUND_HIT_DAMAGE
} from './constants.js';

export class GameState {
    constructor() {
        this.reset();
    }
    
    /**
     * Reset all game state to initial values
     */
    reset() {
        this.score = 0;
        this.integrity = 100;
        this.wave = 1;
        this.spawnTimer = 0;
        this.spawnCooldown = INITIAL_SPAWN_COOLDOWN;
        this.lastLaserTime = 0;
        this.gameOver = false;
        this.lastTime = performance.now();
        this.frameTime = this.lastTime;
    }
    
    /**
     * Add score for destroying a drone
     */
    addDroneDestroyScore() {
        this.score += DRONE_DESTROY_SCORE;
    }
    
    /**
     * Apply damage when drone reaches ground
     */
    applyGroundDamage() {
        this.integrity = Math.max(0, this.integrity - GROUND_HIT_DAMAGE);
        if (this.integrity <= 0) {
            this.gameOver = true;
        }
    }
    
    /**
     * Advance to next wave
     * @returns {number} Wave completion bonus score
     */
    advanceWave() {
        // Calculate wave completion bonus
        const baseBonus = 200;
        const waveMultiplier = this.wave * 50;
        const integrityBonus = Math.floor(this.integrity * 10); // 10 points per % integrity
        const waveBonus = baseBonus + waveMultiplier + integrityBonus;
        
        this.score += waveBonus;
        this.wave += 1;
        this.spawnCooldown = Math.max(
            MIN_SPAWN_COOLDOWN, 
            this.spawnCooldown - SPAWN_COOLDOWN_REDUCTION
        );
        
        return waveBonus;
    }
    
    /**
     * Update spawn timer
     * @returns {boolean} True if should spawn a new drone
     */
    updateSpawnTimer() {
        this.spawnTimer -= 1;
        if (this.spawnTimer <= 0) {
            this.spawnTimer = this.spawnCooldown;
            return true;
        }
        return false;
    }
    
    /**
     * Get number of drones for current wave
     * @returns {number}
     */
    getDronesForWave() {
        return Math.min(
            BASE_DRONES_PER_WAVE + this.wave * DRONES_PER_WAVE_INCREASE, 
            MAX_DRONES_PER_WAVE
        );
    }
    
    /**
     * Update frame timing
     * @param {number} currentTime - Current timestamp
     */
    updateTiming(currentTime) {
        this.lastTime = currentTime;
        this.frameTime = currentTime;
    }
    
    /**
     * Get state snapshot for HUD
     * @param {number} droneCount - Current drone count
     * @returns {Object}
     */
    getHUDState(droneCount) {
        return {
            score: this.score,
            integrity: this.integrity,
            wave: this.wave,
            droneCount
        };
    }
}

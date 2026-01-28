/**
 * DifficultyManager Module - Manage game difficulty settings
 * Provides Easy, Normal, and Hard difficulty modes
 */

export const Difficulty = {
    EASY: 'easy',
    NORMAL: 'normal',
    HARD: 'hard'
};

export class DifficultyManager {
    constructor() {
        this.currentDifficulty = Difficulty.NORMAL;
        this.config = this.getDifficultyConfig(this.currentDifficulty);
    }
    
    /**
     * Get configuration for a difficulty level
     * @param {string} difficulty - Difficulty level
     * @returns {Object} Difficulty configuration
     */
    getDifficultyConfig(difficulty) {
        const configs = {
            [Difficulty.EASY]: {
                name: 'Easy',
                color: '#4ade80',
                droneSpeedMultiplier: 0.7,
                droneHealthMultiplier: 0.8,
                dronesPerWaveMultiplier: 0.8,
                spawnCooldownMultiplier: 1.3,
                baseIntegrity: 150,
                damageMultiplier: 0.7,
                scoreMultiplier: 0.8,
                powerUpFrequency: 12 // seconds
            },
            [Difficulty.NORMAL]: {
                name: 'Normal',
                color: '#60a5fa',
                droneSpeedMultiplier: 1.0,
                droneHealthMultiplier: 1.0,
                dronesPerWaveMultiplier: 1.0,
                spawnCooldownMultiplier: 1.0,
                baseIntegrity: 100,
                damageMultiplier: 1.0,
                scoreMultiplier: 1.0,
                powerUpFrequency: 15 // seconds
            },
            [Difficulty.HARD]: {
                name: 'Hard',
                color: '#ef4444',
                droneSpeedMultiplier: 1.3,
                droneHealthMultiplier: 1.5,
                dronesPerWaveMultiplier: 1.3,
                spawnCooldownMultiplier: 0.7,
                baseIntegrity: 75,
                damageMultiplier: 1.5,
                scoreMultiplier: 1.5,
                powerUpFrequency: 18 // seconds
            }
        };
        
        return configs[difficulty] || configs[Difficulty.NORMAL];
    }
    
    /**
     * Set difficulty level
     * @param {string} difficulty - Difficulty to set
     */
    setDifficulty(difficulty) {
        if (Object.values(Difficulty).includes(difficulty)) {
            this.currentDifficulty = difficulty;
            this.config = this.getDifficultyConfig(difficulty);
        }
    }
    
    /**
     * Get current difficulty
     * @returns {string} Current difficulty level
     */
    getDifficulty() {
        return this.currentDifficulty;
    }
    
    /**
     * Get current difficulty config
     * @returns {Object} Current config
     */
    getConfig() {
        return this.config;
    }
    
    /**
     * Apply difficulty modifiers to drone
     * @param {Object} droneConfig - Base drone configuration
     * @returns {Object} Modified configuration
     */
    applyToDrone(droneConfig) {
        return {
            ...droneConfig,
            speed: droneConfig.speed * this.config.droneSpeedMultiplier,
            health: Math.ceil(droneConfig.health * this.config.droneHealthMultiplier)
        };
    }
    
    /**
     * Get modified drone count for wave
     * @param {number} baseCount - Base drone count
     * @returns {number} Modified count
     */
    getWaveDroneCount(baseCount) {
        return Math.ceil(baseCount * this.config.dronesPerWaveMultiplier);
    }
    
    /**
     * Get modified spawn cooldown
     * @param {number} baseCooldown - Base cooldown
     * @returns {number} Modified cooldown
     */
    getSpawnCooldown(baseCooldown) {
        return Math.floor(baseCooldown * this.config.spawnCooldownMultiplier);
    }
    
    /**
     * Get modified damage amount
     * @param {number} baseDamage - Base damage
     * @returns {number} Modified damage
     */
    getDamage(baseDamage) {
        return Math.ceil(baseDamage * this.config.damageMultiplier);
    }
    
    /**
     * Get modified score value
     * @param {number} baseScore - Base score
     * @returns {number} Modified score
     */
    getScore(baseScore) {
        return Math.ceil(baseScore * this.config.scoreMultiplier);
    }
    
    /**
     * Draw difficulty selector menu
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} canvasWidth - Canvas width
     * @param {number} canvasHeight - Canvas height
     * @param {string} selectedDifficulty - Currently selected difficulty
     */
    static drawDifficultySelector(ctx, canvasWidth, canvasHeight, selectedDifficulty) {
        ctx.save();
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Title
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
        ctx.shadowBlur = 15;
        ctx.fillText('SELECT DIFFICULTY', canvasWidth / 2, 120);
        ctx.shadowBlur = 0;
        
        // Difficulty options
        const options = [
            { difficulty: Difficulty.EASY, y: 220 },
            { difficulty: Difficulty.NORMAL, y: 340 },
            { difficulty: Difficulty.HARD, y: 460 }
        ];
        
        const diffManager = new DifficultyManager();
        
        options.forEach(({ difficulty, y }) => {
            const config = diffManager.getDifficultyConfig(difficulty);
            const isSelected = difficulty === selectedDifficulty;
            
            // Box
            const boxWidth = 400;
            const boxHeight = 80;
            const boxX = canvasWidth / 2 - boxWidth / 2;
            
            if (isSelected) {
                ctx.strokeStyle = config.color;
                ctx.lineWidth = 4;
                ctx.shadowColor = config.color;
                ctx.shadowBlur = 15;
                ctx.strokeRect(boxX - 5, y - 5, boxWidth + 10, boxHeight + 10);
                ctx.shadowBlur = 0;
            }
            
            ctx.fillStyle = isSelected ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)';
            ctx.fillRect(boxX, y, boxWidth, boxHeight);
            
            ctx.strokeStyle = config.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(boxX, y, boxWidth, boxHeight);
            
            // Difficulty name
            ctx.fillStyle = config.color;
            ctx.font = 'bold 32px Arial';
            ctx.fillText(config.name, canvasWidth / 2, y + 45);
            
            // Description
            ctx.fillStyle = '#aaa';
            ctx.font = '16px Arial';
            const desc = difficulty === Difficulty.EASY ? 'Slower enemies, more health' :
                        difficulty === Difficulty.NORMAL ? 'Balanced challenge' :
                        'Fast enemies, less health, higher rewards';
            ctx.fillText(desc, canvasWidth / 2, y + 68);
        });
        
        // Instructions
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.fillText('Use ↑↓ arrows to select, ENTER to confirm', canvasWidth / 2, canvasHeight - 60);
        
        ctx.restore();
    }
}

/**
 * HighScore Module - Local high score tracking with localStorage
 * Manages top 10 scores with player initials, wave reached, and date
 */

const HIGH_SCORE_KEY = 'laserDefenseHighScores';
const MAX_HIGH_SCORES = 10;

/**
 * High score entry structure
 * @typedef {Object} HighScoreEntry
 * @property {string} initials - Player initials (3 characters)
 * @property {number} score - Final score
 * @property {number} wave - Wave reached
 * @property {string} date - Date achieved (ISO string)
 */

/**
 * Get all high scores from localStorage
 * @returns {HighScoreEntry[]} Array of high score entries
 */
export function getHighScores() {
    try {
        const stored = localStorage.getItem(HIGH_SCORE_KEY);
        if (!stored) return [];
        
        const scores = JSON.parse(stored);
        return Array.isArray(scores) ? scores : [];
    } catch (error) {
        console.error('Error loading high scores:', error);
        return [];
    }
}

/**
 * Save high scores to localStorage
 * @param {HighScoreEntry[]} scores - Scores to save
 */
function saveHighScores(scores) {
    try {
        localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(scores));
    } catch (error) {
        console.error('Error saving high scores:', error);
    }
}

/**
 * Check if score qualifies for high score table
 * @param {number} score - Score to check
 * @returns {boolean} True if score makes the top 10
 */
export function isHighScore(score) {
    const scores = getHighScores();
    if (scores.length < MAX_HIGH_SCORES) return true;
    return score > scores[scores.length - 1].score;
}

/**
 * Add a new high score entry
 * @param {string} initials - Player initials
 * @param {number} score - Final score
 * @param {number} wave - Wave reached
 * @returns {number} Position in high score table (1-10), or -1 if not added
 */
export function addHighScore(initials, score, wave) {
    if (!isHighScore(score)) return -1;
    
    const scores = getHighScores();
    const newEntry = {
        initials: initials.toUpperCase().substring(0, 3).padEnd(3, '_'),
        score,
        wave,
        date: new Date().toISOString()
    };
    
    scores.push(newEntry);
    scores.sort((a, b) => b.score - a.score);
    
    // Keep only top 10
    const trimmedScores = scores.slice(0, MAX_HIGH_SCORES);
    saveHighScores(trimmedScores);
    
    // Return position (1-indexed)
    return trimmedScores.findIndex(s => s === newEntry) + 1;
}

/**
 * Format date for display
 * @param {string} isoDate - ISO date string
 * @returns {string} Formatted date
 */
export function formatDate(isoDate) {
    const date = new Date(isoDate);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

/**
 * Clear all high scores
 */
export function clearHighScores() {
    try {
        localStorage.removeItem(HIGH_SCORE_KEY);
    } catch (error) {
        console.error('Error clearing high scores:', error);
    }
}

/**
 * Draw high score table on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @param {number|null} highlightPosition - Position to highlight (optional)
 */
export function drawHighScoreTable(ctx, canvasWidth, canvasHeight, highlightPosition = null) {
    const scores = getHighScores();
    
    ctx.save();
    
    // Draw semi-transparent background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Title
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillText('🏆 HIGH SCORES 🏆', canvasWidth / 2, 80);
    ctx.shadowBlur = 0;
    
    if (scores.length === 0) {
        ctx.fillStyle = '#aaa';
        ctx.font = '24px Arial';
        ctx.fillText('No high scores yet!', canvasWidth / 2, canvasHeight / 2);
        ctx.fillText('Be the first to set a record.', canvasWidth / 2, canvasHeight / 2 + 40);
    } else {
        // Table headers
        const startY = 150;
        const lineHeight = 45;
        const colX = [canvasWidth / 2 - 300, canvasWidth / 2 - 150, canvasWidth / 2 + 50, canvasWidth / 2 + 200];
        
        ctx.fillStyle = '#60a5fa';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('RANK', colX[0], startY);
        ctx.fillText('NAME', colX[1], startY);
        ctx.fillText('SCORE', colX[2], startY);
        ctx.fillText('WAVE', colX[3], startY);
        
        // Draw line under headers
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(colX[0] - 10, startY + 10);
        ctx.lineTo(canvasWidth / 2 + 320, startY + 10);
        ctx.stroke();
        
        // Score entries
        ctx.font = '24px Courier New';
        scores.forEach((entry, index) => {
            const y = startY + 30 + (index + 1) * lineHeight;
            const isHighlighted = highlightPosition === index + 1;
            
            // Highlight row if specified
            if (isHighlighted) {
                ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
                ctx.fillRect(colX[0] - 15, y - 25, canvasWidth / 2 + 335 - (colX[0] - 15), 35);
            }
            
            // Rank color based on position
            if (index === 0) ctx.fillStyle = '#FFD700'; // Gold
            else if (index === 1) ctx.fillStyle = '#C0C0C0'; // Silver
            else if (index === 2) ctx.fillStyle = '#CD7F32'; // Bronze
            else ctx.fillStyle = isHighlighted ? '#FFD700' : '#ddd';
            
            ctx.fillText(`#${index + 1}`, colX[0], y);
            ctx.fillText(entry.initials, colX[1], y);
            ctx.fillText(entry.score.toLocaleString(), colX[2], y);
            ctx.fillText(`${entry.wave}`, colX[3], y);
            
            // Date in smaller font
            ctx.font = '16px Courier New';
            ctx.fillStyle = '#888';
            ctx.fillText(formatDate(entry.date), canvasWidth / 2 + 250, y);
            ctx.font = '24px Courier New';
        });
    }
    
    // Instructions
    ctx.fillStyle = '#aaa';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Press R to restart or ESC to return to game', canvasWidth / 2, canvasHeight - 40);
    
    ctx.restore();
}

/**
 * Show initials entry prompt
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @param {number} score - Final score
 * @param {number} wave - Wave reached
 * @param {string} currentInitials - Current initials being entered
 */
export function drawInitialsPrompt(ctx, canvasWidth, canvasHeight, score, wave, currentInitials) {
    ctx.save();
    
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Congratulations message
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
    ctx.shadowBlur = 15;
    ctx.fillText('🎉 NEW HIGH SCORE! 🎉', canvasWidth / 2, canvasHeight / 2 - 120);
    ctx.shadowBlur = 0;
    
    // Score and wave info
    ctx.fillStyle = '#fff';
    ctx.font = '32px Arial';
    ctx.fillText(`Score: ${score.toLocaleString()}`, canvasWidth / 2, canvasHeight / 2 - 40);
    ctx.fillText(`Wave: ${wave}`, canvasWidth / 2, canvasHeight / 2);
    
    // Prompt
    ctx.fillStyle = '#60a5fa';
    ctx.font = '24px Arial';
    ctx.fillText('Enter your initials:', canvasWidth / 2, canvasHeight / 2 + 60);
    
    // Initials input box
    const boxWidth = 180;
    const boxHeight = 60;
    const boxX = canvasWidth / 2 - boxWidth / 2;
    const boxY = canvasHeight / 2 + 80;
    
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 3;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    
    // Current initials
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 36px Courier New';
    const displayInitials = currentInitials.padEnd(3, '_');
    ctx.fillText(displayInitials, canvasWidth / 2, boxY + 42);
    
    // Instructions
    ctx.fillStyle = '#aaa';
    ctx.font = '18px Arial';
    ctx.fillText('Type 3 letters, then press ENTER', canvasWidth / 2, canvasHeight / 2 + 180);
    
    ctx.restore();
}

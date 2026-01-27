/**
 * InputManager Module - Centralized input handling
 * Handles mouse and keyboard events with proper cleanup
 */

export class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.crosshair = { x: 0, y: 0 };
        this.isFiring = false;
        this.keys = {};
        this.callbacks = {
            restart: null
        };
        
        // Bound event handlers for cleanup
        this.boundMouseMove = this.handleMouseMove.bind(this);
        this.boundMouseDown = this.handleMouseDown.bind(this);
        this.boundMouseUp = this.handleMouseUp.bind(this);
        this.boundKeyDown = this.handleKeyDown.bind(this);
        this.boundKeyUp = this.handleKeyUp.bind(this);
    }
    
    /**
     * Initialize event listeners
     */
    init() {
        window.addEventListener('mousemove', this.boundMouseMove);
        window.addEventListener('mousedown', this.boundMouseDown);
        window.addEventListener('mouseup', this.boundMouseUp);
        window.addEventListener('keydown', this.boundKeyDown);
        window.addEventListener('keyup', this.boundKeyUp);
        
        // Initialize crosshair to center
        this.crosshair.x = this.canvas.width / 2;
        this.crosshair.y = this.canvas.height / 2;
    }
    
    /**
     * Remove all event listeners
     */
    destroy() {
        window.removeEventListener('mousemove', this.boundMouseMove);
        window.removeEventListener('mousedown', this.boundMouseDown);
        window.removeEventListener('mouseup', this.boundMouseUp);
        window.removeEventListener('keydown', this.boundKeyDown);
        window.removeEventListener('keyup', this.boundKeyUp);
    }
    
    /**
     * Set callback for restart action
     * @param {Function} callback - Restart callback
     */
    onRestart(callback) {
        this.callbacks.restart = callback;
    }
    
    /**
     * Handle mouse movement
     * @param {MouseEvent} event
     */
    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.crosshair.x = Math.max(0, Math.min(this.canvas.width, event.clientX - rect.left));
        this.crosshair.y = Math.max(0, Math.min(this.canvas.height, event.clientY - rect.top));
    }
    
    /**
     * Handle mouse button press
     */
    handleMouseDown() {
        this.isFiring = true;
    }
    
    /**
     * Handle mouse button release
     */
    handleMouseUp() {
        this.isFiring = false;
    }
    
    /**
     * Handle key press
     * @param {KeyboardEvent} event
     */
    handleKeyDown(event) {
        const key = event.key.toLowerCase();
        this.keys[key] = true;
        
        if (key === 'r' && this.callbacks.restart) {
            this.callbacks.restart();
        }
    }
    
    /**
     * Handle key release
     * @param {KeyboardEvent} event
     */
    handleKeyUp(event) {
        this.keys[event.key.toLowerCase()] = false;
    }
    
    /**
     * Check if a key is currently pressed
     * @param {string} key - Key to check
     * @returns {boolean}
     */
    isKeyPressed(key) {
        return this.keys[key.toLowerCase()] === true;
    }
    
    /**
     * Get current crosshair position
     * @returns {{x: number, y: number}}
     */
    getCrosshair() {
        return this.crosshair;
    }
    
    /**
     * Check if firing button is held
     * @returns {boolean}
     */
    getIsFiring() {
        return this.isFiring;
    }
}

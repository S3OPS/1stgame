/**
 * ObjectPool - Reusable object pool to reduce garbage collection
 * Optimization: Avoids creating/destroying objects during gameplay
 */

export class ObjectPool {
    constructor(factory, initialSize = 50) {
        this.factory = factory;
        this.pool = [];
        this.active = [];
        
        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.factory());
        }
    }
    
    /**
     * Get an object from the pool, creating if necessary
     * @returns {Object} A reusable object
     */
    acquire() {
        const obj = this.pool.length > 0 ? this.pool.pop() : this.factory();
        this.active.push(obj);
        return obj;
    }
    
    /**
     * Return an object to the pool
     * @param {Object} obj - Object to release
     */
    release(obj) {
        const index = this.active.indexOf(obj);
        if (index !== -1) {
            this.active.splice(index, 1);
            this.pool.push(obj);
        }
    }
    
    /**
     * Release all active objects back to the pool
     */
    releaseAll() {
        while (this.active.length > 0) {
            this.pool.push(this.active.pop());
        }
    }
    
    /**
     * Get count of active objects
     * @returns {number}
     */
    getActiveCount() {
        return this.active.length;
    }
    
    /**
     * Get all active objects (read-only reference)
     * @returns {Array}
     */
    getActive() {
        return this.active;
    }
    
    /**
     * Process active objects in reverse order (safe for removal)
     * @param {Function} callback - Called with (obj, index). Return true to release.
     */
    processActive(callback) {
        for (let i = this.active.length - 1; i >= 0; i--) {
            const shouldRelease = callback(this.active[i], i);
            if (shouldRelease) {
                this.pool.push(this.active[i]);
                this.active.splice(i, 1);
            }
        }
    }
}

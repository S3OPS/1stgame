# Known Issues and Limitations

## Minor Issues (Non-Critical)

### 1. Swarm Drone Grouping
**Status:** Cosmetic issue, does not affect gameplay  
**Description:** The DroneTypes module defines a `groupSize` property (3-5) for Swarm drones, but this is not currently implemented. Swarm drones spawn individually rather than in coordinated groups.  
**Impact:** Low - Swarm drones still function correctly, just spawn one at a time  
**Future Enhancement:** Could implement batch spawning logic to create true swarm behavior

### 2. BOSS Drone Type Placeholder
**Status:** Incomplete feature  
**Description:** A BOSS drone type is defined in the DroneType enum but has no configuration, unlock logic, or rendering.  
**Impact:** None - Never spawns in gameplay  
**Future Enhancement:** Complete implementation for boss battles

### 3. Power-Up Announcement Display
**Status:** Simplified implementation  
**Description:** Power-up collection shows console log instead of on-screen announcement to avoid conflict with wave announcements.  
**Impact:** Low - Users see visual indicator in top-right corner  
**Future Enhancement:** Create separate notification system for multiple overlays

### 4. Color Format Assumptions
**Status:** Potential edge case  
**Description:** Glow effects use string replacement assuming HSL format with '60%'. If drone colors change format, gradients may not render correctly.  
**Impact:** Low - All current drone types use compatible HSL colors  
**Mitigation:** Existing code works with current implementation

## Design Decisions

### Audio Initialization
Audio requires user interaction due to browser autoplay policies. The game initializes audio on first mousedown OR keydown, ensuring it works with keyboard-only users.

### Power-Up Duration vs Spawn
Power-ups spawn every 15 seconds and stay on screen for 15 seconds. This creates a continuous availability pattern where one power-up is always available when collected promptly.

### Score Calculation
Drone scores are now determined by type rather than a fixed base value. This allows for strategic scoring (e.g., Tank drones worth 150 points, Scouts worth 75).

## Testing Notes
All core functionality has been tested:
- ✅ Audio plays on user interaction
- ✅ All drone types spawn correctly
- ✅ Power-ups spawn and activate effects
- ✅ High scores save and display
- ✅ All keyboard controls work
- ✅ No breaking changes to existing code


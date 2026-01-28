# Quick Start Guide - New Features

## 🎮 How to Play with New Features

### Starting the Game

1. **Open the game** - Load `index.html` in a web browser
2. **Select difficulty** - Use ↑↓ arrow keys to choose:
   - **Easy**: Slower enemies, more health, lower score
   - **Normal**: Balanced gameplay
   - **Hard**: Fast enemies, less health, higher score
3. **Press Enter** - Start the game with selected difficulty

### Building Combos

- **Hit drones consecutively** to build your combo
- **Combo multiplier** increases score: 1.0x → 1.2x → 1.4x → ... → 3.0x (max)
- **Timer bar** shows how long you have to maintain combo (3 seconds)
- **Combo resets** if a drone reaches the ground
- **Color-coded**: Green (low) → Yellow → Orange → Red (max)

### Wave Completion

When you clear all drones:
- **Base Bonus**: 200 points
- **Wave Multiplier**: Current wave × 50
- **Integrity Bonus**: Base integrity % × 10
- **Total bonus** displayed with animated breakdown

### Visual Indicators

- **Health Bars**: Appear above damaged drones
  - Green (>50% health)
  - Yellow (25-50% health)
  - Red (<25% health)

- **Smoke Trails**: Emit from drones below 50% health

- **Enhanced Explosions**: Multi-layered effects
  - Shockwave rings
  - Debris particles
  - Screen flash (on ground impacts)

- **Laser Effects**:
  - Charging glow at corners when firing
  - Cyan glow on laser beams
  - Pulsing crosshair when active

### Controls

**Basic**:
- Mouse Move - Aim crosshair
- Click/Hold - Fire lasers
- R - Restart (goes to difficulty selection)
- P - Pause

**New**:
- ↑↓ - Navigate difficulty selection
- Enter - Confirm difficulty
- N - Change difficulty (game over only)

**Other**:
- M - Toggle audio
- H - View high scores
- D - Toggle debug info

### Game Over Screen

Shows:
- Final score
- Wave reached
- **Max combo achieved** (if > 1)
- Press R to restart
- Press N to change difficulty

### Tips for High Scores

1. **Maintain combos** - Don't let drones reach the ground
2. **Preserve integrity** - Higher integrity = bigger wave bonus
3. **Use power-ups** - They stack with combo multipliers
4. **Try Hard mode** - 1.5x score multiplier on everything
5. **Build 10+ combos** - Max out at 3.0x multiplier

### Difficulty Differences

| Aspect | Easy | Normal | Hard |
|--------|------|--------|------|
| Drone Speed | 0.7x | 1.0x | 1.3x |
| Drone Health | 0.8x | 1.0x | 1.5x |
| Drone Count | 0.8x | 1.0x | 1.3x |
| Base Integrity | 150 | 100 | 75 |
| Damage Taken | 0.7x | 1.0x | 1.5x |
| Score Earned | 0.8x | 1.0x | 1.5x |
| Power-up Spawn | 12s | 15s | 18s |

### Score Calculation

```
Base Score = Drone Type Score Value
Difficulty Score = Base Score × Difficulty Multiplier
Combo Score = Difficulty Score × Combo Multiplier
Final Score = Combo Score × Power-up Multiplier (if active)
```

Example:
- Drone worth 100 points
- Hard difficulty: 100 × 1.5 = 150
- 5-hit combo: 150 × 2.0 = 300
- Score power-up: 300 × 2 = **600 points**

### Performance Notes

- All effects use object pooling
- No performance impact even with many effects
- 60 FPS maintained throughout gameplay
- Memory usage optimized

### Troubleshooting

**Game won't start?**
- Ensure you're at difficulty selection screen
- Press Enter to confirm selection

**Combo not appearing?**
- Combo only shows at 2+ hits
- Make sure you're hitting drones consecutively

**Effects not visible?**
- Check that drones are damaged (for smoke)
- Large explosions happen on ground impacts

### Advanced Techniques

1. **Combo Management**: Focus on weak drones first to build combo quickly
2. **Integrity Preservation**: Prioritize dangerous drones near the ground
3. **Power-up Stacking**: Combine score multiplier + combo for massive points
4. **Wave Timing**: Clear waves quickly with high integrity for max bonus

---

**Enjoy the enhanced gameplay!** 🚀

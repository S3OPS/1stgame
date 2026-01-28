# 🎮 New Features Guide

## 🔊 Audio System (AudioManager)
**Keyboard Control:** Press `M` to toggle audio on/off

### Sounds Added:
- **Laser Fire**: High-pitched swoosh when firing
- **Drone Hit**: Metallic clang on laser contact
- **Explosion**: Noise-based boom on drone destruction
- **Ground Impact**: Deep thud when drone reaches ground
- **Wave Start**: Ascending tone for new wave
- **Power-Up Collect**: Cheerful chime on pickup
- **Background Music**: Ambient loop (starts on first click)

## 🤖 Enemy Drone Types (DroneTypes)
Different enemy variants with unique characteristics:

### Drone Variants:
1. **Normal** (Available from Wave 1)
   - Medium speed, medium health
   - Balanced enemy type
   - Circle shape, cyan color

2. **Scout** (Unlocks Wave 2)
   - Fast speed, low health (1 HP)
   - Hard to hit but fragile
   - Triangle shape, green color
   - Worth 75 points

3. **Swarm** (Unlocks Wave 3)
   - Small size, spawns in groups (3-5)
   - Fast but weak
   - Small circles, purple color
   - Worth 25 points each

4. **Tank** (Unlocks Wave 4)
   - Slow speed, high health (5+ HP)
   - Shows health bar above
   - Square shape with armor plates, red color
   - Worth 150 points

## ⭐ Power-Up System (PowerUp)
Collectibles that spawn every 15 seconds and remain on screen for 15 seconds

### Power-Up Types:
1. **🛡️ Shield** (10 seconds)
   - Protects from ground damage
   - Blue hexagon with shield icon

2. **⚡ Rapid Fire** (7.5 seconds)
   - 50% faster laser cooldown
   - Orange hexagon with lightning icon

3. **✨ Triple Laser** (5 seconds)
   - 3 beams per corner (6 total)
   - Purple hexagon with sparkle icon

4. **💎 Score Multiplier** (15 seconds)
   - 2x points for all kills
   - Green hexagon with x2 text

### Usage:
- Move crosshair over power-up to collect
- Active effects shown in top-right corner
- Duration countdown displayed

## 🏆 High Score System (HighScore)
**Keyboard Control:** Press `H` to view high scores anytime

### Features:
- Top 10 scores saved locally (localStorage)
- Auto-detection on game over
- Enter 3-letter initials
- Shows score, wave, and date
- Your score highlighted in gold
- Rankings: Gold (1st), Silver (2nd), Bronze (3rd)

### Controls:
- Type 3 letters for initials
- `BACKSPACE` to delete
- `ENTER` to submit
- `ESC` to exit view
- `R` to restart from high score screen

## 🎯 Updated Controls
| Key | Action |
|-----|--------|
| Mouse Move | Aim crosshair |
| Click/Hold | Fire lasers |
| `R` | Restart game |
| `P` | Pause/Resume |
| `M` | Toggle audio |
| `H` | View high scores |
| `D` | Toggle debug info |
| `ESC` | Exit high score view |

## 💡 Pro Tips
1. Power-ups spawn every 15 seconds and stay on screen for 15 seconds
2. Shield is best saved for waves with many drones
3. Score Multiplier + Tank drones = 300 points each!
4. Triple Laser makes quick work of Swarm groups
5. Scout drones are worth chasing with Rapid Fire
6. Tank health bars help prioritize targets
7. Different drone types have different point values
8. Try to beat your high score each run!

## 🐛 Debug Mode
Press `D` to toggle performance overlay:
- FPS counter
- Active object counts (drones, lasers, particles, power-ups)
- Current wave number


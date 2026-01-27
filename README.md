# 🚁 Laser Defense: AI Drone Assault

A rebuilt HTML5 canvas defense game where AI-controlled drones attack and you stop them with twin corner lasers.

## 🎮 One Command to Rule Them All

```bash
npm start
```

That's it! The game will automatically launch in your browser at `http://localhost:3000`

## 🚀 Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/S3OPS/1stgame.git
   cd 1stgame
   ```

2. **Run the game:**
   ```bash
   npm start
   ```

3. **Play!** Your browser will open automatically. Use the controls below to defend the base.

## 🎯 Features

- **AI Drone Waves**: Drones seek your crosshair with evasive wobble
- **Corner Lasers**: Dual laser beams fire from the bottom corners
- **Particle Effects**: Impact sparks and explosions
- **HUD Display**: Score, base integrity, wave, and drone count

## 🕹️ Controls

- **Mouse Move** - Aim the crosshair
- **Mouse Click/Hold** - Fire corner lasers
- **R** - Restart defense

## 🛠️ Technical Details

### Architecture
- Pure vanilla JavaScript (no frameworks)
- Canvas 2D rendering API
- Object-oriented design pattern
- Event-driven input system

### Animation System
- Request Animation Frame for smooth 60 FPS
- Delta-time normalization for consistent physics
- Particle system with lifecycle management
- Rotation interpolation and damping

### Physics Simulation
- AI steering behavior with wobble offsets
- Collision detection for lasers vs drones
- Wave-based spawning and difficulty scaling

## 📁 Project Structure

```
1stgame/
├── index.html      # Main HTML file with game container
├── game.js         # Game engine and defense logic
├── package.json    # NPM configuration
└── README.md       # This file
```

## 🧪 Development

No build process required! Just edit the files and refresh your browser.

For development with auto-reload, use your preferred static server tooling.

## 🎨 Customization

The game is designed to be easily customizable:

- **Drone appearance**: Edit `drawDrones()` in `game.js`
- **Weapons**: Adjust the laser cadence in `fireLasers()`
- **Difficulty**: Tune wave sizes and spawn cooldowns in `spawnWave()` and `updateWave()`
- **Colors**: Update CSS in `index.html` or canvas drawing calls

## 📊 Performance

- Optimized for 60 FPS on modern browsers
- Particle system with automatic cleanup
- Efficient rendering with canvas layering
- Minimal memory footprint

## 🌟 Future Enhancements

Potential additions:
- Multiple drone types and formations
- Defensive upgrades and power-ups
- Sound effects and music
- Mobile touch controls

## 📄 License

MIT License - Feel free to use and modify!

## 👨‍💻 Author

Created by a Senior Animation Programmer with 15 years of experience in game development and real-time graphics.

---

**Hold the line and defend the base! ✨**

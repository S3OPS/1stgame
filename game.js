/**
 * Laser Defense: AI Drone Assault
 * Rebuilt gameplay focused on defending against AI drones with corner lasers.
 */

const SPAWN_EDGES = 3;
const STAR_COUNT = 150;
const LASER_FIRE_COOLDOWN_MS = 120;
const GROUND_LEVEL_OFFSET = 60;
const LASER_COLLISION_RADIUS = 6;
const MIN_SPAWN_COOLDOWN = 60;
const SPAWN_COOLDOWN_REDUCTION = 8;
const ATMOSPHERIC_LINE_SPACING = 26;
const GROUND_DECORATION_START = 40;
const GROUND_DECORATION_SPACING = 140;
const GROUND_DECORATION_WIDTH = 18;
const GROUND_DECORATION_HEIGHT = 6;

class LaserDefenseGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.canvas.width = 1200;
        this.canvas.height = 700;

        this.crosshair = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 14
        };

        this.lasers = [];
        this.drones = [];
        this.particles = [];
        this.stars = Array.from({ length: STAR_COUNT }, () => {
            const layer = 0.5 + Math.random() * 0.8;
            return {
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: (0.6 + Math.random() * 1.6) * layer,
                alpha: 0.3 + Math.random() * 0.7,
                twinkle: Math.random() * Math.PI * 2,
                twinkleSpeed: 0.0006 + Math.random() * 0.0016,
                layer
            };
        });

        this.score = 0;
        this.integrity = 100;
        this.wave = 1;
        this.spawnTimer = 0;
        this.spawnCooldown = 120;
        this.lastLaserTime = 0;
        this.isFiring = false;
        this.gameOver = false;

        this.keys = {};
        this.lastTime = performance.now();

        this.setupEventListeners();
        this.spawnWave();
        this.gameLoop();
    }

    setupEventListeners() {
        window.addEventListener('mousemove', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            this.crosshair.x = Math.max(0, Math.min(this.canvas.width, event.clientX - rect.left));
            this.crosshair.y = Math.max(0, Math.min(this.canvas.height, event.clientY - rect.top));
        });

        window.addEventListener('mousedown', () => {
            this.isFiring = true;
        });

        window.addEventListener('mouseup', () => {
            this.isFiring = false;
        });

        window.addEventListener('keydown', (event) => {
            this.keys[event.key.toLowerCase()] = true;
            if (event.key.toLowerCase() === 'r') {
                this.resetGame();
            }
        });

        window.addEventListener('keyup', (event) => {
            this.keys[event.key.toLowerCase()] = false;
        });
    }

    resetGame() {
        this.lasers = [];
        this.drones = [];
        this.particles = [];
        this.score = 0;
        this.integrity = 100;
        this.wave = 1;
        this.spawnTimer = 0;
        this.spawnCooldown = 120;
        this.gameOver = false;
        this.spawnWave();
    }

    spawnWave() {
        const droneCount = Math.min(6 + this.wave * 2, 18);
        for (let i = 0; i < droneCount; i++) {
            this.drones.push(this.createDrone());
        }
    }

    createDrone() {
        const edge = Math.floor(Math.random() * SPAWN_EDGES);
        const spawnPadding = 40;
        let x = 0;
        let y = 0;

        if (edge === 0) {
            x = Math.random() * this.canvas.width;
            y = -spawnPadding;
        } else if (edge === 1) {
            x = -spawnPadding;
            y = Math.random() * this.canvas.height * 0.6;
        } else {
            x = this.canvas.width + spawnPadding;
            y = Math.random() * this.canvas.height * 0.6;
        }

        return {
            x,
            y,
            radius: 16 + Math.random() * 6,
            speed: 0.7 + Math.random() * 0.5 + this.wave * 0.05,
            wobble: Math.random() * Math.PI * 2,
            color: `hsl(${180 + Math.random() * 40}, 70%, 60%)`,
            health: 2 + Math.floor(this.wave / 2),
            drift: (Math.random() - 0.5) * 0.6
        };
    }

    fireLasers() {
        const now = performance.now();
        if (!this.isFiring) {
            return;
        }

        if (!this.lastLaserTime) {
            this.lastLaserTime = now;
        }

        if (now - this.lastLaserTime < LASER_FIRE_COOLDOWN_MS) {
            return;
        }

        this.lastLaserTime = now;
        const corners = [
            { x: 0, y: this.canvas.height },
            { x: this.canvas.width, y: this.canvas.height }
        ];

        corners.forEach((corner) => {
            const angle = Math.atan2(this.crosshair.y - corner.y, this.crosshair.x - corner.x);
            const speed = 12;
            this.lasers.push({
                x: corner.x,
                y: corner.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 70,
                originX: corner.x,
                originY: corner.y
            });
        });
    }

    updateLasers() {
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            const laser = this.lasers[i];
            laser.x += laser.vx;
            laser.y += laser.vy;
            laser.life -= 1;

            if (laser.life <= 0 ||
                laser.x < -50 ||
                laser.x > this.canvas.width + 50 ||
                laser.y < -50 ||
                laser.y > this.canvas.height + 50) {
                this.lasers.splice(i, 1);
            }
        }
    }

    updateDrones() {
        const targetX = this.crosshair.x;
        const targetY = this.crosshair.y;

        for (let i = this.drones.length - 1; i >= 0; i--) {
            const drone = this.drones[i];
            const angle = Math.atan2(targetY - drone.y, targetX - drone.x);
            const wobbleOffset = Math.sin(drone.wobble + performance.now() * 0.002) * 0.6;
            drone.x += Math.cos(angle + wobbleOffset) * drone.speed;
            drone.y += Math.sin(angle + wobbleOffset) * drone.speed;
            drone.x += drone.drift;

            if (drone.y > this.canvas.height - GROUND_LEVEL_OFFSET) {
                this.integrity = Math.max(0, this.integrity - 4);
                this.spawnExplosion(drone.x, this.canvas.height - GROUND_LEVEL_OFFSET);
                this.drones.splice(i, 1);
            }
        }

        if (this.integrity <= 0) {
            this.gameOver = true;
        }
    }

    handleCollisions() {
        for (let i = this.drones.length - 1; i >= 0; i--) {
            const drone = this.drones[i];
            for (let j = this.lasers.length - 1; j >= 0; j--) {
                const laser = this.lasers[j];
                const dx = drone.x - laser.x;
                const dy = drone.y - laser.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < drone.radius + LASER_COLLISION_RADIUS) {
                    this.lasers.splice(j, 1);
                    drone.health -= 1;
                    this.spawnHitParticles(drone.x, drone.y, drone.color);
                    if (drone.health <= 0) {
                        this.drones.splice(i, 1);
                        this.score += 50;
                        this.spawnExplosion(drone.x, drone.y);
                    }
                    break;
                }
            }
        }
    }

    spawnHitParticles(x, y, color) {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                life: 20,
                maxLife: 20,
                color,
                size: 2 + Math.random() * 2
            });
        }
    }

    spawnExplosion(x, y) {
        for (let i = 0; i < 18; i++) {
            this.particles.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                life: 35,
                maxLife: 35,
                color: 'rgba(255,180,80,0.95)',
                size: 3 + Math.random() * 4
            });
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 1;
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    updateWave() {
        if (this.drones.length === 0 && !this.gameOver) {
            this.wave += 1;
            this.spawnCooldown = Math.max(MIN_SPAWN_COOLDOWN, this.spawnCooldown - SPAWN_COOLDOWN_REDUCTION);
            this.spawnWave();
        }

        if (this.spawnTimer <= 0 && !this.gameOver) {
            this.spawnTimer = this.spawnCooldown;
            this.drones.push(this.createDrone());
        }

        this.spawnTimer -= 1;
    }

    updateHUD() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('integrity').textContent = Math.round(this.integrity);
        document.getElementById('wave').textContent = this.wave;
        document.getElementById('drones').textContent = this.drones.length;
    }

    drawBackground() {
        const time = performance.now();
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2,
            this.canvas.height * 0.2,
            100,
            this.canvas.width / 2,
            this.canvas.height,
            this.canvas.width
        );
        gradient.addColorStop(0, '#20325c');
        gradient.addColorStop(0.55, '#0b152c');
        gradient.addColorStop(1, '#04060d');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const nebula = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        nebula.addColorStop(0, 'rgba(90,130,255,0.18)');
        nebula.addColorStop(0.45, 'rgba(20,40,90,0)');
        nebula.addColorStop(1, 'rgba(255,120,220,0.12)');
        this.ctx.fillStyle = nebula;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.globalAlpha = 0.5;
        this.ctx.fillStyle = 'rgba(120, 200, 255, 0.08)';
        for (let y = 0; y < this.canvas.height; y += ATMOSPHERIC_LINE_SPACING) {
            this.ctx.fillRect(0, y, this.canvas.width, 1);
        }
        this.ctx.restore();

        this.stars.forEach((star) => {
            star.y += 0.03 * star.layer;
            if (star.y > this.canvas.height + 5) {
                star.y = -10;
                star.x = Math.random() * this.canvas.width;
            }
            const twinkle = 0.6 + 0.4 * Math.sin(time * star.twinkleSpeed + star.twinkle);
            this.ctx.fillStyle = `rgba(220,235,255,${star.alpha * twinkle})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });

        const horizonGlow = this.ctx.createRadialGradient(
            this.canvas.width / 2,
            this.canvas.height - 80,
            20,
            this.canvas.width / 2,
            this.canvas.height - 60,
            this.canvas.width * 0.6
        );
        horizonGlow.addColorStop(0, 'rgba(120,200,255,0.25)');
        horizonGlow.addColorStop(1, 'rgba(10,20,35,0)');
        this.ctx.fillStyle = horizonGlow;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const groundGradient = this.ctx.createLinearGradient(0, this.canvas.height - 90, 0, this.canvas.height);
        groundGradient.addColorStop(0, '#0b1a1e');
        groundGradient.addColorStop(1, '#040609');
        this.ctx.fillStyle = groundGradient;
        this.ctx.fillRect(0, this.canvas.height - 60, this.canvas.width, 60);

        this.ctx.fillStyle = 'rgba(120,200,255,0.2)';
        for (let x = GROUND_DECORATION_START; x < this.canvas.width; x += GROUND_DECORATION_SPACING) {
            this.ctx.fillRect(x, this.canvas.height - 55, GROUND_DECORATION_WIDTH, GROUND_DECORATION_HEIGHT);
        }
    }

    drawLasers() {
        this.ctx.save();
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = 'rgba(255,80,120,0.45)';
        this.ctx.lineWidth = 8;
        this.ctx.shadowColor = 'rgba(255,80,120,0.6)';
        this.ctx.shadowBlur = 18;
        this.lasers.forEach((laser) => {
            this.ctx.beginPath();
            this.ctx.moveTo(laser.originX, laser.originY);
            this.ctx.lineTo(laser.x, laser.y);
            this.ctx.stroke();

            this.ctx.fillStyle = 'rgba(255,200,220,0.7)';
            this.ctx.beginPath();
            this.ctx.arc(laser.x, laser.y, 4, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.shadowBlur = 0;
        this.ctx.strokeStyle = '#fff4f7';
        this.ctx.lineWidth = 2;
        this.lasers.forEach((laser) => {
            this.ctx.beginPath();
            this.ctx.moveTo(laser.originX, laser.originY);
            this.ctx.lineTo(laser.x, laser.y);
            this.ctx.stroke();
        });
        this.ctx.restore();
    }

    drawDrones() {
        this.drones.forEach((drone) => {
            const time = performance.now() * 0.002;
            const tilt = Math.sin(time + drone.wobble) * 0.18;
            this.ctx.save();
            this.ctx.translate(drone.x, drone.y);
            this.ctx.rotate(tilt);
            const bodyGradient = this.ctx.createRadialGradient(
                -drone.radius * 0.3,
                -drone.radius * 0.2,
                drone.radius * 0.2,
                0,
                0,
                drone.radius
            );
            bodyGradient.addColorStop(0, '#f2fbff');
            bodyGradient.addColorStop(0.4, drone.color);
            bodyGradient.addColorStop(1, 'rgba(20,40,60,0.95)');
            this.ctx.fillStyle = bodyGradient;
            this.ctx.shadowColor = 'rgba(120,200,255,0.35)';
            this.ctx.shadowBlur = 12;
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, drone.radius, drone.radius * 0.7, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;

            this.ctx.strokeStyle = 'rgba(120,200,255,0.45)';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(-drone.radius * 0.6, 0);
            this.ctx.lineTo(drone.radius * 0.6, 0);
            this.ctx.stroke();

            this.ctx.fillStyle = 'rgba(200,240,255,0.9)';
            this.ctx.beginPath();
            this.ctx.ellipse(0, -drone.radius * 0.2, drone.radius * 0.35, drone.radius * 0.22, 0, 0, Math.PI * 2);
            this.ctx.fill();

            const thrusterGradient = this.ctx.createRadialGradient(
                0,
                drone.radius * 0.35,
                2,
                0,
                drone.radius * 0.45,
                drone.radius * 0.6
            );
            thrusterGradient.addColorStop(0, 'rgba(130,220,255,0.9)');
            thrusterGradient.addColorStop(1, 'rgba(20,60,120,0)');
            this.ctx.fillStyle = thrusterGradient;
            this.ctx.beginPath();
            this.ctx.ellipse(0, drone.radius * 0.4, drone.radius * 0.5, drone.radius * 0.3, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    drawParticles() {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'lighter';
        this.particles.forEach((particle) => {
            const maxLife = particle.maxLife ?? 35;
            const lifeRatio = Math.max(0, particle.life / maxLife);
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = lifeRatio;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.globalAlpha = lifeRatio * 0.4;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * 2.2, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.restore();
    }

    drawCrosshair() {
        const { x, y, radius } = this.crosshair;
        this.ctx.save();
        this.ctx.strokeStyle = '#bfe6ff';
        this.ctx.lineWidth = 2;
        this.ctx.shadowColor = 'rgba(140,200,255,0.6)';
        this.ctx.shadowBlur = 12;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
        this.ctx.strokeStyle = '#ffd166';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x - radius - 6, y);
        this.ctx.lineTo(x + radius + 6, y);
        this.ctx.moveTo(x, y - radius - 6);
        this.ctx.lineTo(x, y + radius + 6);
        this.ctx.stroke();
        this.ctx.restore();
    }

    drawGameOver() {
        if (!this.gameOver) {
            return;
        }

        this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Defense Breached', this.canvas.width / 2, this.canvas.height / 2 - 10);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Press R to restart', this.canvas.width / 2, this.canvas.height / 2 + 30);
        this.ctx.textAlign = 'start';
    }

    gameLoop(currentTime = performance.now()) {
        const delta = currentTime - this.lastTime;
        this.lastTime = currentTime;

        if (!this.gameOver) {
            this.fireLasers();
            this.updateLasers();
            this.updateDrones();
            this.handleCollisions();
            this.updateParticles();
            this.updateWave();
        }

        this.updateHUD();

        this.drawBackground();
        this.drawLasers();
        this.drawDrones();
        this.drawParticles();
        this.drawCrosshair();
        this.drawGameOver();

        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

window.addEventListener('load', () => {
    new LaserDefenseGame();
});

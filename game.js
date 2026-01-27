/**
 * Laser Defense: AI Drone Assault
 * Rebuilt gameplay focused on defending against AI drones with corner lasers.
 */

const SPAWN_EDGES = 3;
const STAR_COUNT = 80;
const LASER_FIRE_COOLDOWN_MS = 120;
const GROUND_LEVEL_OFFSET = 60;
const LASER_COLLISION_RADIUS = 6;
const MIN_SPAWN_COOLDOWN = 60;
const SPAWN_COOLDOWN_REDUCTION = 8;

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
        this.stars = Array.from({ length: STAR_COUNT }, () => ({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            radius: 0.8 + Math.random() * 1.2
        }));

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
                this.integrity = Math.max(0, this.integrity - 0.2);
                drone.y = this.canvas.height - GROUND_LEVEL_OFFSET;
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
                color
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
                color: 'rgba(255,180,80,0.9)'
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
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2,
            this.canvas.height * 0.2,
            100,
            this.canvas.width / 2,
            this.canvas.height,
            this.canvas.width
        );
        gradient.addColorStop(0, '#1b2a48');
        gradient.addColorStop(1, '#05070f');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = 'rgba(255,255,255,0.06)';
        this.stars.forEach((star) => {
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.ctx.fillStyle = '#1a2a1f';
        this.ctx.fillRect(0, this.canvas.height - 50, this.canvas.width, 50);
    }

    drawLasers() {
        this.ctx.strokeStyle = '#ff3344';
        this.ctx.lineWidth = 3;
        this.lasers.forEach((laser) => {
            this.ctx.beginPath();
            this.ctx.moveTo(laser.originX, laser.originY);
            this.ctx.lineTo(laser.x, laser.y);
            this.ctx.stroke();
        });
    }

    drawDrones() {
        this.drones.forEach((drone) => {
            this.ctx.save();
            this.ctx.translate(drone.x, drone.y);
            this.ctx.fillStyle = drone.color;
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, drone.radius, drone.radius * 0.7, 0, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.strokeStyle = 'rgba(0,0,0,0.4)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(-drone.radius * 0.6, 0);
            this.ctx.lineTo(drone.radius * 0.6, 0);
            this.ctx.stroke();

            this.ctx.fillStyle = 'rgba(255,255,255,0.7)';
            this.ctx.beginPath();
            this.ctx.arc(-drone.radius * 0.3, -drone.radius * 0.2, 3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    drawParticles() {
        this.particles.forEach((particle) => {
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = Math.max(0, particle.life / 35);
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        });
    }

    drawCrosshair() {
        const { x, y, radius } = this.crosshair;
        this.ctx.strokeStyle = '#ffd166';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(x - radius - 6, y);
        this.ctx.lineTo(x + radius + 6, y);
        this.ctx.moveTo(x, y - radius - 6);
        this.ctx.lineTo(x, y + radius + 6);
        this.ctx.stroke();
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

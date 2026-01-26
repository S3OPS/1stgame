/**
 * Drone Flying Animation Game
 * A sophisticated physics-based drone simulator with smooth animations
 * Created by Senior Animation Programmer
 */

class DroneGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 1200;
        this.canvas.height = 700;
        
        // Drone properties
        this.drone = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            width: 60,
            height: 20,
            velocityX: 0,
            velocityY: 0,
            thrust: 0,
            maxThrust: 2,
            rotation: 0,
            rotationVelocity: 0
        };
        
        // Physics constants
        this.gravity = 0.3;
        this.airResistance = 0.98;
        this.rotationDamping = 0.95;
        
        // Control state
        this.keys = {};
        
        // Particle system for propellers
        this.particles = [];
        this.maxParticles = 100;
        
        // Environment
        this.clouds = [];
        this.birds = [];
        this.time = 0;
        this.battery = 100;
        
        // Camera
        this.camera = {
            x: 0,
            y: 0,
            smoothing: 0.1
        };
        
        // Initialize environment
        this.initEnvironment();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start game loop
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    initEnvironment() {
        // Create clouds
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width * 2,
                y: Math.random() * this.canvas.height * 0.4,
                width: 80 + Math.random() * 60,
                height: 30 + Math.random() * 20,
                speed: 0.2 + Math.random() * 0.3
            });
        }
        
        // Create birds
        for (let i = 0; i < 3; i++) {
            this.birds.push({
                x: Math.random() * this.canvas.width,
                y: 50 + Math.random() * 100,
                phase: Math.random() * Math.PI * 2,
                speed: 1 + Math.random()
            });
        }
    }
    
    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key.toLowerCase() === 'r') {
                this.resetDrone();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    resetDrone() {
        this.drone.x = this.canvas.width / 2;
        this.drone.y = this.canvas.height / 2;
        this.drone.velocityX = 0;
        this.drone.velocityY = 0;
        this.drone.thrust = 0;
        this.drone.rotation = 0;
        this.drone.rotationVelocity = 0;
        this.battery = 100;
    }
    
    handleInput() {
        // Thrust control
        if (this.keys['w'] || this.keys['arrowup']) {
            this.drone.thrust = Math.min(this.drone.thrust + 0.1, this.drone.maxThrust);
            this.battery = Math.max(0, this.battery - 0.02);
        } else if (this.keys['s'] || this.keys['arrowdown']) {
            this.drone.thrust = Math.max(this.drone.thrust - 0.1, 0);
        } else {
            this.drone.thrust *= 0.95;
        }
        
        // Horizontal control
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.drone.rotationVelocity -= 0.002;
            this.drone.velocityX -= 0.15;
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            this.drone.rotationVelocity += 0.002;
            this.drone.velocityX += 0.15;
        }
    }
    
    updatePhysics(deltaTime) {
        // Apply thrust (upward force)
        this.drone.velocityY -= this.drone.thrust;
        
        // Apply gravity
        this.drone.velocityY += this.gravity;
        
        // Apply air resistance
        this.drone.velocityX *= this.airResistance;
        this.drone.velocityY *= this.airResistance;
        
        // Update position
        this.drone.x += this.drone.velocityX;
        this.drone.y += this.drone.velocityY;
        
        // Update rotation
        this.drone.rotation += this.drone.rotationVelocity;
        this.drone.rotationVelocity *= this.rotationDamping;
        
        // Clamp rotation
        this.drone.rotation = Math.max(-0.3, Math.min(0.3, this.drone.rotation));
        
        // Boundary collision with bounce
        if (this.drone.y > this.canvas.height - 50) {
            this.drone.y = this.canvas.height - 50;
            this.drone.velocityY *= -0.5;
        }
        if (this.drone.y < 50) {
            this.drone.y = 50;
            this.drone.velocityY *= -0.5;
        }
        if (this.drone.x < 30) {
            this.drone.x = 30;
            this.drone.velocityX *= -0.5;
        }
        if (this.drone.x > this.canvas.width - 30) {
            this.drone.x = this.canvas.width - 30;
            this.drone.velocityX *= -0.5;
        }
        
        // Recharge battery slowly when not thrusting
        if (this.drone.thrust < 0.1) {
            this.battery = Math.min(100, this.battery + 0.01);
        }
    }
    
    updateParticles(deltaTime) {
        // Create new particles from propellers
        if (this.drone.thrust > 0.1 && this.particles.length < this.maxParticles) {
            // Left propeller
            this.particles.push({
                x: this.drone.x - 20,
                y: this.drone.y + 5,
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * 2 + 1,
                life: 1,
                size: 3 + Math.random() * 3
            });
            
            // Right propeller
            this.particles.push({
                x: this.drone.x + 20,
                y: this.drone.y + 5,
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * 2 + 1,
                life: 1,
                size: 3 + Math.random() * 3
            });
        }
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            p.vy += 0.1; // Gravity effect on particles
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    updateEnvironment(deltaTime) {
        // Update clouds
        this.clouds.forEach(cloud => {
            cloud.x -= cloud.speed;
            if (cloud.x + cloud.width < 0) {
                cloud.x = this.canvas.width;
                cloud.y = Math.random() * this.canvas.height * 0.4;
            }
        });
        
        // Update birds
        this.birds.forEach(bird => {
            bird.x += bird.speed;
            bird.phase += 0.1;
            if (bird.x > this.canvas.width) {
                bird.x = -20;
                bird.y = 50 + Math.random() * 100;
            }
        });
        
        this.time += deltaTime;
    }
    
    updateCamera() {
        // Smooth camera follow
        const targetX = this.drone.x - this.canvas.width / 2;
        const targetY = this.drone.y - this.canvas.height / 2;
        
        this.camera.x += (targetX - this.camera.x) * this.camera.smoothing;
        this.camera.y += (targetY - this.camera.y) * this.camera.smoothing;
    }
    
    drawSky() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#E0F6FF');
        gradient.addColorStop(1, '#90EE90');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.clouds.forEach(cloud => {
            this.ctx.beginPath();
            this.ctx.ellipse(cloud.x, cloud.y, cloud.width / 2, cloud.height / 2, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.ellipse(cloud.x + cloud.width * 0.3, cloud.y - cloud.height * 0.2, cloud.width / 3, cloud.height / 2.5, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.ellipse(cloud.x - cloud.width * 0.3, cloud.y - cloud.height * 0.1, cloud.width / 3.5, cloud.height / 3, 0, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawBirds() {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.birds.forEach(bird => {
            const wingAngle = Math.sin(bird.phase) * 0.5;
            this.ctx.beginPath();
            this.ctx.moveTo(bird.x, bird.y);
            this.ctx.quadraticCurveTo(bird.x - 8, bird.y - 8 + wingAngle * 5, bird.x - 15, bird.y - 3);
            this.ctx.moveTo(bird.x, bird.y);
            this.ctx.quadraticCurveTo(bird.x + 8, bird.y - 8 + wingAngle * 5, bird.x + 15, bird.y - 3);
            this.ctx.stroke();
        });
    }
    
    drawGround() {
        // Ground
        this.ctx.fillStyle = '#8B7355';
        this.ctx.fillRect(0, this.canvas.height - 40, this.canvas.width, 40);
        
        // Grass
        this.ctx.fillStyle = '#90EE90';
        this.ctx.fillRect(0, this.canvas.height - 45, this.canvas.width, 5);
    }
    
    drawDrone() {
        this.ctx.save();
        this.ctx.translate(this.drone.x, this.drone.y);
        this.ctx.rotate(this.drone.rotation);
        
        // Drone body
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(-this.drone.width / 2, -this.drone.height / 2, this.drone.width, this.drone.height);
        
        // Cockpit
        this.ctx.fillStyle = '#4169E1';
        this.ctx.fillRect(-10, -this.drone.height / 2 - 5, 20, 10);
        
        // Propeller arms
        this.ctx.strokeStyle = '#555';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(-25, 0);
        this.ctx.lineTo(-25, -15);
        this.ctx.moveTo(25, 0);
        this.ctx.lineTo(25, -15);
        this.ctx.stroke();
        
        // Propellers (animated)
        const propellerAngle = this.time * 0.5;
        
        // Left propeller
        this.ctx.save();
        this.ctx.translate(-25, -15);
        this.ctx.rotate(propellerAngle);
        this.ctx.fillStyle = this.drone.thrust > 0.1 ? 'rgba(255, 255, 255, 0.6)' : 'rgba(200, 200, 200, 0.4)';
        this.ctx.fillRect(-15, -2, 30, 4);
        this.ctx.fillRect(-2, -15, 4, 30);
        this.ctx.restore();
        
        // Right propeller
        this.ctx.save();
        this.ctx.translate(25, -15);
        this.ctx.rotate(-propellerAngle);
        this.ctx.fillStyle = this.drone.thrust > 0.1 ? 'rgba(255, 255, 255, 0.6)' : 'rgba(200, 200, 200, 0.4)';
        this.ctx.fillRect(-15, -2, 30, 4);
        this.ctx.fillRect(-2, -15, 4, 30);
        this.ctx.restore();
        
        // Propeller centers
        this.ctx.fillStyle = '#FF4500';
        this.ctx.beginPath();
        this.ctx.arc(-25, -15, 5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(25, -15, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawParticles() {
        this.particles.forEach(p => {
            this.ctx.fillStyle = `rgba(200, 200, 200, ${p.life * 0.6})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawShadow() {
        const shadowY = this.canvas.height - 45;
        const shadowScale = Math.max(0.2, 1 - (shadowY - this.drone.y) / 300);
        
        this.ctx.save();
        this.ctx.globalAlpha = 0.3 * shadowScale;
        this.ctx.fillStyle = '#000';
        this.ctx.translate(this.drone.x, shadowY);
        this.ctx.scale(shadowScale, shadowScale * 0.3);
        this.ctx.fillRect(-this.drone.width / 2, -10, this.drone.width, 20);
        this.ctx.restore();
    }
    
    updateHUD() {
        const altitude = Math.round(this.canvas.height - this.drone.y - 50);
        const speed = Math.round(Math.sqrt(this.drone.velocityX ** 2 + this.drone.velocityY ** 2) * 10) / 10;
        
        document.getElementById('altitude').textContent = Math.max(0, altitude);
        document.getElementById('speed').textContent = speed;
        document.getElementById('battery').textContent = Math.round(this.battery);
    }
    
    gameLoop(currentTime = performance.now()) {
        const deltaTime = (currentTime - this.lastTime) / 16.67; // Normalize to 60fps
        this.lastTime = currentTime;
        
        // Update
        this.handleInput();
        this.updatePhysics(deltaTime);
        this.updateParticles(deltaTime);
        this.updateEnvironment(deltaTime);
        this.updateCamera();
        
        // Render
        this.drawSky();
        this.drawClouds();
        this.drawBirds();
        this.drawGround();
        this.drawShadow();
        this.drawParticles();
        this.drawDrone();
        
        // Update HUD
        this.updateHUD();
        
        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new DroneGame();
});

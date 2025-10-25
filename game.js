// Quake Fiend Runner Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load niche apple images
const appleImage = new Image();
appleImage.src = 'niche-apple.png';
let imageLoaded = false;
appleImage.onload = () => {
    imageLoaded = true;
    console.log('Niche apple image loaded! 🍎');
};
appleImage.onerror = () => {
    console.log('Using drawn apple instead');
    imageLoaded = false;
};

// Load tongue-out version
const appleTongueImage = new Image();
appleTongueImage.src = 'niche-apple-2.png';
let tongueImageLoaded = false;
appleTongueImage.onload = () => {
    tongueImageLoaded = true;
    console.log('Niche apple tongue image loaded! 👅');
};
appleTongueImage.onerror = () => {
    console.log('Tongue image not found, will use main image');
    tongueImageLoaded = false;
};

// Game state
const game = {
    running: false,
    paused: false,
    speed: 5,
    score: 0,
    distance: 0,
    speedIncrement: 0.001,
    maxSpeed: 15
};

// Lane system (3 lanes like Subway Surfers)
const lanes = {
    positions: [200, 400, 600],
    width: 150
};

// Player (Niche Apple)
class Player {
    constructor() {
        this.lane = 1; // Start in middle lane
        this.x = lanes.positions[this.lane];
        this.y = 400;
        this.width = 80;
        this.height = 100;
        this.targetX = this.x;
        this.moveSpeed = 15;
        this.animFrame = 0;
        this.animSpeed = 0.2;
        this.tongueOut = false;
        this.tongueTimer = 0;
        // Power-up effects
        this.invincible = false;
        this.invincibleTimer = 0;
        this.magnetActive = false;
        this.magnetTimer = 0;
        this.speedBoostActive = false;
        this.speedBoostTimer = 0;
    }

    moveLeft() {
        if (this.lane > 0) {
            this.lane--;
            this.targetX = lanes.positions[this.lane];
        }
    }

    moveRight() {
        if (this.lane < lanes.positions.length - 1) {
            this.lane++;
            this.targetX = lanes.positions[this.lane];
        }
    }

    update() {
        // Smooth movement between lanes
        if (this.x < this.targetX) {
            this.x = Math.min(this.x + this.moveSpeed, this.targetX);
        } else if (this.x > this.targetX) {
            this.x = Math.max(this.x - this.moveSpeed, this.targetX);
        }
        
        this.animFrame += this.animSpeed;
        
        // Update tongue timer
        if (this.tongueOut) {
            this.tongueTimer--;
            if (this.tongueTimer <= 0) {
                this.tongueOut = false;
            }
        }
        
        // Update power-up timers
        if (this.invincible) {
            this.invincibleTimer--;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
        }
        
        if (this.magnetActive) {
            this.magnetTimer--;
            if (this.magnetTimer <= 0) {
                this.magnetActive = false;
            }
        }
        
        if (this.speedBoostActive) {
            this.speedBoostTimer--;
            if (this.speedBoostTimer <= 0) {
                this.speedBoostActive = false;
            }
        }
    }

    activatePowerUp(type) {
        if (type === 'invincible') {
            this.invincible = true;
            this.invincibleTimer = 300; // 5 seconds at 60fps
        } else if (type === 'magnet') {
            this.magnetActive = true;
            this.magnetTimer = 360; // 6 seconds
        } else if (type === 'speedboost') {
            this.speedBoostActive = true;
            this.speedBoostTimer = 240; // 4 seconds
        }
    }

    showTongue() {
        this.tongueOut = true;
        this.tongueTimer = 30; // Show tongue for 30 frames
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Draw invincibility shield if active
        if (this.invincible) {
            const pulseSize = Math.sin(this.animFrame * 2) * 10 + 60;
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 5;
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        
        // Draw magnet effect if active
        if (this.magnetActive) {
            ctx.strokeStyle = '#ff00ff';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.shadowColor = '#ff00ff';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(0, 0, 70, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.shadowBlur = 0;
        }
        
        // Draw speed lines if speed boost active
        if (this.speedBoostActive) {
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
            ctx.lineWidth = 3;
            for (let i = 0; i < 5; i++) {
                const offset = i * 20 - 40;
                ctx.beginPath();
                ctx.moveTo(offset - 80, -30 + i * 15);
                ctx.lineTo(offset - 40, -30 + i * 15);
                ctx.stroke();
            }
        }
        
        // Draw Niche Apple character
        const bounce = Math.sin(this.animFrame) * 5;
        
        // Draw the image if loaded, otherwise draw the original apple
        if (imageLoaded) {
            ctx.save();
            ctx.translate(0, bounce);
            
            // Draw the niche apple image (swap images based on tongue state)
            const imgSize = 100;
            
            // Use tongue image if available and tongue is out, otherwise use normal image
            if (this.tongueOut && tongueImageLoaded) {
                ctx.drawImage(appleTongueImage, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
            } else {
                ctx.drawImage(appleImage, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
            }
            
            ctx.restore();
        } else {
            // Fallback: Draw original apple
            this.drawOriginalApple(bounce);
        }
        
        ctx.restore();
    }

    drawOriginalApple(bounce) {
        // Apple body (red apple)
        const gradient = ctx.createRadialGradient(-10, bounce - 10, 10, 0, bounce, 45);
        gradient.addColorStop(0, '#ff4444');
        gradient.addColorStop(0.6, '#cc0000');
        gradient.addColorStop(1, '#990000');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        // Apple shape
        ctx.ellipse(0, bounce, 45, 50, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Highlight on apple
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.ellipse(-15, bounce - 15, 12, 15, -0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Stem
        ctx.fillStyle = '#4a3a2a';
        ctx.fillRect(-3, bounce - 50, 6, 15);
        
        // Leaf
        ctx.fillStyle = '#2d5016';
        ctx.beginPath();
        ctx.ellipse(8, bounce - 45, 12, 8, 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Leaf vein
        ctx.strokeStyle = '#1a3010';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(8, bounce - 50);
        ctx.lineTo(8, bounce - 40);
        ctx.stroke();
        
        // Face
        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(-12, bounce - 5, 6, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(12, bounce - 5, 6, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye shine
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-10, bounce - 8, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(14, bounce - 8, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Smile/Mouth
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, bounce + 5, 15, 0.2, Math.PI - 0.2);
        ctx.stroke();
        
        // Tongue (if collecting)
        if (this.tongueOut) {
            ctx.fillStyle = '#ff6b9d';
            ctx.beginPath();
            ctx.ellipse(0, bounce + 20, 10, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Tongue outline
            ctx.strokeStyle = '#d64a7a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(0, bounce + 20, 10, 12, 0, 0, Math.PI);
            ctx.stroke();
        }
        
        // Little arms
        ctx.strokeStyle = '#cc0000';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        
        // Left arm
        ctx.beginPath();
        ctx.moveTo(-35, bounce + 5);
        ctx.lineTo(-50, bounce + 15);
        ctx.stroke();
        
        // Right arm
        ctx.beginPath();
        ctx.moveTo(35, bounce + 5);
        ctx.lineTo(50, bounce + 15);
        ctx.stroke();
        
        // Hands (little circles)
        ctx.fillStyle = '#cc0000';
        ctx.beginPath();
        ctx.arc(-50, bounce + 15, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(50, bounce + 15, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
}

// Collectible class (6s and 7s)
class Collectible {
    constructor(lane, type) {
        this.lane = lane;
        this.x = lanes.positions[lane];
        this.y = -50;
        this.width = 40;
        this.height = 50;
        this.type = type; // '6' or '7'
        this.collected = false;
        this.rotation = 0;
        this.rotationSpeed = 0.1;
    }

    update() {
        this.y += game.speed;
        this.rotation += this.rotationSpeed;
    }

    draw() {
        if (this.collected) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Glowing effect
        ctx.shadowColor = '#ff6600';
        ctx.shadowBlur = 20;
        
        // Draw number with Quake style
        ctx.fillStyle = '#ff6600';
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 3;
        ctx.font = 'bold 48px "Courier New"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.strokeText(this.type, 0, 0);
        ctx.fillText(this.type, 0, 0);
        
        ctx.shadowBlur = 0;
        ctx.restore();
    }

    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
}

// Power-Up class
class PowerUp {
    constructor(lane, type) {
        this.lane = lane;
        this.x = lanes.positions[lane];
        this.y = -50;
        this.width = 50;
        this.height = 50;
        this.type = type; // 'invincible', 'magnet', 'speedboost'
        this.collected = false;
        this.rotation = 0;
        this.rotationSpeed = 0.05;
        this.pulse = 0;
    }

    update() {
        this.y += game.speed;
        this.rotation += this.rotationSpeed;
        this.pulse += 0.1;
    }

    draw() {
        if (this.collected) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        const pulseSize = Math.sin(this.pulse) * 5 + 30;
        
        if (this.type === 'invincible') {
            // Shield power-up (cyan)
            ctx.strokeStyle = '#00ffff';
            ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 20;
            ctx.lineWidth = 4;
            
            // Shield shape
            ctx.beginPath();
            ctx.moveTo(0, -pulseSize);
            ctx.quadraticCurveTo(pulseSize, -pulseSize / 2, pulseSize, pulseSize / 2);
            ctx.quadraticCurveTo(pulseSize / 2, pulseSize, 0, pulseSize + 10);
            ctx.quadraticCurveTo(-pulseSize / 2, pulseSize, -pulseSize, pulseSize / 2);
            ctx.quadraticCurveTo(-pulseSize, -pulseSize / 2, 0, -pulseSize);
            ctx.fill();
            ctx.stroke();
            
        } else if (this.type === 'magnet') {
            // Magnet power-up (pink/purple)
            ctx.rotate(this.rotation);
            ctx.strokeStyle = '#ff00ff';
            ctx.fillStyle = 'rgba(255, 0, 255, 0.3)';
            ctx.shadowColor = '#ff00ff';
            ctx.shadowBlur = 20;
            ctx.lineWidth = 4;
            
            // Horseshoe magnet shape
            ctx.beginPath();
            ctx.arc(0, 0, pulseSize, 0, Math.PI, true);
            ctx.lineTo(-pulseSize, pulseSize / 2);
            ctx.lineTo(-pulseSize + 10, pulseSize / 2);
            ctx.lineTo(-pulseSize + 10, 0);
            ctx.arc(0, 0, pulseSize - 10, Math.PI, 0, false);
            ctx.lineTo(pulseSize - 10, pulseSize / 2);
            ctx.lineTo(pulseSize, pulseSize / 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // N and S poles
            ctx.fillStyle = '#ff0000';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('N', -pulseSize + 5, pulseSize / 2 - 5);
            ctx.fillStyle = '#0000ff';
            ctx.fillText('S', pulseSize - 5, pulseSize / 2 - 5);
            
        } else if (this.type === 'speedboost') {
            // Speed boost power-up (yellow)
            ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
            ctx.strokeStyle = '#ffff00';
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 20;
            ctx.lineWidth = 4;
            
            // Lightning bolt
            ctx.beginPath();
            ctx.moveTo(-pulseSize / 4, -pulseSize);
            ctx.lineTo(pulseSize / 4, -pulseSize / 4);
            ctx.lineTo(0, -pulseSize / 4);
            ctx.lineTo(pulseSize / 4, pulseSize);
            ctx.lineTo(-pulseSize / 4, pulseSize / 4);
            ctx.lineTo(0, pulseSize / 4);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        
        ctx.shadowBlur = 0;
        ctx.restore();
    }

    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
}

// Obstacle class (Scary Brainrot Memes)
class Obstacle {
    constructor(lane) {
        this.lane = lane;
        this.x = lanes.positions[lane];
        this.y = -100;
        this.width = 80;
        this.height = 100;
        const types = ['skibidi', 'grimace', 'huggy'];
        this.type = types[Math.floor(Math.random() * types.length)];
        this.animFrame = Math.random() * Math.PI * 2;
    }

    update() {
        this.y += game.speed;
        this.animFrame += 0.1;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        const shake = Math.sin(this.animFrame * 3) * 2;
        
        if (this.type === 'skibidi') {
            // Skibidi Toilet - cursed toilet creature
            ctx.translate(shake, 0);
            
            // Toilet bowl
            ctx.fillStyle = '#e8e8e8';
            ctx.fillRect(-35, -10, 70, 60);
            
            // Toilet rim (darker)
            ctx.fillStyle = '#d0d0d0';
            ctx.fillRect(-40, -15, 80, 10);
            
            // Water (dark/ominous)
            ctx.fillStyle = '#1a4d4d';
            ctx.fillRect(-30, 0, 60, 40);
            
            // Creepy face emerging from toilet
            ctx.fillStyle = '#3d5c3d';
            ctx.beginPath();
            ctx.ellipse(0, -30, 30, 35, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Evil red eyes
            ctx.fillStyle = '#ff0000';
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.ellipse(-12, -35, 8, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(12, -35, 8, 10, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Creepy smile
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, -20, 15, 0.3, Math.PI - 0.3);
            ctx.stroke();
            
            // Teeth
            for (let i = -10; i <= 10; i += 5) {
                ctx.fillStyle = '#fff';
                ctx.fillRect(i - 2, -20, 3, 6);
            }
            
        } else if (this.type === 'grimace') {
            // Grimace Shake Monster
            ctx.translate(0, shake);
            
            // Purple body
            const grimaceGradient = ctx.createRadialGradient(0, -20, 10, 0, 0, 50);
            grimaceGradient.addColorStop(0, '#9966cc');
            grimaceGradient.addColorStop(1, '#4a2454');
            ctx.fillStyle = grimaceGradient;
            
            ctx.beginPath();
            ctx.ellipse(0, 0, 40, 50, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Creepy dripping texture
            ctx.fillStyle = '#6b4684';
            for (let i = -30; i < 30; i += 15) {
                ctx.beginPath();
                ctx.moveTo(i, -20);
                ctx.lineTo(i, 40 + Math.sin(this.animFrame + i) * 10);
                ctx.lineTo(i + 5, 40 + Math.sin(this.animFrame + i) * 10);
                ctx.lineTo(i + 5, -20);
                ctx.fill();
            }
            
            // Multiple eyes (uncanny)
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.ellipse(-15, -15, 10, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(15, -15, 10, 12, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // White glowing pupils
            ctx.fillStyle = '#fff';
            ctx.shadowColor = '#fff';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(-15, -17, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(15, -17, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Distorted mouth
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(-20, 10);
            ctx.quadraticCurveTo(-10, 20 + Math.sin(this.animFrame) * 5, 0, 15);
            ctx.quadraticCurveTo(10, 20 + Math.sin(this.animFrame) * 5, 20, 10);
            ctx.stroke();
            
        } else if (this.type === 'huggy') {
            // Huggy Wuggy inspired creature
            ctx.translate(shake, shake);
            
            // Blue furry body
            ctx.fillStyle = '#0066cc';
            ctx.beginPath();
            ctx.ellipse(0, 0, 40, 55, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Fur texture (jagged)
            ctx.strokeStyle = '#0055aa';
            ctx.lineWidth = 2;
            for (let angle = 0; angle < Math.PI * 2; angle += 0.3) {
                const x1 = Math.cos(angle) * 35;
                const y1 = Math.sin(angle) * 50;
                const x2 = Math.cos(angle) * 45;
                const y2 = Math.sin(angle) * 60;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
            
            // Large creepy eyes
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.ellipse(-12, -15, 12, 18, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(12, -15, 12, 18, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Yellow glowing pupils
            ctx.fillStyle = '#ffff00';
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(-12, -15, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(12, -15, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Nightmare mouth with sharp teeth
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.ellipse(0, 15, 25, 20, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Sharp teeth
            ctx.fillStyle = '#fff';
            for (let i = -20; i <= 20; i += 8) {
                ctx.beginPath();
                ctx.moveTo(i, 10);
                ctx.lineTo(i - 3, 25);
                ctx.lineTo(i + 3, 25);
                ctx.fill();
                
                ctx.beginPath();
                ctx.moveTo(i, 25);
                ctx.lineTo(i - 3, 10);
                ctx.lineTo(i + 3, 10);
                ctx.fill();
            }
            
            // Long arms
            ctx.strokeStyle = '#0066cc';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(-30, 10);
            ctx.lineTo(-45, 35);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(30, 10);
            ctx.lineTo(45, 35);
            ctx.stroke();
        }
        
        ctx.restore();
    }

    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
}

// Game objects
let player;
let collectibles = [];
let obstacles = [];
let particles = [];
let powerUps = [];

// Background elements
let roadLines = [];

// "You go twin" messages
let twinMessages = [];

class TwinMessage {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.opacity = 1;
        this.life = 120; // Show for 2 seconds at 60fps
        this.vy = -2;
    }

    update() {
        this.y += this.vy;
        this.life--;
        this.opacity = this.life / 120;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#ff1493';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.font = 'bold 36px "Courier New"';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ff1493';
        ctx.shadowBlur = 20;
        ctx.strokeText('YOU GO TWIN! 💅', this.x, this.y);
        ctx.fillText('YOU GO TWIN! 💅', this.x, this.y);
        ctx.restore();
    }
}

// Particle effect for collecting items
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.life = 1;
        this.color = color;
        this.size = Math.random() * 8 + 4;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.02;
        this.vy += 0.2;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Initialize game
function init() {
    player = new Player();
    collectibles = [];
    obstacles = [];
    particles = [];
    powerUps = [];
    roadLines = [];
    twinMessages = [];
    game.running = true;
    game.paused = false;
    game.speed = 5;
    game.score = 0;
    game.distance = 0;
    game.lastTwinScore = 0;
    
    // Initialize road lines
    for (let i = 0; i < 10; i++) {
        roadLines.push({
            y: i * 80 - 100
        });
    }
    
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('startOverlay').style.display = 'none';
    document.getElementById('instructions').style.display = 'block';
}

// Start game and music
function startGame() {
    init();
    
    // Start background music
    const bgMusic = document.getElementById('bgMusic');
    if (bgMusic) {
        bgMusic.currentTime = 0;
        bgMusic.volume = 0.5;
        bgMusic.play().then(() => {
            updateMusicButton(true);
        }).catch(e => {
            console.log('Music autoplay prevented:', e);
            updateMusicButton(false);
        });
    }
}

// Update music button text
function updateMusicButton(isPlaying) {
    const btn = document.getElementById('musicControl');
    if (btn) {
        btn.textContent = isPlaying ? '🔊 MUTE' : '🔇 UNMUTE';
    }
}

// Collision detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Spawn collectibles and obstacles
let spawnTimer = 0;
const spawnInterval = 100;
let powerUpSpawnTimer = 0;

function spawnObjects() {
    spawnTimer++;
    powerUpSpawnTimer++;
    
    if (spawnTimer >= spawnInterval) {
        spawnTimer = 0;
        
        // Randomly choose lanes for spawning
        let availableLanes = [0, 1, 2];
        
        // Spawn 1-2 collectibles
        const numCollectibles = Math.random() > 0.3 ? 1 : 2;
        for (let i = 0; i < numCollectibles && availableLanes.length > 0; i++) {
            const laneIndex = Math.floor(Math.random() * availableLanes.length);
            const lane = availableLanes[laneIndex];
            availableLanes.splice(laneIndex, 1);
            
            const type = Math.random() > 0.5 ? '6' : '7';
            collectibles.push(new Collectible(lane, type));
        }
        
        // Spawn 0-1 obstacles
        if (Math.random() > 0.4 && availableLanes.length > 0) {
            const laneIndex = Math.floor(Math.random() * availableLanes.length);
            const lane = availableLanes[laneIndex];
            obstacles.push(new Obstacle(lane));
        }
    }
    
    // Spawn power-ups less frequently
    if (powerUpSpawnTimer >= 400) { // Every 6-7 seconds
        powerUpSpawnTimer = 0;
        
        if (Math.random() > 0.3) { // 70% chance
            const lane = Math.floor(Math.random() * 3);
            const types = ['invincible', 'magnet', 'speedboost'];
            const type = types[Math.floor(Math.random() * types.length)];
            powerUps.push(new PowerUp(lane, type));
        }
    }
}

// Update game
function update() {
    if (!game.running || game.paused) return;
    
    // Update player
    player.update();
    
    // Update and spawn objects
    spawnObjects();
    
    // Update collectibles
    for (let i = collectibles.length - 1; i >= 0; i--) {
        const collectible = collectibles[i];
        collectible.update();
        
        // Magnet effect - pull collectibles towards player
        if (player.magnetActive) {
            const dx = player.x - collectible.x;
            const dy = player.y - collectible.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 200) { // Magnet range
                collectible.x += dx * 0.1;
                collectible.y += dy * 0.1;
            }
        }
        
        // Check collision with player
        if (!collectible.collected && checkCollision(player.getBounds(), collectible.getBounds())) {
            collectible.collected = true;
            const points = collectible.type === '6' ? 60 : 70;
            const previousScore = game.score;
            game.score += points;
            
            // Make apple stick tongue out!
            player.showTongue();
            
            // Create particles
            for (let j = 0; j < 15; j++) {
                particles.push(new Particle(collectible.x, collectible.y, '#ff6600'));
            }
            
            // Check if we crossed a 100 point threshold
            const previousHundreds = Math.floor(previousScore / 100);
            const currentHundreds = Math.floor(game.score / 100);
            if (currentHundreds > previousHundreds) {
                twinMessages.push(new TwinMessage(canvas.width / 2, 150));
            }
            
            collectibles.splice(i, 1);
        } else if (collectible.y > canvas.height) {
            collectibles.splice(i, 1);
        }
    }
    
    // Update power-ups
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        powerUp.update();
        
        // Check collision with player
        if (!powerUp.collected && checkCollision(player.getBounds(), powerUp.getBounds())) {
            powerUp.collected = true;
            player.activatePowerUp(powerUp.type);
            
            // Create particles based on power-up type
            let color = '#ffffff';
            if (powerUp.type === 'invincible') color = '#00ffff';
            else if (powerUp.type === 'magnet') color = '#ff00ff';
            else if (powerUp.type === 'speedboost') color = '#ffff00';
            
            for (let j = 0; j < 20; j++) {
                particles.push(new Particle(powerUp.x, powerUp.y, color));
            }
            
            powerUps.splice(i, 1);
        } else if (powerUp.y > canvas.height) {
            powerUps.splice(i, 1);
        }
    }
    
    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.update();
        
        // Check collision with player (unless invincible)
        if (!player.invincible && checkCollision(player.getBounds(), obstacle.getBounds())) {
            gameOver();
            return;
        }
        
        if (obstacle.y > canvas.height) {
            obstacles.splice(i, 1);
        }
    }
    
    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
    
    // Update twin messages
    for (let i = twinMessages.length - 1; i >= 0; i--) {
        twinMessages[i].update();
        if (twinMessages[i].life <= 0) {
            twinMessages.splice(i, 1);
        }
    }
    
    // Update road lines
    for (let line of roadLines) {
        line.y += game.speed;
        if (line.y > canvas.height) {
            line.y = -100;
        }
    }
    
    // Increase speed over time
    if (game.speed < game.maxSpeed) {
        game.speed += game.speedIncrement;
    }
    
    // Update distance
    game.distance += game.speed * 0.1;
    
    // Update UI
    document.getElementById('score').textContent = `SCORE: ${Math.floor(game.score)}`;
    document.getElementById('distance').textContent = `DISTANCE: ${Math.floor(game.distance)}m`;
    
    // Update power-up display
    let powerUpText = '';
    if (player.invincible) {
        powerUpText += `🛡️ INVINCIBLE (${Math.ceil(player.invincibleTimer / 60)}s) `;
    }
    if (player.magnetActive) {
        powerUpText += `🧲 MAGNET (${Math.ceil(player.magnetTimer / 60)}s) `;
    }
    if (player.speedBoostActive) {
        powerUpText += `⚡ SPEED (${Math.ceil(player.speedBoostTimer / 60)}s) `;
    }
    document.getElementById('powerUpDisplay').textContent = powerUpText;
}

// Draw game
function draw() {
    // Clear canvas with dark Quake-themed background
    ctx.fillStyle = '#1a0f0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Only draw game elements if game has been initialized
    if (!player) return;
    
    // Draw floor perspective lines (to create depth)
    ctx.strokeStyle = '#3a2a2a';
    ctx.lineWidth = 2;
    
    // Vertical lane dividers
    for (let line of roadLines) {
        ctx.beginPath();
        ctx.moveTo(100, line.y);
        ctx.lineTo(100, line.y + 60);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(700, line.y);
        ctx.lineTo(700, line.y + 60);
        ctx.stroke();
    }
    
    // Lane separators
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = '#4a3a3a';
    for (let i = 0; i < lanes.positions.length - 1; i++) {
        const x = (lanes.positions[i] + lanes.positions[i + 1]) / 2;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    ctx.setLineDash([]);
    
    // Draw game objects (from back to front)
    obstacles.forEach(obstacle => obstacle.draw());
    collectibles.forEach(collectible => collectible.draw());
    powerUps.forEach(powerUp => powerUp.draw());
    particles.forEach(particle => particle.draw());
    player.draw();
    
    // Draw twin messages on top of everything
    twinMessages.forEach(message => message.draw());
    
    // Draw pause overlay
    if (game.paused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ff1493';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.font = 'bold 60px "Courier New"';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ff1493';
        ctx.shadowBlur = 20;
        ctx.strokeText('PAUSED', canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 20);
        
        ctx.font = 'bold 24px "Courier New"';
        ctx.fillStyle = '#ff6600';
        ctx.shadowBlur = 10;
        ctx.fillText('Press SPACE to Continue', canvas.width / 2, canvas.height / 2 + 40);
        ctx.shadowBlur = 0;
    }
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Game over
function gameOver() {
    game.running = false;
    document.getElementById('finalScore').textContent = `SCORE: ${Math.floor(game.score)}`;
    document.getElementById('finalDistance').textContent = `DISTANCE: ${Math.floor(game.distance)}m`;
    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('instructions').style.display = 'none';
    
    // Pause music
    const bgMusic = document.getElementById('bgMusic');
    if (bgMusic) {
        bgMusic.pause();
    }
}

// Input handling
let keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // Pause/unpause with spacebar
    if ((e.key === ' ' || e.key === 'Spacebar') && game.running) {
        game.paused = !game.paused;
        
        // Control music based on pause state
        const bgMusic = document.getElementById('bgMusic');
        if (bgMusic) {
            if (game.paused) {
                bgMusic.pause();
            } else {
                bgMusic.play().catch(e => console.log('Music play error:', e));
            }
        }
        return;
    }
    
    if (!game.running || game.paused) return;
    
    if (e.key === 'ArrowLeft') {
        player.moveLeft();
    } else if (e.key === 'ArrowRight') {
        player.moveRight();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Start button
document.getElementById('startBtn').addEventListener('click', () => {
    startGame();
});

// Restart button
document.getElementById('restartBtn').addEventListener('click', () => {
    startGame();
});

// Music control button
document.getElementById('musicControl').addEventListener('click', () => {
    const bgMusic = document.getElementById('bgMusic');
    if (bgMusic) {
        if (bgMusic.paused) {
            bgMusic.play().then(() => {
                updateMusicButton(true);
            }).catch(e => console.log('Music play error:', e));
        } else {
            bgMusic.pause();
            updateMusicButton(false);
        }
    }
});

// Show start overlay initially
document.getElementById('startOverlay').style.display = 'flex';

// Start game loop (always running for animations)
gameLoop();


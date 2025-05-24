class SpaceInvadersGame {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.playerWidth = 50;
        this.playerHeight = 30;
        this.bulletSize = 5;
        this.alienWidth = 40;
        this.alienHeight = 30;
        this.alienRows = 5;
        this.alienCols = 8;
        this.alienPadding = 20;
        this.score = 0;
        this.lives = 3;
        this.gameLoop = null;
        this.gameSpeed = 1000/60;
        this.alienDirection = 1;
        this.alienStepDown = false;
        this.alienMoveCounter = 0;
        
        this.player = {
            x: (canvas.width - this.playerWidth)/2,
            y: canvas.height - this.playerHeight - 10,
            speed: 5,
            shooting: false
        };
        
        this.bullets = [];
        this.alienBullets = [];
        this.aliens = this.initializeAliens();
    }

    initializeAliens() {
        const aliens = [];
        for(let r = 0; r < this.alienRows; r++) {
            aliens[r] = [];
            for(let c = 0; c < this.alienCols; c++) {
                aliens[r][c] = {
                    x: c * (this.alienWidth + this.alienPadding) + this.alienPadding,
                    y: r * (this.alienHeight + this.alienPadding) + this.alienPadding,
                    alive: true
                };
            }
        }
        return aliens;
    }

    start() {
        this.aliens = this.initializeAliens();
        this.bullets = [];
        this.alienBullets = [];
        this.score = 0;
        this.lives = 3;
        this.player.x = (this.canvas.width - this.playerWidth)/2;
        this.alienDirection = 1;
        this.alienStepDown = false;
        this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
    }

    stop() {
        clearInterval(this.gameLoop);
    }

    restart() {
        this.stop();
        this.start();
    }

    moveAliens() {
        this.alienMoveCounter++;
        if(this.alienMoveCounter < 10) return; // Slow down alien movement
        
        this.alienMoveCounter = 0;
        let touchedEdge = false;

        // Check if any alien touched the edges
        this.aliens.forEach(row => {
            row.forEach(alien => {
                if(!alien.alive) return;
                if(this.alienDirection > 0 && alien.x + this.alienWidth >= this.canvas.width ||
                   this.alienDirection < 0 && alien.x <= 0) {
                    touchedEdge = true;
                }
            });
        });

        // Move aliens down and change direction if they touched edge
        if(touchedEdge) {
            this.alienDirection *= -1;
            this.aliens.forEach(row => {
                row.forEach(alien => {
                    alien.y += this.alienHeight;
                    // Check if aliens reached the player
                    if(alien.alive && alien.y + this.alienHeight >= this.player.y) {
                        this.gameOver();
                    }
                });
            });
        } else {
            // Move aliens horizontally
            this.aliens.forEach(row => {
                row.forEach(alien => {
                    alien.x += 10 * this.alienDirection;
                });
            });
        }

        // Random alien shooting
        if(Math.random() < 0.02) {
            const bottomAliens = [];
            for(let c = 0; c < this.alienCols; c++) {
                for(let r = this.alienRows-1; r >= 0; r--) {
                    if(this.aliens[r][c].alive) {
                        bottomAliens.push(this.aliens[r][c]);
                        break;
                    }
                }
            }
            if(bottomAliens.length > 0) {
                const shooter = bottomAliens[Math.floor(Math.random() * bottomAliens.length)];
                this.alienBullets.push({
                    x: shooter.x + this.alienWidth/2,
                    y: shooter.y + this.alienHeight,
                    speed: 5
                });
            }
        }
    }

    update() {
        this.moveAliens();

        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            // Check for collision with aliens
            let hit = false;
            this.aliens.forEach(row => {
                row.forEach(alien => {
                    if(alien.alive && 
                       bullet.x >= alien.x && 
                       bullet.x <= alien.x + this.alienWidth &&
                       bullet.y >= alien.y && 
                       bullet.y <= alien.y + this.alienHeight) {
                        alien.alive = false;
                        hit = true;
                        this.score += 10;
                        if(this.checkVictory()) {
                            this.victory();
                        }
                    }
                });
            });
            return !hit && bullet.y > 0;
        });

        // Update alien bullets
        this.alienBullets = this.alienBullets.filter(bullet => {
            bullet.y += bullet.speed;
            // Check for collision with player
            if(bullet.x >= this.player.x && 
               bullet.x <= this.player.x + this.playerWidth &&
               bullet.y >= this.player.y && 
               bullet.y <= this.player.y + this.playerHeight) {
                this.lives--;
                if(this.lives <= 0) {
                    this.gameOver();
                }
                return false;
            }
            return bullet.y < this.canvas.height;
        });

        this.draw();
    }

    checkVictory() {
        return this.aliens.every(row => row.every(alien => !alien.alive));
    }

    victory() {
        this.stop();
        this.ctx.fillStyle = '#0F0';
        this.ctx.font = '40px "Press Start 2P"';
        this.ctx.fillText('VICTORY!', this.canvas.width/2 - 120, this.canvas.height/2);
    }

    gameOver() {
        this.stop();
        this.ctx.fillStyle = '#F00';
        this.ctx.font = '40px "Press Start 2P"';
        this.ctx.fillText('GAME OVER', this.canvas.width/2 - 150, this.canvas.height/2);
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw player
        this.ctx.fillStyle = '#0F0';
        this.ctx.fillRect(this.player.x, this.player.y, this.playerWidth, this.playerHeight);

        // Draw aliens
        this.aliens.forEach(row => {
            row.forEach(alien => {
                if(alien.alive) {
                    this.ctx.fillStyle = '#F00';
                    this.ctx.fillRect(alien.x, alien.y, this.alienWidth, this.alienHeight);
                }
            });
        });

        // Draw bullets
        this.ctx.fillStyle = '#FFF';
        this.bullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, this.bulletSize, this.bulletSize);
        });

        // Draw alien bullets
        this.ctx.fillStyle = '#F00';
        this.alienBullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, this.bulletSize, this.bulletSize);
        });

        // Draw score and lives
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '20px "Press Start 2P"';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
        this.ctx.fillText(`Lives: ${this.lives}`, this.canvas.width - 150, 30);
    }

    handleInput(event) {
        switch(event.key) {
            case 'ArrowLeft':
                if(this.player.x > 0) {
                    this.player.x -= this.player.speed;
                }
                break;
            case 'ArrowRight':
                if(this.player.x < this.canvas.width - this.playerWidth) {
                    this.player.x += this.player.speed;
                }
                break;
            case ' ':
                if(!this.player.shooting) {
                    this.bullets.push({
                        x: this.player.x + this.playerWidth/2,
                        y: this.player.y,
                        speed: 7
                    });
                    this.player.shooting = true;
                }
                break;
        }
    }

    handleKeyUp(event) {
        if(event.key === ' ') {
            this.player.shooting = false;
        }
    }

    setDifficulty(level) {
        switch(level) {
            case 'easy':
                this.alienSpeed = 0.7;
                this.bulletSpeed = 5;
                break;
            case 'hard':
                this.alienSpeed = 1.7;
                this.bulletSpeed = 9;
                break;
            default:
                this.alienSpeed = 1.2;
                this.bulletSpeed = 7;
        }
    }
}
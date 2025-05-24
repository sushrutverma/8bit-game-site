class PacmanGame {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.tileSize = 20;
        this.score = 0;
        this.lives = 3;
        this.gameLoop = null;
        this.dotSize = 4;
        this.powerDotSize = 8;
        this.gameSpeed = 1000/60;
        
        // 0: empty, 1: wall, 2: dot, 3: power dot
        this.maze = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,1],
            [1,3,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,3,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,1,1,2,1,2,1,1,1,1,1,1,2,1,2,1,1,2,1],
            [1,2,2,2,2,1,2,2,2,1,1,2,2,2,1,2,2,2,2,1],
            [1,1,1,1,2,1,1,1,0,1,1,0,1,1,1,2,1,1,1,1],
            [1,1,1,1,2,1,0,0,0,0,0,0,0,0,1,2,1,1,1,1],
            [1,0,0,0,2,0,0,1,1,0,0,1,1,0,0,2,0,0,0,1],
            [1,1,1,1,2,1,0,0,0,0,0,0,0,0,1,2,1,1,1,1],
            [1,1,1,1,2,1,0,1,1,1,1,1,1,0,1,2,1,1,1,1],
            [1,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,1],
            [1,2,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1,2,1],
            [1,3,2,1,2,2,2,2,2,2,2,2,2,2,2,2,1,2,3,1],
            [1,1,2,1,2,1,2,1,1,1,1,1,1,2,1,2,1,2,1,1],
            [1,2,2,2,2,1,2,2,2,1,1,2,2,2,1,2,2,2,2,1],
            [1,2,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];

        this.pacman = {
            x: 10,
            y: 15,
            direction: 'right',
            nextDirection: 'right',
            animation: 0
        };

        this.ghosts = [
            {x: 9, y: 9, direction: 'right', color: '#F00', mode: 'chase'},  // Red
            {x: 10, y: 9, direction: 'left', color: '#F8B', mode: 'chase'},   // Pink
            {x: 9, y: 10, direction: 'up', color: '#0CF', mode: 'chase'},    // Cyan
            {x: 10, y: 10, direction: 'down', color: '#F80', mode: 'chase'}  // Orange
        ];

        this.powerMode = false;
        this.powerModeTimer = null;
    }

    start() {
        this.score = 0;
        this.lives = 3;
        this.resetPositions();
        this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
    }

    stop() {
        clearInterval(this.gameLoop);
        if(this.powerModeTimer) clearTimeout(this.powerModeTimer);
    }

    restart() {
        this.stop();
        this.start();
    }

    resetPositions() {
        this.pacman = {x: 10, y: 15, direction: 'right', nextDirection: 'right', animation: 0};
        this.ghosts = [
            {x: 9, y: 9, direction: 'right', color: '#F00', mode: 'chase'},
            {x: 10, y: 9, direction: 'left', color: '#F8B', mode: 'chase'},
            {x: 9, y: 10, direction: 'up', color: '#0CF', mode: 'chase'},
            {x: 10, y: 10, direction: 'down', color: '#F80', mode: 'chase'}
        ];
    }

    canMove(x, y) {
        // Check maze boundaries
        if (y < 0 || y >= this.maze.length || x < 0 || x >= this.maze[0].length) {
            return false;
        }
        return this.maze[y][x] !== 1;
    }

    getNextPosition(x, y, direction) {
        switch(direction) {
            case 'up': return {x: x, y: y-1};
            case 'down': return {x: x, y: y+1};
            case 'left': return {x: x-1, y: y};
            case 'right': return {x: x+1, y: y};
        }
    }

    moveGhosts() {
        this.ghosts.forEach(ghost => {
            const directions = ['up', 'down', 'left', 'right'];
            const validDirections = directions.filter(dir => {
                const next = this.getNextPosition(ghost.x, ghost.y, dir);
                return this.canMove(next.x, next.y);
            });

            if(ghost.mode === 'chase' && !this.powerMode) {
                // Improved ghost AI with personality
                const dx = this.pacman.x - ghost.x;
                const dy = this.pacman.y - ghost.y;
                
                switch(ghost.color) {
                    case '#F00': // Red ghost: Direct chase
                        if(Math.abs(dx) > Math.abs(dy)) {
                            ghost.direction = dx > 0 ? 'right' : 'left';
                        } else {
                            ghost.direction = dy > 0 ? 'down' : 'up';
                        }
                        break;
                    case '#F8B': // Pink ghost: Intercept
                        const targetX = this.pacman.x + (this.pacman.direction === 'right' ? 4 : this.pacman.direction === 'left' ? -4 : 0);
                        const targetY = this.pacman.y + (this.pacman.direction === 'down' ? 4 : this.pacman.direction === 'up' ? -4 : 0);
                        if(Math.abs(targetX - ghost.x) > Math.abs(targetY - ghost.y)) {
                            ghost.direction = targetX > ghost.x ? 'right' : 'left';
                        } else {
                            ghost.direction = targetY > ghost.y ? 'down' : 'up';
                        }
                        break;
                    case '#0CF': // Cyan ghost: Flank
                        if(Math.random() < 0.3) { // 30% chance to change direction
                            ghost.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
                        } else {
                            if(Math.abs(dx) > Math.abs(dy)) {
                                ghost.direction = dx > 0 ? 'right' : 'left';
                            } else {
                                ghost.direction = dy > 0 ? 'down' : 'up';
                            }
                        }
                        break;
                    case '#F80': // Orange ghost: Random with chase tendency
                        if(Math.abs(dx) + Math.abs(dy) > 8) { // Chase when far
                            if(Math.abs(dx) > Math.abs(dy)) {
                                ghost.direction = dx > 0 ? 'right' : 'left';
                            } else {
                                ghost.direction = dy > 0 ? 'down' : 'up';
                            }
                        } else { // Random when close
                            ghost.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
                        }
                        break;
                }
            } else {
                // Improved scatter/frightened mode: More predictable escape
                if(this.powerMode) {
                    // Run away from Pacman
                    const dx = this.pacman.x - ghost.x;
                    const dy = this.pacman.y - ghost.y;
                    if(Math.abs(dx) > Math.abs(dy)) {
                        ghost.direction = dx > 0 ? 'left' : 'right';
                    } else {
                        ghost.direction = dy > 0 ? 'up' : 'down';
                    }
                } else {
                    // Scatter mode: patrol corners
                    ghost.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
                }
            }

            if(!validDirections.includes(ghost.direction)) {
                ghost.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
            }

            const next = this.getNextPosition(ghost.x, ghost.y, ghost.direction);
            if(this.canMove(next.x, next.y)) {
                ghost.x = next.x;
                ghost.y = next.y;
            }
        });
    }

    checkCollisions() {
        this.ghosts.forEach(ghost => {
            // Improved collision detection with tolerance for smoother gameplay
            const dx = Math.abs(ghost.x - this.pacman.x);
            const dy = Math.abs(ghost.y - this.pacman.y);
            if(dx < 0.8 && dy < 0.8) {
                if(this.powerMode) {
                    this.score += 200;
                    // Reset ghost to spawn point with brief vulnerability
                    ghost.x = 9 + Math.floor(Math.random() * 2);
                    ghost.y = 9 + Math.floor(Math.random() * 2);
                    ghost.mode = 'scatter';
                    setTimeout(() => {
                        ghost.mode = 'chase';
                    }, 3000);
                } else {
                    this.lives--;
                    if(this.lives <= 0) {
                        this.gameOver();
                    } else {
                        this.resetPositions();
                        // Brief invulnerability after death
                        this.ghosts.forEach(g => g.mode = 'scatter');
                        setTimeout(() => {
                            this.ghosts.forEach(g => g.mode = 'chase');
                        }, 2000);
                    }
                }
            }
        });
    }

    update() {
        // Move Pacman
        const next = this.getNextPosition(this.pacman.x, this.pacman.y, this.pacman.nextDirection);
        if(this.canMove(next.x, next.y)) {
            this.pacman.direction = this.pacman.nextDirection;
            this.pacman.x = next.x;
            this.pacman.y = next.y;
        } else {
            const current = this.getNextPosition(this.pacman.x, this.pacman.y, this.pacman.direction);
            if(this.canMove(current.x, current.y)) {
                this.pacman.x = current.x;
                this.pacman.y = current.y;
            }
        }

        // Collect dots
        if(this.maze[this.pacman.y][this.pacman.x] === 2) {
            this.maze[this.pacman.y][this.pacman.x] = 0;
            this.score += 10;
        } else if(this.maze[this.pacman.y][this.pacman.x] === 3) {
            this.maze[this.pacman.y][this.pacman.x] = 0;
            this.score += 50;
            this.powerMode = true;
            if(this.powerModeTimer) clearTimeout(this.powerModeTimer);
            this.powerModeTimer = setTimeout(() => {
                this.powerMode = false;
            }, 10000);
        }

        this.moveGhosts();
        this.checkCollisions();
        this.pacman.animation = (this.pacman.animation + 0.2) % 2;
        this.draw();

        // Check victory
        if(!this.maze.some(row => row.includes(2) || row.includes(3))) {
            this.victory();
        }
    }

    victory() {
        this.stop();
        this.ctx.fillStyle = '#0F0';
        this.ctx.font = '40px "Press Start 2P"';
        this.ctx.fillText('YOU WIN!', this.canvas.width/2 - 120, this.canvas.height/2);
    }

    gameOver() {
        this.stop();
        this.ctx.fillStyle = '#F00';
        this.ctx.font = '40px "Press Start 2P"';
        this.ctx.fillText('GAME OVER', this.canvas.width/2 - 150, this.canvas.height/2);
    }

    draw() {
        // Clear canvas with a slight gradient for depth
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#000');
        gradient.addColorStop(1, '#001');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw maze with improved visuals
        for(let y = 0; y < this.maze.length; y++) {
            for(let x = 0; x < this.maze[y].length; x++) {
                if(this.maze[y][x] === 1) {
                    // Wall with 3D effect
                    this.ctx.fillStyle = '#00F';
                    this.ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                    this.ctx.fillStyle = '#00A';
                    this.ctx.fillRect(x * this.tileSize + 2, y * this.tileSize + 2, this.tileSize - 4, this.tileSize - 4);
                } else if(this.maze[y][x] === 2) {
                    // Regular dots with glow
                    this.ctx.fillStyle = '#FFF';
                    this.ctx.shadowColor = '#FFF';
                    this.ctx.shadowBlur = 5;
                    this.ctx.beginPath();
                    this.ctx.arc(x * this.tileSize + this.tileSize/2, y * this.tileSize + this.tileSize/2, this.dotSize/2, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.shadowBlur = 0;
                } else if(this.maze[y][x] === 3) {
                    // Power dots with animation
                    const pulseSize = this.powerDotSize/2 + Math.sin(Date.now() / 200) * 2;
                    this.ctx.fillStyle = '#FFF';
                    this.ctx.shadowColor = '#FFF';
                    this.ctx.shadowBlur = 10;
                    this.ctx.beginPath();
                    this.ctx.arc(x * this.tileSize + this.tileSize/2, y * this.tileSize + this.tileSize/2, pulseSize, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.shadowBlur = 0;
                }
            }
        }

        // Draw Pacman with improved animation
        this.ctx.fillStyle = '#FF0';
        this.ctx.shadowColor = '#FF0';
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        const pacmanX = this.pacman.x * this.tileSize + this.tileSize/2;
        const pacmanY = this.pacman.y * this.tileSize + this.tileSize/2;
        const mouthSize = Math.PI/4 + Math.sin(this.pacman.animation * Math.PI) * Math.PI/4;
        let startAngle = 0, endAngle = 0;
        switch(this.pacman.direction) {
            case 'right': startAngle = mouthSize; endAngle = 2*Math.PI - mouthSize; break;
            case 'left': startAngle = Math.PI + mouthSize; endAngle = Math.PI - mouthSize; break;
            case 'up': startAngle = Math.PI*1.5 + mouthSize; endAngle = Math.PI*1.5 - mouthSize; break;
            case 'down': startAngle = Math.PI/2 + mouthSize; endAngle = Math.PI/2 - mouthSize; break;
        }
        this.ctx.arc(pacmanX, pacmanY, this.tileSize/2, startAngle, endAngle);
        this.ctx.lineTo(pacmanX, pacmanY);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        // Draw ghosts with improved visuals
        this.ghosts.forEach(ghost => {
            const ghostX = ghost.x * this.tileSize;
            const ghostY = ghost.y * this.tileSize;
            
            // Ghost body
            this.ctx.fillStyle = this.powerMode ? '#00F' : ghost.color;
            this.ctx.shadowColor = this.powerMode ? '#00F' : ghost.color;
            this.ctx.shadowBlur = 10;
            this.ctx.beginPath();
            this.ctx.arc(ghostX + this.tileSize/2, ghostY + this.tileSize/2, 
                        this.tileSize/2, Math.PI, 0, false);
            this.ctx.lineTo(ghostX + this.tileSize, ghostY + this.tileSize);
            this.ctx.lineTo(ghostX, ghostY + this.tileSize);
            this.ctx.fill();

            // Ghost eyes
            if(!this.powerMode) {
                this.ctx.shadowBlur = 0;
                this.ctx.fillStyle = '#FFF';
                this.ctx.beginPath();
                this.ctx.arc(ghostX + this.tileSize/3, ghostY + this.tileSize/2, 
                            this.tileSize/6, 0, Math.PI * 2);
                this.ctx.arc(ghostX + this.tileSize*2/3, ghostY + this.tileSize/2, 
                            this.tileSize/6, 0, Math.PI * 2);
                this.ctx.fill();

                this.ctx.fillStyle = '#00F';
                this.ctx.beginPath();
                this.ctx.arc(ghostX + this.tileSize/3, ghostY + this.tileSize/2, 
                            this.tileSize/12, 0, Math.PI * 2);
                this.ctx.arc(ghostX + this.tileSize*2/3, ghostY + this.tileSize/2, 
                            this.tileSize/12, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });

        // Draw score and lives with improved visuals
        this.ctx.fillStyle = '#0F0';
        this.ctx.shadowColor = '#0F0';
        this.ctx.shadowBlur = 5;
        this.ctx.font = '20px "Press Start 2P"';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
        this.ctx.fillText(`Lives: ${this.lives}`, this.canvas.width - 150, 30);
        this.ctx.shadowBlur = 0;
    }

    handleInput(event) {
        const key = event.key.toLowerCase();
        // Support both arrow keys and WASD
        switch(key) {
            case 'arrowup':
            case 'w':
                this.pacman.nextDirection = 'up';
                break;
            case 'arrowdown':
            case 's':
                this.pacman.nextDirection = 'down';
                break;
            case 'arrowleft':
            case 'a':
                this.pacman.nextDirection = 'left';
                break;
            case 'arrowright':
            case 'd':
                this.pacman.nextDirection = 'right';
                break;
            case 'p': // Pause functionality
                if(this.gameLoop) {
                    this.stop();
                    this.ctx.fillStyle = '#FFF';
                    this.ctx.font = '40px "Press Start 2P"';
                    this.ctx.fillText('PAUSED', this.canvas.width/2 - 100, this.canvas.height/2);
                } else {
                    this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
                }
                break;
        }
    }
}
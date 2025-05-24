class BreakoutGame {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.ballRadius = 8;
        this.paddleHeight = 10;
        this.paddleWidth = 75;
        this.brickRowCount = 5;
        this.brickColumnCount = 8;
        this.brickWidth = 75;
        this.brickHeight = 20;
        this.brickPadding = 10;
        this.brickOffsetTop = 50;
        this.brickOffsetLeft = 30;
        this.score = 0;
        this.lives = 3;
        this.gameLoop = null;
        
        this.ball = {
            x: canvas.width/2,
            y: canvas.height - 30,
            dx: 4,
            dy: -4
        };
        
        this.paddle = {
            x: (canvas.width - this.paddleWidth)/2
        };
        
        this.bricks = this.initializeBricks();
    }

    initializeBricks() {
        const bricks = [];
        for(let c = 0; c < this.brickColumnCount; c++) {
            bricks[c] = [];
            for(let r = 0; r < this.brickRowCount; r++) {
                bricks[c][r] = { x: 0, y: 0, status: 1 };
            }
        }
        return bricks;
    }

    start() {
        this.bricks = this.initializeBricks();
        this.score = 0;
        this.lives = 3;
        this.ball.x = this.canvas.width/2;
        this.ball.y = this.canvas.height - 30;
        this.ball.dx = 4;
        this.ball.dy = -4;
        this.paddle.x = (this.canvas.width - this.paddleWidth)/2;
        this.gameLoop = setInterval(() => this.update(), 1000/60);
    }

    stop() {
        clearInterval(this.gameLoop);
    }

    restart() {
        this.stop();
        this.start();
    }

    collisionDetection() {
        for(let c = 0; c < this.brickColumnCount; c++) {
            for(let r = 0; r < this.brickRowCount; r++) {
                const b = this.bricks[c][r];
                if(b.status === 1) {
                    if(this.ball.x > b.x && 
                       this.ball.x < b.x + this.brickWidth && 
                       this.ball.y > b.y && 
                       this.ball.y < b.y + this.brickHeight) {
                        this.ball.dy = -this.ball.dy;
                        b.status = 0;
                        this.score += 10;
                        
                        if(this.score === this.brickRowCount * this.brickColumnCount * 10) {
                            this.victory();
                        }
                    }
                }
            }
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

    update() {
        // Move ball
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        // Bounce off walls
        if(this.ball.x + this.ball.dx > this.canvas.width - this.ballRadius || 
           this.ball.x + this.ball.dx < this.ballRadius) {
            this.ball.dx = -this.ball.dx;
        }
        if(this.ball.y + this.ball.dy < this.ballRadius) {
            this.ball.dy = -this.ball.dy;
        } else if(this.ball.y + this.ball.dy > this.canvas.height - this.ballRadius) {
            // Check for paddle collision
            if(this.ball.x > this.paddle.x && 
               this.ball.x < this.paddle.x + this.paddleWidth) {
                // Calculate angle of reflection based on where ball hits paddle
                const hitPos = (this.ball.x - (this.paddle.x + this.paddleWidth/2)) / (this.paddleWidth/2);
                this.ball.dx = hitPos * 8; // Max horizontal speed
                this.ball.dy = -Math.sqrt(64 - this.ball.dx * this.ball.dx); // Maintain constant speed
            } else {
                this.lives--;
                if(!this.lives) {
                    this.gameOver();
                    return;
                } else {
                    this.ball.x = this.canvas.width/2;
                    this.ball.y = this.canvas.height - 30;
                    this.ball.dx = 4;
                    this.ball.dy = -4;
                    this.paddle.x = (this.canvas.width - this.paddleWidth)/2;
                }
            }
        }

        this.collisionDetection();
        this.draw();
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw bricks
        for(let c = 0; c < this.brickColumnCount; c++) {
            for(let r = 0; r < this.brickRowCount; r++) {
                if(this.bricks[c][r].status === 1) {
                    const brickX = (c * (this.brickWidth + this.brickPadding)) + this.brickOffsetLeft;
                    const brickY = (r * (this.brickHeight + this.brickPadding)) + this.brickOffsetTop;
                    this.bricks[c][r].x = brickX;
                    this.bricks[c][r].y = brickY;
                    this.ctx.fillStyle = '#0F0';
                    this.ctx.fillRect(brickX, brickY, this.brickWidth, this.brickHeight);
                }
            }
        }
        
        // Draw ball
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ballRadius, 0, Math.PI*2);
        this.ctx.fillStyle = '#FFF';
        this.ctx.fill();
        this.ctx.closePath();
        
        // Draw paddle
        this.ctx.fillStyle = '#0FF';
        this.ctx.fillRect(this.paddle.x, this.canvas.height - this.paddleHeight, 
                         this.paddleWidth, this.paddleHeight);
        
        // Draw score and lives
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '20px "Press Start 2P"';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
        this.ctx.fillText(`Lives: ${this.lives}`, this.canvas.width - 150, 30);
    }

    handleInput(event) {
        const paddleSpeed = 7;
        if(event.key === 'ArrowRight' && 
           this.paddle.x < this.canvas.width - this.paddleWidth) {
            this.paddle.x += paddleSpeed;
        }
        else if(event.key === 'ArrowLeft' && this.paddle.x > 0) {
            this.paddle.x -= paddleSpeed;
        }
    }
    setDifficulty(level) {
        switch(level) {
            case 'easy':
                this.ballSpeed = 3;
                this.paddleSpeed = 7;
                break;
            case 'hard':
                this.ballSpeed = 7;
                this.paddleSpeed = 11;
                break;
            default:
                this.ballSpeed = 5;
                this.paddleSpeed = 9;
        }
    }
}
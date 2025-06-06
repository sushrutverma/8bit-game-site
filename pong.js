class PongGame {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.paddleHeight = 100;
        this.paddleWidth = 10;
        this.ballSize = 10;
        this.paddleSpeed = 5;
        this.ballSpeed = 4;
        this.level = 1;
        this.maxLevel = 5;
        this.aiSpeedMultiplier = 0.8;
        this.playerDirection = 0;
        this.isTouch = false;
        this.touchStartY = 0;
        this.touchCurrentY = 0;
        
        // Initialize game objects
        this.playerPaddle = {
            y: canvas.height/2 - this.paddleHeight/2,
            score: 0
        };
        
        this.aiPaddle = {
            y: canvas.height/2 - this.paddleHeight/2,
            score: 0
        };
        
        this.ball = this.resetBall();
        this.gameLoop = null;
    }

    resetBall() {
        return {
            x: this.canvas.width/2,
            y: this.canvas.height/2,
            dx: this.ballSpeed * (Math.random() > 0.5 ? 1 : -1),
            dy: this.ballSpeed * (Math.random() * 2 - 1)
        };
    }

    start() {
        this.gameLoop = setInterval(() => this.update(), 1000/60);
    }

    stop() {
        clearInterval(this.gameLoop);
    }

    restart() {
        this.playerPaddle.score = 0;
        this.aiPaddle.score = 0;
        this.ball = this.resetBall();
        if (!this.gameLoop) {
            this.start();
        }
    }

    update() {
        this.movePlayer();
        this.moveBall();
        this.moveAI();
        this.checkCollisions();
        this.draw();
    }

    movePlayer() {
        if (this.playerDirection !== 0) {
            this.playerPaddle.y += this.playerDirection * this.paddleSpeed;
            this.playerPaddle.y = Math.max(0, Math.min(this.canvas.height - this.paddleHeight, this.playerPaddle.y));
        }
        // Touch movement
        if (this.isTouch) {
            let delta = this.touchCurrentY - this.touchStartY;
            this.playerPaddle.y += delta * 0.2;
            this.playerPaddle.y = Math.max(0, Math.min(this.canvas.height - this.paddleHeight, this.playerPaddle.y));
            this.touchStartY = this.touchCurrentY;
        }
    }

    moveBall() {
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        // Ball hits top or bottom
        if (this.ball.y <= 0 || this.ball.y >= this.canvas.height) {
            this.ball.dy *= -1;
        }

        // Ball goes out
        if (this.ball.x <= 0) {
            this.aiPaddle.score++;
            this.ball = this.resetBall();
            this.increaseLevel();
        } else if (this.ball.x >= this.canvas.width) {
            this.playerPaddle.score++;
            this.ball = this.resetBall();
        }
    }

    moveAI() {
        const paddleCenter = this.aiPaddle.y + this.paddleHeight/2;
        const ballCenter = this.ball.y;
        
        // Add some delay and imperfection to AI
        if (Math.abs(paddleCenter - ballCenter) > this.paddleHeight/6) {
            if (paddleCenter < ballCenter) {
                this.aiPaddle.y += this.paddleSpeed * this.aiSpeedMultiplier;
            } else {
                this.aiPaddle.y -= this.paddleSpeed * this.aiSpeedMultiplier;
            }
        }

        // Keep AI paddle within canvas
        this.aiPaddle.y = Math.max(0, Math.min(this.canvas.height - this.paddleHeight, this.aiPaddle.y));
    }

    checkCollisions() {
        // Check collision with paddles
        const checkPaddleCollision = (paddle, x) => {
            return this.ball.y >= paddle.y && 
                   this.ball.y <= paddle.y + this.paddleHeight && 
                   Math.abs(this.ball.x - x) <= this.paddleWidth;
        };

        // Player paddle collision
        if (checkPaddleCollision(this.playerPaddle, this.paddleWidth)) {
            this.ball.dx = Math.abs(this.ball.dx);
            this.ball.dy += (this.ball.y - (this.playerPaddle.y + this.paddleHeight/2)) * 0.03;
        }

        // AI paddle collision
        if (checkPaddleCollision(this.aiPaddle, this.canvas.width - this.paddleWidth)) {
            this.ball.dx = -Math.abs(this.ball.dx);
            this.ball.dy += (this.ball.y - (this.aiPaddle.y + this.paddleHeight/2)) * 0.03;
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw center line
        this.ctx.setLineDash([5, 15]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width/2, 0);
        this.ctx.lineTo(this.canvas.width/2, this.canvas.height);
        this.ctx.strokeStyle = '#fff';
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Draw paddles
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, this.playerPaddle.y, this.paddleWidth, this.paddleHeight);
        this.ctx.fillRect(this.canvas.width - this.paddleWidth, this.aiPaddle.y, this.paddleWidth, this.paddleHeight);

        // Draw ball
        this.ctx.fillRect(this.ball.x - this.ballSize/2, this.ball.y - this.ballSize/2, this.ballSize, this.ballSize);

        // Draw scores and level
        this.ctx.font = '40px "Press Start 2P"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.playerPaddle.score.toString(), this.canvas.width/4, 60);
        this.ctx.fillText(this.aiPaddle.score.toString(), 3*this.canvas.width/4, 60);
        
        // Draw level
        this.ctx.font = '20px "Press Start 2P"';
        this.ctx.fillText(`Level ${this.level}`, this.canvas.width/2, 30);
    }

    handleInput(event) {
        if (event.type === 'keydown') {
            if (event.key === 'ArrowUp') {
                event.preventDefault();
                this.playerDirection = -1;
            } else if (event.key === 'ArrowDown') {
                event.preventDefault();
                this.playerDirection = 1;
            }
        } else if (event.type === 'keyup') {
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                event.preventDefault();
                this.playerDirection = 0;
            }
        }
    }

    handleTouchStart(e) {
        this.isTouch = true;
        this.touchStartY = e.touches[0].clientY;
        this.touchCurrentY = e.touches[0].clientY;
    }

    handleTouchMove(e) {
        this.touchCurrentY = e.touches[0].clientY;
    }

    handleTouchEnd(e) {
        this.isTouch = false;
    }

    increaseLevel() {
        if (this.level < this.maxLevel) {
            this.level++;
            this.ballSpeed += 1;
            this.paddleSpeed += 0.5;
            this.aiSpeedMultiplier += 0.05;
        }
    }

    setDifficulty(level) {
        switch(level) {
            case 'easy':
                this.ballSpeed = 4;
                this.paddleSpeed = 6;
                break;
            case 'hard':
                this.ballSpeed = 8;
                this.paddleSpeed = 10;
                break;
            default:
                this.ballSpeed = 6;
                this.paddleSpeed = 8;
        }
    }
}
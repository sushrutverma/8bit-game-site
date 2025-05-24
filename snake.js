class SnakeGame {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.gridSize = 20;
        this.snake = [];
        this.food = {};
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.gameLoop = null;
        this.gameSpeed = 100;
    }

    start() {
        this.snake = [
            { x: 5, y: 5 },
            { x: 4, y: 5 },
            { x: 3, y: 5 }
        ];
        this.generateFood();
        this.score = 0;
        this.direction = 'right';
        this.nextDirection = 'right';
        this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
    }

    stop() {
        clearInterval(this.gameLoop);
    }

    restart() {
        this.stop();
        this.start();
    }

    generateFood() {
        const maxX = Math.floor(this.canvas.width / this.gridSize) - 1;
        const maxY = Math.floor(this.canvas.height / this.gridSize) - 1;
        
        do {
            this.food = {
                x: Math.floor(Math.random() * maxX),
                y: Math.floor(Math.random() * maxY)
            };
        } while (this.snake.some(segment => 
            segment.x === this.food.x && segment.y === this.food.y));
    }

    update() {
        // Update direction
        this.direction = this.nextDirection;

        // Calculate new head position
        const head = { ...this.snake[0] };
        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Check for collisions
        if (this.checkCollision(head)) {
            this.gameOver();
            return;
        }

        // Add new head
        this.snake.unshift(head);

        // Check if food was eaten
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.generateFood();
            // Increase speed every 50 points
            if (this.score % 50 === 0) {
                this.gameSpeed = Math.max(50, this.gameSpeed - 10);
                clearInterval(this.gameLoop);
                this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
            }
        } else {
            this.snake.pop();
        }

        this.draw();
    }

    checkCollision(head) {
        // Wall collision
        if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 || head.y >= this.canvas.height / this.gridSize) {
            return true;
        }

        // Self collision
        return this.snake.some(segment => segment.x === head.x && segment.y === head.y);
    }

    gameOver() {
        this.stop();
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '40px "Press Start 2P"';
        this.ctx.fillText('GAME OVER', this.canvas.width/2 - 150, this.canvas.height/2);
        this.ctx.font = '20px "Press Start 2P"';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width/2 - 70, this.canvas.height/2 + 40);
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        this.snake.forEach((segment, index) => {
            this.ctx.fillStyle = index === 0 ? '#0f0' : '#0a0';
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });

        // Draw food
        this.ctx.fillStyle = '#f00';
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 2,
            this.gridSize - 2
        );

        // Draw score
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px "Press Start 2P"';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
    }

    handleInput(event) {
        switch (event.key) {
            case 'ArrowUp':
                if (this.direction !== 'down') this.nextDirection = 'up';
                break;
            case 'ArrowDown':
                if (this.direction !== 'up') this.nextDirection = 'down';
                break;
            case 'ArrowLeft':
                if (this.direction !== 'right') this.nextDirection = 'left';
                break;
            case 'ArrowRight':
                if (this.direction !== 'left') this.nextDirection = 'right';
                break;
        }
    }

    setDifficulty(level) {
        switch(level) {
            case 'easy':
                this.gameSpeed = 180;
                break;
            case 'hard':
                this.gameSpeed = 80;
                break;
            default:
                this.gameSpeed = 120;
        }
    }
}
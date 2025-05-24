class TetrisGame {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.blockSize = 30;
        this.gridWidth = 10;
        this.gridHeight = 20;
        this.grid = Array(this.gridHeight).fill().map(() => Array(this.gridWidth).fill(0));
        this.score = 0;
        this.gameLoop = null;
        this.currentPiece = null;
        this.gameSpeed = 1000;
        this.colors = ['#000', '#0F0', '#00F', '#F00', '#FF0', '#F0F', '#0FF', '#FFF'];

        // Define tetromino shapes
        this.shapes = [
            [[1,1,1,1]], // I
            [[1,1],[1,1]], // O
            [[1,1,1],[0,1,0]], // T
            [[1,1,1],[1,0,0]], // L
            [[1,1,1],[0,0,1]], // J
            [[1,1,0],[0,1,1]], // S
            [[0,1,1],[1,1,0]]  // Z
        ];
    }

    start() {
        this.grid = Array(this.gridHeight).fill().map(() => Array(this.gridWidth).fill(0));
        this.score = 0;
        this.spawnPiece();
        this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
    }

    stop() {
        clearInterval(this.gameLoop);
    }

    restart() {
        this.stop();
        this.start();
    }

    spawnPiece() {
        const shapeIndex = Math.floor(Math.random() * this.shapes.length);
        this.currentPiece = {
            shape: this.shapes[shapeIndex],
            x: Math.floor(this.gridWidth/2) - Math.floor(this.shapes[shapeIndex][0].length/2),
            y: 0,
            color: shapeIndex + 1
        };

        if (this.checkCollision()) {
            this.gameOver();
        }
    }

    checkCollision(offsetX = 0, offsetY = 0, rotatedShape = null) {
        const shape = rotatedShape || this.currentPiece.shape;
        return shape.some((row, dy) => 
            row.some((value, dx) => {
                if (value === 0) return false;
                const newX = this.currentPiece.x + dx + offsetX;
                const newY = this.currentPiece.y + dy + offsetY;
                return newX < 0 || newX >= this.gridWidth ||
                       newY >= this.gridHeight ||
                       (newY >= 0 && this.grid[newY][newX]);
            })
        );
    }

    rotatePiece() {
        const rotated = this.currentPiece.shape[0].map((_, i) =>
            this.currentPiece.shape.map(row => row[row.length-1-i])
        );
        if (!this.checkCollision(0, 0, rotated)) {
            this.currentPiece.shape = rotated;
        }
    }

    update() {
        if (this.checkCollision(0, 1)) {
            this.mergePiece();
            this.clearLines();
            this.spawnPiece();
        } else {
            this.currentPiece.y++;
        }
        this.draw();
    }

    mergePiece() {
        this.currentPiece.shape.forEach((row, dy) => {
            row.forEach((value, dx) => {
                if (value) {
                    const y = this.currentPiece.y + dy;
                    const x = this.currentPiece.x + dx;
                    if (y >= 0) this.grid[y][x] = this.currentPiece.color;
                }
            });
        });
    }

    clearLines() {
        for (let y = this.gridHeight - 1; y >= 0; y--) {
            if (this.grid[y].every(cell => cell)) {
                this.grid.splice(y, 1);
                this.grid.unshift(Array(this.gridWidth).fill(0));
                this.score += 100;
                this.gameSpeed = Math.max(100, 1000 - this.score/2);
                clearInterval(this.gameLoop);
                this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
            }
        }
    }

    gameOver() {
        this.stop();
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '40px "Press Start 2P"';
        this.ctx.fillText('GAME OVER', this.canvas.width/2 - 150, this.canvas.height/2);
        this.ctx.font = '20px "Press Start 2P"';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width/2 - 70, this.canvas.height/2 + 40);
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        this.grid.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.ctx.fillStyle = this.colors[value];
                    this.ctx.fillRect(
                        x * this.blockSize,
                        y * this.blockSize,
                        this.blockSize - 1,
                        this.blockSize - 1
                    );
                }
            });
        });

        // Draw current piece
        if (this.currentPiece) {
            this.ctx.fillStyle = this.colors[this.currentPiece.color];
            this.currentPiece.shape.forEach((row, dy) => {
                row.forEach((value, dx) => {
                    if (value) {
                        this.ctx.fillRect(
                            (this.currentPiece.x + dx) * this.blockSize,
                            (this.currentPiece.y + dy) * this.blockSize,
                            this.blockSize - 1,
                            this.blockSize - 1
                        );
                    }
                });
            });
        }

        // Draw score
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '20px "Press Start 2P"';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
    }

    handleInput(event) {
        switch(event.key) {
            case 'ArrowLeft':
                if (!this.checkCollision(-1, 0)) this.currentPiece.x--;
                break;
            case 'ArrowRight':
                if (!this.checkCollision(1, 0)) this.currentPiece.x++;
                break;
            case 'ArrowDown':
                if (!this.checkCollision(0, 1)) this.currentPiece.y++;
                break;
            case 'ArrowUp':
                this.rotatePiece();
                break;
        }
        this.draw();
    }
}
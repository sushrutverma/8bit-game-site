let currentGame = null;

const gameTutorials = {
    snake: {
        title: 'Snake Tutorial',
        instructions: [
            'Use Arrow Keys to control the snake',
            'Eat food (red squares) to grow longer',
            'Avoid hitting walls and yourself',
            'Score increases with each food eaten',
            'Game ends if you hit a wall or yourself'
        ]
    },
    pong: {
        title: 'Pong Tutorial',
        instructions: [
            'Use Up/Down Arrow Keys to move your paddle',
            'Hit the ball with your paddle to return it',
            'Score points when AI misses the ball',
            'First to reach 11 points wins',
            'Ball speed increases over time'
        ]
    },
    tetris: {
        title: 'Tetris Tutorial',
        instructions: [
            'Left/Right Arrows to move pieces',
            'Up Arrow to rotate piece',
            'Down Arrow to soft drop',
            'Space to hard drop',
            'Clear lines to score points',
            'Game ends when pieces reach the top'
        ]
    },
    breakout: {
        title: 'Breakout Tutorial',
        instructions: [
            'Use Left/Right Arrows to move paddle',
            'Break all bricks to win',
            'Don\'t let the ball fall below paddle',
            'Some bricks need multiple hits',
            'Ball speed increases over time'
        ]
    },
    spaceinvaders: {
        title: 'Space Invaders Tutorial',
        instructions: [
            'Left/Right Arrows to move ship',
            'Space to shoot',
            'Destroy all aliens to win',
            'Avoid alien projectiles',
            'Score more points for higher aliens'
        ]
    },
    pacman: {
        title: 'Pac-Man Tutorial',
        instructions: [
            'Use Arrow Keys to move Pac-Man',
            'Eat all dots to complete the level',
            'Power pellets make ghosts vulnerable',
            'Avoid ghosts unless they\'re blue',
            'Eat fruit for bonus points'
        ]
    }
};

function showTutorial(gameType) {
    const overlay = document.createElement('div');
    overlay.className = 'tutorial-overlay';
    
    const content = document.createElement('div');
    content.className = 'tutorial-content';
    
    const title = document.createElement('h2');
    title.textContent = gameTutorials[gameType].title;
    content.appendChild(title);
    
    const instructions = document.createElement('ul');
    gameTutorials[gameType].instructions.forEach(instruction => {
        const li = document.createElement('li');
        li.textContent = instruction;
        instructions.appendChild(li);
    });
    content.appendChild(instructions);
    
    const startButton = document.createElement('button');
    startButton.className = 'retro-button';
    startButton.textContent = 'Start Game';
    startButton.onclick = () => {
        overlay.remove();
        initializeGame(gameType);
    };
    content.appendChild(startButton);
    
    overlay.appendChild(content);
    document.body.appendChild(overlay);
}

function loadGame(gameType) {
    showTutorial(gameType);
}

function initializeGame(gameType) {
    const gameContainer = document.getElementById('game-container');
    const gameSelection = document.querySelector('.game-selection');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = 800;
    canvas.height = 500;

    // Hide game selection and show game container
    gameSelection.style.display = 'none';
    gameContainer.classList.remove('hidden');

    // Remove existing event listeners if any
    if (currentGame) {
        document.removeEventListener('keydown', currentGame.handleInput);
    }

    // Initialize the selected game
    switch (gameType) {
        case 'snake':
            currentGame = new SnakeGame(canvas, ctx);
            document.addEventListener('keydown', (e) => currentGame.handleInput(e));
            break;
        case 'pong':
            currentGame = new PongGame(canvas, ctx);
            document.addEventListener('keydown', currentGame.handleInput.bind(currentGame));
            document.addEventListener('keyup', currentGame.handleInput.bind(currentGame));
            // Touch controls for mobile
            canvas.addEventListener('touchstart', function(e) { currentGame.handleTouchStart(e); }, {passive: false});
            canvas.addEventListener('touchmove', function(e) { currentGame.handleTouchMove(e); }, {passive: false});
            canvas.addEventListener('touchend', function(e) { currentGame.handleTouchEnd(e); }, {passive: false});
            break;
        case 'tetris':
            currentGame = new TetrisGame(canvas, ctx);
            document.addEventListener('keydown', (e) => currentGame.handleInput(e));
            break;
        case 'breakout':
            currentGame = new BreakoutGame(canvas, ctx);
            document.addEventListener('keydown', (e) => currentGame.handleInput(e));
            break;
        case 'spaceinvaders':
            currentGame = new SpaceInvadersGame(canvas, ctx);
            document.addEventListener('keydown', (e) => currentGame.handleInput(e));
            document.addEventListener('keyup', (e) => currentGame.handleKeyUp && currentGame.handleKeyUp(e));
            break;
        case 'pacman':
            currentGame = new PacmanGame(canvas, ctx);
            document.addEventListener('keydown', (e) => currentGame.handleInput(e));
            break;
    }
    
    if (currentGame) {
        currentGame.start();
    }
}

function returnToMenu() {
    const gameContainer = document.getElementById('game-container');
    const gameSelection = document.querySelector('.game-selection');

    // Stop current game if exists
    if (currentGame) {
        currentGame.stop();
        document.removeEventListener('keydown', currentGame.handleInput);
        currentGame = null;
    }

    // Show game selection and hide game container
    gameSelection.style.display = 'grid';
    gameContainer.classList.add('hidden');
}

function restartGame() {
    if (currentGame) {
        currentGame.restart();
    }
}
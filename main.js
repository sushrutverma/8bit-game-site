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

// --- Virtual Controller and Difficulty Selector Logic ---

function createVirtualController(gameType) {
    const container = document.getElementById('virtual-controller');
    container.innerHTML = '';
    container.style.display = 'none';
    if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return;
    }
    let btns = [];
    if (gameType === 'snake' || gameType === 'tetris' || gameType === 'pacman') {
        btns = [
            { label: '◀', action: 'left' },
            { label: '▲', action: 'up' },
            { label: '▼', action: 'down' },
            { label: '▶', action: 'right' }
        ];
    } else if (gameType === 'pong' || gameType === 'breakout') {
        btns = [
            { label: '◀', action: 'left' },
            { label: '▶', action: 'right' }
        ];
    } else if (gameType === 'spaceinvaders') {
        btns = [
            { label: '◀', action: 'left' },
            { label: '▶', action: 'right' },
            { label: '⎋', action: 'shoot' }
        ];
    }
    btns.forEach(btn => {
        const el = document.createElement('button');
        el.className = 'virtual-btn';
        el.innerText = btn.label;
        el.addEventListener('touchstart', e => {
            e.preventDefault();
            triggerVirtualInput(btn.action, true);
        });
        el.addEventListener('touchend', e => {
            e.preventDefault();
            triggerVirtualInput(btn.action, false);
        });
        container.appendChild(el);
    });
    if (btns.length > 0) {
        container.style.display = 'flex';
    }
}

function triggerVirtualInput(action, pressed) {
    if (!window.currentGame) return;
    let key = null;
    switch(action) {
        case 'left': key = 'ArrowLeft'; break;
        case 'right': key = 'ArrowRight'; break;
        case 'up': key = 'ArrowUp'; break;
        case 'down': key = 'ArrowDown'; break;
        case 'shoot': key = ' '; break;
    }
    if (key) {
        if (pressed) {
            window.currentGame.handleInput && window.currentGame.handleInput({ key });
        } else if (window.currentGame.handleKeyUp) {
            window.currentGame.handleKeyUp({ key });
        }
    }
}

function createDifficultySelector(gameType, onChange) {
    const container = document.getElementById('difficulty-selector');
    container.innerHTML = '';
    const levels = ['Easy', 'Medium', 'Hard'];
    levels.forEach(level => {
        const btn = document.createElement('button');
        btn.className = 'difficulty-btn';
        btn.innerText = level;
        btn.onclick = () => {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            onChange(level.toLowerCase());
        };
        container.appendChild(btn);
    });
    container.style.display = 'flex';
    // Default to Medium
    container.querySelector('.difficulty-btn:nth-child(2)').classList.add('selected');
}

function hideDifficultySelector() {
    document.getElementById('difficulty-selector').style.display = 'none';
}

// --- Patch initializeGame to use overlays ---
const originalInitializeGame = initializeGame;
window.currentDifficulty = 'medium';
window.currentGameType = null;
window.currentGame = null;

initializeGame = function(gameType) {
    window.currentGameType = gameType;
    createVirtualController(gameType);
    createDifficultySelector(gameType, function(level) {
        window.currentDifficulty = level;
        if (window.currentGame && window.currentGame.setDifficulty) {
            window.currentGame.setDifficulty(level);
        }
    });
    originalInitializeGame.apply(this, arguments);
    window.currentGame = window.gameInstance;
    if (window.currentGame && window.currentGame.setDifficulty) {
        window.currentGame.setDifficulty(window.currentDifficulty);
    }
};

// Hide overlays on menu
function showMenuOverlays(show) {
    document.getElementById('virtual-controller').style.display = show ? 'none' : '';
    document.getElementById('difficulty-selector').style.display = show ? 'none' : '';
}

// Patch returnToMenu to hide overlays
const originalReturnToMenu = returnToMenu;
returnToMenu = function() {
    showMenuOverlays(true);
    originalReturnToMenu.apply(this, arguments);
};

// Patch loadGame to show overlays
const originalLoadGame = loadGame;
loadGame = function(gameType) {
    showMenuOverlays(false);
    originalLoadGame.apply(this, arguments);
};

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
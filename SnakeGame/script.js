window.addEventListener('load', () => {
    // DOM Elements
    const landingScreen = document.getElementById('landingScreen');
    const gameScreen = document.getElementById('gameScreen');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    const highScoreEl = document.getElementById('high-score');
    
    // Modals
    const pauseModal = document.getElementById('pauseModal');
    const gameOverModal = document.getElementById('gameOverModal');
    const finalScoreEl = document.getElementById('finalScore');
    const finalHighScoreEl = document.getElementById('finalHighScore');

    // Buttons
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const resumeButton = document.getElementById('resumeButton');
    const endGameButton = document.getElementById('endGameButton');
    const restartButton = document.getElementById('restartButton');
    const mainMenuButton = document.getElementById('mainMenuButton');
    const mapCards = document.querySelectorAll('.map-card');
    
    // Mobile Buttons
    const upBtn = document.getElementById('upBtn'), downBtn = document.getElementById('downBtn'),
          leftBtn = document.getElementById('leftBtn'), rightBtn = document.getElementById('rightBtn');

    // Game State
    let snake, food, score, highScore, direction, changingDirection, gameLoopTimeout;
    let gameState = 'landing'; // landing, playing, paused, gameover
    let selectedMap = 'classic';
    let obstacles = [];
    const gridSize = 20;

    // Map Definitions
    const maps = {
        classic: [],
        tunnel: [],
        boxed: []
    };

    function setupMaps(width, height) {
        const numX = width / gridSize;
        const numY = height / gridSize;
        // Tunnel Map
        maps.tunnel = [];
        for (let i = 0; i < numX; i++) {
            maps.tunnel.push({ x: i * gridSize, y: 0 }); // Top wall
            maps.tunnel.push({ x: i * gridSize, y: (numY - 1) * gridSize }); // Bottom wall
        }
        // Boxed Map
        maps.boxed = [];
         for (let i = 0; i < numX; i++) {
            maps.boxed.push({ x: i * gridSize, y: 0 }); // Top
            maps.boxed.push({ x: i * gridSize, y: (numY - 1) * gridSize }); // Bottom
        }
        for (let i = 1; i < numY - 1; i++) {
            maps.boxed.push({ x: 0, y: i * gridSize }); // Left
            maps.boxed.push({ x: (numX - 1) * gridSize, y: i * gridSize }); // Right
        }
    }
    
    function resizeCanvas() {
        let canvasSize = Math.min(window.innerWidth - 40, window.innerHeight - 200, 600);
        canvasSize = Math.floor(canvasSize / gridSize) * gridSize;
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        setupMaps(canvas.width, canvas.height);
    }

    // --- Game Flow Functions ---
    function showScreen(screenName) {
        landingScreen.classList.add('hidden');
        gameScreen.classList.add('hidden');
        gameOverModal.classList.add('hidden');
        pauseModal.classList.add('hidden');
        
        if (screenName === 'landing') landingScreen.classList.remove('hidden');
        if (screenName === 'game') gameScreen.classList.remove('hidden');
    }

    function startGame() {
        gameState = 'playing';
        showScreen('game');
        init();
    }
    
    function pauseGame() {
        if (gameState !== 'playing') return;
        gameState = 'paused';
        pauseModal.classList.remove('hidden');
        pauseModal.classList.add('flex');
    }
    
    function resumeGame() {
        if (gameState !== 'paused') return;
        gameState = 'playing';
        pauseModal.classList.add('hidden');
        pauseModal.classList.remove('flex');
        main(); // Resume the game loop
    }

    function endGame() {
        gameState = 'landing';
        showScreen('landing');
    }
    
    function showGameOver() {
        gameState = 'gameover';
        finalScoreEl.textContent = score;
        finalHighScoreEl.textContent = highScore;
        gameOverModal.classList.remove('hidden');
        gameOverModal.classList.add('flex');
    }

    // --- Core Game Logic ---
    function init() {
        obstacles = [...maps[selectedMap]];
        
        snake = [ { x: Math.floor(canvas.width / 2 / gridSize) * gridSize, y: Math.floor(canvas.height / 2 / gridSize) * gridSize } ];
        snake.push({x: snake[0].x - gridSize, y: snake[0].y});
        snake.push({x: snake[0].x - (2*gridSize), y: snake[0].y});

        score = 0;
        highScore = localStorage.getItem(`snakeHighScore_${selectedMap}`) || 0;
        direction = { x: gridSize, y: 0 };
        changingDirection = false;
        
        scoreEl.textContent = score;
        highScoreEl.textContent = highScore;

        gameOverModal.classList.add('hidden');
        gameOverModal.classList.remove('flex');
        
        generateFood();
        
        if (gameLoopTimeout) clearTimeout(gameLoopTimeout);
        main();
    }

    function main() {
        if (gameState !== 'playing') return;

        if (isGameOver()) {
            showGameOver();
            return;
        }

        changingDirection = false;
        gameLoopTimeout = setTimeout(() => {
            clearCanvas();
            drawObstacles();
            drawFood();
            moveSnake();
            drawSnake();
            main();
        }, 150);
    }

    function clearCanvas() {
        ctx.fillStyle = '#010409';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawObstacles() {
        ctx.fillStyle = '#484F58';
        ctx.strokeStyle = '#6E7681';
        obstacles.forEach(obs => {
            ctx.fillRect(obs.x, obs.y, gridSize, gridSize);
            ctx.strokeRect(obs.x, obs.y, gridSize, gridSize);
        });
    }

    function drawSnake() {
        snake.forEach((part, index) => {
            const isHead = index === 0;
            ctx.fillStyle = isHead ? '#3fb950' : '#58a6ff'; 
            ctx.strokeStyle = isHead ? '#238636' : '#2f81f7';
            ctx.fillRect(part.x, part.y, gridSize, gridSize);
            ctx.strokeRect(part.x, part.y, gridSize, gridSize);
        });
    }

    function drawFood() {
        ctx.fillStyle = '#F85149';
        ctx.strokeStyle = '#DA3633';
        ctx.fillRect(food.x, food.y, gridSize, gridSize);
        ctx.strokeRect(food.x, food.y, gridSize, gridSize);
    }

    function moveSnake() {
        const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
        snake.unshift(head);
        if (snake[0].x === food.x && snake[0].y === food.y) {
            score += 10;
            scoreEl.textContent = score;
            if (score > highScore) {
                highScore = score;
                highScoreEl.textContent = highScore;
                localStorage.setItem(`snakeHighScore_${selectedMap}`, highScore);
            }
            generateFood();
        } else {
            snake.pop();
        }
    }

    function generateFood() {
        let foodOnObstacleOrSnake;
        do {
            foodOnObstacleOrSnake = false;
            food = {
                x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
                y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize
            };
            
            // Check against obstacles
            for(const obs of obstacles) {
                if (obs.x === food.x && obs.y === food.y) {
                    foodOnObstacleOrSnake = true;
                    break;
                }
            }
            // Check against snake body
            if(!foodOnObstacleOrSnake) {
                for(const part of snake) {
                   if (part.x === food.x && part.y === food.y) {
                        foodOnObstacleOrSnake = true;
                        break;
                    }
                }
            }
        } while(foodOnObstacleOrSnake);
    }
    
    function isGameOver() {
        const head = snake[0];
        // Collision with self
        for (let i = 4; i < snake.length; i++) {
            if (snake[i].x === head.x && snake[i].y === head.y) return true;
        }
        // Collision with walls (for non-classic maps)
        if (selectedMap !== 'classic') {
             if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) return true;
        } else {
             // Screen wrap for classic mode
            if (head.x < 0) head.x = canvas.width - gridSize;
            if (head.x >= canvas.width) head.x = 0;
            if (head.y < 0) head.y = canvas.height - gridSize;
            if (head.y >= canvas.height) head.y = 0;
        }
        // Collision with obstacles
        for(const obs of obstacles) {
            if (obs.x === head.x && obs.y === head.y) return true;
        }
        return false;
    }
    
    // --- Event Handlers ---
    function changeDirection(eventKey) {
         if (changingDirection) return;
        changingDirection = true;
        const goingUp = direction.y === -gridSize, goingDown = direction.y === gridSize,
              goingRight = direction.x === gridSize, goingLeft = direction.x === -gridSize;
        
        if ((eventKey === 'ArrowLeft' || eventKey === 'a') && !goingRight) direction = { x: -gridSize, y: 0 };
        if ((eventKey === 'ArrowUp' || eventKey === 'w') && !goingDown) direction = { x: 0, y: -gridSize };
        if ((eventKey === 'ArrowRight' || eventKey === 'd') && !goingLeft) direction = { x: gridSize, y: 0 };
        if ((eventKey === 'ArrowDown' || eventKey === 's') && !goingUp) direction = { x: 0, y: gridSize };
    }

    // Button Event Listeners
    startButton.addEventListener('click', startGame);
    pauseButton.addEventListener('click', pauseGame);
    resumeButton.addEventListener('click', resumeGame);
    endGameButton.addEventListener('click', endGame);
    restartButton.addEventListener('click', () => {
        showScreen('game');
        init();
    });
    mainMenuButton.addEventListener('click', endGame);
    
    document.addEventListener('keydown', (e) => {
        if (gameState === 'playing') {
             changeDirection(e.key);
        }
        if (gameState === 'paused' && e.key === 'Escape') {
            resumeGame();
        }
         if (gameState === 'playing' && e.key === 'Escape') {
            pauseGame();
        }
    });

    mapCards.forEach(card => {
        card.addEventListener('click', () => {
            mapCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedMap = card.id.split('-')[1];
        });
    });

    // Mobile button handlers
    upBtn.addEventListener('click', () => changeDirection('ArrowUp'));
    downBtn.addEventListener('click', () => changeDirection('ArrowDown'));
    leftBtn.addEventListener('click', () => changeDirection('ArrowLeft'));
    rightBtn.addEventListener('click', () => changeDirection('ArrowRight'));

    // Initial Setup
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    lucide.createIcons();
});

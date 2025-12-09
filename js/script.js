// script.js - Snake Game
(() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  // UI elements
  const scoreEl = document.getElementById('score');
  const startBtn = document.getElementById('startBtn');
  const restartBtn = document.getElementById('restartBtn');
  const gameOverEl = document.getElementById('gameOver');
  const finalScoreEl = document.getElementById('finalScore');
  const playAgainBtn = document.getElementById('playAgainBtn');
  const goHomeBtn = document.getElementById('goHomeBtn');

  // Game settings
  const gridSize = 20;           // number of cells per row/column if we scale
  const cellSize = canvas.width / gridSize;
  let snake;                     // array of {x,y}
  let dir;                       // {x,y}
  let nextDir;
  let food;
  let score;
  let running = false;
  let loopId = null;
  const speed = 100; // ms per tick

  // init/reset function
  function resetGame() {
    snake = [
      { x: 8, y: 10 },
      { x: 7, y: 10 },
      { x: 6, y: 10 }
    ];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    placeFood();
    score = 0;
    scoreEl.textContent = score;
    running = false;
    hideGameOver();
    clearLoop();
    draw();
  }

  // place food in random free cell
  function placeFood() {
    while (true) {
      const x = Math.floor(Math.random() * gridSize);
      const y = Math.floor(Math.random() * gridSize);
      if (!snake.some(s => s.x === x && s.y === y)) {
        food = { x, y };
        return;
      }
    }
  }

  // start loop
  function startGame() {
    if (running) return;
    running = true;
    clearLoop();
    loopId = setInterval(tick, speed);
  }

  function clearLoop() {
    if (loopId) {
      clearInterval(loopId);
      loopId = null;
    }
  }

  // main tick
  function tick() {
    // update direction
    dir = nextDir;

    // compute new head
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // wrap-around behaviour (you can change to collision instead)
    if (head.x < 0) head.x = gridSize - 1;
    if (head.x >= gridSize) head.x = 0;
    if (head.y < 0) head.y = gridSize - 1;
    if (head.y >= gridSize) head.y = 0;

    // check collision with self
    if (snake.some(s => s.x === head.x && s.y === head.y)) {
      return endGame();
    }

    // add head
    snake.unshift(head);

    // check food
    if (head.x === food.x && head.y === food.y) {
      score += 1;
      scoreEl.textContent = score;
      placeFood();
    } else {
      // remove tail
      snake.pop();
    }

    // draw everything
    draw();
  }

  // end game
  function endGame() {
    running = false;
    clearLoop();
    finalScoreEl.textContent = score;
    showGameOver();
  }

  // draw grid, snake, food
  function draw() {
    // clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // background
    ctx.fillStyle = '#0b0b0c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw grid faint (optional)
    // for (let i=0;i<gridSize;i++){
    //   ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    //   ctx.beginPath();
    //   ctx.moveTo(i*cellSize,0);
    //   ctx.lineTo(i*cellSize,canvas.height);
    //   ctx.stroke();
    // }

    // draw food - red small square with glow
    const fx = food.x * cellSize;
    const fy = food.y * cellSize;
    ctx.fillStyle = '#ef4444'; // red
    ctx.fillRect(fx + 2, fy + 2, cellSize - 4, cellSize - 4);

    // draw snake - gradient green with head highlight
    for (let i = 0; i < snake.length; i++) {
      const s = snake[i];
      const x = s.x * cellSize;
      const y = s.y * cellSize;

      // head different
      if (i === 0) {
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
        // little eye
        ctx.fillStyle = '#05250a';
        const eyeX = x + (dir.x === 1 ? cellSize - 6 : dir.x === -1 ? 4 : cellSize/2 - 2);
        const eyeY = y + (dir.y === 1 ? cellSize - 6 : dir.y === -1 ? 4 : cellSize/2 - 2);
        ctx.fillRect(eyeX, eyeY, 3, 3);
      } else {
        ctx.fillStyle = '#059669';
        ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
      }
    }

    // small border glow
    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    ctx.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1);
  }

  // keyboard handling
  function handleKey(e) {
    const key = e.key.toLowerCase();
    if (key === 'arrowup' || key === 'w') tryChangeDir(0, -1);
    else if (key === 'arrowdown' || key === 's') tryChangeDir(0, 1);
    else if (key === 'arrowleft' || key === 'a') tryChangeDir(-1, 0);
    else if (key === 'arrowright' || key === 'd') tryChangeDir(1, 0);
    else if (key === ' '){ // space toggles start/pause
      if (!running) startGame();
      else { running = false; clearLoop(); }
    }
  }

  // prevent reversing directly
  function tryChangeDir(x, y) {
    // cannot immediately reverse
    if (dir.x === -x && dir.y === -y) return;
    // queue the next direction so head movement doesn't instantly flip twice in a tick
    nextDir = { x, y };
  }

  // UI helpers
  function showGameOver() {
    gameOverEl.classList.remove('hidden');
  }
  function hideGameOver() {
    gameOverEl.classList.add('hidden');
  }

  // Button bindings
  startBtn.addEventListener('click', () => startGame());
  restartBtn.addEventListener('click', () => {
    resetGame();
    startGame();
  });
  playAgainBtn.addEventListener('click', () => {
    resetGame();
    startGame();
  });
  goHomeBtn.addEventListener('click', () => {
    resetGame();
  });

  // keyboard
  window.addEventListener('keydown', handleKey);

  // start with initial draw
  resetGame();
})();

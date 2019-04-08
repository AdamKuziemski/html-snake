const tilesOnCanvas = 30;
const lastTile = tilesOnCanvas - 1;
const tileSideLength = 20;
const tileMargin = 2;
const startingSpeed = 8;
const maxSpeed = 16.6;

let loop = -1;
let canvas = document.getElementById('gc');
let context = canvas.getContext('2d');
let scoreboard = [
  document.getElementById('score'),
  document.getElementById('highscore'),
];

let highScore = parseInt(localStorage.getItem('highScore') || '0', 10);

function drawTile(tile) {
  context.fillRect(
    tile.x * tileSideLength,
    tile.y * tileSideLength,
    tileSideLength - tileMargin,
    tileSideLength - tileMargin
  );
}

function newLoop(speed) {
  clearInterval(loop);
  loop = setInterval(game, 1000 / speed);
}

function displayScore(score) {
  scoreboard[0].textContent = `Score: ${score}`;
  scoreboard[1].textContent = `Highest score: ${highScore}`;
}

function updateHighScore(score) {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', '' + highScore);
  }
}

class Coords {
  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }

  collidesWith(otherCoords) {
    return this.x === otherCoords.x && this.y === otherCoords.y;
  }
}

class Snake {
  constructor() {
    this.head = new Coords(10, 10);
    this.velocity = new Coords(0, 0);
    this.trail = [];
    this.direction = 'none';
    this.hasChangedDirection = false;

    this.reset();
  }

  collidesWith(apple) {
    return this.trail.filter(block => block.collidesWith(apple.position)).length !== 0;
  }

  eatApple() {
    this.length++;
    this.score++;
    this.speed += 0.4;

    if (this.speed >= maxSpeed) {
      this.speed = maxSpeed;
    }

    newLoop(this.speed);
    displayScore(this.score);
  }

  changeDirection(event) {
    if (this.hasChangedDirection) { // prevent suicides when pressing buttons too fast
      return;
    }

    const code = event.code;
    if (code === 'ArrowLeft' && this.direction !== 'ArrowRight') {
      this.velocity.x = -1; this.velocity.y = 0;
      this.direction = 'ArrowLeft';
    }
    if (code === 'ArrowUp' && this.direction !== 'ArrowDown') {
      this.velocity.x = 0; this.velocity.y = -1;
      this.direction = 'ArrowUp';
    }
    if (code === 'ArrowRight' && this.direction !== 'ArrowLeft') {
      this.velocity.x = 1; this.velocity.y = 0;
      this.direction = 'ArrowRight';
    }
    if (code === 'ArrowDown' && this.direction !== 'ArrowUp') {
      this.velocity.x = 0; this.velocity.y = 1;
      this.direction = 'ArrowDown';
    }

    this.hasChangedDirection = true;
  }

  move() {
    this.head.x += this.velocity.x;
    this.head.y += this.velocity.y;
    this.hasChangedDirection = false;

    this.wrap();
  }

  wrap() {
    if (this.head.x < 0) {
      this.head.x = lastTile;
    }
    if (this.head.x > lastTile) {
      this.head.x = 0;
    }
    if (this.head.y < 0) {
      this.head.y = lastTile;
    }
    if (this.head.y > lastTile) {
      this.head.y = 0;
    }
  }

  draw() {
    context.fillStyle = 'lime';

    this.trail.forEach(block => {
      drawTile(block);

      if (block.collidesWith(this.head)) {
        updateHighScore(this.score);
        this.reset();
      }
    });

    this.trail.push(new Coords(this.head.x, this.head.y));

    while (this.trail.length > this.length) {
      delete this.trail.shift();
    }
  }

  reset() {
    this.length = 5;
    this.score = 0;
    this.speed = startingSpeed;

    newLoop(this.speed);
    displayScore(this.score);
  }
};

class Apple {
  constructor() {
    this.position = new Coords(15, 15);
  }

  replace() {
    while (snake.collidesWith(this)) { // prevent spawning apples on the snake
      this.position.x = Math.floor(Math.random() * tilesOnCanvas);
      this.position.y = Math.floor(Math.random() * tilesOnCanvas);
    }
  }

  draw() {
    context.fillStyle = 'red';
    drawTile(this.position);
  }
}

let apple = new Apple();
let snake = new Snake();

function game() {
  snake.move();

  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);

  if (snake.collidesWith(apple)) {
    snake.eatApple();
    apple.replace();
  }

  snake.draw();
  apple.draw();
}

document.addEventListener('keydown', event => snake.changeDirection(event));


const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const bestElement = document.getElementById("best");
const startButton = document.getElementById("start");
const message = document.getElementById("message");

const W = canvas.width;
const H = canvas.height;

const lanes = [90, 200, 310];

let player = {
    lane: 1,
    x: lanes[1],
    y: 530,
    width: 48,
    height: 85
};

let enemies = [];
let score = 0;
let best = Number(localStorage.getItem("rixhavBest")) || 0;
let speed = 4;
let roadOffset = 0;
let spawnTimer = 0;
let running = false;
let gameOver = false;
let lastTime = 0;

bestElement.textContent = best;

function drawRoad() {
    ctx.fillStyle = "#23733b";
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#333333";
    ctx.fillRect(35, 0, 330, H);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.moveTo(40, 0);
    ctx.lineTo(40, H);
    ctx.moveTo(360, 0);
    ctx.lineTo(360, H);
    ctx.stroke();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.setLineDash([35, 35]);

    roadOffset = (roadOffset + speed) % 70;

    for (let x of [145, 255]) {
        ctx.beginPath();
        ctx.moveTo(x, -70 + roadOffset);
        ctx.lineTo(x, H + 70);
        ctx.stroke();
    }

    ctx.setLineDash([]);
}

function drawCar(x, y, color, width = 48, height = 85) {
    // Car body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x - width / 2, y, width, height, 10);
    ctx.fill();

    // Windows
    ctx.fillStyle = "#9be7ff";
    ctx.fillRect(x - 15, y + 13, 30, 18);
    ctx.fillRect(x - 15, y + 53, 30, 14);

    // Wheels
    ctx.fillStyle = "#111";
    ctx.fillRect(x - width / 2 - 4, y + 13, 6, 19);
    ctx.fillRect(x + width / 2 - 2, y + 13, 6, 19);
    ctx.fillRect(x - width / 2 - 4, y + 55, 6, 19);
    ctx.fillRect(x + width / 2 - 2, y + 55, 6, 19);

    // Headlights
    ctx.fillStyle = "#fff7a0";
    ctx.fillRect(x - 16, y + 3, 10, 5);
    ctx.fillRect(x + 6, y + 3, 10, 5);
}

function spawnEnemy() {
    const lane = Math.floor(Math.random() * 3);

    enemies.push({
        x: lanes[lane],
        y: -100,
        width: 48,
        height: 85,
        color: ["#ff3030", "#ffb300", "#9c6bff", "#ffffff"][
            Math.floor(Math.random() * 4)
        ]
    });
}

function movePlayer(direction) {
    if (!running) return;

    player.lane += direction;
    player.lane = Math.max(0, Math.min(2, player.lane));
    player.x = lanes[player.lane];
}

function checkCollision(a, b) {
    return (
        a.x - a.width / 2 + 7 < b.x + b.width / 2 - 7 &&
        a.x + a.width / 2 - 7 > b.x - b.width / 2 + 7 &&
        a.y + 8 < b.y + b.height - 8 &&
        a.y + a.height - 8 > b.y + 8
    );
}

function endGame() {
    running = false;
    gameOver = true;

    if (score > best) {
        best = score;
        localStorage.setItem("rixhavBest", best);
        bestElement.textContent = best;
    }

    message.textContent = "Game Over! Your score: " + score;
    startButton.textContent = "PLAY AGAIN";
}

function update(delta) {
    const step = delta / 16.67;

    roadOffset = (roadOffset + speed * step) % 70;

    spawnTimer += delta;

    if (spawnTimer > Math.max(550, 1200 - score * 3)) {
        spawnEnemy();
        spawnTimer = 0;
    }

    enemies.forEach(enemy => {
        enemy.y += speed * step;

        if (checkCollision(player, enemy)) {
            endGame();
        }
    });

    enemies = enemies.filter(enemy => {
        if (enemy.y > H) {
            score += 10;
            scoreElement.textContent = score;
            return false;
        }
        return true;
    });

    speed = Math.min(9, 4 + score / 250);
}

function draw() {
    drawRoad();

    enemies.forEach(enemy => {
        drawCar(
            enemy.x,
            enemy.y,
            enemy.color,
            enemy.width,
            enemy.height
        );
    });

    drawCar(player.x, player.y, "#00e5ff");
}

function loop(timestamp) {
    if (!running) return;

    const delta = Math.min(timestamp - lastTime, 50);
    lastTime = timestamp;

    update(delta);
    draw();

    if (running) {
        requestAnimationFrame(loop);
    }
}

function startGame() {
    enemies = [];
    score = 0;
    speed = 4;
    spawnTimer = 0;
    roadOffset = 0;
    player.lane = 1;
    player.x = lanes[1];

    scoreElement.textContent = score;
    message.textContent = "Avoid the traffic!";
    startButton.textContent = "RESTART GAME";

    gameOver = false;
    running = true;
    lastTime = performance.now();

    requestAnimationFrame(loop);
}

document.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft" || event.key === "a") {
        event.preventDefault();
        movePlayer(-1);
    }

    if (event.key === "ArrowRight" || event.key === "d") {
        event.preventDefault();
        movePlayer(1);
    }
});

document.getElementById("left").addEventListener("click", () => {
    movePlayer(-1);
});

document.getElementById("right").addEventListener("click", () => {
    movePlayer(1);
});

startButton.addEventListener("click", startGame);

draw();


const scoreDisplay = document.querySelector(".high-score");
const reset = document.querySelector(".reset");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 500;
canvas.height = 500;

let rightPressed = false;
let leftPressed = false;
let started = false;

document.addEventListener("keydown", keyHandler);
document.addEventListener("keyup", keyHandler);

function keyHandler(e)
{
    let keyState = (e.type == "keydown") ? true : false;

    switch (e.keyCode)
    {
        case 32: //space
            started = true;
            break;
        case 37: //left arrow
            leftPressed = keyState;
            break;
        case 39: //right arrow
            rightPressed = keyState;
            break;
    }
}

let highScore = parseInt(localStorage.getItem("highScore"));

if (isNaN(highScore)) {
    highScore = 0;
}

scoreDisplay.innerHTML = `High Score: ${highScore}`;
fillStyle = "#FFFFFF";
reset.addEventListener("click", () => {
    localStorage.setItem("highScore", "0");
    score = 0;
    scoreDisplay.innerHTML = `High Score: 0`;

    drawBricks();
});

let score = 0;

function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#CE1212";
    ctx.fillText("Score: " + score, 8, 20);
}

let speed = 3;

let ball = {
    x: canvas.height / 2,
    y: canvas.height - 25,
    dx: speed,
    dy: -speed + 1,
    radius: 7,
    draw: function() {
        ctx.beginPath();
        ctx.fillStyle = "#CE1212";
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
    }
};

let paddle = {
    height: 10,
    width: 76,
    x: canvas.width / 2 - 76 / 2,
    draw: function() {
        ctx.beginPath();
        ctx.rect(this.x, canvas.height - this.height, this.width, this.height);
        ctx.fillStyle = "#810000";
        ctx.fill();
        ctx.closePath();
    }
};

function play() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    ball.draw();
    paddle.draw();
    movePaddle();
    collisionDetection();
    levelUp();
    drawScore();
    moveBall();

    requestAnimationFrame(play);
}

let gameLevelUp = true;

function movePaddle() {
    if (rightPressed) {
        paddle.x += 7;
        if (paddle.x + paddle.width > canvas.width) {
            paddle.x = canvas.width - paddle.width;
        }
    } else if (leftPressed) {
        paddle.x -= 7;
        if (paddle.x < 0) {
            paddle.x = 0;
        }
    }
}

var brickRowCount = 3;
var brickColumnCount = 5;
var brickWidth = 70;
var brickHeight = 20;
var brickPadding = 20;
var brickOffsetTop = 30;
var brickOffsetLeft = 35;

var bricks = [];

function generateBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

function drawBricks() {
    for (var c = 0; c < brickColumnCount; c++) {
        for (var r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                var brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                var brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "#810000";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function collisionDetection() {
    for (var c = 0; c < brickColumnCount; c++) {
        for (var r = 0; r < brickRowCount; r++) {
            var b = bricks[c][r];
            if (b.status == 1) {
                if (
                    ball.x >= b.x &&
                    ball.x <= b.x + brickWidth &&
                    ball.y >= b.y &&
                    ball.y <= b.y + brickHeight
                ) {
                    ball.dy *= -1;
                    b.status = 0;
                    score++;
                }
            }
        }
    }
}

function moveBall() {
    if (!started) {
        ball.x = paddle.x + paddle.width / 2;
        ball.y = canvas.height - 25;

        if (rightPressed) {
            ball.dx *= -1;
        } else if (leftPressed) {
            ball.dx = speed;
        } else {
            ball.dx *= Math.random() < 0.5 ? 1 : -1;
        }

        return;
    }
    
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx *= -1;
    }

    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.dy *= -1;
    }

    // reset score
    if (ball.y + ball.radius > canvas.height) {
        if (score > parseInt(localStorage.getItem("highScore"))) {
            localStorage.setItem("highScore", score.toString());
            scoreDisplay.innerHTML = `High Score: ${score}`;
        }
        score = 0;
        generateBricks();
        ball.dx = speed;
        ball.dy = -speed + 1;
        started = false;
    }

    // Bounce off paddle
    if (
        ball.x >= paddle.x &&
        ball.x <= paddle.x + paddle.width &&
        ball.y + ball.radius >= canvas.height - paddle.height
    ) {
        ball.dy *= -1;
    }
}

function levelUp() {
    if (score % 15 == 0 && score != 0) {
        if (ball.y > canvas.height / 2) {
            generate0Bricks();
        }

        if (gameLevelUp) {
            if (ball.dy > 0) {
                ball.dy += 1;
                gameLevelUp = false;
            } else {
                ball.dy -= 1;
                gameLevelUp = false;
            }
            console.log(ball.dy);
        }
    }

    if (score % 15 != 0) {
        gameLevelUp = true;
    }
}

generateBricks();
play();
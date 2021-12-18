function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

const ctx = document.querySelector("canvas").getContext("2d");
const plr = document.getElementById("plr");

ctx.canvas.width = 1024;
ctx.canvas.height = 768;

const res = { x: ctx.canvas.width, y: ctx.canvas.height };

let background = new Image;
background.onload = function() {
    ctx.drawImage(background, 0, 0, res.x, res.y);
};
background.src = "../Assets/World/background.png";


const enemies = [];
const enemySprites = [];

const bullets = [];
const bulletSprites = [];

let frameCount = 1;

const floorHeight = 32;

const playerDefaults = {
    width: 32,
    height: 32,

    crouchHeight: 16,
}

const player = {
    width: playerDefaults.width,
    height: playerDefaults.height,

    crouchHeight: playerDefaults.crouchHeight,

    pos: { x: 0, y: res.y },
    vel: { x: 0, y: 0 },

    running: false,
    crouching: false,

    shotTics: 0,
};

function EnemyConstructor(height, width, pos, vel) {
    this.height = height;
    this.width = width;
    this.pos = pos;
    this.vel = vel;
}

function CreateEnemy(xCoord) {
    const enemy = new EnemyConstructor(32, 32, 0, 0);
    enemy.pos = { x: xCoord, y: getRandomArbitrary(res.y - floorHeight * 4, res.y - enemy.height - floorHeight) };

    const enm = document.createElement("img");
    enm.src = "../Assets/Enemy/Idle_1.png";
    enm.style.position = "absolute";
    document.body.appendChild(enm);

    enemies.push(enemy);
    enemySprites.push(enm);
}

function Shoot(source, damage, vel) {
    const bullet = {
        width: 4,
        height: 4,

        pos: { x: source.pos.x + source.width, y: source.pos.y - source.height / 8 },
        damage: damage,
        vel: vel,
    }

    const blt = document.createElement("img");
    blt.src = "../Assets/Bullet.png";
    blt.style.position = "absolute";
    blt.style.left = String(bullet.pos.x) + "px";
    blt.style.top = String(bullet.pos.y) + "px";
    document.body.appendChild(blt);

    bullets.push(bullet);
    bulletSprites.push(blt);
}

function UpdateBullets() {
    for (i = 0; i < bullets.length; i++) {
        if (bullets[i].pos.x + bullets[i].vel > res.x - bullets[i].width * 4) {
            bullets.splice(i, 1);

            bulletSprites[i].remove();
            bulletSprites.splice(i, 1);
            continue;
        }

        bullets[i].pos.x += bullets[i].vel;
        bulletSprites[i].style.left = String(bullets[i].pos.x) + "px";

        for (j = 0; j < enemies.length; j++) {
            if (CheckCollision(bullets[i], enemies[j])) {
                bullets.splice(i, 1);

                bulletSprites[i].remove();
                bulletSprites.splice(i, 1);

                enemies.splice(j, 1);

                enemySprites[j].remove();
                enemySprites.splice(j, 1);
                break;
            }
        }
    }
}

const NextFrame = () => {
    frameCount++;

    for (let i = 0; i < frameCount / 2; i++) {
        let xCoord = Math.floor(Math.random() * res.x);
        CreateEnemy(xCoord);
    }
}

let test = Math.floor(Math.random() * res.x);
CreateEnemy(test);

function EnemyTick() {
    for (i = 0; i < enemies.length; i++) {
        enemySprites[i].style.left = String(enemies[i].pos.x) + "px";
        enemySprites[i].style.top = String(enemies[i].pos.y) + "px";
    }
}

const controller = {
    left: false,
    right: false,
    up: false,
    down: false,
    run: false,
    crouch: false,
    shoot: false,

    keyHoldListener: function(e) {
        let keyState = (e.type == "keydown") ? true : false;

        switch (e.keyCode) {
            case 16: //shift
                controller.run = keyState;
                break;
            case 17: //ctrl
                controller.crouch = keyState;
                break;
            case 32: //space
                controller.shoot = keyState;
                break;
            case 37: //left arrow
                controller.left = keyState;
                break;
            case 38: //up arrow
                controller.up = keyState;
                break;
            case 39: //right arrow
                controller.right = keyState;
                break;
            case 40: //down arrow
                controller.down = keyState;
                break;
        }
    },
};

function Crouch() {
    player.height = controller.crouch ? player.crouchHeight : playerDefaults.height;
}

function MovePlayer() {
    if (controller.left) {
        player.vel.x -= 1;
    }
    if (controller.right) {
        player.vel.x += 1;
    }
    if (controller.up) {
        player.vel.y -= 1;
    }
    if (controller.down) {
        player.vel.y += 1;
    }
    if (controller.shoot && player.shotTics <= 0) {
        Shoot(player, 10, 10);
        player.shotTics = 10;
    }
    player.shotTics--;

    if (player.pos.x + player.vel.x > res.x - player.width) {
        player.pos.x = 0;
        NextFrame();
    }

    let prevPos = player.pos;
    let nextPos = { x: player.pos.x + player.vel.x * (controller.run ? 2 : 1), y: player.pos.y + player.vel.y * (controller.run ? 2 : 1) };
    player.pos = nextPos;

    for (i = 0; i < enemies.length; i++) {
        if (CheckCollision(player, enemies[i])) {
            player.pos = prevPos;
            break;
        }
    }

    player.pos.x = clamp(player.pos.x, 8, res.x - player.width);
    player.pos.y = clamp(player.pos.y, res.y - floorHeight * 4, res.y - player.height - floorHeight);

    player.vel.x *= 0.7;
    player.vel.y *= 0.7;

    plr.style.left = String(player.pos.x) + "px";
    plr.style.top = String(player.pos.y) + "px";
}

function CheckCollision(actor, other) {
    let l1 = { x: actor.pos.x, y: actor.pos.y };
    let r1 = { x: actor.pos.x + actor.width, y: actor.pos.y + actor.height };
    let l2 = { x: other.pos.x, y: other.pos.y };
    let r2 = { x: other.pos.x + other.width, y: other.pos.y + other.height };

    //ctx.fillRect(l1.x,l1.y,32,48);
    //ctx.fillRect(l2.x,l2.y,32,48);

    if (l1.x == r1.x || l1.y == r1.y ||
        l2.x == r2.x || l2.y == r2.y) {
        return false;
    }

    if (l1.x >= r2.x || l2.x >= r1.x) {
        return false;
    }

    if (r1.y <= l2.y || r2.y <= l1.y) {
        return false;
    }

    return true;
}

const Tick = function() {
    Crouch();
    MovePlayer();

    EnemyTick();
    UpdateBullets();

    window.requestAnimationFrame(Tick);
};

window.addEventListener("keydown", controller.keyHoldListener);
window.addEventListener("keyup", controller.keyHoldListener);

window.requestAnimationFrame(Tick);
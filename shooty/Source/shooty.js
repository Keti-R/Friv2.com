function clamp(num, min, max)
{
    return Math.min(Math.max(num, min), max);
}

function getRandomArbitrary(min, max)
{
    return Math.random() * (max - min) + min;
}

const ctx = document.getElementById("bckgCanvas").getContext("2d");
const plr = document.getElementById("plr");

ctx.canvas.width = 800;
ctx.canvas.height = 600;

const res = { x: ctx.canvas.width, y: ctx.canvas.height };

let background = new Image;
background.onload = function()
{
    ctx.drawImage(background, 0, 0, res.x, res.y);
};
background.src = "../Assets/World/background.png";

let actors = [];
let actorSprites = [];
let enemies = [];
let enemySprites = [];

let bullets = [];
let bulletSprites = [];

let frameCount = 1;

const floorHeight = 32;

const playerDefaults =
{
    health: 100,
    width: 32,
    height: 48,

    crouchHeight: 24,
}

const player =
{
    health: playerDefaults.health,
    width: playerDefaults.width,
    height: playerDefaults.height,

    crouchHeight: playerDefaults.crouchHeight,

    pos: { x: 0, y: res.y },
    vel: { x: 0, y: 0 },

    running: false,
    crouching: false,
    dead: false,

    shotTics: 0,
    deathTics: 30,

    kills: 0,
};

const levelCount = document.getElementById("level");
const killCount = document.getElementById("kills");

function UpdateKillCount()
{
    killCount.innerHTML = "Kills: " + String(player.kills);
}

actors.push(player);
actorSprites.push(plr);

function EnemyConstructor(width, height, pos, vel, health, mag = 3, shotTics = 0, shotDelay = 60, deathTics = 30, dead = false)
{
    this.width = width;
    this.height = height;
    this.pos = pos;
    this.vel = vel;
    this.health = health;
    this.mag = mag;
    this.shotTics = shotTics;
    this.shotDelay = shotDelay;
    this.deathTics = deathTics;
    this.dead = dead;
}

function CreateEnemy()
{
    const enemy = new EnemyConstructor(32, 48, 0, 0, 100);
    enemy.pos = { x: getRandomArbitrary(128, res.x - 64), y: getRandomArbitrary(res.y - floorHeight * 4, res.y - enemy.height - floorHeight / 2) };

    const enm = document.createElement("img");
    enm.src = "../Assets/Enemy/Shoot_1.png";;
    enm.style.position = "absolute";
    document.body.appendChild(enm);

    enemies.push(enemy);
    actors.push(enemy);
    enemySprites.push(enm);
    actorSprites.push(enm);
}

function ClearEnemies()
{
    for (i = 0; i < enemies.length; i++)
    {
        enemySprites[i].remove();
    }

    enemies = [];
    enemySprites = [];

    for (i = 0; i < actors.length; i++)
    {
        if (actors[i] != player)
        {
            actors.splice(i, 1);
        }
    
        if (actorSprites[i] != plr)
        {    
            actorSprites[i].remove();
            actorSprites.splice(i, 1);
        }
    }
}

function EnemyShoot()
{
    if (enemies[i].shotDelay <= 0)
    {
        if (enemies[i].shotTics <= 0 && enemies[i].mag > 0)
        {
            Shoot(enemies[i], 5, -10);
            enemies[i].shotTics = 10;
            enemies[i].mag--;
        }

        enemies[i].shotTics--;
    }

    enemies[i].shotDelay--;

    if (enemies[i].mag <= 0)
    {
        enemies[i].shotDelay = 60;
        enemies[i].mag = getRandomArbitrary(1, 7);
    }
}

function Shoot(source, damage, vel)
{
    let angle = source == player ? 1 : -0.5;
    
    const bullet =
    {
        width: 4,
        height: 4,

        pos: { x: source.pos.x + source.width * angle, y: source.pos.y + source.height / 3 },
        damage: damage,
        vel: vel,
    }

    const blt = document.createElement("img");
    blt.src = "../Assets/Bullet.png";
    blt.style.width = String(bullet.width * 2) + "px";
    blt.style.height = String(bullet.height * 2) + "px";
    blt.style.position = "absolute";
    blt.style.left = String(bullet.pos.x) + "px";
    blt.style.top = String(bullet.pos.y) + "px";
    document.body.appendChild(blt);

    bullets.push(bullet);
    bulletSprites.push(blt);
}

function UpdateBullets()
{
    for (i = 0; i < bullets.length; i++)
    {
        if (bullets[i].pos.x + bullets[i].vel > res.x - bullets[i].width * 4)
        {
            bullets.splice(i, 1);

            bulletSprites[i].remove();
            bulletSprites.splice(i, 1);
            continue;
        }

        bullets[i].pos.x += bullets[i].vel;
        bulletSprites[i].style.left = String(bullets[i].pos.x) + "px";

        for (j = 0; j < actors.length; j++)
        {
            if (CheckCollision(bullets[i], actors[j]))
            {
                
                actors[j].health -= bullets[i].damage;

                bullets.splice(i, 1);

                bulletSprites[i].remove();
                bulletSprites.splice(i, 1);

                if (actors[j].health <= 0)
                {    
                    if (actors[j] != player)
                    {
                        player.kills++;
                    }
                    
                    actors[j].dead = true;
                    actors.splice(j, 1);
                }

                break;
            }
        }
    }
}

function NextFrame()
{
    frameCount++;
    levelCount.innerHTML = "Level: " + String(frameCount);

    ClearEnemies();

    for (let i = 0; i < frameCount / 2; i++)
    {
        CreateEnemy();
    }
}

CreateEnemy();

function EnemyTick()
{
    AnimateEnemies();

    for (i = 0; i < enemies.length; i++)
    {
        if (enemies[i].dead) return;
        
        enemySprites[i].style.left = String(enemies[i].pos.x) + "px";
        enemySprites[i].style.top = String(enemies[i].pos.y) + "px";

        EnemyShoot();
    }
}

const controller =
{
    left: false,
    right: false,
    up: false,
    down: false,
    run: false,
    crouch: false,
    shoot: false,

    keyHoldListener: function(e)
    {
        let keyState = (e.type == "keydown") ? true : false;

        switch (e.keyCode)
        {
            case 16: //shift
                controller.run = keyState;
                player.running = keyState;
                break;
            case 17: //ctrl
                controller.crouch = keyState;
                player.crouching = keyState;

                if (player.dead) return;

                if (!e.repeat)
                {
                    player.pos.y += player.crouchHeight;
                }
                if (e.type == "keyup")
                {
                    player.pos.y -= player.crouchHeight * 2;

                    for (i = 0; i < enemies.length; i++)
                    {
                        if (CheckCollision(player, enemies[i]))
                        {
                            player.pos.y += player.crouchHeight;
                            break;
                        }
                    }
                }
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

function Crouch()
{
    player.height = controller.crouch ? player.crouchHeight : playerDefaults.height;
}

function SpeedMult()
{
    return (controller.run && !controller.crouch ? 2 : controller.crouch ? 0.5 : 1);
}

function MovePlayer()
{
    if (player.dead) return;

    Crouch();
    
    if (controller.left)
    {
        player.vel.x -= 1;
    }
    if (controller.right)
    {
        player.vel.x += 1;
    }
    if (controller.up)
    {
        player.vel.y -= 1;
    }
    if (controller.down)
    {
        player.vel.y += 1;
    }
    if (controller.shoot && player.shotTics <= 0)
    {
        Shoot(player, 25, 10);
        player.shotTics = 10;
    }
    player.shotTics--;

    if (player.pos.x + player.vel.x > res.x - player.width)
    {
        player.pos.x = 0;
        NextFrame();
    }

    let prevPos = player.pos;
    let nextPos = { x: player.pos.x + player.vel.x * SpeedMult(), y: player.pos.y + player.vel.y * SpeedMult() };
    player.pos = nextPos;

    for (i = 0; i < enemies.length; i++)
    {
        if (CheckCollision(player, enemies[i]))
        {
            player.pos = prevPos;
            break;
        }
    }

    player.pos.x = clamp(player.pos.x, 8, res.x - player.width);
    player.pos.y = clamp(player.pos.y, res.y - floorHeight * 4, res.y - player.height - floorHeight / 2);

    player.vel.x *= 0.7;
    player.vel.y *= 0.7;

    plr.style.left = String(player.pos.x) + "px";
    plr.style.top = String(player.pos.y) + "px";
}

function CheckCollision(actor, other)
{
    if (other.dead) return;
    
    let l1 = { x: actor.pos.x, y: actor.pos.y };
    let r1 = { x: actor.pos.x + actor.width, y: actor.pos.y + actor.height };
    let l2 = { x: other.pos.x, y: other.pos.y };
    let r2 = { x: other.pos.x + other.width, y: other.pos.y + other.height };

    //ctx.fillRect(l1.x,l1.y,player.width,player.height);
    //ctx.fillRect(l2.x,l2.y,enemies[0].width,enemies[0].height);

    if (l1.x == r1.x || l1.y == r1.y ||
        l2.x == r2.x || l2.y == r2.y)
    {
        return false;
    }

    if (l1.x >= r2.x || l2.x >= r1.x)
    {
        return false;
    }

    if (r1.y <= l2.y || r2.y <= l1.y)
    {
        return false;
    }

    return true;
}

let frame = 1;
let fps = player.running && !player.crouching ? 7 : 15;

function FrameTick()
{
    fps--;

    if (fps <= 0)
    {
        frame++;
        fps = player.running && !player.crouching ? 7 : 15;

        if (frame > 3)
        {
            frame = 1;
        }
    }
}

function AnimatePlayer()
{
    if (player.dead)
    {
        if (player.deathTics <= 30 && player.deathTics > 20)
        {
            plr.src = "../Assets/Player/Death_1.png";
            plr.style.top = String(player.pos.y + 15) + "px";
        }
        if (player.deathTics <= 20 && player.deathTics > 10)
        {
            plr.src = "../Assets/Player/Death_2.png";
            plr.style.top = String(player.pos.y + 22) + "px";
        }
        if (player.deathTics <= 10 && player.deathTics >= 0)
        {
            plr.src = "../Assets/Player/Death_3.png";
            plr.style.top = String(player.pos.y + 33) + "px";
        }

        if (player.deathTics != 0)
        {
            player.deathTics--;
        }
    }
    else if (Math.round(player.vel.x) != 0 || Math.round(player.vel.y) != 0)
    {
        plr.src = "../Assets/Player/Move_" + String(frame) + ".png";

        if (player.crouching)
        {
            plr.src = "../Assets/Player/CrouchMove_" + String(frame) + ".png";
        }
    }
    else if (Math.round(player.vel.x) == 0 || Math.round(player.vel.y) == 0 && player.shotTics < 0)
    {
        plr.src = "../Assets/Player/Idle_1.png";

        if (player.crouching)
        {
            plr.src = "../Assets/Player/CrouchIdle_1.png";
        }
    }
    else if (player.shotTics <= 10 && player.shotTics >= 6)
    {
        plr.src = "../Assets/Player/Shoot_1.png";

        if (player.crouching)
        {
            plr.src = "../Assets/Player/CrouchShoot_1.png";
        }
    }
    else if (player.shotTics < 6 && player.shotTics > 0)
    {
        plr.src = "../Assets/Player/Shoot_2.png";

        if (player.crouching)
        {
            plr.src = "../Assets/Player/CrouchShoot_2.png";
        }
    }
}

function AnimateEnemies()
{
    for (i = 0; i < enemies.length; i++)
    {
        if (enemies[i].dead)
        {
            if (enemies[i].deathTics <= 30 && enemies[i].deathTics > 20)
            {
                enemySprites[i].src = "../Assets/Enemy/Death_1.png";
                enemySprites[i].style.top = String(enemies[i].pos.y + 15) + "px";
            }
            if (enemies[i].deathTics <= 20 && enemies[i].deathTics > 10)
            {
                enemySprites[i].src = "../Assets/Enemy/Death_2.png";
                enemySprites[i].style.top = String(enemies[i].pos.y + 22) + "px";
            }
            if (enemies[i].deathTics <= 10 && enemies[i].deathTics >= 0)
            {
                enemySprites[i].src = "../Assets/Enemy/Death_3.png";
                enemySprites[i].style.top = String(enemies[i].pos.y + 33) + "px";
            }

            if (enemies[i].deathTics != 0)
            {
                enemies[i].deathTics--;
            }
        }
        else if (enemies[i].shotTics <= 10 && enemies[i].shotTics >= 6)
        {
            enemySprites[i].src = "../Assets/Enemy/Shoot_1.png";
        }
        else if (enemies[i].shotTics < 6 && enemies[i].shotTics > 0)
        {
            enemySprites[i].src = "../Assets/Enemy/Shoot_2.png";
        }
    };
}

const healthBars = document.getElementById("healthBars");
healthBars.style.position = "absolute";
healthBars.style.left = "0px";
healthBars.style.top = "0px";
const HealthBarsCtx = healthBars.getContext("2d");

HealthBarsCtx.canvas.width = 800;
HealthBarsCtx.canvas.height = 600;

const Tick = function()
{
    MovePlayer();
    AnimatePlayer();
    FrameTick();

    EnemyTick();
    UpdateBullets();

    UpdateKillCount();

    window.requestAnimationFrame(Tick);
};

const DrawHealth = function()
{
    HealthBarsCtx.clearRect(0, 0, HealthBarsCtx.canvas.width, HealthBarsCtx.canvas.height);

    actors.forEach(actor =>
    {
        HealthBarsCtx.fillStyle = "red";
        HealthBarsCtx.fillRect(actor.pos.x, actor.pos.y - actor.height / 2, actor.health / 2, 10);
    });

    window.requestAnimationFrame(DrawHealth);
}
DrawHealth();

window.addEventListener("keydown", controller.keyHoldListener);
window.addEventListener("keyup", controller.keyHoldListener);

window.requestAnimationFrame(Tick);
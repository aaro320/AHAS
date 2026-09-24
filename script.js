/* =====================================================
   SNAKE GAME
   Mobile Swipe + Desktop Keyboard (Arrow & WASD) Version
===================================================== */


/* =====================================================
   SETTINGS
===================================================== */

const GRID = 20;

/* Base speed set to 200ms per move for easier initial control */
const BASE_SPEED = 200;

const POWERUP_DURATION = 6000;


/* =====================================================
   CANVAS
===================================================== */

const canvas =
    document.getElementById(
        "gameCanvas"
    );

const ctx =
    canvas.getContext("2d");


/* =====================================================
   SONG LIST (WITH COVERS)
===================================================== */

const SONGS = [

    {
        title: "Dahil ikaw",
        file: "dahil-ikaw.mp3",
        cover: "assets/dahil-ikaw.jpg"
    },

    {
        title: "Buwan",
        file: "buwan.mp3",
        cover: "assets/buwan.jpg"
    },

    {
        title: "Just the Way You Are",
        file: "just-the-way-you-are.mp3",
        cover: "assets/just-the-way-you-are.jpg"
    },

    {
        title: "Beautiful",
        file: "beautiful.mp3",
        cover: "assets/beautiful.jpg"
    },

    {
        title: "Naiilang",
        file: "naiilang.mp3",
        cover: "assets/naiilang.jpg"
    },

    {
        title: "Maria Clara",
        file: "maria-clara.mp3",
        cover: "assets/maria-clara.jpg"
    },

    {
        title: "Inaasam",
        file: "inaasam.mp3",
        cover: "assets/inaasam.jpg"
    },

    {
        title: "Merry Christmas, I Miss You!",
        file: "merry-christmas-i-miss-you.mp3",
        cover: "assets/merry-christmas-i-miss-you.jpg"
    },

    {
        title: "Merry Christmas, Please Don't Call!",
        file: "merry-christmas-please-dont-call.mp3",
        cover: "assets/merry-christmas-please-dont-call.jpg"
    },

    {
        title: "What If I Call",
        file: "what-if-i-call.mp3",
        cover: "assets/what-if-i-call.jpg"
    },

    {
        title: "Perfect",
        file: "perfect.mp3",
        cover: "assets/perfect.jpg"
    }

];


/* =====================================================
   GAME VARIABLES
===================================================== */

let snakeName = "Player";

let snakeColor = "#ff69b4";

let snake = [];

/* Food can now hold multiple items (for Food Bomb) */
let foods = [];

let bigFood = null;

let powerup = null;


let direction = {
    x: 1,
    y: 0
};


let nextDirection = {
    x: 1,
    y: 0
};


let score = 0;

let running = false;

let lastMove = 0;

let speed = BASE_SPEED;

let powerupEnd = 0;

let activePowerupType = null;

let hasShield = false;

let pointMultiplier = 1;


let touchStartX = 0;

let touchStartY = 0;


let selectedSong = null;


/* =====================================================
   CANVAS RESIZE
===================================================== */

function resizeCanvas() {

    const size =
        Math.min(
            window.innerWidth - 14,
            600
        );


    const dpr =
        window.devicePixelRatio || 1;


    canvas.style.width =
        size + "px";


    canvas.style.height =
        size + "px";


    canvas.width =
        Math.round(
            size * dpr
        );


    canvas.height =
        Math.round(
            size * dpr
        );


    ctx.setTransform(

        dpr * size / GRID,

        0,

        0,

        dpr * size / GRID,

        0,

        0

    );

}


window.addEventListener(
    "resize",
    resizeCanvas
);


resizeCanvas();


/* =====================================================
   SHOW SCREEN
===================================================== */

function show(id) {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {

            screen.classList.add(
                "hidden"
            );

        });


    document
        .getElementById(id)
        .classList.remove(
            "hidden"
        );
}


/* =====================================================
   START GAME
===================================================== */

function startGame() {

    snakeName =
        document
            .getElementById(
                "snakeName"
            )
            .value
            .trim();


    if (!snakeName) {

        snakeName = "Player";

    }


    snakeName =
        snakeName.substring(
            0,
            15
        );


    document
        .getElementById(
            "displayName"
        )
        .textContent =
        snakeName;


    /* Starting snake */

    snake = [

        {
            x: 10,
            y: 10
        },

        {
            x: 9,
            y: 10
        },

        {
            x: 8,
            y: 10
        }

    ];


    direction = {

        x: 1,
        y: 0

    };


    nextDirection = {

        x: 1,
        y: 0

    };


    score = 0;


    speed =
        BASE_SPEED;


    powerup = null;

    bigFood = null;

    activePowerupType = null;

    hasShield = false;

    pointMultiplier = 1;

    foods = [];


    powerupEnd = 0;


    running = true;


    document
        .getElementById(
            "score"
        )
        .textContent =
        score;


    document
        .getElementById(
            "powerupInfo"
        )
        .textContent =
        "⚡ Power-up: none";


    spawnFood();


    spawnPowerupMaybe();


    show(
        "gameScreen"
    );


    resizeCanvas();


    lastMove =
        performance.now();


    requestAnimationFrame(
        gameLoop
    );
}


/* =====================================================
   SPAWN FOOD
===================================================== */

function spawnFood() {

    let newFood;

    do {

        newFood = {

            x:
                Math.floor(
                    Math.random() *
                    GRID
                ),

            y:
                Math.floor(
                    Math.random() *
                    GRID
                )

        };

    }

    while (

        snake.some(

            part =>

                part.x === newFood.x &&

                part.y === newFood.y

        )

        ||

        (

            bigFood &&

            bigFood.x === newFood.x &&

            bigFood.y === newFood.y

        )

        ||

        foods.some(

            f => f.x === newFood.x && f.y === newFood.y

        )

    );


    foods.push(newFood);
}


/* =====================================================
   SPAWN BIG FOOD
===================================================== */

function spawnBigFoodMaybe() {

    /* 30% chance to spawn Big Food */

    if (Math.random() > 0.30) {

        return;

    }


    let tries = 0;


    do {

        bigFood = {

            x:
                Math.floor(
                    Math.random() *
                    GRID
                ),

            y:
                Math.floor(
                    Math.random() *
                    GRID
                ),

            /* Random points bonus between 1 and 5 */

            points: Math.floor(Math.random() * 5) + 1

        };


        tries++;

    }

    while (

        tries < 100 &&

        (

            snake.some(

                part =>

                    part.x === bigFood.x &&

                    part.y === bigFood.y

            )

            ||

            foods.some(

                f =>

                    f.x === bigFood.x &&

                    f.y === bigFood.y

            )

            ||

            (

                powerup &&

                powerup.x === bigFood.x &&

                powerup.y === bigFood.y

            )

        )

    );
}


/* =====================================================
   SPAWN POWERUP
===================================================== */

function spawnPowerupMaybe() {

    /* 30% chance */

    if (
        Math.random() > 0.30
    ) {

        powerup = null;

        return;

    }


    let tries = 0;

    const types = ["shield", "ghost", "magnet", "speed", "bomb"];

    const chosenType = types[Math.floor(Math.random() * types.length)];


    do {

        powerup = {

            x:
                Math.floor(
                    Math.random() *
                    GRID
                ),

            y:
                Math.floor(
                    Math.random() *
                    GRID
                ),

            type: chosenType

        };


        tries++;

    }

    while (

        tries < 100 &&

        (

            snake.some(

                part =>

                    part.x ===
                    powerup.x &&

                    part.y ===
                    powerup.y

            )

            ||

            foods.some(

                f =>

                    f.x ===
                    powerup.x &&

                    f.y ===
                    powerup.y

            )

            ||

            (

                bigFood &&

                bigFood.x === powerup.x &&

                bigFood.y === powerup.y

            )

        )

    );
}


/* =====================================================
   FOOD MAGNET LOGIC
===================================================== */

function applyMagnetEffect() {

    const head = snake[0];


    /* Pull regular food 1 tile closer */

    foods.forEach(f => {

        if (f.x < head.x) f.x++;

        else if (f.x > head.x) f.x--;


        if (f.y < head.y) f.y++;

        else if (f.y > head.y) f.y--;

    });


    /* Pull big food 1 tile closer */

    if (bigFood) {

        if (bigFood.x < head.x) bigFood.x++;

        else if (bigFood.x > head.x) bigFood.x--;


        if (bigFood.y < head.y) bigFood.y++;

        else if (bigFood.y > head.y) bigFood.y--;

    }
}


/* =====================================================
   CHANGE DIRECTION
===================================================== */

function setDirection(
    x,
    y
) {

    if (!running)
        return;


    /* Prevent opposite direction */

    if (

        x === -direction.x &&

        y === -direction.y

    ) {

        return;

    }


    if (

        x === -nextDirection.x &&

        y === -nextDirection.y

    ) {

        return;

    }


    nextDirection = {

        x: x,

        y: y

    };
}


/* =====================================================
   UPDATE GAME
===================================================== */

function update() {

    direction =
        nextDirection;


    const head =
        snake[0];


    let newHead = {

        x:
            head.x +
            direction.x,

        y:
            head.y +
            direction.y

    };


    /* Magnet Power-up Effect */

    if (activePowerupType === "magnet") {

        applyMagnetEffect();

    }


    /* Wall Check */

    let hitWall =

        newHead.x < 0 ||

        newHead.x >= GRID ||

        newHead.y < 0 ||

        newHead.y >= GRID;


    /* Ghost Mode Wall Wrap */

    if (hitWall && activePowerupType === "ghost") {

        if (newHead.x < 0) newHead.x = GRID - 1;

        else if (newHead.x >= GRID) newHead.x = 0;


        if (newHead.y < 0) newHead.y = GRID - 1;

        else if (newHead.y >= GRID) newHead.y = 0;


        hitWall = false;

    }


    /* Self Collision Check */

    const hitSelf =

        snake.some(

            part =>

                part.x ===
                newHead.x &&

                part.y ===
                newHead.y

        );


    if (hitWall || hitSelf) {

        if (hasShield) {

            /* Shield absorbs collision */

            hasShield = false;


            document

                .getElementById(

                    "powerupInfo"

                )

                .textContent =

                "🛡️ Shield Broke!";


            return;

        }

        else {

            gameOver();

            return;

        }

    }


    snake.unshift(
        newHead
    );


    let ateFood = false;


    /* Regular food collision */

    const foodIndex = foods.findIndex(

        f => f.x === newHead.x && f.y === newHead.y

    );


    if (foodIndex !== -1) {

        score += 1 * pointMultiplier;


        document

            .getElementById("score")

            .textContent = score;


        foods.splice(foodIndex, 1);


        ateFood = true;


        if (foods.length === 0) {

            spawnFood();

        }


        spawnBigFoodMaybe();


        spawnPowerupMaybe();

    }


    /* Big food collision */

    else if (

        bigFood &&

        newHead.x === bigFood.x &&

        newHead.y === bigFood.y

    ) {

        score += bigFood.points * pointMultiplier;


        document

            .getElementById("score")

            .textContent = score;


        ateFood = true;


        bigFood = null;

    }


    if (!ateFood) {

        snake.pop();

    }


    /* Collect Power-up */

    if (

        powerup &&

        newHead.x === powerup.x &&

        newHead.y === powerup.y

    ) {

        activePowerupType = powerup.type;


        if (powerup.type === "shield") {

            hasShield = true;

            document.getElementById("powerupInfo").textContent = "🛡️ Shield Active!";

        }

        else if (powerup.type === "ghost") {

            powerupEnd = performance.now() + 8000;

            document.getElementById("powerupInfo").textContent = "👻 Ghost Mode Active!";

        }

        else if (powerup.type === "magnet") {

            powerupEnd = performance.now() + POWERUP_DURATION;

            document.getElementById("powerupInfo").textContent = "🧲 Magnet Active!";

        }

        else if (powerup.type === "speed") {

            speed = 110;

            pointMultiplier = 2;

            powerupEnd = performance.now() + POWERUP_DURATION;

            document.getElementById("powerupInfo").textContent = "⚡ Speed 2x Points Active!";

        }

        else if (powerup.type === "bomb") {

            for (let i = 0; i < 5; i++) {

                spawnFood();

            }

            document.getElementById("powerupInfo").textContent = "💣 Food Bomb Exploded!";

        }


        powerup = null;

    }

}


/* =====================================================
   GAME LOOP
===================================================== */

function gameLoop(now) {

    if (!running)
        return;


    /* Expire Timed Power-ups */

    if (

        powerupEnd &&

        now >= powerupEnd

    ) {

        speed = BASE_SPEED;

        pointMultiplier = 1;

        powerupEnd = 0;

        activePowerupType = null;


        document

            .getElementById("powerupInfo")

            .textContent = "⚡ Power-up: none";

    }


    if (

        now - lastMove >= speed

    ) {

        update();


        lastMove = now;

    }


    draw();


    requestAnimationFrame(
        gameLoop
    );
}


/* =====================================================
   DRAW GAME
===================================================== */

function draw() {

    ctx.clearRect(
        0,
        0,
        GRID,
        GRID
    );


    ctx.fillStyle =
        "#050509";


    ctx.fillRect(
        0,
        0,
        GRID,
        GRID
    );


    /* Grid lines */

    ctx.strokeStyle =
        "rgba(255,255,255,.035)";


    ctx.lineWidth =
        0.03;


    for (
        let i = 0;
        i <= GRID;
        i++
    ) {

        ctx.beginPath();

        ctx.moveTo(
            i,
            0
        );

        ctx.lineTo(
            i,
            GRID
        );

        ctx.stroke();


        ctx.beginPath();

        ctx.moveTo(
            0,
            i
        );

        ctx.lineTo(
            GRID,
            i
        );

        ctx.stroke();

    }


    /* Regular Foods */

    foods.forEach(f => {

        ctx.fillStyle = "#e74c3c";

        ctx.beginPath();

        ctx.arc(f.x + 0.5, f.y + 0.5, 0.34, 0, Math.PI * 2);

        ctx.fill();

    });


    /* Big Food */

    if (bigFood) {

        ctx.fillStyle = "#f1c40f";

        ctx.beginPath();

        ctx.arc(bigFood.x + 0.5, bigFood.y + 0.5, 0.46, 0, Math.PI * 2);

        ctx.fill();


        ctx.fillStyle = "#050509";

        ctx.font = "bold 0.45px Arial";

        ctx.textAlign = "center";

        ctx.textBaseline = "middle";

        ctx.fillText("★", bigFood.x + 0.5, bigFood.y + 0.5);

    }


    /* Powerup Rendering */

    if (powerup) {

        let symbol = "⚡";


        if (powerup.type === "shield") {

            ctx.fillStyle = "#00e676";

            symbol = "🛡";

        } else if (powerup.type === "ghost") {

            ctx.fillStyle = "#9c27b0";

            symbol = "👻";

        } else if (powerup.type === "magnet") {

            ctx.fillStyle = "#29b6f6";

            symbol = "🧲";

        } else if (powerup.type === "speed") {

            ctx.fillStyle = "#ffeb3b";

            symbol = "⚡";

        } else if (powerup.type === "bomb") {

            ctx.fillStyle = "#ff1744";

            symbol = "💣";

        }


        ctx.beginPath();

        ctx.arc(powerup.x + 0.5, powerup.y + 0.5, 0.30, 0, Math.PI * 2);

        ctx.fill();


        ctx.fillStyle = "#06151a";

        ctx.font = "0.45px Arial";

        ctx.textAlign = "center";

        ctx.textBaseline = "middle";

        ctx.fillText(symbol, powerup.x + 0.5, powerup.y + 0.5);

    }


    /* Snake Rendering */

    snake.forEach(
        (part, index) => {

            if (index === 0 && hasShield) {

                ctx.fillStyle = "#00e676";

            } else if (activePowerupType === "ghost") {

                ctx.fillStyle = "rgba(156, 39, 176, 0.75)";

            } else {

                ctx.fillStyle = snakeColor;

            }


            const pad =

                index === 0

                    ? 0.04

                    : 0.09;


            roundRect(

                part.x + pad,

                part.y + pad,

                1 - pad * 2,

                1 - pad * 2,

                0.18

            );


            ctx.fill();


            if (index === 0) {

                drawSnakeEyes(
                    part
                );

            }

        }
    );
}


/* =====================================================
   SNAKE EYES
===================================================== */

function drawSnakeEyes(part) {

    ctx.fillStyle =
        "#ffffff";


    let eyeX1;

    let eyeX2;

    let eyeY;


    if (direction.x !== 0) {

        eyeX1 =
            part.x +
            (
                direction.x > 0
                    ? 0.70
                    : 0.30
            );


        eyeX2 =
            eyeX1;


        eyeY =
            part.y + 0.35;

    }

    else {

        eyeY =
            part.y +
            (
                direction.y > 0
                    ? 0.70
                    : 0.30
            );


        eyeX1 =
            part.x + 0.35;


        eyeX2 =
            part.x + 0.65;

    }


    ctx.beginPath();


    ctx.arc(

        eyeX1,

        eyeY,

        0.09,

        0,

        Math.PI * 2

    );


    ctx.fill();


    ctx.beginPath();


    ctx.arc(

        eyeX2,

        eyeY,

        0.09,

        0,

        Math.PI * 2

    );


    ctx.fill();
}


/* =====================================================
   ROUNDED RECTANGLE
===================================================== */

function roundRect(
    x,
    y,
    w,
    h,
    r
) {

    ctx.beginPath();


    ctx.moveTo(
        x + r,
        y
    );


    ctx.arcTo(
        x + w,
        y,
        x + w,
        y + h,
        r
    );


    ctx.arcTo(
        x + w,
        y + h,
        x,
        y + h,
        r
    );


    ctx.arcTo(
        x,
        y + h,
        x,
        y,
        r
    );


    ctx.arcTo(
        x,
        y,
        x + w,
        y,
        r
    );


    ctx.closePath();
}


/* =====================================================
   GAME OVER
===================================================== */

function gameOver() {

    running = false;


    saveScore();


    selectedSong =
        SONGS[
            Math.floor(
                Math.random() *
                SONGS.length
            )
        ];


    document
        .getElementById(
            "finalScore"
        )
        .textContent =
        score;


    document
        .getElementById(
            "finalMessage"
        )
        .textContent =

        `${snakeName} scored ${
            score
        } point${
            score === 1
                ? ""
                : "s"
        }.`;


    document
        .getElementById(
            "songTitle"
        )
        .textContent =
        selectedSong.title;


    document
        .getElementById(
            "songCover"
        )
        .src =
        selectedSong.cover;


    const audio =
        document.getElementById(
            "deathAudio"
        );


    audio.src =
        "assets/" +
        selectedSong.file;


    audio.currentTime =
        0;


    show(
        "gameOverScreen"
    );


    audio
        .play()
        .catch(
            () => {

            }
        );
}


/* =====================================================
   LEADERBOARD
===================================================== */

function saveScore() {

    const board =
        JSON.parse(

            localStorage.getItem(
                "snakeLeaderboard"
            ) || "[]"

        );


    board.push({

        name:
            snakeName,

        score:
            score,

        date:
            new Date()
                .toLocaleDateString()

    });


    board.sort(

        (a, b) =>
            b.score -
            a.score

    );


    localStorage.setItem(

        "snakeLeaderboard",

        JSON.stringify(
            board.slice(0, 10)
        )

    );
}


/* =====================================================
   DISPLAY LEADERBOARD
===================================================== */

function renderLeaderboard() {

    const board =
        JSON.parse(

            localStorage.getItem(
                "snakeLeaderboard"
            ) || "[]"

        );


    const list =
        document.getElementById(
            "leaderboardList"
        );


    list.innerHTML = "";


    if (
        board.length === 0
    ) {

        const li =
            document.createElement(
                "li"
            );


        li.textContent =
            "No scores yet.";


        list.appendChild(
            li
        );


        return;
    }


    board.forEach(
        item => {

            const li =
                document.createElement(
                    "li"
                );


            li.textContent =

                `${item.name} — ${
                    item.score
                } point${
                    item.score === 1
                        ? ""
                        : "s"
                } (${item.date})`;


            list.appendChild(
                li
            );

        }
    );
}


/* =====================================================
   OPEN LEADERBOARD
===================================================== */

function openLeaderboard() {

    renderLeaderboard();


    document
        .getElementById(
            "leaderboardModal"
        )
        .classList.remove(
            "hidden"
        );
}


/* =====================================================
   CLOSE LEADERBOARD
===================================================== */

function closeLeaderboard() {

    document
        .getElementById(
            "leaderboardModal"
        )
        .classList.add(
            "hidden"
        );
}


/* =====================================================
   COLOR SELECTION
===================================================== */

document
    .querySelectorAll(
        ".color-btn"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".color-btn"
                        )
                        .forEach(
                            btn =>
                                btn.classList
                                    .remove(
                                        "selected"
                                    )
                        );


                    button.classList.add(
                        "selected"
                    );


                    snakeColor =
                        button.dataset.color;

                }
            );

        }
    );


/* =====================================================
   DESKTOP KEYBOARD CONTROLS (ARROWS + WASD)
===================================================== */

window.addEventListener(
    "keydown",
    function (event) {

        if (!running)
            return;


        const key =
            event.key;


        if (
            key === "ArrowUp" ||
            key === "w" ||
            key === "W"
        ) {

            event.preventDefault();

            setDirection(0, -1);

        }

        else if (
            key === "ArrowDown" ||
            key === "s" ||
            key === "S"
        ) {

            event.preventDefault();

            setDirection(0, 1);

        }

        else if (
            key === "ArrowLeft" ||
            key === "a" ||
            key === "A"
        ) {

            event.preventDefault();

            setDirection(-1, 0);

        }

        else if (
            key === "ArrowRight" ||
            key === "d" ||
            key === "D"
        ) {

            event.preventDefault();

            setDirection(1, 0);

        }

    }
);


/* =====================================================
   BUTTON LISTENERS
===================================================== */

document
    .getElementById(
        "startBtn"
    )
    .addEventListener(
        "click",
        startGame
    );


document
    .getElementById(
        "playAgainBtn"
    )
    .addEventListener(
        "click",
        startGame
    );


document
    .getElementById(
        "homeBtn"
    )
    .addEventListener(
        "click",
        () => {

            const audio =
                document.getElementById(
                    "deathAudio"
                );


            audio.pause();


            audio.currentTime =
                0;


            show(
                "setupScreen"
            );

        }
    );


document
    .getElementById(
        "leaderboardBtn"
    )
    .addEventListener(
        "click",
        openLeaderboard
    );


document
    .getElementById(
        "gameOverLeaderboardBtn"
    )
    .addEventListener(
        "click",
        openLeaderboard
    );


document
    .getElementById(
        "closeLeaderboard"
    )
    .addEventListener(
        "click",
        closeLeaderboard
    );


document
    .getElementById(
        "clearLeaderboard"
    )
    .addEventListener(
        "click",
        () => {

            const answer =
                confirm(
                    "Clear all leaderboard scores?"
                );


            if (answer) {

                localStorage.removeItem(
                    "snakeLeaderboard"
                );


                renderLeaderboard();

            }

        }
    );


/* =====================================================
   SWIPE START (TOUCH DEVICES)
===================================================== */

canvas.addEventListener(

    "touchstart",

    function(event) {

        const touch =
            event.changedTouches[0];


        touchStartX =
            touch.clientX;


        touchStartY =
            touch.clientY;

    },

    {
        passive: true
    }

);


/* =====================================================
   SWIPE END (TOUCH DEVICES)
===================================================== */

canvas.addEventListener(

    "touchend",

    function(event) {

        const touch =
            event.changedTouches[0];


        const dx =
            touch.clientX -
            touchStartX;


        const dy =
            touch.clientY -
            touchStartY;


        if (

            Math.max(
                Math.abs(dx),
                Math.abs(dy)
            ) < 25

        ) {

            return;

        }


        if (

            Math.abs(dx) >
            Math.abs(dy)

        ) {

            if (dx > 0) {

                setDirection(
                    1,
                    0
                );

            }

            else {

                setDirection(
                    -1,
                    0
                );

            }

        }

        else {

            if (dy > 0) {

                setDirection(
                    0,
                    1
                );

            }

            else {

                setDirection(
                    0,
                    -1
                );

            }

        }

    },

    {
        passive: true
    }

);

const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");


/* =========================
   GAME SETTINGS
========================= */

const GRID = 20;

const BASE_SPEED = 130;

const POWERUP_DURATION = 5000;


/* =========================
   SONGS
========================= */

const SONGS = [

    {
        title: "Dahil ikaw",
        file: "dahil-ikaw.mp3"
    },

    {
        title: "Buwan",
        file: "buwan.mp3"
    },

    {
        title: "Just the Way You Are",
        file: "just-the-way-you-are.mp3"
    },

    {
        title: "Beautiful",
        file: "beautiful.mp3"
    },

    {
        title: "Naiilang",
        file: "naiilang.mp3"
    },

    {
        title: "Maria Clara",
        file: "maria-clara.mp3"
    },

    {
        title: "Inaasam",
        file: "inaasam.mp3"
    },

    {
        title: "Merry Christmas, I Miss You!",
        file: "merry-christmas-i-miss-you.mp3"
    },

    {
        title: "Merry Christmas, Please Don't Call!",
        file: "merry-christmas-please-dont-call.mp3"
    },

    {
        title: "What If I Call",
        file: "what-if-i-call.mp3"
    },

    {
        title: "Perfect",
        file: "perfect.mp3"
    }

];


/* =========================
   VARIABLES
========================= */

let snakeName = "Player";

let snakeColor = "#ff69b4";

let snake = [];

let food = null;

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

let paused = false;

let lastMove = 0;

let speed = BASE_SPEED;

let powerupEnd = 0;

let touchStartX = 0;

let touchStartY = 0;

let selectedSong = null;


/* =========================
   CANVAS SIZE
========================= */

function resizeCanvas() {

    const size =
        Math.min(
            window.innerWidth - 20,
            600
        );

    const dpr =
        window.devicePixelRatio || 1;

    canvas.style.width =
        size + "px";

    canvas.style.height =
        size + "px";

    canvas.width =
        Math.round(size * dpr);

    canvas.height =
        Math.round(size * dpr);

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


/* =========================
   SCREEN
========================= */

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


/* =========================
   START GAME
========================= */

function startGame() {

    snakeName =
        document
            .getElementById("snakeName")
            .value
            .trim() || "Player";

    snakeName =
        snakeName.substring(0, 15);


    document
        .getElementById("displayName")
        .textContent = snakeName;


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

    speed = BASE_SPEED;

    powerup = null;

    powerupEnd = 0;

    paused = false;

    running = true;


    document
        .getElementById("score")
        .textContent = score;


    document
        .getElementById("powerupInfo")
        .textContent =
        "⚡ Power-up: none";


    spawnFood();

    spawnPowerupMaybe();


    show("gameScreen");

    resizeCanvas();


    lastMove =
        performance.now();


    requestAnimationFrame(
        gameLoop
    );
}


/* =========================
   FOOD
========================= */

function spawnFood() {

    do {

        food = {

            x:
                Math.floor(
                    Math.random() * GRID
                ),

            y:
                Math.floor(
                    Math.random() * GRID
                )

        };

    }

    while (
        snake.some(
            part =>
                part.x === food.x &&
                part.y === food.y
        )
    );
}


/* =========================
   POWER UP
========================= */

function spawnPowerupMaybe() {

    /*
       25% chance of power-up
    */

    if (Math.random() > 0.25) {

        powerup = null;

        return;
    }


    let tries = 0;


    do {

        powerup = {

            x:
                Math.floor(
                    Math.random() * GRID
                ),

            y:
                Math.floor(
                    Math.random() * GRID
                ),

            type: "slow"

        };

        tries++;

    }

    while (

        tries < 100 &&

        (

            snake.some(
                part =>
                    part.x === powerup.x &&
                    part.y === powerup.y
            )

            ||

            (
                food &&
                food.x === powerup.x &&
                food.y === powerup.y
            )

        )

    );
}


/* =========================
   DIRECTION
========================= */

function setDirection(x, y) {

    if (!running || paused)
        return;


    /*
       Prevent going directly
       backwards.
    */

    if (
        x === -direction.x &&
        y === -direction.y
    )
        return;


    if (
        x === -nextDirection.x &&
        y === -nextDirection.y
    )
        return;


    nextDirection = {
        x: x,
        y: y
    };
}


/* =========================
   UPDATE
========================= */

function update() {

    direction =
        nextDirection;


    const head =
        snake[0];


    const newHead = {

        x:
            head.x +
            direction.x,

        y:
            head.y +
            direction.y

    };


    /*
       WALL COLLISION
    */

    if (

        newHead.x < 0 ||

        newHead.x >= GRID ||

        newHead.y < 0 ||

        newHead.y >= GRID ||

        snake.some(
            part =>
                part.x === newHead.x &&
                part.y === newHead.y
        )

    ) {

        gameOver();

        return;
    }


    snake.unshift(
        newHead
    );


    /*
       FOOD
    */

    if (

        food &&

        newHead.x === food.x &&

        newHead.y === food.y

    ) {

        /*
           ONLY 1 POINT
           PER FOOD
        */

        score += 1;


        document
            .getElementById("score")
            .textContent = score;


        spawnFood();

        spawnPowerupMaybe();

    }

    else {

        snake.pop();

    }


    /*
       POWER UP
    */

    if (

        powerup &&

        newHead.x === powerup.x &&

        newHead.y === powerup.y

    ) {

        /*
           Snake becomes slower
        */

        speed =
            BASE_SPEED * 1.65;


        powerupEnd =
            performance.now() +
            POWERUP_DURATION;


        document
            .getElementById("powerupInfo")
            .textContent =
            "🐌 Slow power-up active!";


        powerup = null;

    }

}


/* =========================
   GAME LOOP
========================= */

function gameLoop(now) {

    if (!running)
        return;


    if (!paused) {


        if (
            powerupEnd &&
            now >= powerupEnd
        ) {

            speed = BASE_SPEED;

            powerupEnd = 0;


            document
                .getElementById("powerupInfo")
                .textContent =
                "⚡ Power-up: none";

        }


        if (
            now - lastMove >= speed
        ) {

            update();

            lastMove = now;

        }


        draw();

    }


    requestAnimationFrame(
        gameLoop
    );
}


/* =========================
   DRAW
========================= */

function draw() {

    ctx.clearRect(
        0,
        0,
        GRID,
        GRID
    );


    /*
       BACKGROUND
    */

    ctx.fillStyle =
        "#050509";

    ctx.fillRect(
        0,
        0,
        GRID,
        GRID
    );


    /*
       GRID
    */

    ctx.strokeStyle =
        "rgba(255,255,255,.035)";

    ctx.lineWidth = 0.03;


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


    /*
       FOOD
    */

    if (food) {

        ctx.fillStyle =
            "#e74c3c";


        ctx.beginPath();

        ctx.arc(
            food.x + .5,
            food.y + .5,
            .34,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }


    /*
       POWER UP
    */

    if (powerup) {

        ctx.fillStyle =
            "#4dd0e1";


        ctx.beginPath();

        ctx.arc(
            powerup.x + .5,
            powerup.y + .5,
            .3,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.fillStyle =
            "#06151a";

        ctx.font =
            ".45px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.fillText(
            "S",
            powerup.x + .5,
            powerup.y + .5
        );

    }


    /*
       SNAKE
    */

    snake.forEach(
        (part, index) => {

            ctx.fillStyle =
                snakeColor;


            const pad =
                index === 0
                    ? .04
                    : .09;


            roundRect(

                part.x + pad,

                part.y + pad,

                1 - pad * 2,

                1 - pad * 2,

                .18

            );


            ctx.fill();


            /*
               Snake eyes
            */

            if (index === 0) {

                ctx.fillStyle =
                    "#fff";


                const eye = .18;


                let ex1 =
                    part.x + .34;

                let ex2 =
                    part.x + .66;

                let ey =
                    part.y + .35;


                if (direction.x !== 0) {

                    ex1 =
                        part.x +
                        (
                            direction.x > 0
                                ? .68
                                : .32
                        );

                    ex2 = ex1;

                    ey =
                        part.y + .35;

                }

                else {

                    ey =
                        part.y +
                        (
                            direction.y > 0
                                ? .68
                                : .32
                        );

                    ex1 =
                        part.x + .35;

                    ex2 =
                        part.x + .65;

                }


                ctx.beginPath();

                ctx.arc(
                    ex1,
                    ey,
                    eye / 2,
                    0,
                    Math.PI * 2
                );

                ctx.fill();


                ctx.beginPath();

                ctx.arc(
                    ex2,
                    ey,
                    eye / 2,
                    0,
                    Math.PI * 2
                );

                ctx.fill();

            }

        }
    );

}


/* =========================
   ROUNDED SNAKE
========================= */

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


/* =========================
   GAME OVER
========================= */

function gameOver() {

    running = false;


    saveScore();


    /*
       RANDOM SONG
    */

    selectedSong =
        SONGS[
            Math.floor(
                Math.random() *
                SONGS.length
            )
        ];


    document
        .getElementById("finalScore")
        .textContent = score;


    document
        .getElementById("finalMessage")
        .textContent =
        `${snakeName} scored ${score} point${
            score === 1 ? "" : "s"
        }.`;



    /*
       ONLY SONG TITLE
       NO LYRICS
    */

    document
        .getElementById("songTitle")
        .textContent =
        selectedSong.title;


    const audio =
        document.getElementById(
            "deathAudio"
        );


    audio.src =
        "assets/" +
        selectedSong.file;


    audio.currentTime = 0;


    show(
        "gameOverScreen"
    );


    /*
       Try automatic playback
    */

    audio
        .play()
        .catch(() => {

            /*
               Some browsers block
               automatic audio.
            */

        });

}


/* =========================
   LEADERBOARD
========================= */

function saveScore() {

    const board =
        JSON.parse(
            localStorage.getItem(
                "snakeLeaderboard"
            ) || "[]"
        );


    board.push({

        name: snakeName,

        score: score,

        date:
            new Date()
                .toLocaleDateString()

    });


    board.sort(
        (a, b) =>
            b.score - a.score
    );


    localStorage.setItem(

        "snakeLeaderboard",

        JSON.stringify(
            board.slice(0, 10)
        )

    );

}


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


    if (!board.length) {

        const li =
            document.createElement(
                "li"
            );

        li.textContent =
            "No scores yet.";

        list.appendChild(li);

        return;
    }


    board.forEach(item => {

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


        list.appendChild(li);

    });

}


/* =========================
   LEADERBOARD MODAL
========================= */

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


function closeLeaderboard() {

    document
        .getElementById(
            "leaderboardModal"
        )
        .classList.add(
            "hidden"
        );
}


/* =========================
   PAUSE
========================= */

function togglePause() {

    if (!running)
        return;


    paused = !paused;


    document
        .getElementById(
            "pauseOverlay"
        )
        .classList.toggle(
            "hidden",
            !paused
        );
}


/* =========================
   COLOR SELECT
========================= */

document
    .querySelectorAll(
        ".color-btn"
    )
    .forEach(btn => {

        btn.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".color-btn"
                    )
                    .forEach(
                        b =>
                            b.classList
                                .remove(
                                    "selected"
                                )
                    );


                btn.classList.add(
                    "selected"
                );


                snakeColor =
                    btn.dataset.color;

            }
        );

    });


/* =========================
   MAIN BUTTONS
========================= */

document
    .getElementById("startBtn")
    .onclick =
    startGame;


document
    .getElementById("playAgainBtn")
    .onclick =
    startGame;


document
    .getElementById("homeBtn")
    .onclick =
    () => {

        document
            .getElementById(
                "deathAudio"
            )
            .pause();


        show(
            "setupScreen"
        );

    };


document
    .getElementById("quitBtn")
    .onclick =
    () => {

        running = false;


        document
            .getElementById(
                "deathAudio"
            )
            .pause();


        show(
            "setupScreen"
        );

    };


document
    .getElementById("pauseBtn")
    .onclick =
    togglePause;


document
    .getElementById("resumeBtn")
    .onclick =
    togglePause;


document
    .getElementById(
        "leaderboardBtn"
    )
    .onclick =
    openLeaderboard;


document
    .getElementById(
        "gameOverLeaderboardBtn"
    )
    .onclick =
    openLeaderboard;


document
    .getElementById(
        "closeLeaderboard"
    )
    .onclick =
    closeLeaderboard;


document
    .getElementById(
        "clearLeaderboard"
    )
    .onclick =
    () => {

        if (
            confirm(
                "Clear all leaderboard scores?"
            )
        ) {

            localStorage.removeItem(
                "snakeLeaderboard"
            );

            renderLeaderboard();

        }

    };


/* =========================
   BUTTON CONTROLS
========================= */

function bindButton(
    id,
    fn
) {

    document
        .getElementById(id)
        .addEventListener(
            "pointerdown",
            e => {

                e.preventDefault();

                fn();

            }
        );

}


bindButton(
    "upBtn",
    () =>
        setDirection(0, -1)
);

bindButton(
    "downBtn",
    () =>
        setDirection(0, 1)
);

bindButton(
    "leftBtn",
    () =>
        setDirection(-1, 0)
);

bindButton(
    "rightBtn",
    () =>
        setDirection(1, 0)
);


/* =========================
   KEYBOARD
========================= */

document.addEventListener(
    "keydown",
    e => {

        if (
            e.key === "ArrowUp" ||
            e.key.toLowerCase() === "w"
        ) {

            setDirection(0, -1);

        }


        if (
            e.key === "ArrowDown" ||
            e.key.toLowerCase() === "s"
        ) {

            setDirection(0, 1);

        }


        if (
            e.key === "ArrowLeft" ||
            e.key.toLowerCase() === "a"
        ) {

            setDirection(-1, 0);

        }


        if (
            e.key === "ArrowRight" ||
            e.key.toLowerCase() === "d"
        ) {

            setDirection(1, 0);

        }


        if (
            e.key === " " &&
            running
        ) {

            togglePause();

        }

    }
);


/* =========================
   SWIPE CONTROL
========================= */

canvas.addEventListener(
    "touchstart",
    e => {

        const touch =
            e.changedTouches[0];


        touchStartX =
            touch.clientX;


        touchStartY =
            touch.clientY;

    },
    {
        passive: true
    }
);


canvas.addEventListener(
    "touchend",
    e => {

        const touch =
            e.changedTouches[0];


        const dx =
            touch.clientX -
            touchStartX;


        const dy =
            touch.clientY -
            touchStartY;


        /*
           Ignore very small movements.
        */

        if (
            Math.max(
                Math.abs(dx),
                Math.abs(dy)
            ) < 25
        ) {

            return;

        }


        /*
           Horizontal swipe
        */

        if (
            Math.abs(dx) >
            Math.abs(dy)
        ) {

            setDirection(
                dx > 0
                    ? 1
                    : -1,
                0
            );

        }


        /*
           Vertical swipe
        */

        else {

            setDirection(
                0,
                dy > 0
                    ? 1
                    : -1
            );

        }

    },
    {
        passive: true
    }
);

const soundSelect = document.getElementById('sound-toggle');
const clickSound = document.getElementById('click');
const bomb = document.getElementById('bomb');
const win = document.getElementById("win");
const resetButton = document.querySelector(".reset");
const menuButton = document.getElementById("menu-btn");
const time = document.querySelector("#timer");

let seconds = 0;
let minutes = 0;
let timeInterval = 0;
let timerStart = false;
let gameOver = false;
let mines = [];
let board = [];
let revealedTiles = 0;

const levelMap = {
    easy: { boardSize: 8, mineCount: 20 },
    medium: { boardSize: 10, mineCount: 50 },
    hard: { boardSize: 12, mineCount: 80 },
};

function playSound(sound) {
    if (soundSelect.value === 'on') {
        sound.currentTime = 0; 
        sound.play(); 
    }
}

soundSelect.addEventListener("change", (event) => {
    if (event.target.value === "off") {
        clickSound.pause();
        bomb.pause();
        win.pause();
    }
});


// Starts the game timer
function startTimer() {
    timeInterval = setInterval(() => {
        seconds++;
        if (seconds >= 60) {
            seconds = 0;
            minutes++;
        }
        document.getElementById("timer").textContent = 
            `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }, 1000);
}


function resetTimer() {
    seconds = 0;
    minutes = 0;
    time.textContent = "00:00";
}


function initializeGame() {
    const level = document.getElementById("level").value;
    const gameBoard = document.getElementById("board");
    const flags = document.getElementById("count");
    
    gameBoard.innerHTML = ""; 
    mines = [];
    board = [];
    gameOver = false;
    
    boardSize = levelMap[level].boardSize;
    mineCount = levelMap[level].mineCount;
    flagCount = mineCount;
    revealedTiles = 0;
    
    flags.textContent = flagCount;

    // Places mines
    while (mines.length < mineCount) {
        let r = Math.floor(Math.random() * boardSize);
        let c = Math.floor(Math.random() * boardSize);
        let id = `${r}-${c}`;
        
        console.log(id);

        if (!mines.includes(id)) {
            mines.push(id);
        }
    }
}
 
function createBoard() {
    const gameBoard = document.getElementById("board");

    for (let i = 0; i < boardSize; i++) {
        const rowEl = document.createElement("div");
        rowEl.classList.add("minesweeper-row", "row");
        let row = [];

        for (let j = 0; j < boardSize; j++) {
            const tile = document.createElement("div");
            tile.id = `${i}-${j}`;
            tile.classList.add("tiles", "unrevealed");
            tile.addEventListener("contextmenu", putFlag);
            tile.addEventListener("click", revealTile);

            row.push(tile);
            rowEl.append(tile);
        }
        board.push(row);
        gameBoard.append(rowEl);
    }
}


function putFlag(event) {
    event.preventDefault();
    const tile = event.currentTarget;

    if (tile.classList.contains("revealed")) return;

    if (tile.classList.contains("flagged")) {
        tile.classList.remove("flagged");
        flagCount++;
    } 
    else if (flagCount > 0) {
        tile.classList.add("flagged");
        flagCount--;
    }

    document.getElementById("count").textContent = flagCount;
}

function revealTile(event) {
    const tile = event.currentTarget;
    if (tile.classList.contains("flagged") || tile.classList.contains("revealed")) return;

    playSound(clickSound);
    if (!timerStart) {
        startTimer();
        timerStart = true;
    }

    tile.classList.add("revealed");
    revealedTiles++;

    const val = tile.id.split("-");
    const row = parseInt(val[0]);
    const col = parseInt(val[1]);

    if (mines.includes(tile.id)) {
        tile.classList.add("mine");
        playSound(bomb);
        resetButton.innerHTML = `<img src="./assets/sad.svg">`;
        endGame(false); 
        return;
    }

    const mineCount = countAdjacentMines(row, col);
    if (mineCount > 0) {
        tile.textContent = mineCount;
    } 
    else {
        revealAdjacentTiles(row, col);
    }

    checkForWin();
}


function countAdjacentMines(row, col) {
    let count = 0;
    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            const newRow = row + x;
            const newCol = col + y;
            if (newRow < 0 || newRow >= boardSize || newCol < 0 || newCol >= boardSize) {
                continue;
            }
                
            if(newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize && mines.includes(newRow + "-" + newCol)){
                count++;
            }
        }
    }
    return count;
}

// Reveals adjacent tiles recursively
function revealAdjacentTiles(row, col) {
    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            const newRow = row + x;
            const newCol = col + y;
            if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
                const adjacentTile = board[newRow][newCol];
                if (!adjacentTile.classList.contains("revealed")) {
                    adjacentTile.classList.add("revealed");
                    revealedTiles++;

                    const adjacentMineCount = countAdjacentMines(newRow, newCol);
                    adjacentTile.textContent = adjacentMineCount > 0 ? adjacentMineCount : "";
                    if (adjacentMineCount === 0) {
                        revealAdjacentTiles(newRow, newCol);
                    }
                }
            }
        }
    }
}


function endGame(winGame) {
    const board = document.getElementById('board');
    // console.log("show result !!! ");

    clearInterval(timeInterval);
    revealAllMines();

    setTimeout(()=> {
        if (winGame) {
            board.innerHTML = `<h1 class="winning-msg"> YOU WON ! <br><span class = "retry"> Play Again :D <span></h1>`;
            playSound(win);
        } 
        else {
            console.log("seddd you lost dammittt !");
            board.innerHTML = `
            <h1 class="losing-msg"> YOU LOST ! </br> <span class = "retry">Try Again :)<span></h1>
            `;
        }
    }, 1000);
    
}

function revealAllMines() {
    mines.forEach(id => {
        const val = id.split("-");
        const row = parseInt(val[0]);
        const col = parseInt(val[1]);
        board[row][col].classList.add("revealed", "mine");
    });
}

function checkForWin() {
    if (revealedTiles === boardSize * boardSize - mineCount) {
        endGame(true);

    }
}

resetButton.addEventListener("click", () => {
    resetButton.innerHTML = `<img src = "./assets/smiley.svg">`;
    render();
});

menuButton.addEventListener("click", () => {
    document.querySelector(".menu-container").classList.remove("hide");
    document.querySelector("#board").classList.add("hide");
    document.querySelector("#minesweeper-head").classList.add("hide");
});
document.querySelector(".start-btn").addEventListener("click", () => {
    document.querySelector(".menu-container").classList.add("hide");
    document.querySelector("#board").classList.remove("hide");
    document.querySelector("#minesweeper-head").classList.remove("hide");
    render();
});

// start game and render
function render() {
    clearInterval(timeInterval);
    resetTimer();
    initializeGame();
    createBoard();
    timerStart = false;
}

// Initial game render
render();




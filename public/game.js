//let PUZZLE_SIZE = 3; // set by sizeSelector
// const GAME_DURATION_SECONDS = 15; // set by function
const container = document.getElementById('puzzle-container');
const sizeSelector = document.getElementById('puzzle-size');
const GAP_SIZE_PX = 5; // Define the gap size in JS as well for calculations

game_level = parseInt(sizeSelector.value); // set puzzle size as game_level
GAME_DURATION_SECONDS = setGameTime(game_level);

// Stats Variables
let board = [];
let emptySpace = { row: 3, col: 3 };
let currentTileSize = 0;
let currentContainerWidth = 0;
let moves = 0;
let secondsRemaining = GAME_DURATION_SECONDS;
let timerInterval = null;
let gameActive = false; 

const dbUserId = document.getElementById('user-info').dataset.userId;
const movesDisplay = document.getElementById('moves-display');
const timerDisplay = document.getElementById('timer-display');

//console.log('Session ID:', dbUserId);  

// --- Timer Functions ---
function setGameTime(game_level) {
    switch (game_level) {
        case 3:
            return 60;
        case 4:
            return 120;
        case 6:
            return 180;
        case 8:
            return 240;
        case 10:
            return 300;
    default:
        return 300;
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(secondsRemaining / 60);
    const remainingSeconds = secondsRemaining % 60;
    const formattedTime = `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    timerDisplay.textContent = `Time: ${formattedTime}`;
}

function startTimer() {
    // game_level = parseInt(sizeSelector.value); // set puzzle size as game_level
    // GAME_DURATION_SECONDS=setGameTime(game_level);
    secondsRemaining = GAME_DURATION_SECONDS;
    updateTimerDisplay();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        secondsRemaining--;
        updateTimerDisplay();
        if (secondsRemaining <= 0) {
            clearInterval(timerInterval);
            gameOver(false); 
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
}

function gameOver(won) {
    gameActive = false;
    stopTimer();
    duration = GAME_DURATION_SECONDS - secondsRemaining;
    if (won) {
        // update database
        game_level = parseInt(sizeSelector.value); // set puzzle size as game_level
        sendGameStats(moves, duration, dbUserId, 1, game_level);
        alert(`You Won in ${moves} moves and ${duration} seconds! Starting a new game...`);
        newGame();

    } else {
        // update database
        game_level = parseInt(sizeSelector.value); // set puzzle size as game_level
        sendGameStats(moves, duration, dbUserId, 2, game_level);
        alert("Game Over! Time has run out. Click 'New Game' or 'Reset to Solved'.");
    }
}

async function sendGameStats(finalMoves, finalDuration, userid, game_status, game_level) {
    const dataToSend = {
            moves: finalMoves,
            durationSeconds: finalDuration,
            userid: userid,
            game_status: game_status,
            game_level: game_level
        };

    try {
        const response = await fetch('updateGameHistory.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        });
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }   

        const result = await response.text();
        console.log('Response from PHP:', result); 

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// --- Puzzle Functions ---

// Function to set CSS variables for dynamic sizing
function setCSSVariables(size) {
    let tileSize = 100; 
    if (size >= 8) tileSize = 70;
    if (size >= 10) tileSize = 60; 

    // Calculate total container width precisely
    const totalWidth = (tileSize * size) + (GAP_SIZE_PX * (size - 1)) + (5 * 2); // Tiles + Gaps + Padding (5px on left/right)

    // Store these in global variables
    currentTileSize = tileSize;
    currentContainerWidth = totalWidth;

    document.documentElement.style.setProperty('--puzzle-size', size);
    document.documentElement.style.setProperty('--tile-size', `${tileSize}px`);
    document.documentElement.style.setProperty('--gap-size', `${GAP_SIZE_PX}px`);
    document.documentElement.style.setProperty('--container-width', `${totalWidth}px`);
}

// Function to initialize (create a solved board) and then shuffle
function initializeBoard() {
    PUZZLE_SIZE = parseInt(sizeSelector.value);
    setCSSVariables(PUZZLE_SIZE);

    createSolvedBoard(); 
    shuffleBoard();      
    drawBoard();
    
    moves = 0; 
    movesDisplay.textContent = `Moves: ${moves}`;
    startTimer(); 
    gameActive = true;
}

// Helper function to set the board to the solved state
function createSolvedBoard() {
    board = [];
    for (let i = 0; i < PUZZLE_SIZE; i++) {
        board[i] = [];
        for (let j = 0; j < PUZZLE_SIZE; j++) {
            const value = i * PUZZLE_SIZE + j + 1;
            board[i][j] = (value <= PUZZLE_SIZE * PUZZLE_SIZE - 1) ? value : 0;
        }
    }
    emptySpace = { row: PUZZLE_SIZE - 1, col: PUZZLE_SIZE - 1 }; 
}

// Function to shuffle the board into a solvable state
function shuffleBoard() {
    let movesToShuffle = 100 * PUZZLE_SIZE; 
    for (let i = 0; i < movesToShuffle; i++) {
        const possibleMoves = getPossibleMoves(emptySpace.row, emptySpace.col);
        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        swapTiles(randomMove.newRow, randomMove.newCol, emptySpace.row, emptySpace.col);
        emptySpace.row = randomMove.newRow;
        emptySpace.col = randomMove.newCol;
    }
}

// Helper function to get valid adjacent moves for the empty space
function getPossibleMoves(row, col) {
    const moves = [];
    if (row > 0) moves.push({ newRow: row - 1, newCol: col });
    if (row < PUZZLE_SIZE - 1) moves.push({ newRow: row + 1, newCol: col });
    if (col > 0) moves.push({ newCol: col - 1, newRow: row });
    if (col < PUZZLE_SIZE - 1) moves.push({ newCol: col + 1, newRow: row });
    return moves;
}

// Helper function to swap values in the 2D array
function swapTiles(r1, c1, r2, c2) {
    const temp = board[r1][c1];
    board[r1][c1] = board[r2][c2];
    board[r2][c2] = temp;
}

// Function to draw the board in the DOM
function drawBoard() {
    container.innerHTML = '';
    for (let i = 0; i < PUZZLE_SIZE; i++) {
        for (let j = 0; j < PUZZLE_SIZE; j++) {
            const tileValue = board[i][j];
            const tile = document.createElement('div');
            tile.classList.add('puzzle-tile');
            
            // Calculate correct background position for the image slice
            // The position is calculated based on where the *solved* tile should be.
            // Solved row 'sr' and solved column 'sc' are derived from the tileValue.
            if (tileValue !== 0) {
                const solvedRow = Math.floor((tileValue - 1) / PUZZLE_SIZE);
                const solvedCol = (tileValue - 1) % PUZZLE_SIZE;
                
                // Calculate pixel offset (remember gaps are handled by the grid layout, we just need the tile offsets)
                const posX = -(solvedCol * currentTileSize + solvedCol * GAP_SIZE_PX);
                const posY = -(solvedRow * currentTileSize + solvedRow * GAP_SIZE_PX);

                tile.style.backgroundPosition = `${posX}px ${posY}px`;

                tile.textContent = tileValue; // Keep numbers if you want them over the image
                tile.dataset.row = i;
                tile.dataset.col = j;
                tile.addEventListener('click', () => moveTile(tile));
            } else {
                tile.classList.add('empty');
            }
            container.appendChild(tile);
        }
    }
}

// Function to handle tile clicks and movement
function moveTile(clickedTile) {
    if (!gameActive) return;

    const clickedRow = parseInt(clickedTile.dataset.row);
    const clickedCol = parseInt(clickedTile.dataset.col);

    // Check if the clicked tile is adjacent to the empty space
    const isAdjacent = (Math.abs(clickedRow - emptySpace.row) === 1 && clickedCol === emptySpace.col) ||
                       (Math.abs(clickedCol - emptySpace.col) === 1 && clickedRow === emptySpace.row);

    if (isAdjacent) {
        swapTiles(clickedRow, clickedCol, emptySpace.row, emptySpace.col);
        
        // Update empty space position
        emptySpace.row = clickedRow;
        emptySpace.col = clickedCol;

        moves++;
        movesDisplay.textContent = `Moves: ${moves}`;
        
        drawBoard(); // Redraw board to reflect changes
        
        if (isSolved()) {
            gameOver(true);
        }
    }
}

// Function to check if the puzzle is solved
function isSolved() {
    let expectedValue = 1;
    for (let i = 0; i < PUZZLE_SIZE; i++) {
        for (let j = 0; j < PUZZLE_SIZE; j++) {
            if (i === PUZZLE_SIZE - 1 && j === PUZZLE_SIZE - 1) {
                // The last tile should be 0 (empty)
                if (board[i][j] !== 0) return false;
            } else {
                if (board[i][j] !== expectedValue) return false;
                expectedValue++;
            }
        }
    }
    return true; // puzzle solved
}

// Theme management
const themes = ['default-theme', 'christmas-theme', 'elf-theme', 'reindeer-theme'];
let currentThemeIndex = 0;
let areNumbersHidden = false;

function toggleTheme() {
    // Cycle through themes: 0 -> 1 -> 2 -> 0 ...
    currentThemeIndex = (currentThemeIndex + 1) % themes.length;
    const newTheme = themes[currentThemeIndex];

    // Remove old themes
    document.body.classList.remove(...themes);

    // Apply the new theme if it's not the 'default-theme' (which relies on :root defaults)
    if (newTheme !== 'default-theme') {
        document.body.classList.add(newTheme);
    }
}

function toggleNumbers() {
    areNumbersHidden = !areNumbersHidden;
    const button = event.target; // Get the button that was clicked
    
    if (areNumbersHidden) {
        document.body.classList.add('hide-numbers');
        button.textContent = "Show Numbers";
    } else {
        document.body.classList.remove('hide-numbers');
        button.textContent = "Hide Numbers";
    }
    // No need to call drawBoard() here because CSS handles the visibility change
}

// --- Global Functions attached to buttons/events in HTML ---

function newGame() {
    stopTimer();
    initializeBoard();
}

function resetGame() {
    stopTimer();
    PUZZLE_SIZE = parseInt(sizeSelector.value); // Ensure size is current
    setCSSVariables(PUZZLE_SIZE);
    createSolvedBoard(); // Sets up a solved board and updates emptySpace location
    drawBoard(); // Draws the solved board
    moves = 0;
    movesDisplay.textContent = `Moves: ${moves}`;
    // gameActive = false; // Game is not active until shuffled/started
    //timerDisplay.textContent = "Time: 4:00"; // Reset display
    startTimer();
}

function playAudio() {
    const audio = document.getElementById('soundEffect');
    // Stop the sound if it's already playing and rewind it to the start
    if (audio.paused === false) {
        audio.pause();
        audio.currentTime = 0;
    }
    audio.play()
         .catch(error => {
             // Handle case where user hasn't interacted with the page yet (autoplay policies)
             console.warn("Audio play failed, likely due to browser autoplay policies:", error);
             // You could optionally alert the user or change the button text to prompt interaction
         });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', (event) => {
    // Select 4x4 by default as per HTML, then call initialize
    sizeSelector.value = '4'; 
    initializeBoard();
});
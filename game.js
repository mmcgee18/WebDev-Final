let PUZZLE_SIZE = 4; // Default size
const GAME_DURATION_SECONDS = 240;
const BLITZ_DURATION_SECONDS = 60; // Blitz mode: 1 minute
const container = document.getElementById('puzzle-container');
const sizeSelector = document.getElementById('puzzle-size');
const GAP_SIZE_PX = 5; // Define the gap size in JS as well for calculations

// Game Mode Variables
let gameMode = 'single'; // 'single', 'versus', or 'blitz'
let currentPlayer = 1; // For versus mode: 1 or 2
let player1Time = null;
let player1Moves = null;
let player2Time = null;
let player2Moves = null;

// Stats Variables
let board = [];
let emptySpace = { row: 3, col: 3 };
let currentTileSize = 0;
let currentContainerWidth = 0;
let moves = 0;
let secondsRemaining = GAME_DURATION_SECONDS;
let timerInterval = null;
let gameActive = false;

// Heat System Variables
let heatStreak = 0; // Counts correct moves
let heatTimestamps = []; // Stores timestamps of correct moves
const HEAT_THRESHOLD = 3; // Need 3 correct moves
const HEAT_TIME_WINDOW = 20; // Within 20 seconds
const HEAT_TIME_BONUS = 3; // Award 3 seconds
let heatDecayInterval = null;

const movesDisplay = document.getElementById('moves-display');
const timerDisplay = document.getElementById('timer-display');
const playerDisplay = document.getElementById('player-display');
let heatBar = null;
let heatCount = null;

// --- Timer Functions ---

function updateTimerDisplay() {
    const minutes = Math.floor(secondsRemaining / 60);
    const remainingSeconds = secondsRemaining % 60;
    const formattedTime = `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    timerDisplay.textContent = `Time: ${formattedTime}`;
}

function startTimer() {
    // Set timer based on game mode
    secondsRemaining = gameMode === 'blitz' ? BLITZ_DURATION_SECONDS : GAME_DURATION_SECONDS;
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
    stopHeatDecay();
}

function gameOver(won) {
    gameActive = false;
    stopTimer();

    if (gameMode === 'blitz') {
        if (won) {
            const timeTaken = BLITZ_DURATION_SECONDS - secondsRemaining;
            alert(`🔥 BLITZ WIN! 🔥\n\nCompleted in ${timeTaken} seconds with ${moves} moves!\n\nStarting a new blitz round...`);
            newGame();
        } else {
            alert(`⚡ Time's Up! ⚡\n\nYou ran out of time in Blitz Mode!\nMoves made: ${moves}\n\nTry again!`);
            newGame();
        }
    } else if (gameMode === 'versus') {
        if (won) {
            const timeTaken = GAME_DURATION_SECONDS - secondsRemaining;

            if (currentPlayer === 1) {
                // Player 1 finished
                player1Time = timeTaken;
                player1Moves = moves;
                updateVersusResults();
                alert(`Player 1 completed in ${timeTaken} seconds with ${moves} moves!\n\nNow it's Player 2's turn!`);

                // Start Player 2's turn
                currentPlayer = 2;
                playerDisplay.textContent = 'Current: Player 2';
                initializeBoard();
            } else {
                // Player 2 finished
                player2Time = timeTaken;
                player2Moves = moves;
                updateVersusResults();
                determineWinner();
            }
        } else {
            alert(`Time's up for Player ${currentPlayer}! Click 'New Game' to restart.`);
        }
    } else {
        // Single player mode
        if (won) {
            alert(`You Won in ${moves} moves and ${GAME_DURATION_SECONDS - secondsRemaining} seconds! Starting a new game...`);
            newGame();
        } else {
            alert("Game Over! Time has run out. Click 'New Game' or 'Reset to Solved'.");
        }
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
    resetHeatSystem();
    startTimer();
    startHeatDecay();
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
        // Store the old empty space position (where the tile will move to)
        const newTileRow = emptySpace.row;
        const newTileCol = emptySpace.col;

        swapTiles(clickedRow, clickedCol, emptySpace.row, emptySpace.col);

        // Update empty space position
        emptySpace.row = clickedRow;
        emptySpace.col = clickedCol;

        moves++;
        movesDisplay.textContent = `Moves: ${moves}`;

        // Check if the moved tile is now in its correct position
        // The tile is now at the position where the empty space was
        checkHeatSystem(newTileRow, newTileCol);

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
    return true;
}

// --- Heat System Functions ---

function checkHeatSystem(row, col) {
    if (!gameActive) return;

    // Check if the tile at (row, col) is in its correct position
    const tileValue = board[row][col];
    if (tileValue === 0) return; // Skip empty tile

    const expectedValue = row * PUZZLE_SIZE + col + 1;

    console.log(`Checking position [${row},${col}]: tile=${tileValue}, expected=${expectedValue}`);

    if (tileValue === expectedValue) {
        // Correct placement!
        const now = Date.now();
        heatTimestamps.push(now);

        // Remove timestamps older than the time window
        heatTimestamps = heatTimestamps.filter(timestamp =>
            now - timestamp <= HEAT_TIME_WINDOW * 1000
        );

        heatStreak = heatTimestamps.length;
        console.log(`Heat streak: ${heatStreak}/${HEAT_THRESHOLD}`);
        updateHeatDisplay();

        // Check if heat threshold is reached
        if (heatStreak >= HEAT_THRESHOLD) {
            activateHeatBonus();
        }
    }
}

function updateHeatDisplay() {
    if (!heatBar || !heatCount) {
        console.error('Heat bar elements not found!');
        return;
    }

    const now = Date.now();
    let totalHeatValue = 0;

    // Calculate partial heat value based on time remaining for each timestamp
    heatTimestamps.forEach(timestamp => {
        const age = (now - timestamp) / 1000; // age in seconds
        const timeRemaining = HEAT_TIME_WINDOW - age;
        const heatValue = Math.max(0, timeRemaining / HEAT_TIME_WINDOW); // 1.0 when fresh, 0.0 when expired
        totalHeatValue += heatValue;
    });

    const percentage = Math.min(100, (totalHeatValue / HEAT_THRESHOLD) * 100);
    heatBar.style.width = `${percentage}%`;
    heatCount.textContent = `${heatStreak}/${HEAT_THRESHOLD}`;

    // Update color based on heat level
    if (totalHeatValue >= HEAT_THRESHOLD) {
        heatBar.style.backgroundColor = '#ff4444';
    } else if (totalHeatValue >= 2) {
        heatBar.style.backgroundColor = '#ff8800';
    } else if (totalHeatValue >= 1) {
        heatBar.style.backgroundColor = '#ffaa00';
    } else {
        heatBar.style.backgroundColor = '#4CAF50';
    }
}

function activateHeatBonus() {
    // Award time bonus
    secondsRemaining += HEAT_TIME_BONUS;
    updateTimerDisplay();

    // Reset heat streak
    heatStreak = 0;
    heatTimestamps = [];
    updateHeatDisplay();

    // Visual feedback
    showHeatBonusNotification();
}

function showHeatBonusNotification() {
    const notification = document.createElement('div');
    notification.className = 'heat-bonus-notification';
    notification.textContent = `🔥 HEAT BONUS! +${HEAT_TIME_BONUS}s! 🔥`;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 2000);
}

function startHeatDecay() {
    if (heatDecayInterval) clearInterval(heatDecayInterval);

    heatDecayInterval = setInterval(() => {
        if (!gameActive) return;

        const now = Date.now();
        // Remove timestamps older than the time window
        heatTimestamps = heatTimestamps.filter(timestamp =>
            now - timestamp <= HEAT_TIME_WINDOW * 1000
        );

        heatStreak = heatTimestamps.length;
        updateHeatDisplay();
    }, 100); // Check every 100ms for smooth visual decay
}

function stopHeatDecay() {
    if (heatDecayInterval) clearInterval(heatDecayInterval);
}

function resetHeatSystem() {
    heatStreak = 0;
    heatTimestamps = [];
    updateHeatDisplay();
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

// --- Versus Mode Functions ---

function changeGameMode() {
    const modeSelector = document.getElementById('game-mode');
    gameMode = modeSelector.value;

    // Reset versus mode variables
    currentPlayer = 1;
    player1Time = null;
    player1Moves = null;
    player2Time = null;
    player2Moves = null;

    // Update UI
    const versusResults = document.getElementById('versus-results');
    if (gameMode === 'versus') {
        playerDisplay.textContent = 'Current: Player 1';
        versusResults.style.display = 'block';
        updateVersusResults();
        alert('🎮 Versus Mode Started! 🎮\n\nPlayer 1, it\'s your turn!\nSolve the puzzle as fast as you can!');
    } else if (gameMode === 'blitz') {
        playerDisplay.textContent = '⚡ Blitz Mode - 60 seconds!';
        versusResults.style.display = 'none';
    } else {
        playerDisplay.textContent = 'Single Player Mode';
        versusResults.style.display = 'none';
    }

    newGame();
}

function updateVersusResults() {
    const p1Result = document.getElementById('p1-result');
    const p2Result = document.getElementById('p2-result');

    if (player1Time !== null && player1Moves !== null) {
        p1Result.textContent = `Player 1: ${player1Time}s (${player1Moves} moves)`;
    } else {
        p1Result.textContent = 'Player 1: --';
    }

    if (player2Time !== null && player2Moves !== null) {
        p2Result.textContent = `Player 2: ${player2Time}s (${player2Moves} moves)`;
    } else {
        p2Result.textContent = 'Player 2: --';
    }
}

function determineWinner() {
    const winnerDisplay = document.getElementById('winner-display');

    if (player1Time === null || player2Time === null) {
        winnerDisplay.textContent = '';
        return;
    }

    let winner = '';
    if (player1Time < player2Time) {
        winner = `🏆 Player 1 Wins! (${player1Time}s vs ${player2Time}s)`;
    } else if (player2Time < player1Time) {
        winner = `🏆 Player 2 Wins! (${player2Time}s vs ${player1Time}s)`;
    } else {
        // Times are equal, check moves
        if (player1Moves < player2Moves) {
            winner = `🏆 Player 1 Wins! (Same time but fewer moves: ${player1Moves} vs ${player2Moves})`;
        } else if (player2Moves < player1Moves) {
            winner = `🏆 Player 2 Wins! (Same time but fewer moves: ${player2Moves} vs ${player1Moves})`;
        } else {
            winner = `🤝 It's a Tie! Both players: ${player1Time}s and ${player1Moves} moves`;
        }
    }

    winnerDisplay.innerHTML = `<strong>${winner}</strong>`;
    alert(winner);
}

// --- Global Functions attached to buttons/events in HTML ---

function newGame() {
    stopTimer();

    if (gameMode === 'versus') {
        // Reset to Player 1 in versus mode
        currentPlayer = 1;
        player1Time = null;
        player1Moves = null;
        player2Time = null;
        player2Moves = null;
        playerDisplay.textContent = 'Current: Player 1';
        updateVersusResults();
        document.getElementById('winner-display').textContent = '';
        alert('🎮 New Versus Game! 🎮\n\nPlayer 1, get ready to start!');
    } else if (gameMode === 'blitz') {
        playerDisplay.textContent = '⚡ Blitz Mode - 60 seconds!';
    } else {
        playerDisplay.textContent = 'Single Player Mode';
    }

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
    // Initialize heat bar elements
    heatBar = document.getElementById('heat-bar');
    heatCount = document.getElementById('heat-count');

    // Select 4x4 by default as per HTML, then call initialize
    sizeSelector.value = '4';
    initializeBoard();
});
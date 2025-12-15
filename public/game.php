<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header('Location: index.php');
    exit();
}
require_once '../includes/database_functions.php';
$userId = $_SESSION['user_id'];
// $userId = 42;
?>

<!DOCTYPE html>
<html lang="en">    
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>N-Puzzle Game</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <audio id="soundEffect" src="the-long-roar-of-a-wild-deer.mp3" preload="auto"></audio>
    <h1>The N-Puzzle Game</h1>

    <div class="controls-container">
        <label for="puzzle-size">Select Size:</label>
        <select id="puzzle-size" onchange="newGame()">
            <option value="3">3x3</option>
            <option value="4" selected>4x4</option>     
            <option value="6">6x6</option>
            <option value="8">8x8</option>
            <option value="10">10x10</option>
        </select>
        <!-- Theme Toggle Button  -->
        <button onclick="toggleTheme()">Toggle Theme</button>
        <button onclick="toggleNumbers()">Hide Numbers</button>
        <button onclick="playAudio()">Reindeer Call</button>

    </div>

    <div class="stats-container">
        <div id="timer-display">Time: 4:00</div>
        <div id="moves-display">Moves: 0</div>
        <div id="user-info" data-user-id="<?= htmlspecialchars($userId); ?>"></div>             
    </div>  

    <div id="puzzle-container">
        <!-- Puzzle tiles will be generated here by JavaScript -->
    </div>
    
    <div class="button-container">
        <button onclick="newGame()">New Game</button>
        <button onclick="resetGame()">Reset to Solved</button>
        <button onclick="document.location='homepage.php'">Exit Game</button>
    </div>

    <script type="text/javascript" src="game.js"></script>

</body>
</html>
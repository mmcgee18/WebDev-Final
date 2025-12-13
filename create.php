<?php
// a script to generate the initial database and tables (schematic)

$host = "localhost";
$user = "mmcgee18";
$pass = "mmcgee18";
$dbname = "mmcgee18";

// Create connection
$conn = new mysqli($host, $user, $pass, $dbname);

// Check connection
if ($conn->connect_error) {
    echo "Could not connect to server\n";
    die("Connection failed: " . $conn->connect_error);
}

// Create table PLAYERS
$sql = "CREATE TABLE IF NOT EXISTS PLAYERS (
    player_id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user VARCHAR(50) NOT NULL,
    pwd VARCHAR(50) NOT NULL,
    total_moves INT(9) DEFAULT 0,
    total_seconds INT(9) DEFAULT 0,
    constraint u_user UNIQUE (user)
)";

if ($conn->query($sql) === TRUE) {
    echo "Table PLAYER created successfully\n";
} else {
    echo "Error creating table: " . $conn->error . "\n";
}

// Insert records (Create)
$sql1 = "INSERT INTO PLAYERS (user, pwd) VALUES ('test1', 'test1')";

if ($conn->query($sql1) === TRUE) {
    echo "New records created successfully\n";
} else {
    echo "Error: " . $conn->error . "\n";
}

// Create table GAME_HISTORY
$sql = "CREATE TABLE IF NOT EXISTS GAME_HISTORY (
    game_id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    player_id INT(6),
    session_id INT(9),
    game_moves INT(9) DEFAULT 0,
    game_time_seconds INT(9) DEFAULT 0
)";

if ($conn->query($sql) === TRUE) {
    echo "Table GAME created successfully\n";
} else {
    echo "Error creating table: " . $conn->error . "\n";
}

// Close connection
$conn->close();
?>
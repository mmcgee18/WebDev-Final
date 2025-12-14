<?php
require_once '../config/database.php';
function create_tables() {
    $mysqli = get_db_connection();
    // Create users table (for login functionality)
    $users_table = "CREATE TABLE IF NOT EXISTS users (
        userid INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(60) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        firstname VARCHAR(60),
        lastname VARCHAR(60),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";

    // Create game_history table
    // game_status: 0 = running, 1 = success, 2 = failure, 9 = abort
    // game_level: 1 = 3x3, 2 = 4x4, 3 = 6x6, 4 = 8x8, 5 = 10x10
    $game_history_table = "CREATE TABLE IF NOT EXISTS game_history (
        gameid INT AUTO_INCREMENT PRIMARY KEY,
        userid INT,
        moves INT DEFAULT 0,
        time_seconds INT DEFAULT 0,
        game_status INT DEFAULT 0,  
        game_level INT DEFAULT 2,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userid) REFERENCES users(userid) ON DELETE SET NULL
    )";

    // Create stats table
    // Achievement Status Tracking TO BE ADDED TO THIS TABLE
    $stats_table = "CREATE TABLE IF NOT EXISTS stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userid INT,
        total_moves INT,
        total_time_seconds INT,
        total_games INT,
        total_wins INT,
        game_level INT,
        fewest_moves INT DEFAULT 0,
        shortest_time_seconds INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userid) REFERENCES users(userid) ON DELETE SET NULL
    )";

    // Execute table creation
    $tables = [$users_table, $game_history_table, $stats_table];
    $table_names = ['users', 'game_history', 'stats'];
    
    echo "<h2>Creating Database Tables...</h2>";
    
    for ($i = 0; $i < count($tables); $i++) {
        if ($mysqli->query($tables[$i])) {
            echo "<p>Table '{$table_names[$i]}' created successfully</p>";
        } else {
            echo "<p>Error creating table '{$table_names[$i]}': " . $mysqli->error . "</p>";
        }
    }

    // Insert sample data for testing
    insert_sample_data($mysqli);
    $mysqli->close();
    }

    function insert_sample_data($mysqli) {
        // Sample users
        $users = [
            [1, 'user', 'exampl3', 'example', 'user']
        ];
        
        // Sample game_history
        $game_history = [
            [1, 1, 167, 182, 1, 2]
        ];

        // Sample stats
        $stats = [
            [1, 1, 167, 182, 1, 1, 2]
        ];
        
        // Insert users
        foreach ($users as $user) {
            $stmt = $mysqli->prepare("INSERT IGNORE INTO users (userid, username, password, firstname, lastname) VALUES (?, ?, ?, ?, ?)");
            $stmt->bind_param("issss", $user[0], $user[1], $user[2], $user[3], $user[4]);
            $stmt->execute();
        }
        
        // Insert game_history
        foreach ($game_history as $game) {
            $stmt = $mysqli->prepare("INSERT IGNORE INTO game_history (gameid, userid, moves, time_seconds, game_status, game_level) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("iiiiii", $game[0], $game[1], $game[2], $game[3], $game[4], $game[5]);
            $stmt->execute();
        }

        // Insert stats
        foreach ($stats as $stat) {
            $stmt = $mysqli->prepare("INSERT IGNORE INTO stats (id, userid, total_moves, total_time_seconds, total_games, total_wins, game_level) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("iiiiiii", $stat[0], $stat[1], $stat[2], $stat[3], $stat[4], $stat[5], $stat[6]);
            $stmt->execute();
        }

        echo "<p>Sample data inserted successfully</p>";
    }

    // Run table creation if accessed directly
    if (basename($_SERVER['PHP_SELF']) == 'create_tables.php') {
    create_tables();
}
?>
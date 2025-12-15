<?php
// Get the JSON data sent from the JavaScript fetch() request
$json_data = file_get_contents("php://input");
$data = json_decode($json_data, true);

$moves = $data["moves"];
$duration = $data["durationSeconds"];
$userid = $data["userid"];
$game_status = $data["game_status"];
$game_level = $data["game_level"];

// Database configuration (replace with your actual credentials)
$servername = "localhost";
$username = "mmcgee18";
$password = "mmcgee18";
$dbname = "mmcgee18";

// Connect to MySQL
    $conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    die(json_encode(["message" => "Connection failed: " . $conn->connect_error]));
}
$response = ['message' => 'Connected to database!'];
header('Content-Type: application/json');
echo json_encode($response);

// Prepare and bind SQL statement for GAME_HISTORY
$stmt = $conn->prepare("INSERT INTO game_history (moves, time_seconds, userid, game_status, game_level) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("iiiii", $moves, $duration, $userid, $game_status, $game_level); 

    if ($stmt->execute()) {
        echo json_encode(["message" => "New GAME_HISTORY record created successfully!"]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Error: " . $stmt->error]);
    }

$stmt->close();

// Get STATS for userid and game_level
$sql = "SELECT id, userid, total_moves, total_time_seconds, total_games, total_wins, game_level, fewest_moves, shortest_time_seconds FROM stats WHERE userid = $userid AND game_level = $game_level";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    // stats for this userid and game_level exists
    while ($row = $result->fetch_assoc()) {
        //track the primary key
        $id = $row["id"];
        //update total moves
        $total_moves = $row["total_moves"] + $moves;
        //update total time seconds
        $total_time_seconds = $row["total_time_seconds"] + $duration;
        //increment total games
        $total_games = $row["total_games"] + 1;
        //update total wins if this was a win
        echo json_encode(["message" => "Before win check!"]);
        if ($game_status == 1) {
            echo json_encode(["message" => "This is a win!"]);
            $total_wins = $row["total_wins"] + 1;
            //new fewest moves record?
            if ($row["fewest_moves"] > $moves) {
                $fewest_moves = $moves;
            } else {
                $fewest_moves = $row["fewest_moves"];
            }
            //new shortest time record?
            if ($row["shortest_time_seconds"] > $duration) {
                $shortest_time_seconds = $duration;
            } else {
                $shortest_time_seconds = $row["shortest_time_seconds"];
            }
        } else {
            $total_wins = $row["total_wins"];
            $fewest_moves = $row["fewest_moves"];
            $shortest_time_seconds = $row["shortest_time_seconds"];
        }
        
        // SQL to update a record
        $sql = "UPDATE stats SET total_moves = $total_moves, total_time_seconds = $total_time_seconds, total_games = $total_games, total_wins = $total_wins, fewest_moves = $fewest_moves, shortest_time_seconds = $shortest_time_seconds WHERE id = $id";

        // Execute query to update record
        if ($conn->query($sql) === TRUE) {
            echo "Stats record updated successfully\n";
        } else {
            echo "Error updating record: " . $conn->error . "\n";
        }
    }
} else {
    // Create a new STATS record
    $total_games = 1;
    $total_wins = 0;
    $shortest_time = 999999999;
    $fewest_moves = 999999999;
    if ($game_status == 1) {
        $total_wins = 1;
        $shortest_time = $duration;
        $fewest_moves = $moves;
    }
    $stmt = $conn->prepare("INSERT INTO stats (userid, total_moves, total_time_seconds, total_games, total_wins, game_level, fewest_moves, shortest_time_seconds) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("iiiiiiii", $userid, $moves, $duration, $total_games, $total_wins, $game_level, $fewest_moves, $shortest_time); 

    if ($stmt->execute()) {
        echo json_encode(["message" => "New STATS record created successfully!"]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Error: " . $stmt->error]);
    }

    $stmt->close();
}

$conn->close();

$response = ['message' => 'Data received successfully!'];
header('Content-Type: application/json');
echo json_encode($response);
?>
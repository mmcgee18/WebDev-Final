<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    // Redirect to login page if not logged in
    header('Location: index.php');
    exit();
}
require_once '../includes/database_functions.php';

$userId = $_SESSION['user_id'];
$servername = "localhost";
$username = "mmcgee18";
$password = "mmcgee18";
$dbname = "mmcgee18";

// Connect to MySQL
$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Fetch game statistics using prepared statements
$stats = [];
$stmt_stats = $conn->prepare("
    SELECT 
        total_moves, 
        total_time_seconds, 
        total_games, 
        total_wins, 
        game_level, 
        fewest_moves, 
        shortest_time_seconds 
    FROM stats 
    WHERE userid = ?
");
$stmt_stats->bind_param("i", $userId);
$stmt_stats->execute();
$result = $stmt_stats->get_result();

while ($row = $result->fetch_assoc()) {
    $stats[] = $row;
}

$stmt_stats->close();
$conn->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Game Statistics</title>
    <style>
        /* Christmas Themed Styling */
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px;
            background-color: #f0f8ff; /* Light blue/snow background */
            color: #006400; /* Dark green for text */
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="www.w3.org" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="1" fill="%23ffffff"/></svg>'); /* Subtle snow effect */
        }
        h2 {
            color: #b22222; /* Firebrick red for headings */
            text-align: center;
            border-bottom: 2px solid #006400;
            padding-bottom: 10px;
        }
        table { 
            border-collapse: collapse; 
            width: 80%; 
            margin: 10px auto; /* Center the table */
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden; /* Ensures border radius applies to headers */
        }
        th, td { 
            border: 1px solid #c8e6c9; /* Lighter green border */
            padding: 12px; 
            text-align: left; 
        }
        th { 
            background-color: #006400; /* Dark green header background */
            color: white;
            font-weight: bold;
        }
        tbody tr:nth-child(even) { 
            background-color: #e8f5e9; /* Very light green for even rows */
        }
        tbody tr:nth-child(odd) {
            background-color: #ffffff; /* White for odd rows */
        }
        .message { 
            padding: 15px; 
            margin: 15px auto;
            border-radius: 8px; 
            width: 80%;
            box-sizing: border-box;
        }
        .success { 
            background-color: #d4edda; 
            color: #155724; 
            border: 1px solid #c3e6cb; 
        }
        .error { 
            background-color: #f8d7da; 
            color: #721c24; 
            border: 1px solid #f5c6cb; 
        }
        .home-button {
            display: block;
            width: 200px;
            margin: 20px auto 0 auto; /* Center the button */
            padding: 12px 15px;
            background-color: #b22222; /* Firebrick red */
            color: white;
            text-decoration: none;
            border-radius: 50px; /* Rounded pill shape */
            text-align: center;
            font-weight: bold;
            transition: background-color 0.3s ease;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .home-button:hover {
            background-color: #ff4500; /* OrangeRed on hover */
            transform: translateY(-2px); /* Slight lift effect */
        }
    </style>
</head>
<body>
    <h2>Statistics for <?= $_SESSION['username'] ?></h2>

    <?php
    // Display feedback messages if redirected from the update script
    if (isset($_GET['status'])) {
        if ($_GET['status'] == 'success') {
            echo '<div class="message success">GPA updated successfully!</div>';
        } elseif ($_GET['status'] == 'error') {
            echo '<div class="message error">' . htmlspecialchars($_GET['message'] ?? 'An error occurred.') . '</div>';
        }
    }
    ?>
    
    <table border="1">
        <thead>
            <tr>
                <th>Game Level</th>
                <th>Total Games</th>
                <th>Total Wins</th>
                <th>Total Time (s)</th>
                <th>Shortest Time (s)</th>
                <th>Total Moves</th>
                <th>Fewest Moves</th>
            </tr>
        </thead>
        <tbody>
            <?php if (empty($stats)): ?>
                <tr><td colspan="7">No statistics found for this user.</td></tr>
            <?php else: ?>
                <?php foreach ($stats as $row): ?>
                    <tr>
                        <td><?= htmlspecialchars($row['game_level']) ?></td>
                        <td><?= htmlspecialchars($row['total_games']) ?></td>
                        <td><?= htmlspecialchars($row['total_wins']) ?></td>
                        <td><?= htmlspecialchars($row['total_time_seconds']) ?></td>
                        <td><?= htmlspecialchars($row['shortest_time_seconds']) ?></td>
                        <td><?= htmlspecialchars($row['total_moves']) ?></td>
                        <td><?= htmlspecialchars($row['fewest_moves']) ?></td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
        </tbody>
    </table>
       
    <!-- The new button linking to the homepage (index.php) -->
    <a href="homepage.php" class="home-button">Back to Homepage</a>
 </body>
</html>
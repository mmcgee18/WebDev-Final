<?php
// Quick test to verify database connection
require_once '../config/database.php';
echo "<h1>Database Connection Test</h1>";
try {
$mysqli = get_db_connection();
echo "<p style='color: green;'>✓ Database connection successful!</p>";
// Test query
$result = $mysqli->query("SHOW TABLES");
echo "<h2>Existing Tables:</h2>";
echo "<ul>";
while ($row = $result->fetch_array()) {
echo "<li>" . $row[0] . "</li>";
}
echo "</ul>";
$mysqli->close();
} catch (Exception $e) {
echo "<p style='color: red;'> Database connection failed: " . $e->getMessage() . "</p>";
}
?>
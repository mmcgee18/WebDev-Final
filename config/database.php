<?php
// Database configuration
// Update with personal info to run on individual Codd
define('DB_HOST', 'localhost');
define('DB_USER', 'mmcgee18');
define('DB_PASS', 'mmcgee18');
define('DB_NAME', 'mmcgee18');
// Create connection
function get_db_connection() {
    $mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    // Check connection
    if ($mysqli->connect_error) {
        die("Connection failed: " . $mysqli->connect_error);
    }
    return $mysqli;
}
?>
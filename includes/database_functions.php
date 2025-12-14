<?php
require_once '../config/database.php';
if (!function_exists('get_db_connection')) {
function get_db_connection() {
    return get_db_connection(); // From database.php
}
}

function sanitize_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}
function validate_year($year) {
    return filter_var($year, FILTER_VALIDATE_INT, array('options' => array('min_range' => 1900, 'max_range' => date('Y'))));
}
function validate_age($age) {
    return filter_var($age, FILTER_VALIDATE_INT, array('options' => array('min_range' => 1, 'max_range' => 120)));
}
?>
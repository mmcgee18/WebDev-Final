<?php
require_once '../config/database.php';
function register_user($firstname, $lastname, $username, $password) {
    $mysqli = get_db_connection();
    
    // Check if username exists
    $check_stmt = $mysqli->prepare("SELECT userid FROM users WHERE username = ?");
    $check_stmt->bind_param("s", $username);
    $check_stmt->execute();
    $check_stmt->store_result();
    
    if ($check_stmt->num_rows > 0) {
        $check_stmt->close();
        $mysqli->close();
        return false; // Username exists
    }
    
    // Hash password for security
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert new user
    $stmt = $mysqli->prepare("INSERT INTO users (firstname, lastname, username, password) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $firstname, $lastname, $username, $hashed_password);
    
    $success = $stmt->execute();
    $stmt->close();
    $mysqli->close();
    
    return $success;
}

function login_user($username, $password) {
    $mysqli = get_db_connection();
    $stmt = $mysqli->prepare("SELECT userid, password FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($id, $hashed_password);
    
    if ($stmt->fetch() && password_verify($password, $hashed_password)) {
        // Start session and store user info
        session_start();
        $_SESSION['user_id'] = $id;
        $_SESSION['username'] = $username;
        
        $stmt->close();
        $mysqli->close();
        return true;
    }
    
    $stmt->close();
    $mysqli->close();
    return false;
}
    
function is_logged_in() {
    session_start();
    return isset($_SESSION['user_id']); 
}
    
function logout() {
    session_start();
    session_destroy();
}
?>
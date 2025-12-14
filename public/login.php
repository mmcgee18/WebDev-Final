<?php
require_once '../includes/auth_functions.php';
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];
    if (login_user($username, $password)) {
        header('Location: homepage.php');
    exit();
    } else {
        header('Location: index.php?error=1');
    exit();
    }
}
?>
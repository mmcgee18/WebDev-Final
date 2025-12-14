<?php
require_once '../includes/auth_functions.php';
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $firstname = $_POST['firstname'];
    $lastname = $_POST['lastname'];
    $username = $_POST['username'];
    $password = $_POST['password'];
    if (register_user($firstname, $lastname, $username, $password)) {
        header('Location: index.php?registered=1');
        exit();
    } else {
        header('Location: register.php?error=duplicate');
        exit();
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Register Account</title>
    <link href="css/style.css" rel="stylesheet">
</head>
    <body>
    <div class="register-container">
        <h1>Create New Account</h1>
        <form method="post" action="register.php">
            <div class="form-group">
                <label>First Name:</label>
                <input type="text" name="firstname" required>
            </div>

            <div class="form-group">
                <label>Last Name:</label>
                <input type="text" name="lastname" required>
            </div>

            <div class="form-group">
                <label>Username:</label>
                <input type="text" name="username" required>
            </div>
            <div class="form-group">
                <label>Password:</label>
                <input type="password" name="password" id="password" required>
            </div>

            <div class="form-group">
            <label>Confirm Password:</label>
                <input type="password" name="confirm_password" id="confirm_password" required>
            </div>
            
            <?php if (isset($_GET['error']) && $_GET['error'] == 'duplicate'): ?>
                <div class="error">
                Username already exists. Please choose another.
                </div>
            <?php endif; ?>
            <div class="form-actions">
                <button type="submit">Register</button>
                <a href="index.php" class="cancel-btn">Cancel</a>
            </div>
        </form>
    </div>

    <script>
    document.querySelector('form').addEventListener('submit', function(e) {
        const password = document.getElementById('password').value;
        const confirm = document.getElementById('confirm_password').value;
        if (password !== confirm) {
            e.preventDefault();
            alert('Passwords do not match!');
            return false;
        }
            if (password.length < 6) {
            e.preventDefault();
            alert('Password must be at least 6 characters long!');
            return false;
        }
        return true;
    });
    </script>
</body>
</html>
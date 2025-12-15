<?php
session_start();
if (isset($_SESSION['user_id'])) {
    header('Location: homepage.php');
    exit();
}
?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>N-Puzzle - Login</title>
    <link href="css/style.css" rel="stylesheet">
</head>
<body>
    <div class="login-container">
        <h1>N-Puzzle Game</h1>
        <h3>Login to play the game</h3>

        <form action="login.php" method="post">
            <div class="form-group">
                <label>Username:</label>
                <input type="text" name="username" required>
            </div>
            
            <div class="form-group">
                <label>Password:</label>
                <input type="password" name="password" required>
            </div>
            
            <button type="submit">Login</button>
        </form>
    
        <?php if (isset($_GET['error'])): ?>
            <div class="error">
                Invalid username or password. Please try again.
            </div>
        <?php endif; ?>
        <div class="register-link">
            <p>Don't have an account? <a href="register.php">Register here</a></p>
        </div>
        <div class="demo-info">
            <p><strong>Demo Credentials:</strong> test / test123</p>
        </div>
    </div>
</body>

</html>
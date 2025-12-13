<?php
// Check if the form was submitted using the POST method
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Retrieve and sanitize the form data
    $user = htmlspecialchars(trim($_POST['user']));
    $pwd = $_POST['pwd'];

    $errors = [];

    // Basic Validation
    if (empty($user)) {
        $errors[] = "Username is required.";
    }
    if (empty($pwd)) {
        $errors[] = "Password is required.";
    }

    // If no errors, process the data (e.g., save to a database)
    if (empty($errors)) {
        // In a real application, you would:
        // 1. Hash the password using password_hash()
        // $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        
        $host = "localhost";
        $dbuser = "mmcgee18";
        $dbpass = "mmcgee18";
        $dbname = "mmcgee18";

        // Create connection
        $conn = new mysqli($host, $dbuser, $dbpass, $dbname);

        // Check connection
        if ($conn->connect_error) {
            echo "Could not connect to server\n";
            die("Connection failed: " . $conn->connect_error);
        }

        // Insert records (Create)
        $sql = "SELECT pwd FROM PLAYERS WHERE user = '$user'";
        $result = $conn->query($sql);

        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                if ($pwd === $row["pwd"]) {
                    echo "Login Successful";
                    // Redirect to a login page or user dashboard
                    $redirect_url = "homepage.php?user=" . urlencode($user);
                    header('Location: ' . $redirect_url);
                } else {
                    echo "Invalid Password";
                }
            }
        } else {
            echo "User does not exist.\n";
        }

        $conn->close();

        // echo "<p style='color: green;'>Sign-up successful! Welcome, $user.</p>";
        // // Redirect to a login page or user dashboard
        // header('Location: login.php');
        // exit;

    } else {
        // Display errors if any exist
        echo "<div style='color: red;'>";
        echo "<ul>";
        foreach ($errors as $error) {
            echo "<li>$error</li>";
        }
        echo "</ul>";
        echo "</div>";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Page</title>
    <link rel="stylesheet" href="stylesLogin.css">
</head>
<body>
    <div class="login-container">
        <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="POST" class="login-form">
            <h2>Login</h2>
            <div class="input-group">
                <label for="user">Username:</label>
                <input type="text" id="user" name="user" required>
            </div>
            <div class="input-group">
                <label for="pwd">Password:</label>
                <input type="password" id="pwd" name="pwd" required>
            </div>
            <button type="submit">Log In</button>
            <div class="form-footer">
                <!-- <a href="/forgot-password">Forgot Password?</a> -->
                <span>Don't have an account? <a href="signup.php">Sign Up</a></span>
            </div>
        </form>
    </div>
</body>
</html>


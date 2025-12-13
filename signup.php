<?php
// Check if the form was submitted using the POST method
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Retrieve and sanitize the form data
    $user = htmlspecialchars(trim($_POST['user']));
    $pwd = $_POST['pwd'];
    $confirm_pwd = $_POST['confirm_pwd'];

    $errors = [];

    // Basic Validation
    if (empty($user)) {
        $errors[] = "Username is required.";
    }
    if (empty($pwd)) {
        $errors[] = "Password is required.";
    }
    if ($pwd !== $confirm_pwd) {
        $errors[] = "Passwords do not match.";
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
        $sql1 = "INSERT INTO PLAYERS (user, pwd) VALUES ('$user', '$pwd')";

        if ($conn->query($sql1) === TRUE) {
            echo "New records created successfully\n";
        } else {
            echo "Error: " . $conn->error . "\n";
        }
        $conn->close();

        // ADD SUCCESS POPUP
        echo "<p style='color: green;'>Sign-up successful! Welcome, $user.</p>";
        // Redirect to a login page or user dashboard
        header('Location: login.php');
        exit;

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
    <title>Sign Up Page</title>
    <link rel="stylesheet" href="stylesLogin.css">
</head>
<body>
    <h2>Create an Account</h2>
    
    <!-- The form sends data back to the same page (signup.php) using POST -->
    <form action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="POST">
        <div>
            <label for="user">Username:</label>
            <input type="text" id="user" name="user" required value="<?php echo $user ?? ''; ?>">
        </div>
        <br>
        <div>
            <label for="pwd">Password:</label>
            <input type="password" id="pwd" name="pwd" required>
        </div>
        <br>
        <div>
            <label for="confirm_pwd">Confirm Password:</label>
            <input type="password" id="confirm_pwd" name="confirm_pwd" required>
        </div>
        <br>
        <button type="submit">Sign Up</button>
    </form>
    <p>Already have an account? <a href="login.php">Log In</a></p>
</body>
</html>

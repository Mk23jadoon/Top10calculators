<?php
header('Content-Type: application/json');

// Database configuration
$host = 'localhost';
$dbname = 'u797284664_calculator';
$username = 'u797284664_calc';
$password = 'per5kilO.//99Akj'; // Replace with your actual password

// Response array
$response = array('success' => false, 'message' => '');

try {
    // Create PDO connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if form is submitted
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Get form data
        $userData = [
            'username' => trim($_POST['username']),
            'email' => trim($_POST['email']),
            'password' => $_POST['password'],
            'firstName' => trim($_POST['firstName']),
            'lastName' => trim($_POST['lastName']),
            'phoneNumber' => !empty($_POST['phoneNumber']) ? trim($_POST['phoneNumber']) : null,
            'dateOfBirth' => !empty($_POST['dateOfBirth']) ? $_POST['dateOfBirth'] : null,
            'gender' => !empty($_POST['gender']) ? $_POST['gender'] : null
        ];
        
        // Validate required fields
        if (empty($userData['username']) || empty($userData['email']) || empty($userData['password']) || 
            empty($userData['firstName']) || empty($userData['lastName'])) {
            throw new Exception('All required fields must be filled.');
        }
        
        // Validate email format
        if (!filter_var($userData['email'], FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Invalid email format.');
        }
        
        // Validate password strength
        if (strlen($userData['password']) < 8) {
            throw new Exception('Password must be at least 8 characters long.');
        }
        
        // Check if username or email already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$userData['username'], $userData['email']]);
        if ($stmt->rowCount() > 0) {
            throw new Exception('Username or email already exists.');
        }
        
        // Hash password
        $hashedPassword = password_hash($userData['password'], PASSWORD_DEFAULT);
        
        // Prepare SQL query
        $sql = "INSERT INTO users (username, email, password_hash, first_name, last_name, 
                phone_number, date_of_birth, gender, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $userData['username'],
            $userData['email'],
            $hashedPassword,
            $userData['firstName'],
            $userData['lastName'],
            $userData['phoneNumber'],
            $userData['dateOfBirth'],
            $userData['gender']
        ]);
        
        $response['success'] = true;
        $response['message'] = 'Registration successful! You can now log in.';
    }
} catch (PDOException $e) {
    $response['message'] = 'Database error: ' . $e->getMessage();
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

// Return JSON response
echo json_encode($response);
?>
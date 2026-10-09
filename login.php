<?php
session_start();
header('Content-Type: application/json');

// Database configuration
$host = 'localhost';
$dbname = 'u797284664_calculator';
$username = 'u797284664_calc';
$password = 'per5kilO.//99Akj';

// WhatsApp Configuration
$whatsapp_api_key = 'YOUR_CALLMEBOT_API_KEY';
$whatsapp_number = '923135901213';

// Response array
$response = array('success' => false, 'message' => '', 'redirect' => '');

try {
    // Create PDO connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if form is submitted
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Get form data
        $userIdentifier = trim($_POST['username']);
        $password = $_POST['password'];
        $remember = isset($_POST['remember']) ? true : false;
        
        // Validate required fields
        if (empty($userIdentifier) || empty($password)) {
            throw new Exception('Please fill in all required fields.');
        }
        
        // Check if user exists with username or email
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$userIdentifier, $userIdentifier]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            throw new Exception('Invalid username/email or password.');
        }
        
        // Verify password
        if (!password_verify($password, $user['password_hash'])) {
            throw new Exception('Invalid username/email or password.');
        }
        
        // Check if account is active
        if ($user['status'] !== 'active') {
            throw new Exception('Your account is not active. Please contact support.');
        }
        
        // Update last login and login count
        $updateStmt = $pdo->prepare("UPDATE users SET last_login = NOW(), login_count = login_count + 1 WHERE id = ?");
        $updateStmt->execute([$user['id']]);
        
        // Set session variables
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['first_name'] = $user['first_name'];
        $_SESSION['last_name'] = $user['last_name'];
        $_SESSION['logged_in'] = true;
        
        // Set remember me cookie if requested
        if ($remember) {
            $token = bin2hex(random_bytes(32));
            $expiry = time() + (30 * 24 * 60 * 60); // 30 days
            
            // Store token in database
            $stmt = $pdo->prepare("INSERT INTO auth_tokens (user_id, token, expires) VALUES (?, ?, ?)");
            $stmt->execute([$user['id'], $token, date('Y-m-d H:i:s', $expiry)]);
            
            setcookie('remember_token', $token, $expiry, '/');
        }
        
        $response['success'] = true;
        $response['message'] = 'Login successful! Redirecting...';
        $response['redirect'] = 'dashboard.php';
        
        // Send WhatsApp Notification for Login
        $whatsapp_message = "🔐 *User Login Alert* 🔐\n\n";
        $whatsapp_message .= "👤 *User:* " . $user['username'] . "\n";
        $whatsapp_message .= "📧 *Email:* " . $user['email'] . "\n";
        $whatsapp_message .= "👨‍💼 *Name:* " . $user['first_name'] . " " . $user['last_name'] . "\n";
        $whatsapp_message .= "🌐 *IP Address:* " . $_SERVER['REMOTE_ADDR'] . "\n";
        $whatsapp_message .= "🕒 *Login Time:* " . date('Y-m-d H:i:s') . "\n";
        $whatsapp_message .= "💻 *Browser:* " . substr($_SERVER['HTTP_USER_AGENT'], 0, 50) . "...";
        
        sendWhatsAppNotification($whatsapp_message, $whatsapp_api_key, $whatsapp_number);
    }
} catch (PDOException $e) {
    $response['message'] = 'Database error: ' . $e->getMessage();
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

// Return JSON response
echo json_encode($response);

// WhatsApp Notification Function
function sendWhatsAppNotification($message, $api_key, $phone_number) {
    $url = "https://api.callmebot.com/whatsapp.php?phone=" . $phone_number . "&text=" . urlencode($message) . "&apikey=" . $api_key;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $result = curl_exec($ch);
    curl_close($ch);
    
    return $result;
}
?>

<?php
header('Content-Type: application/json');

// Database configuration
$host = 'localhost';
$dbname = 'u797284664_calculator';
$username = 'u797284664_calc';
$password = 'per5kilO.//99Akj';

// WhatsApp Configuration - FREE CallMeBot
$whatsapp_api_key = 'YOUR_CALLMEBOT_API_KEY'; // Get from https://www.callmebot.com/blog/free-api-whatsapp-messages/
$whatsapp_number = '923135901213'; // Your number without +

// Response array
$response = array('success' => false, 'message' => '');

try {
    // Create PDO connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if form is submitted
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Get form data
        $feedbackData = [
            'name' => trim($_POST['name']),
            'email' => trim($_POST['email']),
            'subject' => trim($_POST['subject']),
            'priority' => !empty($_POST['priority']) ? $_POST['priority'] : 'Normal',
            'message' => trim($_POST['message']),
            'ip_address' => $_SERVER['REMOTE_ADDR'],
            'user_agent' => substr($_SERVER['HTTP_USER_AGENT'], 0, 255)
        ];
        
        // Validate required fields
        if (empty($feedbackData['name']) || empty($feedbackData['email']) || 
            empty($feedbackData['subject']) || empty($feedbackData['message'])) {
            throw new Exception('All required fields must be filled.');
        }
        
        // Validate email format
        if (!filter_var($feedbackData['email'], FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Invalid email format.');
        }
        
        // Prepare SQL query
        $sql = "INSERT INTO feedback (name, email, subject, priority, message, ip_address, user_agent) 
                VALUES (:name, :email, :subject, :priority, :message, :ip_address, :user_agent)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($feedbackData);
        
        $response['success'] = true;
        $response['message'] = 'Thank you for your feedback! We will get back to you soon.';
        
        // Send WhatsApp Notification
        $whatsapp_message = "📝 *New Feedback Received* 📝\n\n";
        $whatsapp_message .= "👤 *Name:* " . $feedbackData['name'] . "\n";
        $whatsapp_message .= "📧 *Email:* " . $feedbackData['email'] . "\n";
        $whatsapp_message .= "📋 *Subject:* " . $feedbackData['subject'] . "\n";
        $whatsapp_message .= "🚨 *Priority:* " . $feedbackData['priority'] . "\n";
        $whatsapp_message .= "💬 *Message:* " . substr($feedbackData['message'], 0, 100) . "...\n";
        $whatsapp_message .= "🌐 *IP:* " . $feedbackData['ip_address'] . "\n";
        $whatsapp_message .= "⏰ *Time:* " . date('Y-m-d H:i:s');
        
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
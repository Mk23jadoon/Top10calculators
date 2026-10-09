<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once 'db_config.php';

class CalculatorAPI {
    private $db;
    private $user_id;
    
    public function __construct() {
        $this->db = getDBConnection();
        $this->authenticate();
    }
    
    private function authenticate() {
        $headers = getallheaders();
        $token = $headers['Authorization'] ?? '';
        
        if ($token) {
            $stmt = $this->db->prepare("
                SELECT user_id FROM auth_tokens 
                WHERE token = ? AND expires > NOW()
            ");
            $stmt->execute([str_replace('Bearer ', '', $token)]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $this->user_id = $result['user_id'] ?? null;
        }
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = $_SERVER['PATH_INFO'] ?? '/';
        
        switch ($method) {
            case 'POST':
                if ($path === '/save') return $this->saveCalculation();
                if ($path === '/login') return $this->login();
                if ($path === '/register') return $this->register();
                break;
            case 'GET':
                if ($path === '/calculations') return $this->getCalculations();
                if (preg_match('/\/share\/(.+)/', $path, $matches)) 
                    return $this->getSharedCalculation($matches[1]);
                break;
            case 'DELETE':
                if (preg_match('/\/calculations\/(\d+)/', $path, $matches))
                    return $this->deleteCalculation($matches[1]);
                break;
        }
        
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
    }
    
    public function saveCalculation() {
        if (!$this->user_id) {
            http_response_code(401);
            return json_encode(['error' => 'Authentication required']);
        }
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $this->db->prepare("
            INSERT INTO user_calculations 
            (user_id, title, calculation_data, calculation_type, is_public, share_token) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        $share_token = bin2hex(random_bytes(16));
        $success = $stmt->execute([
            $this->user_id,
            $data['title'] ?? 'Untitled Calculation',
            json_encode($data['calculations']),
            $data['type'] ?? 'scientific',
            $data['is_public'] ?? false,
            $share_token
        ]);
        
        if ($success) {
            return json_encode([
                'success' => true,
                'calculation_id' => $this->db->lastInsertId(),
                'share_token' => $share_token
            ]);
        }
        
        http_response_code(500);
        return json_encode(['error' => 'Failed to save calculation']);
    }
    
    public function getCalculations() {
        if (!$this->user_id) {
            http_response_code(401);
            return json_encode(['error' => 'Authentication required']);
        }
        
        $stmt = $this->db->prepare("
            SELECT id, title, calculation_type, is_public, share_token, 
                   created_at, updated_at, view_count
            FROM user_calculations 
            WHERE user_id = ?
            ORDER BY updated_at DESC
        ");
        $stmt->execute([$this->user_id]);
        $calculations = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return json_encode(['calculations' => $calculations]);
    }
    
    public function getSharedCalculation($share_token) {
        $stmt = $this->db->prepare("
            SELECT uc.title, uc.calculation_data, uc.calculation_type,
                   u.username, uc.created_at, uc.view_count
            FROM user_calculations uc
            JOIN users u ON uc.user_id = u.id
            WHERE uc.share_token = ? AND uc.is_public = TRUE
        ");
        $stmt->execute([$share_token]);
        $calculation = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($calculation) {
            // Update view count
            $update_stmt = $this->db->prepare("
                UPDATE user_calculations SET view_count = view_count + 1 
                WHERE share_token = ?
            ");
            $update_stmt->execute([$share_token]);
            
            $calculation['calculation_data'] = json_decode($calculation['calculation_data'], true);
            return json_encode(['calculation' => $calculation]);
        }
        
        http_response_code(404);
        return json_encode(['error' => 'Calculation not found']);
    }
    
    public function login() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $this->db->prepare("
            SELECT id, password_hash FROM users 
            WHERE (email = ? OR username = ?) AND status = 'active'
        ");
        $stmt->execute([$data['username'], $data['username']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user && password_verify($data['password'], $user['password_hash'])) {
            // Create auth token
            $token = bin2hex(random_bytes(32));
            $expires = date('Y-m-d H:i:s', strtotime('+30 days'));
            
            $token_stmt = $this->db->prepare("
                INSERT INTO auth_tokens (user_id, token, expires) 
                VALUES (?, ?, ?)
            ");
            $token_stmt->execute([$user['id'], $token, $expires]);
            
            // Update user stats
            $update_stmt = $this->db->prepare("
                UPDATE users SET last_login = NOW(), login_count = COALESCE(login_count, 0) + 1 
                WHERE id = ?
            ");
            $update_stmt->execute([$user['id']]);
            
            return json_encode([
                'success' => true,
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username']
                ]
            ]);
        }
        
        http_response_code(401);
        return json_encode(['error' => 'Invalid credentials']);
    }
    
    public function register() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Check if user exists
        $check_stmt = $this->db->prepare("
            SELECT id FROM users WHERE email = ? OR username = ?
        ");
        $check_stmt->execute([$data['email'], $data['username']]);
        
        if ($check_stmt->fetch()) {
            http_response_code(409);
            return json_encode(['error' => 'User already exists']);
        }
        
        $stmt = $this->db->prepare("
            INSERT INTO users (username, email, password_hash, first_name, last_name, status) 
            VALUES (?, ?, ?, ?, ?, 'active')
        ");
        
        $success = $stmt->execute([
            $data['username'],
            $data['email'],
            password_hash($data['password'], PASSWORD_DEFAULT),
            $data['firstName'] ?? '',
            $data['lastName'] ?? ''
        ]);
        
        if ($success) {
            return json_encode(['success' => true, 'message' => 'Registration successful']);
        }
        
        http_response_code(500);
        return json_encode(['error' => 'Registration failed']);
    }
}

$api = new CalculatorAPI();
$api->handleRequest();
?>
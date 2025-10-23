<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$query = $input['query'] ?? '';

if (empty($query)) {
    http_response_code(400);
    echo json_encode(['error' => 'Query is required']);
    exit;
}

// Simple chat name generation based on query content
// In a real implementation, this would call an LLM API
function generateChatName($query) {
    // Remove common question words and clean up
    $query = trim($query);
    $query = preg_replace('/^(what|how|why|when|where|who|can|could|would|should|is|are|do|does|did)\s+/i', '', $query);
    $query = preg_replace('/\?+$/', '', $query);
    
    // Capitalize first letter
    $query = ucfirst($query);
    
    // Limit length
    if (strlen($query) > 50) {
        $query = substr($query, 0, 47) . '...';
    }
    
    // If empty after cleaning, use a default
    if (empty($query)) {
        return 'New Chat';
    }
    
    return $query;
}

$chatName = generateChatName($query);

echo json_encode(['name' => $chatName]);
?>
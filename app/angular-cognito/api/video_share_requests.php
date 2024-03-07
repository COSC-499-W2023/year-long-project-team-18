<?php

require 'connect.php';

function getPostData() {
    return json_decode(file_get_contents('php://input'), true);
}

// Create a new video share request
function createShareRequest($pdo, $senderId, $receiverId, $videoKey) {
    $sql = "INSERT INTO video_share_requests (sender_id, receiver_id, video_key, status) VALUES (?, ?, ?, 'pending')";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$senderId, $receiverId, $videoKey]);
    echo json_encode(['success' => true, 'message' => 'Share request created']);
}

// Fetch pending video share requests for a user
function fetchPendingRequests($pdo, $userId) {
    $sql = "SELECT * FROM video_share_requests WHERE receiver_id = ? AND status = 'pending'";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$userId]);
    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'data' => $requests]);
}

// Respond to a video share request (accept or deny)
function respondToRequest($pdo, $requestId, $action) {
    $status = $action === 'accept' ? 'accepted' : 'denied';
    $sql = "UPDATE video_share_requests SET status = ? WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$status, $requestId]);
    echo json_encode(['success' => true, 'message' => "Request $action"]);
}

$action = $_GET['action'] ?? '';
$data = getPostData();

switch ($action) {
    case 'create':
        createShareRequest($pdo, $data['senderId'], $data['receiverId'], $data['videoKey']);
        break;
    case 'fetch':
        $userId = $data['userId'] ?? '';
        fetchPendingRequests($pdo, $userId);
        break;
    case 'respond':
        respondToRequest($pdo, $data['requestId'], $data['action']);
        break;
    default:
        echo json_encode(['error' => 'Invalid action']);
        break;
}

?>

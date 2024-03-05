<?php

require 'connect.php';

$username = $_GET['username'];
$videolist = [];


$sql = "SELECT email FROM Users WHERE username = '{$username}';";

$statement = $pdo->query($sql);
$cr = 0;
while($row = $statement->fetch(PDO::FETCH_ASSOC)){
    $videolist[$cr]['email'] = $row['email'];
    $cr++;

}


if(!empty($signup)){
    echo json_encode(['data'=>$signup]);
}else{
    http_response_code(404);
}



?>
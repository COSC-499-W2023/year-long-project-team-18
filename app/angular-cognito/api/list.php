<?php

require 'connect.php';

$signup = [];

$sql = "SELECT email FROM Users";

$statement = $pdo->query($sql);
$cr = 0;
while($row = $statement->fetch(PDO::FETCH_ASSOC)){
    $signup[$cr]['email'] = $row['email'];
    $cr++;

}


if(!empty($signup)){
    echo json_encode(['data'=>$signup]);
}else{
    http_response_code(404);
}



?>
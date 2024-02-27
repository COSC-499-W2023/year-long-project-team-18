<?php

require 'connect.php';


$postdata = file_get_contents("php://input");

if(isset($postdata) && !empty($postdata)){
    $request = json_decode($postdata);

    $username = $request->data->username;
    $organizationcode = $request->data->organizationcode;
}
$videolist = [];

$sql = "SELECT username FROM Users WHERE organizationcode = '{$organizationcode}' AND username != '{$username}';";

$statement = $pdo->query($sql);
$cr = 0;
while($row = $statement->fetch(PDO::FETCH_ASSOC)){
    $signup[$cr]['username'] = $row['username'];
    $cr++;

}


if(!empty($videolist)){
    echo json_encode(['data'=>$signup]);
}else{
    http_response_code(404);
}



?>
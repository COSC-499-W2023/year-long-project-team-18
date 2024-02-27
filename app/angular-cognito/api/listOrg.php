<?php

require 'connect.php';


$postdata = file_get_contents("php://input");

if(isset($postdata) && !empty($postdata)){
    $request = json_decode($postdata);

    $organizationcode = $request->data->organizationcode;
}
$signup = [];

$sql = "SELECT username FROM Users WHERE organizationcode = '{$organizationcode}';";

$statement = $pdo->query($sql);
$cr = 0;
while($row = $statement->fetch(PDO::FETCH_ASSOC)){
    $signup[$cr]['organizationcode'] = $row['organizationcode'];
    $cr++;

}


if(!empty($signup)){
    echo json_encode(['data'=>$signup]);
}else{
    http_response_code(404);
}



?>
<?php
require 'connect.php';

$postdata = file_get_contents("php://input");

if(isset($postdata) && !empty($postdata))
{
  $request = json_decode($postdata);
  $username = $request->data->username;
  $organizationcode = $request->data->organizationcode;

  $sql = "UPDATE 'Users' SET 'organizationcode'='{$organizationcode}' WHERE 'username' = '{$username}';";
  $statement = $pdo->prepare($sql);

  if($statement->execute())
  {
    http_response_code(204);
  }
  else
  {
    return http_response_code(422);
  }  
}

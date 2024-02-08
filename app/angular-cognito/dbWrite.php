<?php

$servername = "prvcy-main-db.cjrkirabesjd.ca-central-1.rds.amazonaws.com";
$user = "admin";
$password = "admin499";
$port = "13306";

$conn = new mysqli ($servername, $user, $password, $port);

$error = mysqli_connect_error();

if($error = null){
    $output = "<p>There was an issue connecting to the database, please try again later.</p>";
    exit($output)
}
else{
    $sql = "INSERT INTO Users (Email)
            values ('test@test.com');";

    $result = mysqli_query($conn, $sql);




    mysqli_free_results($result);
    mysqli_close($connection);
}

?>
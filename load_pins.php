<?php

include "db.php";

$result = $conn->query("SELECT * FROM pins");

$pins = [];

while($row = $result->fetch_assoc()){
    $pins[] = $row;
}

echo json_encode($pins);
?>

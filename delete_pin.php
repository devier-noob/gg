<?php

include "db.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["id"])) {
    die("No ID received");
}

$id = $data["id"];

$sql = "DELETE FROM pins WHERE id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $id);

if ($stmt->execute()) {
    echo "Deleted";
} else {
    echo "Failed";
}

$stmt->close();
$conn->close();

?>
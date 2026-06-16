<?php

file_put_contents(
    "debug.txt",
    file_get_contents("php://input")
);

include "db.php";

$pins = json_decode(file_get_contents("php://input"), true);

if (!$pins) {
    die("No data received");
}

$conn->query("TRUNCATE TABLE pins");

foreach ($pins as $pin) {

    $id = $pin["id"];
    $name = $conn->real_escape_string($pin["name"] ?? "");
    $status = $conn->real_escape_string($pin["status"] ?? "");
    $event = json_encode($pin["event"] ?? []);
    $description = $conn->real_escape_string($pin["description"] ?? "");
    $x = (float)$pin["x"];
    $y = (float)$pin["y"];

    $sql = "
        INSERT INTO pins
        (id, name, status, event, description, x, y)
        VALUES
        ('$id', '$name', '$status', '$event', '$description', $x, $y)
    ";

    $conn->query($sql);
}

echo "success";

?>

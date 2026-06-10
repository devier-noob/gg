<?php
include "db.php";

$sql = "DELETE FROM pins"; // change "pins" to your table name

if (mysqli_query($conn, $sql)) {
    echo "All pins cleared successfully";
} else {
    echo "Error clearing pins: " . mysqli_error($conn);
}
?>
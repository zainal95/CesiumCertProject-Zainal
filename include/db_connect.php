<?php
  
 
	// db connect
	$DB_SERVERNAME = "localhost\SQLEXPRESS";
	$DB_USERNAME = "sa";
	$DB_PASSWORD = "sa";
	$DB_DBNAME = "cesium_project";
    global $conn ;
 
$connectionInfo = array("Database" => $DB_DBNAME, "UID" => $DB_USERNAME, "PWD" => $DB_PASSWORD);
$conn = sqlsrv_connect($DB_SERVERNAME, $connectionInfo);

if ($conn) {
} else {
    die(print_r(sqlsrv_errors(), true));
}
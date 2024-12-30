<?php

    
error_reporting(E_ALL);

ini_set("display_errors", 1);

$response = array();
if(!isset($_POST['functionName'])){
    $response['msg'] = "No variable received";
    $response['status'] = false;
    echo json_encode($resp);
    return;
}else{
    $response['functionName'] = $_POST['functionName'];
}

include '../include/db_connect.php';
$functionName = trim($_POST['functionName']);
// if (!isset($conn)) {
//     die("Connection variable not set. Check include file.");
// }

switch($functionName){
    case "fetchAssetData":
        fetchAssetData();
        break; 
    case "fetchAssetDataList":
        fetchAssetDataList();
        break;  
    case "updateAssetData":
        updateAssetData();
        break; 
}
echo json_encode($response);
// unset($dbh); unset($stmt);

function fetchAssetData(){
    global $response;
    global $conn;
    $asset_id = $_POST['assetId'];
    $sql = "SELECT * FROM layer_data WHERE Culvert_Na = '$asset_id'";
    $stmt = sqlsrv_query($conn, $sql);
    
    if ($stmt === false) {
        die(print_r(sqlsrv_errors(), true));
    }
    while ($row = sqlsrv_fetch_Array($stmt, SQLSRV_FETCH_ASSOC)) { 
        $Culvert_Na = $row['Culvert_Na'];
        $layer =  $row['layer'];
        $path =  $row['path'];
        $coordinates =  $row['coordinates'];  
        $asset_condition =  $row['asset_condition'];  
        $response['status'] = 'Success';
        $response['asset_data'] = $row;
    }
 
}

function fetchAssetDataList() {
    global $response;
    global $conn;
 
    $sql = "SELECT * FROM layer_data ";
    $stmt = sqlsrv_query($conn, $sql);

    if ($stmt === false) {
        die(print_r(sqlsrv_errors(), true));
    }

    $data = [];
    while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
        $data[] = $row; 
    }

    $response = [
        'status' => !empty($data) ? 'Success' : 'No Data Found',
        'data' => $data
    ];
}


function updateAssetData() {
    global $response;
    global $conn;
 
    $asset_condition = isset($_POST['asset_condition']) ? $_POST['asset_condition'] : null;
    $assetId = isset($_POST['assetId']) ? $_POST['assetId'] : null;
 
    if (empty($asset_condition) || empty($assetId)) {
        $response = [
            'status' => 'Error',
            'message' => 'Missing asset_condition or assetId'
        ];
        return;
    }
 
    $sqlUpdate = "UPDATE layer_data SET asset_condition = ? WHERE Culvert_Na = ?";
    $params = [$asset_condition, $assetId];

    $stmt = sqlsrv_query($conn, $sqlUpdate, $params);
 
    if ($stmt === false) {
        $response = [
            'status' => 'Error',
            'message' => 'Update failed: ' . print_r(sqlsrv_errors(), true)
        ];
        return;
    }
 
    $response = [
        'status' => 'Success',
        'message' => 'Asset condition updated successfully'
    ];
}

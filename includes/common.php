<?php

//MariaDB Functions

//Connection
function connect() {
  //Get DB Configs
    include (getenv("DOCUMENT_ROOT")."../../private/conf.php");
	
	$conn= new mysqli($host, $user, $pass, $db);
	
	if ($conn->connect_error) {	die('Database connection failed: '.$conn->connect_error); }
	return $conn;
}

//Get all records from a table
  function get_recs($table,$orderby=NULL) {
  	//Connect to DB
  	  $conn=connect();
	  
	//Select Statement
	  if (isset($orderby)) { $table.=" ORDER BY ".$orderby; }
	  
	  $sql='SELECT * from '.$table;
	  $rs=$conn->query($sql);
	  
	//Test for error
	  if ($rs === false) { trigger_error("Wrong SQL: ".$sql. " Error:". $conn->error, E_USER_ERROR); }
	  else { $arr = $rs->fetch_all(MYSQLI_ASSOC); }
	//Close 
	  $conn->close();
	//Return   
	  return $arr;
}

//Get all records from a table
  function get_rec($table,$column,$value) {
  	//Connect to DB
  	  $conn=connect();
	  
	//Select Statement
	  $sql="SELECT * from ".$table." WHERE ".$column."='".$value."'";
	  $rs=$conn->query($sql);
	  
	//Test for error
	  if ($rs === false) { trigger_error("Wrong SQL: ".$sql. " Error:". $conn->error, E_USER_ERROR); }
	  else { $arr = $rs->fetch_all(MYSQLI_ASSOC); }

	//Close 
	  $conn->close();
	//Return   
	  return $arr;
}

//Get all records from a table
function get_unique_column($table,$column) {
    //Connect to DB
    $conn=connect();
    
    //Select Statement
    $sql="SELECT ".$column." from ".$table;
    $rs=$conn->query($sql);
    
    //Test for error
    if ($rs === false) { trigger_error("Wrong SQL: ".$sql. " Error:". $conn->error, E_USER_ERROR); }
    else { $arr = $rs->fetch_all(MYSQLI_ASSOC); }
    foreach($arr as $value) {
        $collapsed[]=$value[$column];
    }
    
    $arr=array_unique($collapsed);
    //Close
    $conn->close();
    //Return
    return $arr;
}

//Add full record to table with data
function add_rec($table,$columns,$array) {
	//Connect to DB
  	  $conn=connect();
	  
	//Select Statement
	  $sql="INSERT INTO $table ($columns) VALUES ('$array' )";
	  $rs=$conn->query($sql);
	//Test for error
	  if ($rs === false) { trigger_error("Wrong SQL: ".$sql. " Error:". $conn->error, E_USER_ERROR); }
	  else { $last_inserted_id = $conn->insert_id; }	
	//Close 
	  $conn->close();
	//Return      
	  return $rs; 
}

//Check if record exists
function if_exist($table,$field1,$field2,$value,$year) {
	//Connect to DB
	$conn=connect();
	 
	//Select Statement
	$sql="SELECT rec_id FROM ".$table." WHERE ".$field1."='".$value."' AND ".$field2." BETWEEN '".$year."-01-01' AND '".$year."-12-31'";
	$rs=$conn->query($sql);
	//Test for error
	if ($rs === false) { trigger_error("Wrong SQL: ".$sql. " Error:". $conn->error, E_USER_ERROR); }
	else { $arr = $rs->fetch_all(MYSQLI_ASSOC); }

	//Close
	$conn->close();
	//Return
	if (count($arr) >=1) { return TRUE; } else { return FALSE; }
}

//Check if record exists
function if_exist_value($table,$field,$value) {
    //Connect to DB
    $conn=connect();
    
    //Select Statement
    $sql="SELECT rec_id FROM ".$table." WHERE ".$field."='".$value."'";
    $rs=$conn->query($sql);
    //Test for error
    if ($rs === false) { trigger_error("Wrong SQL: ".$sql. " Error:". $conn->error, E_USER_ERROR); }
    else { $arr = $rs->fetch_all(MYSQLI_ASSOC); }
    
    //Close
    $conn->close();
    //Return
    if (count($arr) >=1) { return TRUE; } else { return FALSE; }
}

//Delete record
function del_rec($table,$delID) {
	//Connect to DB
  	  $conn=connect();
	  
	//Select Statement
	  $sql='DELETE FROM '.$table.' WHERE rec_id='.$delID;
	  $rs=$conn->query($sql);
	//Test for error
	  if ($rs === false) { trigger_error("Wrong SQL: ".$sql. " Error:". $conn->error, E_USER_ERROR); }
	  else { $affected_rows = $conn->affected_rows; }	
	//Close 
	  $conn->close();
	//Return      
	  return $affected_rows; 
}


function update_rec($table,$field,$value,$rec_id) {
	//Connect to DB
  	  $conn=connect();
	  
	//Select Statement
	  $sql="UPDATE $table SET ".$field."='".$value."' WHERE rec_id=".$rec_id;
	  $rs=$conn->query($sql);

	//Test for error
	  if ($rs === false) { trigger_error("Wrong SQL: ".$sql. " Error:". $conn->error, E_USER_ERROR); }
	  else { $affected_rows = $conn->affected_rows; }
	//Close 
	  $conn->close();
	//Return    
	  return $affected_rows; 
}
  
if (!function_exists('str_contains')) {
    function str_contains (string $haystack, string $needle)
    {
        return empty($needle) || strpos($haystack, $needle) !== false;
    }
}

?>
  
  
  

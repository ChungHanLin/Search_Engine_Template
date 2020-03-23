<?php
/* 資料庫連結資訊 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header("Content-Type:text/html; charset=utf-8");
ini_set("default_charset", "utf8");

/* Login information should not be sighted by the client */
include_once "login.php";
$mydb = new mysqli($host, $username, $password, $db);

/* Get ajax content */
$category = isset($_POST["category"]) ? $_POST["category"] : "";
$page = isset($_POST["page"]) ? $_POST["page"] : "1";

/* Connection Failed */
/* Should remind the client about internet problem */
/* Toast message ? */
if($mydb->connect_error){
		die("Fatal error");
}
else{
		/* 設定編碼為 utf-8 */
		mysqli_set_charset($mydb, "utf8");
		
		$start_index = ($page - 1) * 15;
		$page_news_num = 15;

		$query = "(SELECT * FROM ettoday WHERE TO_DAYS(times) = TO_DAYS(NOW()))
				  UNION ALL
				  (SELECT * FROM setn WHERE TO_DAYS(times) = TO_DAYS(NOW()))
				  UNION ALL
				  (SELECT * FROM udn WHERE TO_DAYS(times) = TO_DAYS(NOW()))
				  UNION ALL
				  (SELECT * FROM pts WHERE TO_DAYS(times) = TO_DAYS(NOW()))
				  UNION ALL
				  (SELECT * FROM apple WHERE TO_DAYS(times) = TO_DAYS(NOW()))
				  UNION ALL
				  (SELECT * FROM tvbs WHERE TO_DAYS(times) = TO_DAYS(NOW()))
				  UNION ALL
				  (SELECT * FROM cts WHERE TO_DAYS(times) = TO_DAYS(NOW()))
				  UNION ALL
				  (SELECT * FROM ltn WHERE TO_DAYS(times) = TO_DAYS(NOW()))
				  ORDER BY times DESC
				  LIMIT $start_index, $page_news_num";

		$result = $mydb->query($query);
		$rows = $result->num_rows;

		for($j = 0; $j < $rows; $j++){
				$row = $result->fetch_array(MYSQLI_ASSOC);

				$news_data[$j] = array("news_title"=>$row['title'],
									   "news_url"=>$row['url']);
		}
 
		echo json_encode($news_data);
		$result->close();
		$mydb->close();
}
?>

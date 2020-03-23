<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: *');
header("Content-Type:text/html; charset=utf-8");
ini_set("default_charset", "utf8");
	
// Using 'GET' method to get the search string
$page = isset($_GET["page"]) ? $_GET["page"] : "";

get_text($page);

function get_text($page){
		
    $file_path = "tmp/" . strval($page);
	// Target file has to been put in the same directory with the <php> file.
    
	if(!file_exists($file_path)){
		echo "<h4>File is not exists.</h4>";
	
	}
	else{
        $file = fopen($file_path, "r");
        $record_num = -1;
        
        $record_list = array();
		$is_record = false;

        while(!feof($file)) {
            $value = fgets($file);
			if (strpos($value, '@Gais_REC') !== false) {
				$is_record = true;
                $record_num++;
            }
            else if (strpos($value, '@url') !== false && $is_record === true) {
                $url = substr($value, 5, -1);
            }
            else if (strpos($value, '@title') !== false && $is_record === true) {
                $title = substr($value, 7, -1);
            }
            else if (strpos($value, '@keyword') !== false && $is_record === true) {
                $keyword = substr($value, 9, -1);
            }
            else if (strpos($value, '@body') !== false && $is_record === true) {
                if (strlen($value) > 8) {
					$body = substr($value, 6, -1);
                }
                else {
                    $value = fgets($file);
                    $body = "";
				}
				$value = "";
                while($value !== "@\n") {
                    $body = $body . $value;
                    $value = fgets($file);
                }
                
                $record_list[$record_num] = array("url"=>$url,
                                                  "title"=>$title,
                                                  "keyword"=>$keyword,
												  "body"=>$body);
				$is_record = false;
            }
        }
        echo json_encode($record_list);
    }
}

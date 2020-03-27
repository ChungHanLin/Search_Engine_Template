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
        $record_num = 0;
        
        $record_list = array();
        $round = 0;
        
        while(!feof($file)) {
            if ($round === 0) {
                $title = fgets($file);
            }
            else if ($round === 1) {
                $url = fgets($file);
            }
            else if ($round === 2) {
                $content = fgets($file);

                $record_list[$record_num] = array(
                    "title"=>$title,
                    "url"=>$url,
                    "content"=>$content
                );
                $record_num++;
                $round = 0;
            }
        }
        echo json_encode($record_list);
    }
}

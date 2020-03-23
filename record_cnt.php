<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: *');
header("Content-Type:text/html; charset=utf-8");
ini_set("default_charset", "utf8");
	
// Using 'GET' method to get the search string
$search_str = isset($_GET["search"]) ? $_GET["search"] : "";

get_search_text_num($search_str);

function get_search_text_num($search_str){
    
    $search_arg = translator($search_str);
	// 理論上會把檔案輸出囉
	$command = "../rgrep/a.out -b @Gais -c -k '$search_arg' -g 15 ~/Desktop/txt/ettoday.rec";
    $time_start = microtime(true);
    exec($command, $match_cnt);
    $time_end = microtime(true);
    
    $match_cnt = substr($match_cnt[0], 14);
    
    $time = $time_end - $time_start;
	// Counting the total line of the $search_str in tmp.txt

	exec("find tmp -type f |wc -l", $file_cnt);

    
    $record_attribute = array("match_count"=>$match_cnt, "match_file"=>$file_cnt, "time"=>round($time, 2));
    
    echo json_encode($record_attribute);
}

// 將搜尋字串轉換為可讀取模式
function translator($search_str) {
    // 去掉頭尾空白
    $search_str = trim($search_str);
    
    // 去除中間字串連續空白
    $search_str = preg_replace('/\s(?=\s)/', '', $search_str);
    return str_replace(' ', ',', $search_str);
}

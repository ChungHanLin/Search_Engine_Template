<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: *');
header("Content-Type:text/html; charset=utf-8");

// Using 'GET' method to get the search string
$search_str = isset($_GET["search"]) ? $_GET["search"] : "";
$page = isset($_GET["page"]) ? $_GET["page"] : "";

unlink_file();
get_search_text_num($search_str, $page);

function unlink_file() {
    for ($i = 0; file_exists("tmp/" . strval($i)); $i++) {
        unlink(strval("tmp/" . $i));
    }
}

function get_search_text_num($search_str, $page){
    $start = ((int)$page - 1) * 10;
    $search_arg = translator($search_str);
    // 計算搜尋時間
    $time_start = microtime(true);
    require_once 'init.php';
    $query = $client->search([
        'body' => [
            'query' => [
                'bool' => [
                    'should' => [
                        'match' => ['title' => $search_arg],
                        'match' => ['content' => $search_arg]
                    ]
                ]
            ],
            'from' => $start,
            'size' => 10
        ]
    ]);
    
    $time_end = microtime(true);
    $time = $time_end - $time_start;
    $match_cnt = $query['hits']['total']['value'];

    $record_attribute = array(
        "match_count" => $match_cnt, 
        "time" => round($time, 2)
    );

    if ($match_cnt == 0) {
        $json_data = array(
            "attribute" => $record_attribute
        );
    }
    else {
        
        if ((($match_cnt  - 1)/ 10) + 1 === ((int) $page)) {
            $limit = $match_cnt - $start;
        }
        else {
            $limit = 10;
        }
        $result = $query['hits']['hits'];
        for ($i = 0; $i < $limit; $i++) {
            $record_article[$i] = array(
                "title" => $result[$i]['_source']['title'],
                "url" => $result[$i]['_source']['url'],
                "content" => $result[$i]['_source']['content']
            );
        }

        $json_data = array(
            "attribute" => $record_attribute,
            "article" => $record_article
        );
    }
    
    echo json_encode($json_data);
}

// 將搜尋字串轉換為可讀取模式
function translator($search_str) {
    // 去掉頭尾空白
    $search_str = trim($search_str);
    
    // 去除中間字串連續空白
    $search_str = preg_replace('/\s(?=\s)/', '', $search_str);
    return $search_str;
}
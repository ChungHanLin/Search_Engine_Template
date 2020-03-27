<?php
require 'init.php';

$search = '三立 news';

$query = $client->search([
    'body' => [
        'query' => [
            'bool' => [
                'should' => [
                    'match' => ['title' => $search],
                    'match' => ['content' => $search]
                ]
            ]
        ]
    ]
]);

if ($query['hits']['total'] >= 1) {
    if ($query['hits']['total'] > 20) {
        $limit = 20;
    }
    else {
        $limit = $query['hits']['total'];
    }
    $result = $query['hits']['hits'];
}

for ($i = 0; $i < $limit; $i++) {
    $json_data[$i] = array(
        "title" => $result[$i]['_source']['title'],
        "url" => $result[$i]['_source']['url'],
        "content" => $result[$i]['_source']['content']
    );
}

echo json_encode($json_data);
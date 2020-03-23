<?php
require_once 'vendor/autoload.php';

// DB handler

$hosts = ['host' => 'localhost:9200'];

$client = Elasticsearch\ClientBuilder::create()
            ->setHosts($hosts)    
            ->build();
?>
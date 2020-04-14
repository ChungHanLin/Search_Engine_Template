$(window).ready(function(){
    
    new WOW().init();
    
    // 若有搜尋字串時， ajax 發送請求
    var search_bar = document.getElementById("search_bar");
    search_bar.onkeypress = getInputValue;
    
    
    // code : CWB-0B80D29E-81A0-49CF-A4EC-003E4FFE8EF5
    weather_widget_1();
    weather_widget_2();
    
    tabnews_api();
    
    // 更新天氣鈕
    document.getElementById("update_weather").onclick = update_weather;
    function update_weather() {
        weather_widget_1();
        weather_widget_2();
    }
    
    document.getElementById("update_news").onclick = update_news;
    function update_news() {
        tabnews_api();
    }
    
    document.getElementById("home_page").onclick = refresh_home_page;
    function refresh_home_page() {
        location.reload();
    }
    
    document.getElementById("download_btn").href = "https://drive.google.com/a/csie.io/file/d/1V2DWlmK6wgQaCDJbLrsi2GtW0QCkOcLi/view?usp=sharing";
    document.getElementById("download_btn").target = "_blank";
});

// 取得輸入框輸入內容
function getInputValue(event){
    // keyCode = 13 為 "Enter"
    if(event.keyCode == 13){
        var search_str = search_bar.value;
        
        if (search_str != ""){
            $("#record_container").empty();
            $("#pagination").empty();
            $("#search_result").empty();
            document.getElementById("search_result").style.visibility = "hidden";
            request_search_str_dataCnt(search_str, 1);
        }
    }
}

// 詢問 server 關於該 search_str 有多少筆資料
function request_search_str_dataCnt(search_str, pageNum){
    var request_url = "http://localhost:8000/record_cnt.php";
    var request_data = {search : search_str, page : pageNum};

    $.ajax({
        type : "GET",
        url : request_url,
        data : request_data,
        success : function (response){
            // // 記錄相應字串資料筆數
            var json = JSON.parse(response);
            var search_str_fileCnt;
            var search_time = String(json["attribute"]["time"]);
            var search_str_dataCnt = String(json["attribute"]["match_count"]);
            
            search_str_dataCnt = parseInt(search_str_dataCnt);
            search_str_fileCnt = search_str_dataCnt / 10;
            
            if(search_str_dataCnt > 0){
                var search_result = document.getElementById("search_result");
                search_result.className = "alert alert-success";
                search_result.innerText = "總計 " + search_str_dataCnt + " 項結果 (搜尋時間：" + search_time + " 秒)";
                search_result.style.visibility = "visible";
                document.getElementById("pagination").visibility = "visible";
                create_record(json["article"]);
                // 製作頁碼
                create_pagination(pageNum, search_str, search_str_fileCnt);
            }
            else{
                // 若相應數據為 0 ，則顯示 "無相關字詞" 訊息
                create_unfind_msg(search_time, search_str_dataCnt);
            }
        },
        error : function (err_msg){
            // table 顯示 server error 訊息
            // 通常是因為連線問題才導致
            create_server_error_msg();
        }
    });
}

function create_record(record_item){
    // 構建項目前，先將 table 中原本項目清除
    
    var recordCnt = record_item.length;
    
    var record_container = document.getElementById("record_container");
    var search_str = document.getElementById("search_bar").value;
    
    for(itemNum = 0; itemNum < recordCnt; itemNum++){
        var card_div = document.createElement("div");
        card_div.className = "container my-5 py-5 z-depth-1";
        card_div.style.backgroundColor = "white";
        
        var section = document.createElement("section");
        section.className = "px-md-4 dark-grey-text text-center text-lg-left";
        
        var row = document.createElement("div");
        var content_div = document.createElement("div");
        content_div.className = "col-lg-10 mb-4 mb-lg-0";
        
        var title = document.createElement("a");
        title.className = "font-weight-bold h3-responsive";
        title.style.color = "#40739e";
        title.append(highlight_title(search_str, record_item[itemNum]["title"]));
        title.href = record_item[itemNum]["url"];
        title.target = "_blank";
        
        var url = document.createElement("p");
        url.id;
        url.className = "font-weight-bolder text-truncate";
        url.style.color = "#10ac84";
        url.innerText = record_item[itemNum]["url"];
        
        var text = document.createElement("p");
        text.className = "text-muted";
        text.append(highlight_content(search_str, record_item[itemNum]["content"]));
        
        content_div.append(title);
        content_div.append(url);
        content_div.append(text);
        row.append(content_div);
        section.append(row);
        card_div.append(section);
        
        record_container.append(card_div);
    }
}

function create_unfind_msg(search_time, search_str_dataCnt){
    $("#pagination").empty();
    $("#record_container").empty();
    
    var search_result = document.getElementById("search_result");
    search_result.className = "alert alert-danger";
    search_result.innerText = "總計 " + search_str_dataCnt + " 項結果 (搜尋時間：" + search_time + " 秒)";
    search_result.style.visibility = "visible";
}

function create_server_error_msg(){
    $("#pagination").empty();
    $("#record_container").empty();
}

function interpret_str(search_str) {
    search_str = search_str.trim();
    search_str = search_str.replace(/\s+/g, " ");
    //search_str = search_str.replace(" ", ",");
    search_str = search_str.split(" ");
    for (i = 0; i < search_str.length; i++) {
        if (search_str[i][0] == '+') {
            search_str[i] = search_str[i].substr(1, search_str[i].length);
        }
    }
    
    return search_str;
}

function highlight_title(search_str, content){
    
    var content_block = document.createElement("div");
    
    var str_array = interpret_str(search_str);
    var indexArray = [];
    var tmpIndex;
    // search_str 可能在同一句子中出現很多次
    // 先進行第一次瀏覽，計算 search_str 出現次數 與 分別紀錄每個 search_str的開頭 index
    for (i = 0; i < str_array.length; i++) {
        var str_index = content.indexOf(str_array[i]);
        while(str_index != -1 && str_index < content.length){
            var object = {
                "index" : str_index,
                "key" : str_array[i]
            };
            indexArray.push(object);
            tmpIndex = str_index + str_array[i].length;
            str_index = content.indexOf(str_array[i], tmpIndex);
        }
    }
    indexArray.sort(function(a, b) {
        return a.index - b.index;
    });
    
    var startIndex = 0;
    var before_str;
    var hightlight_str;
    var rest_num = content.length;
    
    // 根據 indexArray 中記錄之內容，進行分段式的變色
    for(i = 0; i < indexArray.length; i++){
        before_str = document.createElement("span");
        before_str.innerText = content.substr(startIndex, indexArray[i].index - startIndex);
        content_block.append(before_str);
        
        hightlight_str = document.createElement("span");
        hightlight_str.innerText = indexArray[i].key;
        hightlight_str.style.fontWeight = "bold";
        hightlight_str.style.color = "#e74c3c";
        content_block.append(hightlight_str);

        rest_num -= (indexArray[i].index - startIndex + indexArray[i].key.length);
        startIndex = indexArray[i].index + indexArray[i].key.length;
    }
    
    // 印出最後一次 search_str 之後的內容
    if(rest_num > 0){
        before_str = document.createElement("span");
        before_str.innerText = content.substr(startIndex, rest_num);
        content_block.append(before_str);
    }
    
    return content_block;
}

function highlight_content(search_str, content) {
    var content_block = document.createElement("div");
    
    var str_array = interpret_str(search_str);
    var indexArray = [];
    var tmpIndex;
    
    // search_str 可能在同一句子中出現很多次
    // 先進行第一次瀏覽，計算 search_str 出現次數 與 分別紀錄每個 search_str的開頭 index
    for (i = 0; i < str_array.length; i++) {
        var str_index = content.indexOf(str_array[i]);
        while(str_index != -1 && str_index < content.length){
            var object = {
                "index" : str_index,
                "key" : str_array[i]
            };
            indexArray.push(object);
            tmpIndex = str_index + str_array[i].length;
            str_index = content.indexOf(str_array[i], tmpIndex);
        }
    }
    
    
    if (indexArray.length == 0){
        
        var key_in_title_block = document.createElement("div");
        var head_content = document.createElement("span");
        head_content.className = "text-truncate";
        head_content.innerText = content.substr(0, 30) + "...";
        key_in_title_block.append(head_content);
        return key_in_title_block;
    }
    indexArray.sort(function(a, b) {
        return a.index - b.index;
    });

    var boundary = 100;
    var close_to_boundary = 0;
    var boundary_1 = 0;
    var boundary_2 = 0;
    var tmp = 0;
    
    for (i = 1; i < indexArray.length; i++) {
         for (j = i - 1; j >= 0; j--) {
             tmp = indexArray[i].index - indexArray[j].index;
             if (tmp > close_to_boundary && tmp < boundary) {
                 close_to_boundary = tmp;
                 boundary_1 = j;
                 boundary_2 = i;
             }
         }
    }
    
    var backtrack = 25;
    var startIndex = indexArray[boundary_1].index - 1;
    for(backtrack_index = 0; backtrack_index < backtrack && startIndex > 0; backtrack_index++) {
        if (content[startIndex] == "。" || content[startIndex] == "，" || content[startIndex] == "." || content[startIndex] == "," || content[startIndex] == "\n") {
            startIndex++;
            break;
        }
        startIndex--;
    }
    var pretrack = 25;
    var endIndex = startIndex + boundary + indexArray[boundary_1].index;
    var before_str, hightlight_str;
    var rest_num = boundary + (indexArray[boundary_1].index - startIndex);
    
    for(i = boundary_1; i <= boundary_2; i++){
        before_str = document.createElement("span");
        before_str.innerText = content.substr(startIndex, indexArray[i].index - startIndex);
        content_block.append(before_str);
        
        hightlight_str = document.createElement("span");
        hightlight_str.innerText = indexArray[i].key;
        hightlight_str.style.fontWeight = "bold";
        hightlight_str.style.color = "#e74c3c";
        content_block.append(hightlight_str);

        rest_num -= (indexArray[i].index - startIndex + indexArray[i].key.length);
        startIndex = indexArray[i].index + indexArray[i].key.length;
    }

    if (boundary_1 == 0 && boundary_2 == 0) {
        before_str = document.createElement("span");
        before_str.innerText = content.substr(0, 10) +　"...";
        content_block.append(before_str);
    }
    else {
        if(rest_num > 0){
            before_str = document.createElement("span");
            before_str.innerText = content.substr(startIndex, rest_num) + "...";
            content_block.append(before_str);
        }
        else {
            before_str = document.createElement("span");
            before_str.innerText = "...";
            content_block.append(before_str);
        }
    }
    return content_block;
    
}

function create_pagination(cur_page, str, pageNum){
    $("#pagination").empty();
    
    if(pageNum > 10){
        create_pagination_list(1, 10, pageNum, cur_page, str);
    }
    else{
        create_pagination_list(1, pageNum, pageNum, cur_page, str);
    }
}

function create_pagination_list(startPage, endPage, totalPage, activePage, str){
    var li = document.createElement("li");
    var a = document.createElement("a");
    var span_1 = document.createElement("span");
    var span_2 = document.createElement("span");
    var page_list = document.getElementById("pagination");
    
    for(i = startPage; i <= endPage; i++){
        li = document.createElement("li");
        
        if (i == activePage){
            li.className = "page-item active";
        }
        else {
            li.className = "page-item";
        }
        a = document.createElement("a");
        a.className = "page-link page-num";
        a.href = "#block";
        var page_str = i + "_page";
        a.id = page_str;
        a.innerText = i;
        li.append(a);
        page_list.append(li);
    }
    
    $("#pagination li").click(function(){
        $("#record_container").empty();
        
        request_search_str_dataCnt(str, $(this).text());
        
        $("#pagination").empty();
        /* 重新製造頁碼 */
        var current_page = $(this).text();
        
        if(parseInt(current_page) + 4 <= totalPage){
            if (parseInt(current_page) - 4 >= 1){
                create_pagination_list(parseInt(current_page) - 4, parseInt(current_page) + 4, totalPage, current_page, str);
            }
            else{
                create_pagination_list(1, parseInt(current_page) + 4, totalPage, current_page, str);
            }
        }
        else{
            if (parseInt(current_page) - 4 >= 1){
                create_pagination_list(parseInt(current_page) - 4, totalPage, totalPage, current_page, str)
            }
            else{
                create_pagination_list(1, totalPage, totalPage, current_page, str);
            }
        }
    });
}

function weather_widget_1() {
    // 請求 php 的網址
    var request_url = "https://works.ioa.tw/weather/api/weathers/143.json";	
    
    $.ajax({
        type : "GET",
        url : request_url,
        success : function (response){
            //var json_data = JSON.parse(response);
            // 建構回傳之 table 項目
            document.getElementById("location_1_img").src = get_img(response["desc"]);
            document.getElementById("location_1_temp").innerText = response["temperature"] + " 度";
        }
    });
}

function weather_widget_2() {
    // 請求 php 的網址
    var request_url = "https://works.ioa.tw/weather/api/weathers/195.json";	
    
    $.ajax({
        type : "GET",
        url : request_url,
        success : function (response){
            //var json_data = JSON.parse(response);
            // 建構回傳之 table 項目
            document.getElementById("location_2_img").src = get_img(response["desc"]);
            document.getElementById("location_2_temp").innerText = response["temperature"] + " 度";
            document.getElementById("update_time").innerText = response["at"];
        }
    });
}

function get_img(desc) {
    console.log(desc);
    if (desc == "晴") {
        return "../icon/sun.png";
    }
    else if (desc == "陰" || desc == "多雲") {
        return "../icon/cloud.png";
    }
    else if (desc == "晴時多雲") {
        return "../icon/cloudy.png";
    }
    else if (desc == "晴時多雲偶陣雨") {
        return "../icon/sun_cloudy_rain.png";
    }
    else if (desc == "陣風" || desc == "強風") {
        return "../icon/windy.png";
    }
    else if (desc == "雨") {
        return "../icon/rain.png";
    }
    else if (desc == "大雨" || desc == "豪大雨") {
        return "../icon/heavy_rain.png";
    }
    else {
        return "../icon/cloudy.png";
    }
}

function tabnews_api() {
    var request_url = "http://www2.cs.ccu.edu.tw/~lcha105u/tabnews_server/all_news_page.php";
    
    $.ajax({
        type : "GET",
        data : 1,
        url : request_url,
        success : function (response){
            var json_data = JSON.parse(response);
            create_news_list(json_data);
        }
    });
}

function create_news_list(response) {
    $("#news_container").empty();
    var news_container = document.getElementById("news_container");
    document.getElementById("update_news_time").innerText = response[0]["news_times"];
    
    for (i = 0; i < response.length; i++) {
        var div = document.createElement("div");
        div.className = "text-truncate pl-0 mb-2";
        
        var title = document.createElement("a");
        title.innerText = response[i]["news_title"];
        title.color = "#222f3e";
        title.href = response[i]["news_url"];
        title.target = "_blank";
        
        div.append(title);
        news_container.append(div);
    }
}
var delay_time = 1000
var question_search = require('question_search.js');
var app_index_version_map = {
    "task_parent": [
        24, 11
    ],
    "task_status": [
        25, 12
    ],
    "tab_depth": [
        26, 16, 2
    ],
    "look": [
        13, 14
    ],
    "icon_id": [
        "lay_state_icon", "v_paused"
    ],
    "article_depth": [
        25, 5
    ],
    "video_depth": [
        25, 5
    ],
    "video_bar_depth": [
        16, 3
    ],
    "challenge_question": [
        25, 12
    ],
    "challenge_option": [
        28, 15
    ],
    "four_question": [
        28, 9
    ],
    "four_option": [
        32, 9
    ],
    "blank_depth": [
        25, 12
    ],
    "daily_choice_depth": [
        26, 13
    ],
    "daily_question_depth": [
        23, 10
    ]
}
var app_index_version = 1;

function my_click_non_clickable(target) {
    if (typeof (target) == 'string') {
        log("waitfor");
        text(target).waitFor();
        var tmp = text(target).findOne().bounds();
    } else {
        var tmp = target.bounds();
    }
    var randomX = random(tmp.left, tmp.right);
    var randomY = random(tmp.top, tmp.bottom);
    click(randomX, randomY);
}


function multiple_choice(answer) {
    var daily_choice_depth = app_index_version_map["daily_choice_depth"][app_index_version];
    var whether_selected = false;
    // options数组：下标为i基数时对应着ABCD，下标为偶数时对应着选项i-1(ABCD)的数值
    var options = className('android.view.View').depth(daily_choice_depth).find();
    for (var i = 1; i < options.length; i += 2) {
        if (answer.indexOf(options[i].text()) != -1) {
            // 答案正确
            my_click_non_clickable(options[i].text());
            // 设置标志位
            whether_selected = true;
        }
    }
    // 如果这里因为ocr错误没选到一个选项，那么则选择相似度最大的
    if (!whether_selected) {
        log("最大相似度匹配 start");
        var max_similarity = 0;
        var max_similarity_index = 1;
        for (var i = 1; i < options.length; i += 2) {
            var similarity = getSimilarity(options[i].text(), answer);
            if (similarity > max_similarity) {
                max_similarity = similarity;
                max_similarity_index = i;
            }
        }
        my_click_non_clickable(options[max_similarity_index].text());
        log("最大相似度匹配 end");
    }
}

function getSimilarity(str1, str2) {
    var sameNum = 0
    //寻找相同字符
    for (var i = 0; i < str1.length; i++) {
        for (var j = 0; j < str2.length; j++) {
            if (str1[i] === str2[j]) {
                sameNum++;
                break;
            }
        }
    }
    return sameNum / str2.length;
}

// 多选题是否全选
function is_select_all_choice() {
    var options_depth = app_index_version_map["daily_choice_depth"][app_index_version];
    var daily_question_depth = app_index_version_map["daily_question_depth"][app_index_version];
    // options数组：下标为i基数时对应着ABCD，下标为偶数时对应着选项i-1(ABCD)的数值
    var options = className('android.view.View').depth(options_depth).find();
    // question是题目(专项答题是第4个，其他是第2个)
    var question = (className('android.view.View').depth(daily_question_depth).findOnce(1).text().length > 2) ?
        className('android.view.View').depth(daily_question_depth).findOnce(1).text() :
        className('android.view.View').depth(daily_question_depth).findOnce(3).text();
    return options.length / 2 == (question.match(/\s+/g) || []).length;
}

var question = "111";
var options_text = ["a"];
var q_set = new Set();
q_set.has(question + options_text);
q_set.add(question + options_text);

log("q set:" + q_set.keys());

// app_index_version = 1;
// var tab_depth = app_index_version_map["tab_depth"][app_index_version];
// var localModel = className('android.widget.LinearLayout').depth(tab_depth).findOnce(15);

// var m =  text("思想").findOne().parent().parent().child(3);
// m.click();
var d = new Date();
log(d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate());
log("device height:" + device.height)
gesture(400, [200, 2000], [400, 100]);

var raw = "vvv这是明朝《cc永乐大典》ccc编者之一的姚广孝赞美江苏的诗句cccc";
var search = question_search.getAnswerText(raw);
console.log(search)

function search2(question) {
    var url = "https://www.hysgn.com/e/search/index.php";

    var keyboard = question
    var show = "title";
    var tempid = 1;
    var tbname = "news";
    var Submit = "搜索"

    var r2 = http.post(url, {
        "keyboard": keyboard,
        "show": show,
        "tempid": tempid,
        "tbname": tbname,
        "Submit": Submit
    });
    var body = r2.body.string();
    // console.log("body:" + r2.body);
    // var html = document.createElement('html');
    // html.innerHTML = body;
    // var bList = el.getElementsByTagName( 'b' );
    // console.log("b List:" + bList);
    var result = body.match(/f00.*<\/b/);
    result = result.toString().replace('f00\">', "");
    result = result.toString().replace('</b', "");
    result = result.toString().replace(/[A-z]、/, "");
    console.log("r:" + result);

}
var q = "马克思";
search2(q);



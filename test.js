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
        26, 2, 6
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
    if (typeof(target) == 'string') {
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

//8.飞书，中国古代法律术语，指","告状信，又称“投书”。
var c1 = "唐代诗人         曾经夜宿小山楼，留下诗作《题金陵渡》:“金陵津渡小山楼，一宿行人自可愁，潮落夜江斜月里，两三星火是瓜洲。”";
var c2 = "每年9月的第三个星期六为全民    "
question_search.getAnswerText(c2);


var questionModel = className('android.view.View').depth(23).drawingOrder(0).findOnce(1);
if (questionModel == null) {
    log("null");
}
var q = questionModel.text();
log("qqq:"+q);
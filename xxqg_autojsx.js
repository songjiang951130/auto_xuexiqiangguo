/** 代码模块化 */
var question_search = require('question_search.js');
var utils = require('utils.js');
var local_tv = require('local_tv.js');
var my_log = require('log.js');
my_log.config();

/* **********************请填写如下信息********************** */

/**
 * 跳转页面加载的时间(以毫秒为单位)
 * 默认为500ms，根据手机性能与网络情况自行而定
 * 时间越长出bug的可能越小，但同时耗费的时间越长
 *  */
var delay_time = 500;

/**
 * 选填，是否要使用微信消息推送功能
 * 如是 请填写pushplus的token，如何获取请见说明
 * topic 分组消息，可以进行组员消息推送
 *  */

var pushplus_token = [];
var pushplus_topic = [];
var lock_number = "";

var users = storages.create("user");
var app_index_version = 0;

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
        28, 16, 9
    ],
    "four_option": [
        32, 17, 9
    ],
    "two_option": [
        32, 19, 9
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


var start = new Date();

/* **********************请填写如上信息********************** */
utils.unlock(lock_number);
sleep(1000);

auto.waitFor();

// 将设备保持常亮 30分钟，应该能跑完脚本
device.keepScreenOn(30 * 60 * 1000);

//请求横屏截图权限
threads.start(function () {
    var beginBtn;
    if (beginBtn = classNameContains("Button").textContains("开始").findOne(1000));
    else (beginBtn = classNameContains("Button").textContains("允许").findOne(1000));
    beginBtn.click();
});
requestScreenCapture(false);
console.log("获取截图权限");

//强制关闭其他同名脚本
let currentEngine = engines.myEngine();
let runningEngines = engines.all();
let currentSource = currentEngine.getSource() + '';
if (runningEngines.length > 1) {
    runningEngines.forEach(compareEngine => {
        let compareSource = compareEngine.getSource() + '';
        if (currentEngine.id !== compareEngine.id && compareSource === currentSource) {
            compareEngine.forceStop();
        }
    });
}

/**
 * 定义HashTable类，用于存储本地题库，查找效率更高
 * 由于hamibot不支持存储自定义对象和new Map()，因此这里用列表存储自己实现
 * 在存储时，不需要存储整个question，可以仅根据选项来对应question，这样可以省去ocr题目的花费
 * 但如果遇到选项为special_problem数组中的模糊词，无法对应question，则需要存储整个问题
 */
var answer_question_map = [];

// 当题目为这些词时，题目较多会造成hash表上的一个index过多，此时存储其选项
var special_problem = '选择正确的读音 选择词语的正确词形 下列词形正确的是 下列词语字形正确的是 根据《中华人民共和国 补全唐代诗人 唐代诗人';

/**
 * hash函数
 * 6469通过从3967到5591中的质数，算出的最优值，具体可以看评估代码
 */
function hash(string) {
    var hash = 0;
    for (var i = 0; i < string.length; i++) {
        hash += string.charCodeAt(i);
    }
    return hash % 6469;
}

// 存入
function map_set(key, value) {
    var index = hash(key);
    if (answer_question_map[index] === undefined) {
        answer_question_map[index] = [
            [key, value]
        ];
    } else {
        // 去重
        for (var i = 0; i < answer_question_map[index].length; i++) {
            if (answer_question_map[index][i][0] == key) {
                return null;
            }
        }
        answer_question_map[index].push([key, value]);
    }
};

// 取出
function map_get(key) {
    var index = hash(key);
    if (answer_question_map[index] != undefined) {
        for (var i = 0; i < answer_question_map[index].length; i++) {
            if (answer_question_map[index][i][0] == key || answer_question_map[index][i][0].includes(key)) {
                return answer_question_map[index][i][1];
            }
        }
    }
    return null;
};

/**
 * 通过Http下载题库到本地，并进行处理，如果本地已经存在则无需下载
 */
// 本地存储数据
var storage = storages.create('data');
// 更新题库为
var answer_question_map_name = "answer_question_map_name";
storage.remove(answer_question_map_name);
if (!storage.contains(answer_question_map_name)) {
    // 使用 Github 文件加速服务：https://gh-proxy.com
    var answer_question_bank = http.get("https://gh-proxy.com/https://raw.githubusercontent.com/Mondayfirst/XXQG_TiKu/main/%E9%A2%98%E5%BA%93_%E6%8E%92%E5%BA%8F%E7%89%88.json");
    answer_question_bank = answer_question_bank.body.string();
    answer_question_bank = JSON.parse(answer_question_bank);

    for (var question in answer_question_bank) {
        var answer = answer_question_bank[question];
        if (special_problem.indexOf(question.slice(0, 7)) != -1) question = question.slice(question.indexOf('|') + 1);
        else {
            question = question.slice(0, question.indexOf('|'));
            question = question.slice(0, question.indexOf(' '));
            question = question.slice(0, 10);
        }
        map_set(question, answer);
    }

    storage.put(answer_question_map_name, answer_question_map);
    console.log("题库 更新完成")
} else {
    console.log("题库 跳过更新");
}

var answer_question_map = storage.get(answer_question_map_name);

/**
 * 模拟点击不可以点击元素
 * @param {UiObject / string} target 控件或者是控件文本
 */
function my_click_non_clickable(target) {
    if (typeof (target) == 'string') {
        text(target).waitFor();
        var tmp = text(target).findOne().bounds();
    } else {
        var tmp = target.bounds();
    }
    var randomX = random(tmp.left, tmp.right);
    var randomY = random(tmp.top, tmp.bottom);
    return click(randomX, randomY);
}

// 模拟点击可点击元素
function my_click_clickable(target) {
    text(target).waitFor();
    // 防止点到页面中其他有包含“我的”的控件，比如搜索栏
    if (target == '我的') {
        return id("comm_head_xuexi_mine").findOne().click();
    } else {
        return click(target);
    }
}

/**
 * 刷新页面
 * @param {boolean} orientation 方向标识 true表示从下至上 false表示从上至下
 */
function refresh(orientation) {
    if (orientation) swipe(device.width / 2, device.height * 13 / 15, device.width / 2, device.height * 2 / 15, utils.random_time(delay_time / 2));
    else swipe(device.width / 2, device.height * 6 / 15, device.width / 2, device.height * 12 / 15, utils.random_time(delay_time / 2));
    sleep(utils.random_time(delay_time * 2));
}

/**
 * 推送通知到微信
 * @param {string} account 账号
 * @param {string} score 分数
 */
function push_weixin_message(account, score) {
    if (score < 40) {
        return;
    }
    for (var t in pushplus_token) {
        var topic;
        if (pushplus_topic.length > t) {
            topic = pushplus_topic[t];
        }
        http.postJson(
            'http://www.pushplus.plus/send', {
            token: pushplus_token[t],
            title: '[' + account + ']今日获得' + score + '积分',
            content: '学习强国 账号名' + account + '今日已经获得' + score + '分',
            topic: topic
        }
        );
    }
}

/*
 *********************准备部分********************
 */
utils.back_track(2);
sleep(utils.random_time(delay_time));

/*
 *********************阅读部分********************
 */

// 把音乐暂停
media.pauseMusic();

/*
 **********我要选读文章与分享与广播学习*********
 */
var currentVolume = device.getMusicVolume();
// 打开电台广播
function listenFM() {
    var taskName = '视听学习时长';
    if (!text(taskName).exists()) {
        utils.back_track(2);
    }
    var score = text(taskName).findOne().parent().child(3).child(0).text();
    console.log(taskName + " score:" + score);
    if (score >= 6) {
        return;
    }
    device.setMusicVolume(0);
    var model = text(taskName).findOne().parent().child(4);
    model.click();

    sleep(utils.random_time(delay_time));
    my_click_clickable('电台');
    sleep(utils.random_time(delay_time));
    my_click_clickable('听广播');
    console.log("点击听广播")
    sleep(utils.random_time(delay_time));
    if (!textStartsWith("正在收听").exists()) {
        var icon_id = app_index_version_map["icon_id"][app_index_version];
        var v = id(icon_id).findOne();
        console.log("播放按钮获取成功")
        var lay_state_icon_pos = v.bounds();
        click(lay_state_icon_pos.centerX(), lay_state_icon_pos.centerY());
        sleep(utils.random_time(delay_time));
        var home_bottom = id('home_bottom_tab_button_work').findOne().bounds();
        click(home_bottom.centerX(), home_bottom.centerY());
    }
}

function closeFM() {
    var taskName = '视听学习时长';
    if (!text(taskName).exists()) {
        utils.back_track(2);
    }
    if (text(taskName).exists()) {
        var model = text(taskName).findOne().parent().child(4);
        model.click();
    }
    sleep(utils.random_time(delay_time));
    my_click_clickable('电台');
    sleep(utils.random_time(delay_time));
    my_click_clickable('听广播');
    sleep(utils.random_time(delay_time));
    if (!textStartsWith("最近收听").exists() && !textStartsWith("推荐收听").exists()) {
        // 换成通过text寻找控件
        textStartsWith("正在收听").waitFor();
        if (textStartsWith("正在收听").findOne().parent().child(1).child(0) != null) {
            textStartsWith("正在收听").findOne().parent().child(1).child(0).click();
        } else {
            id("v_playing").findOne().click();
        }
    }
}

function readArtcle() {
    utils.back_track(2);
    var taskName = '我要选读文章';
    var completed_read_count = text(taskName).findOne().parent().child(3).child(0).text();
    console.log(taskName + " score:" + completed_read_count);
    if (completed_read_count >= 12) {
        return;
    }

    utils.back_track(0);
    sleep(200);
    // 阅读文章次数
    var count = 0;
    var single_total_read = 63000;
    var titleSet = new Set();
    var article_depth = app_index_version_map["article_depth"][app_index_version];
    var need_count = (12 - completed_read_count) / 2 + 1;
    while (count < need_count) {
        console.log("开始阅读：need_count:%d count:%d", need_count, count)
        swipe(800, 2000, 800, 600, 1000);
        sleep(utils.random_time(delay_time));
        var articles = className("android.widget.TextView").id("general_card_title_id").depth(article_depth).drawingOrder(2).find();
        // console.log("找文章列表 length:", articles.length)

        if (articles.length == 0) {
            toast("未找到文章，进行刷新");
            refresh(true);
            sleep(utils.random_time(delay_time));
            continue;
        }

        for (var i = 0; i < articles.length; i++) {
            if (count >= need_count) {
                break;
            }
            if (titleSet.has(articles[i].text()) || articles[i].text().includes("朗读")
                || articles[i].text().includes("朗诵") || articles[i].text().includes("专题")
                || articles[i].text().includes("近平")
            ) {
                continue;
            }
            var cr = click(articles[i].text());
            //这里存在点击失败，但是进文章成功
            if (!cr && !textStartsWith("地方发布平台内容").depth(21).exists()) {
                // console.log("点击失败 " + articles[i].text());
                continue;
            }
            var use_time = 0;
            swipe(500, 1700, 500, 700, 500);
            sleep(Math.abs(single_total_read - use_time));
            console.log("阅读完成 count:", count, " i:", i, " title:", articles[i].text());
            titleSet.add(articles[i].text());
            count++;
            back();
        }
    }
}

/*
 **********视听学习、听学习时长*********
 */
function videoListenStudy() {
    var taskName = "视听学习"
    if (!text('视听学习').exists()) {
        utils.back_track(2);
    }
    // 已观看视频次数
    var score = text(taskName).findOne().parent().child(3).child(0).text();
    console.log(taskName + " score:" + score);
    if (score >= 6) {
        return;
    }
    var model = text(taskName).findOne().parent().child(4);
    model.click();
    var video_depth = app_index_version_map["video_depth"][app_index_version];
    var video_bar_depth = app_index_version_map["video_bar_depth"][app_index_version];

    sleep(utils.random_time(delay_time * 2));
    my_click_clickable('百灵');
    sleep(utils.random_time(delay_time));
    if (text("关闭").exists()) {
        click("关闭");
    }
    console.log("竖")
    my_click_clickable('竖');
    // 等待视频加载
    device.setMusicVolume(0);
    console.log("设置静音");
    sleep(utils.random_time(delay_time * 2));
    // 点击第一个视频
    var firstVideo = text("").findOne(300);
    if (firstVideo == null) {
        firstVideo = className('android.widget.FrameLayout').clickable(true).depth(video_depth).findOne();
    } else {
        log("查找首个视频失败");
    }
    var bound = firstVideo.bounds();
    click(bound.centerX(), bound.centerY());
    toast("点击第一个视频");
    sleep(utils.random_time(delay_time));
    console.log("completed_watch_count:" + score)
    while (score <= 6) {
        log("completed_watch_count:" + score);
        sleep(utils.random_time(delay_time / 2));
        var video_time_text = className('android.widget.TextView').clickable(false).depth(video_bar_depth).findOne().text();
        if (video_time_text == null) {
            sleep(200);
            continue;
        }
        // 当前视频的时间长度
        video_time_text = video_time_text.toString();
        if (video_time_text.search("当前网络未非WiFi网络") != -1 || video_time_text.search("当前为未非WiFi网络") != -1) {
            text("刷新重试").findOnce().click();
            sleep(200);
            video_time_text = className('android.widget.TextView').clickable(false).depth(video_bar_depth).findOne().text();
        }
        log("短视频时长:" + video_time_text);
        if (video_time_text == null || video_time_text == '') {
            sleep(200);
            continue;
        }
        var current_video_time = video_time_text.match(/\/.*/).toString().slice(1);
        //"竖线后内容，有空格| 01:20"
        log("短视频时长:" + current_video_time + " " + Number(current_video_time.slice(0, 3)));
        // 如果视频超过一分钟就跳过
        if (Number(current_video_time.slice(0, 3)) >= 1) {
            log("视频时长超过一分钟进行跳过");
            //下一步根据设备宽度来
            gesture(400, [200, 2000], [400, 100]);
            sleep(utils.random_time(delay_time));
            continue;
        }
        sleep(Number(current_video_time.slice(4)) * 1000 + 3000);
        score++;
    }
    back();
    sleep(1000);
    device.setMusicVolume(currentVolume);
}

/*
 *********************竞赛部分********************
 */
log("竞赛部分 start");

/** 
 * 选出选项
 * @param {answer} answer 答案
 * @param {int} depth_click_option 点击选项控件的深度，用于点击选项
 * @param {list[string]} options_text 每个选项文本
 */
function select_option(answer, depth_click_option, options_text) {
    // 注意这里一定要用original_options_text
    var option_i = options_text.indexOf(answer);
    // 如果找到答案对应的选项
    if (option_i != -1) {
        try {
            className('android.widget.RadioButton').depth(depth_click_option).clickable(true).findOnce(option_i).click();
            return;
        } catch (error) {
            log("点击失败" + error)
        }
    }

    // 如果运行到这，说明很有可能是选项ocr错误，导致答案无法匹配，因此用最大相似度匹配
    if (answer != null) {
        var max_similarity = 0;
        var max_similarity_index = 0;
        for (var i = 0; i < options_text.length; ++i) {
            if (options_text[i]) {
                var similarity = getSimilarity(options_text[i], answer);
                if (similarity > max_similarity) {
                    max_similarity = similarity;
                    max_similarity_index = i;
                }
            }
        }
        var op = className('android.widget.RadioButton').depth(depth_click_option).clickable(true).findOnce(max_similarity_index)
        if (op != null) {
            op.click();
        }

    } else {
        // 没找到答案，点击第一个
        log("ocr 失败，匹配不到，请检查代码");
        var op = className('android.widget.RadioButton').depth(depth_click_option).clickable(true).findOne(300);
        if (op != null) {
            op.click();
        }
    }
}

/**
 * @param {int} depth_click_option 点击选项控件的深度，用于点击选项
 * @param {string} question 问题
 * @param {list[string]} options_text 每个选项文本
 */
function do_contest_answer(depth_click_option, question, options_text) {
    var raw = question;
    question = question.slice(0, 10);
    // 如果是特殊问题需要用选项搜索答案，而不是问题
    if (special_problem.indexOf(question.slice(0, 7)) != -1) {
        log("special_problem:" + question.slice(0, 7));
        var original_options_text = options_text.concat();
        var sorted_options_text = original_options_text.sort();
        question = sorted_options_text.join('|');
    }
    // 从哈希表中取出答案
    var answer = map_get(question);
    // 如果本地题库没搜到，则搜网络题库
    if (answer == null) {
        var result = question_search.getAnswerText(question);
        if (!result) {
            result = question_search.getAnswerText(raw);
        }
        if (result) {
            log("答题 网络搜索 :" + result);
            select_option(result, depth_click_option, options_text);
        } else {
            log("答题 网络搜索失败");
            // 没找到答案，点击第一个
            var b = className('android.widget.RadioButton').depth(depth_click_option).clickable(true).findOnce();
            if (b != null) {
                b.click();
            } else {
                log("答题 网络搜索失败 未找到按钮");
            }
        }
    } else {
        select_option(answer, depth_click_option, options_text);
        log('答题 题库: ' + answer);
    }
}
/*
 ********************答题部分********************
 */
var blank_storge = storages.create("auto_xuexiqiangguo:blank");
// 填空题
function fill_in_blank(answer) {
    // 获取每个空
    var blank_depth = app_index_version_map["blank_depth"][app_index_version];
    var blanks = className('android.view.View').depth(blank_depth).find();
    for (var i = 0; i < blanks.length; i++) {
        // 需要点击一下空才能paste
        blanks[i].click();
        setClip(answer[i]);
        blanks[i].paste();
        // 需要缓冲
        sleep(500);
    }
}

function findBlankAnswer(tipsText, questionSlice) {
    for (var i in questionSlice) {
        if (typeof questionSlice[i] == "function" || !questionSlice[i]) {
            continue;
        }
        if (questionSlice[i] == "class com.stardust.automator.UiObjectCollection") {
            continue;
        }
        var q = questionSlice[i].text();
        if (q.includes("")) {
            break;
        }
        var q = questionSlice[i].text();
        tipsText = tipsText.replace(q, "");
        console.log("填空题解析res:" + tipsText);
        if (q.includes("出题")) {
            break;
        }
    }
    return tipsText;
}

/**
 * 视频题
 * @param {string} video_question 视频题问题
 * @returns {string} video_answer 答案
 */
function video_answer_question(video_question) {
    // 找到中文标点符号
    var punctuation_index = video_question.search(/[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/);
    video_question = video_question.slice(0, Math.max(5, punctuation_index));
    try {
        var video_result = http.get('https://www.365shenghuo.com/?s=' + encodeURI(video_question));
    } catch (error) { }
    var video_answer = video_result.body.string().match(/答案：.+</);
    if (video_answer) video_answer = video_answer[0].slice(3, video_answer[0].indexOf('<'));
    return video_answer;
}

/**
 * 用于下面选择题
 * 获取2个字符串的相似度
 * @param {string} str1 字符串1
 * @param {string} str2 字符串2
 * @returns {number} 相似度 
 */
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

// 选择题
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
    var isMultChoice = options.length / 2 == (question.match(/\s+/g) || []).length;
    console.log("多选题判断全选:" + isMultChoice);
    console.log("多选题文本:" + question);
    return isMultChoice;
}

function paddle_ocr_api(img) {
    /**
     * @see http://doc.autoxjs.com/#/AI
     * useSlim true 速度更快，false准确率高
     */
    var words_list = paddle.ocrText(img, 8, false);
    log("paddle ocr result:" + JSON.stringify(words_list));
    var question = "";
    var options_text = [];
    var options_str = "";
    var question_content_end = false;
    if (words_list) {
        // question是否读取完成的标志位
        var question_flag = false;
        for (var i in words_list) {
            if (!question_flag) {
                // 如果是选项则后面不需要加到question中
                if (words_list[i][0].match(/^[A-Z]/)) {
                    question_flag = true;
                }
                if (!question_flag) question += words_list[i];
            }
            // 这里不能用else，会漏读一次
            if (question_flag) {
                // 其他的就是选项了
                if (words_list[i].match("出题")) {
                    question_content_end = true;
                }
                if (!question_content_end) {
                    options_str = options_str + words_list[i];
                }

            }
        }
    }
    var options_array = options_str.split(/[A-Z]\./);
    for (var i in options_array) {
        var t = options_array[i].split(/[A-Z]/);
        for (var j in t) {
            if (t[j].length > 0) {
                options_text.push(t[j]);
            }
        }
    }
    question = question.replace(/\s*/g, "");
    question = question.replace(/,/g, "，");
    question = question.replace(/\d\./, "");
    return [question, options_text];
}

/**
 * 答题 每日
 * @param {int} number 需要做题目的数量
 */
function do_periodic_answer(number) {
    // 保证拿满分，如果ocr识别有误而扣分重来
    // flag为true时全对
    var flag = false;
    while (!flag) {
        sleep(utils.random_time(delay_time));
        // 局部变量用于保存答案
        var answer = "";
        var num = 0;
        for (num; num < number; num++) {
            if (text("登录").exists()) {
                var taskName = "每日答题";
                var model = text(taskName).findOne().parent().child(4);
                model.click();
                num = 0;
            }
            // 下滑到底防止题目过长，选项没有读取到
            swipe(500, 1700, 500, 500, utils.random_time(delay_time / 2));
            sleep(utils.random_time(delay_time));

            // 判断是否是全选，这样就不用ocr
            if (text('多选题').exists() && is_select_all_choice()) {
                // options数组：下标为i基数时对应着ABCD，下标为偶数时对应着选项i-1(ABCD)的数值
                var options = className('android.view.View').depth(26).find();
                for (var i = 1; i < options.length; i += 2) {
                    my_click_non_clickable(options[i].text());
                }

            } else if (className("android.widget.Image").exists() && text('填空题').exists()) {
                // 如果存在视频题
                var video_question = className("android.view.View").depth(24).findOnce(2).text();
                answer = video_answer_question(video_question);
                if (answer) {
                    fill_in_blank(answer);
                } else {
                    back();
                    my_click_clickable('退出');
                }

            } else {
                var try_web = try_web_query();
                if (try_web) {
                    sleep(utils.random_time(delay_time));
                    click("确定");
                    sleep(utils.random_time(delay_time));
                    continue;
                }
                my_click_clickable('查看提示');
                text('提示').waitFor();
                // 打开查看提示的时间
                sleep(1000);
                var tipsModel = text("提示").findOne().parent().parent().child(1).child(0);
                var tipsText = tipsModel.text();
                var pos = tipsModel.bounds();
                var sc = captureScreen();
                // var imageC = images.clip(sc, pos.left, pos.top, pos.width(), device.height - pos.top);
                var image = images.inRange(sc, '#800000', '#FF0000');
                var baidu_res = paddle_ocr_api(image);
                answer = baidu_res[0];
                var options_text = baidu_res[1];
                if (!answer) {
                    toastLog("未找到答案 ocr失败");
                    images.save(sc, "./image/fail.jpg");
                    images.save(image, "./image/fail_c.jpg");
                }
                log("answer:" + answer + " options_text:" + options_text);
                back();
                sleep(200);
                if (textContains('多选题').exists() || textContains('单选题').exists()) {
                    multiple_choice(answer);
                } else {
                    if (!answer) {
                        var questionSlice = className('android.view.View').depth(24).find();
                        answer = findBlankAnswer(tipsText, questionSlice);
                    }
                    fill_in_blank(answer);
                }
            }

            sleep(400);
            click('确定');
            sleep(utils.random_time(delay_time));
            // 如果错误（ocr识别有误）则重来
            if (text('下一题').exists() || text('完成').exists()) {
                // 如果视频题错误，则每周答题就不需要重新答
                if (restart_flag == 1 && className("android.widget.Image").exists()) {
                    if (text('下一题').exists()) click('下一题');
                    else click('完成');
                } else {
                    back();
                    my_click_clickable('退出');
                }
            }
            sleep(utils.random_time(delay_time * 2)); // 每题之间的过渡时间
        }
        if (num == number) flag = true;
    }
}

/**
 * 尝试从网站获取数据
 */
function try_web_query() {
    var questionModel = className('android.view.View').depth(23).drawingOrder(0).findOnce(1);
    if (questionModel == null) {
        return false;
    }
    var question = questionModel.text();

    var answer = question_search.getAnswerText(question);
    if (answer == null) {
        return false;
    } else {
        log("点击答案:" + answer + " end");
        var textModel = text(answer).findOne(1000);
        if (textModel == null) {
            return false;
        }
        return textModel.parent().child(0).click();
    }
}

/**
 * 处理访问异常
 */
function handling_access_exceptions() {
    // 在子线程执行的定时器，如果不用子线程，则无法获取弹出页面的控件
    var thread_handling_access_exceptions = threads.start(function () {
        while (true) {
            textContains("访问异常").waitFor();
            // 滑动按钮">>"位置
            idContains("nc_1_n1t").waitFor();
            var bound = idContains("nc_1_n1t").findOne().bounds();
            // 滑动边框位置
            text("向右滑动验证").waitFor();
            var slider_bound = text("向右滑动验证").findOne().bounds();
            // 通过更复杂的手势验证（先右后左再右）
            var x_start = bound.centerX();
            var dx = x_start - slider_bound.left;
            var x_end = slider_bound.right - dx;
            var x_mid = (x_end - x_start) * random(5, 8) / 10 + x_start;
            var back_x = (x_end - x_start) * random(2, 3) / 10;
            var y_start = random(bound.top, bound.bottom);
            var y_end = random(bound.top, bound.bottom);
            x_start = random(x_start - 7, x_start);
            x_end = random(x_end, x_end + 10);
            gesture(utils.random_time(delay_time) * 2, [x_start, y_start], [x_mid, y_end], [x_mid - back_x, y_start], [x_end, y_end]);
            sleep(utils.random_time(delay_time) * 2);
            if (textContains("刷新").exists()) {
                click("刷新");
                continue;
            }
            if (textContains("网络开小差").exists()) {
                click("确定");
                continue;
            }
            // 执行脚本只需通过一次验证即可，防止占用资源
            break;
        }
    });
    return thread_handling_access_exceptions;
}

/* 
处理访问异常，滑动验证
*/
handling_access_exceptions();

/*
 **********每日答题*********
 */
var restart_flag = 0;

function dauily() {
    if (!text("每日答题").exists()) {
        utils.back_track(2);
    }
    var taskName = "每日答题";
    console.log(taskName);
    var score = text(taskName).findOne().parent().child(3).child(0).text();
    console.log(taskName + " score:" + score);
    if (score >= 5) {
        return;
    }

    var model = text(taskName).findOne().parent().child(4);
    model.click();
    // 等待题目加载
    text('查看提示').waitFor();
    do_periodic_answer(5);
    my_click_clickable('返回');
}

/*
 **********挑战答题********* !finish_list[5]
 */
function challenge() {
    if (!text('登录').exists()) {
        utils.back_track(2);
    };
    var taskName = '挑战答题';
    var score = text(taskName).findOne().parent().child(3).child(0).text();
    console.log(taskName + " score:" + score);
    if (score >= 5) {
        return;
    }
    var model = text(taskName).findOne().parent().child(4);
    model.click();
    sleep(200);
    text("时事政治").findOne().click();
    sleep(200);

    var q_index = app_index_version_map["challenge_question"][app_index_version]; //12 26
    var o_index = app_index_version_map["challenge_option"][app_index_version];
    console.log("q_index:" + q_index + " o_index:" + o_index);
    sleep(utils.random_time(delay_time));

    className('android.view.View').depth(q_index).waitFor();
    //由于可以复活，所以5分满分加复活一次，就是6次
    var times = 6;
    // flag为true时挑战成功拿到6分
    var flag = false;
    while (!flag) {
        sleep(utils.random_time(delay_time * 3));
        var num = 0;
        while (num < times) {
            // 每题的过渡
            sleep(utils.random_time(delay_time * 2));
            if (textStartsWith("本次答题").exists()) {
                var txt = textStartsWith("本次答题").findOne().text();
                var score = txt.match(/\d+/);
                if (score >= 5) {
                    num = score;
                    flag = true;
                    break;
                }
            }
            // 如果答错，第一次通过分享复活
            if (text("立即复活").exists()) {
                click("立即复活");
                sleep(utils.random_time(delay_time * 3));
            }
            //复活后 第二次重新开局
            if (text('再来一局').exists()) {
                console.log("再来一局 b");
                num = 0;
                my_click_clickable('再来一局');
                break;
            }
            console.log("挑战答题 题目等待 num:" + num);
            // 题目
            className('android.view.View').depth(q_index).waitFor();
            var question = className('android.view.View').depth(q_index).findOne().text();
            // 截取到下划线前
            question = question.slice(0, question.indexOf(' '));
            // 选项文字列表
            var options_text = [];
            console.log("挑战答题 选项等待");
            className('android.widget.RadioButton').depth(o_index).clickable(true).waitFor();
            // 获取所有选项控件，以RadioButton对象为基准，根据UI控件树相对位置寻找选项文字内容
            var options = className('android.widget.RadioButton').depth(o_index).find();
            // 选项文本
            options.forEach((element, index) => {
                //挑战答题中，选项文字位于RadioButton对象的兄弟对象中
                options_text[index] = element.parent().child(1).text();
            });
            do_contest_answer(o_index, question, options_text);
            num++; //这一步其实不准，
            sleep(utils.random_time(delay_time));
        }
        sleep(utils.random_time(delay_time));
        if (num >= times && !text('再来一局').exists() && !text('结束本局').exists()) {
            flag = true;
        }
    }
    // 随意点击直到退出
    do {
        sleep(utils.random_time(delay_time * 2.5));
        console.log("挑战完成 选第一个 start");
        var radio = className('android.widget.RadioButton').depth(o_index).findOne(3000);
        if (radio == null) {
            break;
        }
        radio.click();
        console.log("挑战完成 选第一个 end");
        sleep(utils.random_time(delay_time * 2.5));
    } while (!textStartsWith('本次答对').exists());
    click('结束本局');
    //此时会出现异常检查
    sleep(2000);
    textStartsWith('本次答对').waitFor();
    sleep(utils.random_time(delay_time));
    back();
}



function do_battle_contest(type) {
    console.log("do_battle_contest do_4_contest");
    var q_index = app_index_version_map["four_question"][app_index_version];
    var o_index = app_index_version_map["four_option"][app_index_version];
    if (type == 2) {
        o_index = app_index_version_map["two_option"][app_index_version];
    }

    var questionMap = new Map();
    var ocrFailTime = 0;
    while (!text('继续挑战').exists()) {
        if (text("开始比赛").exists()) {
            click("开始比赛");
        }
        className("android.view.View").depth(q_index).waitFor();
        console.log("do_battle_contest 题目加载");
        var pos = className("android.view.View").depth(q_index).findOne().bounds();
        console.log("do_battle_contest 选项加载");
        var options = className('android.widget.RadioButton').depth(o_index).clickable(true).findOne(20000);
        if (options == null) {
            break;
        }
        var rawImage = captureScreen();
        var img = images.inRange(rawImage, '#000000', '#444444');
        img = images.clip(img, pos.left, pos.top, pos.width(), pos.height());
        var result = paddle_ocr_api(img);
        var question = result[0];
        if (question == "") {
            ocrFailTime++;
            if (ocrFailTime >= 3) {
                var random = Math.round(Math.random());
                var b = className('android.widget.RadioButton').depth(o_index).clickable(true).findOnce(random);
                if (b != null) {
                    b.click();
                    ocrFailTime = 0;
                    sleep(2000);
                }
            }
            continue;
        }
        var options_text = result[1];

        console.log("do_battle_contest 题目: " + question + " 选项:" + options_text);
        var key = question + options_text;
        if (!options_text || options_text.length == 0) {
            var val = questionMap.get(key);
            val = val == null ? 0 : val;
            val++;
            questionMap.set(key, val);
            // saveOcrError("option4", rawImage, img);
            if (questionMap.get(key) < 3) {
                console.log("do_battle_contest 选项异常");
                continue;
            }
        }
        if (question) {
            do_contest_answer(o_index, question, options_text);
            //答完题后的休息时间
            sleep(1000);
        } else {
            var b = className('android.widget.RadioButton').depth(o_index).clickable(true).findOnce();
            if (b != null) {
                b.click();
            }
        }
        questionMap.set(key, 1);
    }
    console.log("do_battle_contest end");
}

function battleTwo() {
    sleep(utils.random_time(delay_time));

    if (!text("双人对战").exists()) {
        utils.back_track(2);
    }
    var score = text("双人对战").findOne().parent().child(3).child(0).text();
    console.log("双人对战得分:" + score);
    if (score > 0) {
        console.log("双人对战已做答");
        return;
    }
    text("双人对战").findOne().parent().child(4).click();
    text("随机匹配").waitFor();
    sleep(200);
    text("随机匹配").findOne().parent().child(0).click();
    do_battle_contest(2);
    sleep(200);
    if (text("继续挑战").exists()) {
        className("android.view.View").text("").findOne().click();
    }
    sleep(200);
    if (text("开始对战").exists()) {
        className("android.view.View").text("").findOne().click();
        text("退出").click();
    }
}


function battleFour() {
    console.log("四人赛");
    if (!text("四人赛").exists()) {
        utils.back_track(2);
    }
    var taskName = "四人赛";
    var score = text(taskName).findOne().parent().child(3).child(0).text();
    console.log(taskName + " score:" + score);
    var b1 = className("android.view.View").text("今日积分奖励局1/2").exists();
    var b2 = className("android.view.View").text("今日积分奖励局2/2").exists();
    if (!b1 && !b2) {
        return;
    }

    swipe(500, 1700, 500, 500, utils.random_time(delay_time / 2));
    var model = text("四人赛").findOne().parent().child(4);
    model.click();
    sleep(utils.random_time(delay_time));
    for (var i = 0; i < 2; i++) {
        sleep(utils.random_time(delay_time));
        if (i == 0) {
            my_click_clickable("开始比赛");
        } else {
            my_click_clickable("继续挑战");
            sleep(200);
        }
        do_battle_contest(4);
    }
    console.log("继续挑战start");
    if (text("继续挑战").exists()) {
        back();
    }
    console.log("继续挑战end");
    sleep(utils.random_time(delay_time));
    back();
}



/*
 **********发表观点*********
 */
function sendOpinion() {
    var taskName = "发表观点";
    console.log(taskName);
    var score = text(taskName).findOne().parent().child(3).child(0).text();
    console.log(taskName + " score:" + score);
    if (score > 0) {
        return;
    }
    var speechs = [
        "好好学习，天天向上",
        "大国领袖，高瞻远瞩",
        "请党放心，强国有我",
        "坚持信念，砥砺奋进",
        "团结一致，共建美好",
        "为人民谋幸福"
    ];

    sleep(utils.random_time(delay_time));
    if (!text('发表观点').exists()) {
        utils.back_track(2);
    }
    toastLog("评论获取用户名称");
    var model = text("发表观点").findOne().parent().child(4);
    model.click();

    // 随意找一篇文章
    sleep(utils.random_time(delay_time * 2));
    className("android.widget.TextView").text("文化").findOne().parent().click();
    sleep(utils.random_time(delay_time));
    var artcle = null;
    var c = false;
    while (!c) {
        swipe(500, 600, 500, 300, 300);
        artcle = id("general_card_title_id").findOnce();
        if (artcle == null || artcle.parent() == null || artcle.parent().parent() == null) {
            continue;
        }
        c = artcle.parent().parent().click();
    }
    sleep(utils.random_time(delay_time));

    console.log("等待欢迎发表你的观点");
    text('欢迎发表你的观点').waitFor();
    sleep(utils.random_time(delay_time));
    my_click_clickable("欢迎发表你的观点");
    console.log("等待欢迎发表你的观点 end");
    sleep(utils.random_time(delay_time));
    setText(speechs[random(0, speechs.length - 1)]);
    sleep(utils.random_time(delay_time));
    my_click_clickable('发布');
    sleep(utils.random_time(delay_time * 2));
    var userName = className("android.widget.TextView").text("我").findOne().parent().child(0).text();
    users.put("user", userName);
    my_click_clickable('删除');
    sleep(utils.random_time(delay_time));
    my_click_clickable('确认');
    sleep(utils.random_time(delay_time));
    back();
}

function pushMessage() {
    if (pushplus_token.length <= 0) {
        return;
    }

    utils.back_track(2);
    // 获取今日得分
    var score = textStartsWith('今日已累积').findOne().text();
    score = score.match(/\d+/);
    sleep(utils.random_time(delay_time));
    back();
    var userName = users.get("user");
    push_weixin_message(userName, score);
}



console.log("打开电台广播");
listenFM();
console.log("打开电台广播 end");

var startRead = new Date();
console.log("选读文章 start");
readArtcle();
console.log("选读文章 end" + (new Date() - startRead) / 1000 / 60);

utils.back_track(2);
local_tv.doTask();

closeFM();
console.log("关闭电台广播 end");

console.log("视听学习 start");
videoListenStudy();
console.log("视听学习 end");

log("每日答题 start");
dauily();
console.log("每日答题 end");
console.log("挑战答题");
challenge();
console.log("挑战答题end");
battleTwo();
battleFour();
console.log("发表观点 start");
sendOpinion();
console.log("发表观点 end");

pushMessage();


device.cancelKeepingAwake();

toastLog('脚本运行完成，时间：' + ((new Date() - start) / 1000 / 60 + "").slice(0, 4) + "分钟");
//起了线程的，加个这个进行退出
threads.shutDownAll();
/** 代码模块化 */
var question_search = require('question_search.js');

/* **********************请填写如下信息********************** */

/**
 * 跳转页面加载的时间(以毫秒为单位)
 * 默认为500ms，根据手机性能与网络情况自行而定
 * 时间越长出bug的可能越小，但同时耗费的时间越长
 *  */
var delay_time = 500;

/**
 * 之前的每周答题是否全部完成
 * 请填入"yes"或"no"(默认为"no")
 * 如果完成就不需要浪费时间向下搜索
 *  */
var all_weekly_answers_completed = "no";

/**
 * 之前的专项答题是否全部完成
 * 请填入"yes"或"no"(默认为"no")
 * 如果完成就不需要浪费时间向下搜索
 *  */
var all_special_answer_completed = "yes";

/**
 * 是否完成发表言论模块
 * 请填入"yes"或"no"(默认为"yes")
 *  */
var whether_complete_speech = "yes";

/**
 * 选填，是否要使用微信消息推送功能
 * 如是 请填写pushplus的token，如何获取请见说明
 *  */
var pushplus_token = [];

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

var lock_number = "";
var start = new Date();

/* **********************请填写如上信息********************** */

/*判断屏幕锁定，解锁屏幕（数字密码）*/
if (!device.isScreenOn() && lock_number) { //息屏状态将屏幕唤醒
    device.wakeUp();
    // 等待屏幕亮起
    sleep(1000);
    //向下滑动、展示输入密码页
    swipe(500, 30, 500, 1000, 300);
    sleep(400);
    //输入锁屏密码
    for (var l in lock_number) {
        desc(lock_number[l]).findOne().click();
        sleep(200);
    }
}

auto.waitFor()

// 将设备保持常亮 30分钟，应该能跑完脚本
device.keepScreenOn(30 * 60 * 1000);

// 本地存储数据
var storage = storages.create('data');
// 更新题库为
var answer_question_map_name = "answer_question_map_name";
storage.remove(answer_question_map_name);

//请求横屏截图权限
threads.start(function () {
    try {
        var beginBtn;
        if (beginBtn = classNameContains("Button").textContains("开始").findOne(delay_time));
        else (beginBtn = classNameContains("Button").textContains("允许").findOne(delay_time));
        beginBtn.click();
    } catch (error) { }
});
requestScreenCapture(false);
sleep(delay_time);

/**
 * 定义HashTable类，用于存储本地题库，查找效率更高
 * 由于hamibot不支持存储自定义对象和new Map()，因此这里用列表存储自己实现
 * 在存储时，不需要存储整个question，可以仅根据选项来对应question，这样可以省去ocr题目的花费
 * 但如果遇到选项为special_problem数组中的模糊词，无法对应question，则需要存储整个问题
 */

var answer_question_map = [];

// 当题目为这些词时，题目较多会造成hash表上的一个index过多，此时存储其选项
var special_problem = '选择正确的读音 选择词语的正确词形 下列词形正确的是 根据《中华人民共和国';

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
if (!storage.contains(answer_question_map_name)) {
    // 使用 Github 文件加速服务：https://gh-proxy.com
    var answer_question_bank = http.get("https://gh-proxy.com/https://raw.githubusercontent.com/Mondayfirst/XXQG_TiKu/main/%E9%A2%98%E5%BA%93_%E6%8E%92%E5%BA%8F%E7%89%88.json");
    // 如果资源过期或无法访问则换成别的云盘
    if (!(answer_question_bank.statusCode >= 200 && answer_question_bank.statusCode < 300)) {
        // 使用腾讯云
        var answer_question_bank = http.get("https://xxqg-tiku-1305531293.cos.ap-nanjing.myqcloud.com/%E9%A2%98%E5%BA%93_%E6%8E%92%E5%BA%8F%E7%89%88.json");
    }
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
    log("题库 更新完成")
} else {
    log("题库 跳过更新");
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
 * time 毫秒
 * 模拟随机时间
 */
function random_time(time) {
    return time + random(100, 1000);
}

/**
 * 刷新页面
 * @param {boolean} orientation 方向标识 true表示从下至上 false表示从上至下
 */
function refresh(orientation) {
    if (orientation) swipe(device.width / 2, device.height * 13 / 15, device.width / 2, device.height * 2 / 15, random_time(delay_time / 2));
    else swipe(device.width / 2, device.height * 6 / 15, device.width / 2, device.height * 12 / 15, random_time(delay_time / 2));
    sleep(random_time(delay_time * 2));
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
        http.postJson(
            'http://www.pushplus.plus/send', {
            token: pushplus_token[t],
            title: '[' + account + ']今日获得' + score + '积分',
            content: '学习强国 账号名' + account + '今日已经获得' + score + '分'
        }
        );
    }
}

/**
 * 如果因为某种不知道的bug退出了界面，则使其回到正轨
 * 全局变量back_track_flag说明:
 * back_track_flag = 0时，表示阅读部分
 * back_track_flag = 1时，表示视听部分
 * back_track_flag = 2时，表示竞赛、答题部分和准备部分
 */
function back_track() {
    app.launchApp('学习强国');
    var while_count = 0;
    while (!id('comm_head_title').exists() && while_count < 5) {
        //会存在app启动的情况
        sleep(5000);
        if (id('comm_head_title').exists()) {
            break;
        }
        while_count++;
        sleep(random_time(delay_time));
        if (text("退出").exists()) {
            click("退出");
            sleep(random_time(delay_time));
        }
        back();
        sleep(random_time(delay_time));
    }
    log("switch " + back_track_flag)
    switch (back_track_flag) {
        case 0:
            // 去中心模块
            toast("等待-中间按钮")
            var home_bottom_tab = "home_bottom_tab_button_work"
            id(home_bottom_tab).waitFor();
            sleep(random_time(delay_time));
            var home_bottom = id(home_bottom_tab).findOne().bounds();
            click(home_bottom.centerX(), home_bottom.centerY());
            // 去province模块
            sleep(random_time(delay_time));
            var tab_depth = app_index_version_map["tab_depth"][app_index_version];
            var localModel = className('android.widget.LinearLayout').depth(tab_depth).findOnce(15);
            toast("点击本地模块");
            localModel.click();
            break;
        case 1:
            //我的->学习积分
            id("comm_head_xuexi_mine").findOne().click();
            text('学习积分').waitFor();
            click("学习积分");
            text('登录').waitFor();
            break;
        case 2:
            id("comm_head_xuexi_score").findOne().click();
            text('登录').waitFor();
            break;
    }
}

/**
 * 获取各模块完成情况的列表、以及全局变量
 * 先获取有哪些模块还没有完成，并生成一个列表，其中第一个是我要选读文章模块，以此类推
 * 再获取阅读模块和视听模块已完成的时间和次数
 */

// 已阅读文章次数
var completed_read_count;
// 已观看视频次数
var completed_watch_count;
// 每周答题已得分
var weekly_answer_scored;
// 专项答题已得分
var special_answer_scored;
// 四人赛已得分
var four_players_scored;
// 双人对战已得分
var two_players_scored;
/**
 * 
 * @returns 
 */
function get_finish_list() {
    var child_index = 3;
    var finish_list = [];
    for (var i = 4; i < 16; i++) {
        var task_parent = app_index_version_map["task_parent"][app_index_version];
        var model = className('android.view.View').depth(task_parent).findOnce(i);
        if (model == null) {
            app_index_version++;
            i--;
            log("app版本:" + app_index_version);
            continue;
        }
        // log("model: " + model);
        log("task:" + (i - 4) + " " + model.child(0).text());
        if (i == 4) {
            completed_read_count = parseInt(model.child(child_index).child(0).text());
        } else if (i == 5) {
            completed_watch_count = parseInt(model.child(child_index).child(0).text());
        } else if (i == 16) {
            weekly_answer_scored = parseInt(model.child(child_index).child(0).text());
        } else if (i == 8) {
            special_answer_scored = parseInt(model.child(child_index).child(0).text());
            special_answer_scored = 8;
        } else if (i == 10) {
            four_players_scored = parseInt(model.child(child_index).child(0).text());
        } else if (i == 11) {
            two_players_scored = parseInt(model.child(child_index).child(0).text());
        }

        finish_list.push(model.child(4).text() == '已完成');
    }
    log("已完成情况:" + finish_list);
    return finish_list;
}

/*
 *********************准备部分********************
 */

var back_track_flag = 2;
back_track();
sleep(random_time(delay_time));
var finish_list = get_finish_list();

// 返回首页
/*
 **********本地频道*********
 */
// finish_list[10] = false;
if (!finish_list[10]) {
    log("进入本地");
    //14是本地
    while (!text("本地频道").exists()) {
        swipe(400, 200, 400, 800, 500);
    }
    var c = text("本地频道").findOne().parent().child(4).click();

    log("等待本地菜单:" + c);
    /**
     * 重庆学习平台、重庆农家书屋等数据
     */
    var tab_depth = app_index_version_map["tab_depth"][app_index_version];
    className('android.widget.LinearLayout').clickable(true).depth(tab_depth).waitFor();
    sleep(random_time(delay_time));
    var c2 = className('android.widget.LinearLayout').clickable(true).depth(tab_depth).findOne().click();
    log("等待本地菜单 点击:" + c2);

    sleep(random_time(delay_time));
    back();
}

/*
 *********************阅读部分********************
 */

// 把音乐暂停
media.pauseMusic();
var back_track_flag = 0;

/*
 **********我要选读文章与分享与广播学习*********
 */
var currentVolume = device.getMusicVolume();
// 打开电台广播

if (!finish_list[2]) {
    log("打开电台广播")
    device.setMusicVolume(0);
    //点击去看看
    click('去学习');
    sleep(random_time(delay_time));
    my_click_clickable('电台');
    sleep(random_time(delay_time));
    my_click_clickable('听广播');
    log("点击听广播")
    sleep(random_time(delay_time));
    if (!textStartsWith("正在收听").exists()) {
        var icon_id = app_index_version_map["icon_id"][app_index_version];
        var v = id(icon_id).findOne();
        log("播放按钮获取成功")
        var lay_state_icon_pos = v.bounds();
        click(lay_state_icon_pos.centerX(), lay_state_icon_pos.centerY());
        sleep(random_time(delay_time));
        var home_bottom = id('home_bottom_tab_button_work').findOne().bounds();
        click(home_bottom.centerX(), home_bottom.centerY());
    }
}
log("打开电台广播end");
if (!finish_list[4] && completed_read_count < 12) {
    log("选读文章 start")
    back_track_flag = 0;
    back_track();
    sleep(random_time(delay_time));

    // 阅读文章次数
    var count = 0;
    var single_total_read = 63000
    var titleSet = new Set();
    var article_depth = app_index_version_map["article_depth"][app_index_version];
    var need_count = (12 - completed_read_count) / 2 + 1;
    while (count < need_count) {
        log("开始阅读：need_count:{} count:{}", need_count, count)
        swipe(800, 2000, 800, 600, 2000);
        sleep(random_time(delay_time));
        var articles = id("general_card_title_id").className("android.widget.TextView").depth(article_depth).find();
        log("找文章列表 length:", articles.length)

        if (articles.length == 0) {
            toast("未找到文章，进行刷新");
            refresh(true);
            sleep(random_time(delay_time));
            continue;
        }

        for (var i = 0; i < articles.length; i++) {
            if (count >= need_count) {
                break;
            }
            if (titleSet.has(articles[i].text())) {
                log("已阅读+" + articles[i].text());
                continue;
            }
            if (articles[i].text().includes("朗读") || articles[i].text().includes("朗诵") || articles[i].text().includes("专题")) {
                log("跳过+" + articles[i].text());
                continue;
            }
            log("标题+:" + articles[i].text() + " index:" + i)
            var cr = click(articles[i].text());
            //这里存在点击失败，但是进文章成功
            if (!cr && !text("地方发布平台内容").exists()) {
                log("点击失败 " + articles[i].text());
                continue;
            }
            var use_time = 0;
            log("阅读中");
            swipe(500, 1700, 500, 700, 500);
            while (!text('点赞').exists()) {
                //向下滑动
                swipe(500, 1700, 500, 700, 3000);
                log("滑动中" + use_time);
                use_time += 3000;
                if (use_time > 20000) {
                    break;
                }
            }
            sleep(Math.abs(single_total_read - use_time));
            log("阅读完成 article length", articles.length, " i:", i, "title:", articles[i].text());
            titleSet.add(articles[i].text());
            count++;
            back();
        }
    }
}
log("选读文章 end");

/*
 *********************视听部分********************
 */

// 关闭电台广播
if (!finish_list[2]) {
    device.setMusicVolume(0);
    sleep(random_time(delay_time));
    my_click_clickable('电台');
    sleep(random_time(delay_time));
    my_click_clickable('听广播');
    sleep(random_time(delay_time));
    if (!textStartsWith("最近收听").exists() && !textStartsWith("推荐收听").exists()) {
        // 换成通过text寻找控件
        textStartsWith("正在收听").waitFor();
        if (textStartsWith("正在收听").findOne().parent().child(1).child(0) != null) {
            textStartsWith("正在收听").findOne().parent().child(1).child(0).click();
        } else {
            id("v_playing").findOne().click();
        }
    }
    sleep(random_time(delay_time));
    device.setMusicVolume(currentVolume);
}
log("关闭电台广播 end");

/*
 **********视听学习、听学习时长*********
 */
log("视听学习 start:" + finish_list[1]);
if (!finish_list[1]) {
    var video_depth = app_index_version_map["video_depth"][app_index_version];
    var video_bar_depth = app_index_version_map["video_bar_depth"][app_index_version];

    back_track_flag = 1;
    if (!id('comm_head_title').exists()) {
        back_track();
    }
    sleep(random_time(delay_time * 5));
    my_click_clickable('百灵');
    sleep(random_time(delay_time / 2));
    if (text("关闭").exists()) {
        log("关闭？？");
        click("关闭");
    }
    log("竖")
    my_click_clickable('竖');
    // 等待视频加载
    device.setMusicVolume(0);
    log("设置静音")
    // 点击第一个视频
    var firstVideo = text("").findOne(300);
    if (firstVideo == null) {
        firstVideo = className('android.widget.FrameLayout').clickable(true).depth(video_depth).findOne();
    }
    var bound = firstVideo.bounds();
    click(bound.centerX(), bound.centerY());
    toast("点击第一个视频");
    sleep(random_time(delay_time));
    log("completed_watch_count:" + completed_watch_count)
    while (completed_watch_count < 6) {
        log("completed_watch_count:" + completed_watch_count);
        sleep(random_time(delay_time / 2));
        var video_time_text = className('android.widget.TextView').clickable(false).depth(video_bar_depth).findOne().text();
        if (video_time_text.search("当前网络未非WiFi网络") != -1) {
            text("刷新重试").findOnce().click();
            sleep(200);
            video_time_text = className('android.widget.TextView').clickable(false).depth(video_bar_depth).findOne().text();
        }
        // 当前视频的时间长度
        video_time_text = video_time_text.toString();
        //&& text("刷新重试").findOnce() != null
        // log("短视频时长:" + video_time_text);
        var current_video_time = video_time_text.match(/\/.*/).toString().slice(1);
        //"竖线后内容，有空格| 01:20"
        log("短视频时长:" + current_video_time);
        // 如果视频超过一分钟就跳过
        if (Number(current_video_time.slice(0, 3)) >= 1) {
            refresh(true);
            sleep(random_time(delay_time));
            continue;
        }
        log("completed_watch_count:" + completed_watch_count)
        sleep(Number(current_video_time.slice(4)) * 1000 + 1000);

        completed_watch_count++;
    }
    sleep(1000);
    device.setMusicVolume(currentVolume);
    back();
}
log("视听学习 end");

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
        } catch (error) { }
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
        try {
            className('android.widget.RadioButton').depth(depth_click_option).clickable(true).findOnce(max_similarity_index).click();
            return;
        } catch (error) { }
    } else {
        try {
            // 没找到答案，点击第一个
            className('android.widget.RadioButton').depth(depth_click_option).clickable(true).findOne().click();
        } catch (error) { }
    }
}

/**
 * 答题（挑战答题、四人赛与双人对战）
 * @param {int} depth_click_option 点击选项控件的深度，用于点击选项
 * @param {string} question 问题
 * @param {list[string]} options_text 每个选项文本
 */
function do_contest_answer(depth_click_option, question, options_text) {
    question = question.slice(0, 10);
    // 如果是特殊问题需要用选项搜索答案，而不是问题
    if (special_problem.indexOf(question.slice(0, 7)) != -1) {
        var original_options_text = options_text.concat();
        var sorted_options_text = original_options_text.sort();
        question = sorted_options_text.join('|');
    }
    // 从哈希表中取出答案
    var answer = map_get(question);
    log("找到答案-哈希表 :" + answer)
    // 如果本地题库没搜到，则搜网络题库
    if (answer == null) {
        var result = question_search.getAnswerText(question);
        if (result) {
            select_option(result, depth_click_option, options_text);
        } else {
            log("找到答案-第一个");
            // 没找到答案，点击第一个
            var b = className('android.widget.RadioButton').depth(depth_click_option).clickable(true).findOnce();
            if (b != null) {
                b.click();
            } else {
                log("未找到按钮");
            }
        }
    } else {
        select_option(answer, depth_click_option, options_text);
        log('答案 题库: ' + answer);

    }
}
/*
 ********************答题部分********************
 */

back_track_flag = 2;

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

/**
 * 点击对应的去答题或去看看
 * @param {int} number 7对应为每日答题模块，以此类推
 */
function entry_model(number) {
    var task_parent = app_index_version_map["task_parent"][app_index_version];
    var model = className('android.view.View').depth(task_parent).findOnce(number);
    model.child(4).click();
}

function entry_text_model(model_text) {
    var model = text(model_text).parent();
    model.child(4).click();
}

/**
 * 如果错误则重新答题
 * 全局变量restart_flag说明:
 * restart_flag = 0时，表示每日答题
 * restart_flag = 1时，表示每周答题
 */
function restart() {
    // 点击退出
    sleep(random_time(delay_time));
    back();
    my_click_clickable('退出');
    switch (restart_flag) {
        case 0:
            text('登录').waitFor();
            entry_model(7);
            break;
        case 1:
            // 设置标志位
            if_restart_flag = true;
            // 等待列表加载
            text('本月').waitFor();
            // 打开第一个出现未作答的题目
            while (!text('未作答').exists()) {
                swipe(500, 1700, 500, 500, random_time(delay_time / 2));
            }
            text('未作答').findOne().parent().click();
            break;
    }
}

function paddle_ocr_api(img) {
    var question = "";
    var options_text = [];
    /**
     * @see http://doc.autoxjs.com/#/AI
     */
    var words_list = paddle.ocrText(img, 8, true);
    log("paddle ocr result:" + JSON.stringify(words_list))
    if (words_list) {
        // question是否读取完成的标志位
        var question_flag = false;
        for (var i in words_list) {
            if (!question_flag) {
                // 如果是选项则后面不需要加到question中
                if (words_list[i][0] == "A") question_flag = true;
                if (!question_flag) question += words_list[i];
            }
            // 这里不能用else，会漏读一次
            if (question_flag) {
                // 其他的就是选项了
                if (words_list[i][1] == '.') options_text.push(words_list[i].slice(2));
            }
        }
    }
    question = question.replace(/\s*/g, "");
    question = question.replace(/,/g, "，");
    question = question.slice(question.indexOf('.') + 1);
    question = question.slice(0, 6);
    log("question:" + question + " options_text:" + options_text)
    return [question, options_text]
}

/**
 * 答题（每日、每周、专项）
 * @param {int} number 需要做题目的数量
 */
function do_periodic_answer(number) {
    // 保证拿满分，如果ocr识别有误而扣分重来
    // flag为true时全对
    var flag = false;
    while (!flag) {
        sleep(random_time(delay_time));
        // 局部变量用于保存答案
        var answer = "";
        var num = 0;
        for (num; num < number; num++) {

            // 下滑到底防止题目过长，选项没有读取到
            swipe(500, 1700, 500, 500, random_time(delay_time / 2));
            sleep(random_time(delay_time));

            // 判断是否是全选，这样就不用ocr
            if (textContains('多选题').exists() && is_select_all_choice()) {
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
                    // 如果没搜到答案
                    // 如果是每周答题那么重做也没用就直接跳过
                    if (restart_flag == 1) {
                        fill_in_blank('cao');
                        sleep(random_time(delay_time * 2));
                        if (text('下一题').exists()) click('下一题');
                        if (text('确定').exists()) click('确定');
                        sleep(random_time(delay_time));
                        if (text('完成').exists()) {
                            click('完成');
                            flag = true;
                            break;
                        }
                    } else {
                        restart();
                        break;
                    }
                }

            } else {
                var try_web = try_web_query();
                if (try_web) {
                    sleep(random_time(delay_time));
                    click("确定");
                    sleep(random_time(delay_time));
                    continue;
                }
                my_click_clickable('查看提示');
                text('提示').waitFor();
                // 打开查看提示的时间
                sleep(1000);
                var tipsModel = text("提示").findOne().parent().parent().child(1).child(0);
                var pos = tipsModel.bounds();
                var sc = captureScreen();
                // var imageC = images.clip(sc, pos.left, pos.top, pos.width(), device.height - pos.top);
                var image = images.inRange(sc, '#800000', '#FF0000');
                var baidu_res = paddle_ocr_api(image);
                answer = baidu_res[0];
                var options_text = baidu_res[1];
                if (!answer) {
                    toast("未找到答案 ocr失败");
                    log("未找到答案 ocr失败");
                    images.save(sc, "./fail.jpg");
                    images.save(imageC, "./fail_c.jpg");
                    // exit();
                }
                log("answer:" + answer + " options_text:" + options_text);
                back();
                sleep(200);
                if (textContains('多选题').exists() || textContains('单选题').exists()) {
                    multiple_choice(answer);
                } else {
                    fill_in_blank(answer);
                }
            }

            sleep(400);
            // 对于专项答题没有确定
            if (text('下一题').exists()) {
                click('下一题');
            } else if (text("完成").exists()) {
                // 如果专项答题完成点击完成
                click("完成");
            } else {
                // 不是专项答题时
                click('确定');
                sleep(random_time(delay_time));
                // 如果错误（ocr识别有误）则重来
                if (text('下一题').exists() || (text('完成').exists() && !special_flag)) {
                    // 如果视频题错误，则每周答题就不需要重新答
                    if (restart_flag == 1 && className("android.widget.Image").exists()) {
                        if (text('下一题').exists()) click('下一题');
                        else click('完成');
                    } else {
                        restart();
                        break;
                    }
                }
            }

            sleep(random_time(delay_time * 2)); // 每题之间的过渡时间
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
            gesture(random_time(delay_time) * 2, [x_start, y_start], [x_mid, y_end], [x_mid - back_x, y_start], [x_end, y_end]);
            sleep(random_time(delay_time) * 2);
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
var thread_handling_access_exceptions = handling_access_exceptions();

/*
 **********每日答题*********
 */
var restart_flag = 0;

log("每日答题 start")
if (!finish_list[3]) {
    sleep(random_time(delay_time));
    if (!className('android.view.View').depth(22).text('学习积分').exists()) back_track();
    entry_model(7);
    // 等待题目加载
    text('查看提示').waitFor();
    do_periodic_answer(5);
    my_click_clickable('返回');
}
log("每日答题 end")

/*
 **********专项答题*********
 */

// 保存本地变量，如果已经做完之前的所有题目则跳过
if (!storage.contains("all_special_answer_completed_storage")) {
    storage.put("all_special_answer_completed_storage", "no");
}

// 保存本地变量，改变存储上次搜索未完成的题目所需时间，用于加速搜索
if (!storage.contains("quick_search_special_answer_time_storage")) {
    storage.put("quick_search_special_answer_time_storage", 0);
}

// 当该账号已完成专项答题，但配置没有转为yes时，也自动跳过
if (all_special_answer_completed == "no") {
    all_special_answer_completed = storage.get("all_special_answer_completed_storage");
}

if (!finish_list[4] && special_answer_scored < 8) {
    log("专项答题");
    sleep(random_time(delay_time));

    if (!className("android.view.View").depth(22).text("学习积分").exists()) back_track();
    entry_model(8);
    className("android.view.View").clickable(true).depth(23).waitFor();
    // 打开第一个出现未完成作答的题目
    // 第一个未完成作答的索引
    var special_i = 0;
    // 是否找到未作答的标志
    var special_flag = false;
    // 是否答题的标志
    var is_answer_special_flag = false;
    // 均速搜索次数（需要根据此更新加速搜索次数）
    var comm_search_special_answer_time = 0
    // 加速搜索次数
    var quick_search_special_answer_time = storage.get("quick_search_special_answer_time_storage");

    // 如果之前的答题全部完成则不向下搜索
    if (all_special_answer_completed == "yes") {
        special_flag = true;
    }
    while (!special_flag) {
        if (text("开始答题").exists()) {
            special_flag = true;
            break;
        }
        while (text("继续答题").findOnce(special_i)) {
            if (text("继续答题").findOnce(special_i).parent().childCount() < 3) {
                special_flag = true;
                break;
            } else {
                special_i++;
            }
        }
        // 根据上次搜索时间 加速搜索
        while (quick_search_special_answer_time > 0) {
            swipe(device.width / 2, (device.height * 13) / 15, device.width / 2, (device.height * 2) / 15, 100);
            quick_search_special_answer_time--;
        }
        if (!special_flag) {
            refresh(true);
            comm_search_special_answer_time++;
        }
        // 如果搜索到底部
        if (text("您已经看到了我的底线").exists()) {
            storage.put("all_special_answers_completed_storage", "yes");
            break;
        }
    }
    sleep(random_time(delay_time * 2));
    // 更新加速搜索次数
    if (storage.get("quick_search_special_answer_time_storage") == 0) {
        // 如果是第一次更新
        storage.put("quick_search_special_answer_time_storage", comm_search_special_answer_time);
    } else {
        var tmp = storage.get("quick_search_special_answer_time_storage");
        storage.put("quick_search_special_answer_time_storage", tmp + comm_search_special_answer_time);
    }


    if (text("开始答题").exists() || text("您已经看到了我的底线").exists()) {
        log("点击:" + "开始答题");
        text("开始答题").findOne().click();
        is_answer_special_flag = true;
        // 总题数
        className("android.view.View").depth(24).waitFor();
        sleep(random_time(delay_time));
        // 为兼容新版本新题只有5题，老版有10题
        var num_string = className("android.view.View").depth(24).findOnce(1).text();
        var total_question_num = parseInt(num_string.slice(num_string.indexOf('/') + 1));
        do_periodic_answer(total_question_num);
    } else if (text("继续答题").exists()) {
        log("点击:" + "继续答题");
        text("继续答题").findOnce(special_i).click();
        // 等待题目加载
        sleep(random_time(delay_time));
        is_answer_special_flag = true;
        className("android.view.View").depth(24).waitFor();
        sleep(random_time(delay_time));
        var num_string = className("android.view.View").depth(24).findOnce(1).text();
        // 已完成题数
        var completed_question_num = parseInt(num_string);
        // 总题数
        var total_question_num = parseInt(num_string.slice(num_string.indexOf('/') + 1));
        do_periodic_answer(total_question_num - completed_question_num + 1);
    } else {
        sleep(random_time(delay_time));
        className("android.view.View").clickable(true).depth(23).waitFor();
        className("android.view.View").clickable(true).depth(23).findOne().click();
    }

    if (is_answer_special_flag) {
        // 点击退出
        sleep(random_time(delay_time));
        className("android.view.View").clickable(true).depth(20).waitFor();
        className("android.view.View").clickable(true).depth(20).findOne().click();
        sleep(random_time(delay_time));
        className("android.view.View").clickable(true).depth(23).waitFor();
        className("android.view.View").clickable(true).depth(23).findOne().click();
    }
}

/*
 **********挑战答题********* !finish_list[5]
 */
log("挑战答题")
if (!finish_list[5]) {
    log("挑战答题start")
    var q_index = app_index_version_map["challenge_question"][app_index_version]; //12 26
    var o_index = app_index_version_map["challenge_option"][app_index_version];
    log("q_index:" + q_index + " o_index:" + o_index)
    sleep(random_time(delay_time));
    if (!text('挑战答题').exists()) back_track();
    entry_model(9);
    className('android.view.View').depth(q_index).waitFor();
    //由于可以复活，所以5分满分加复活一次，就是6次
    var times = 6;
    // flag为true时挑战成功拿到6分
    var flag = false;
    while (!flag) {
        sleep(random_time(delay_time * 3));
        var num = 0;
        while (num < times) {
            // 每题的过渡
            sleep(random_time(delay_time * 2));
            // 如果答错，第一次通过分享复活
            if (text("立即复活").exists()) {
                click("立即复活");
                sleep(random_time(delay_time * 3));
            }
            //复活后 第二次重新开局
            if (text('再来一局').exists()) {
                log("再来一局 b");
                num = 0;
                my_click_clickable('再来一局');
                break;
            }
            log("挑战答题 题目等待");
            // 题目
            className('android.view.View').depth(q_index).waitFor();
            var question = className('android.view.View').depth(q_index).findOne().text();
            // 截取到下划线前
            question = question.slice(0, question.indexOf(' '));
            // 选项文字列表
            var options_text = [];
            // 等待选项加载
            log("挑战答题 选项等待");
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
        }
        sleep(random_time(delay_time * 2));
        if (num == times && !text('再来一局').exists() && !text('结束本局').exists()) {
            flag = true;
        }
    }
    // 随意点击直到退出
    do {
        sleep(random_time(delay_time * 2.5));
        log("随意点击直到退出 b");
        var radio = className('android.widget.RadioButton').depth(o_index).findOne(300);
        if (radio == null) {
            break;
        }
        radio.click();
        log("随意点击直到退出 a");
        sleep(random_time(delay_time * 2.5));
    } while (!textStartsWith('本次答对').exists());
    click('结束本局');
    //此时会出现异常检查
    sleep(2000);
    textStartsWith('本次答对').waitFor();
    sleep(random_time(delay_time));
    back();
}
log("挑战答题end");

/*
 ********************双人对战********************
 */

function do_2_contest() {
    var q_index = app_index_version_map["four_question"][app_index_version];
    var o_index = app_index_version_map["two_option"][app_index_version];
    while (!text('继续挑战').exists()) {
        // 等待下一题题目加载
        log("双人赛 题目加载 等题目出现");
        className("android.view.View").depth(q_index).waitFor();
        var pos = className("android.view.View").depth(q_index).findOne().bounds();
        log("双人赛 题目加载 等答题按钮出现");
        className('android.widget.RadioButton').depth(o_index).clickable(true).waitFor();
        var rawImage = captureScreen();
        var img = images.inRange(rawImage, '#000000', '#444444');
        try {
            //图片剪切
            img = images.clip(img, pos.left, pos.top, pos.width(), device.height - pos.top);
            var result = paddle_ocr_api(img);
            var question = result[0];
            var options_text = result[1];
            if (question) {
                do_contest_answer(o_index, question, options_text);
            } else {
                log("选项加载 题目查找失败，选首个");
                className('android.widget.RadioButton').depth(o_index).findOne(200).click();
            }
        } catch (e) {
            log("选项加载 题目查找失败，选首个" + e);
            // className('android.widget.RadioButton').depth(o_index).findOne(200).click();
        }

    }
}

/**
 * 四人赛先加载题目再加载答案，而且是单选题，所以可以先题目识别，找到答案，答案一加载，就点击答案
 */
function do_4_contest() {
    log("四人赛 do_4_contest");
    var q_index = app_index_version_map["four_question"][app_index_version];
    var o_index = app_index_version_map["four_option"][app_index_version];
    while (!text('继续挑战').exists()) {
        log("四人赛题目加载 等答题按钮出现");
        className("android.view.View").depth(q_index).waitFor();
        var pos = className("android.view.View").depth(q_index).findOne().bounds();
        log("四人赛选项加载");
        className('android.widget.RadioButton').depth(o_index).clickable(true).findOne(2000);

        var img = images.inRange(captureScreen(), '#000000', '#444444');
        img = images.clip(img, pos.left, pos.top, pos.width(), device.height - pos.top);
        var result = paddle_ocr_api(img);

        var question = result[0];
        var options_text = result[1];

        log("题目: " + question);
        log("选项: " + options_text);
        if (question) {
            log("选项匹配");
            do_contest_answer(o_index, question, options_text);
        } else {
            log("选项加载 题目查找失败，选首个");
            var firstModel = className('android.widget.RadioButton').depth(o_index).findOne(200);
            if (firstModel != null) {
                firstModel.click();
            }
        }
    }
    log("四人赛 do_4_contest end");

}

/*
 **********四人赛*********
 && four_players_scored < 3
 */
if (!finish_list[6] && four_players_scored < 3) {
    log("四人赛");
    if (!text("四人赛").exists()) back_track();
    swipe(500, 1700, 500, 500, random_time(delay_time / 2));
    var model = textStartsWith("四人赛").findOne().parent().child(4);
    model.click();
    sleep(random_time(delay_time));
    var isPlay = textStartsWith("今日积分奖励局").exists();
    isPlay = true;
    if (isPlay) {
        sleep(random_time(delay_time));
        for (var i = 0; i < 2; i++) {
            //非积分局退出
            if (!textStartsWith("今日积分奖励局").exists()) {
                break;
            }
            sleep(random_time(delay_time));
            my_click_clickable("开始比赛");
            do_4_contest();
            if (i == 0) {
                sleep(random_time(delay_time * 2));
                my_click_clickable("继续挑战");
                sleep(random_time(delay_time));
            }
        }
        sleep(random_time(delay_time));
        back();
    } else {
        log("四人赛已完成跳过");
    }
    sleep(random_time(delay_time));
    back();
}

/*
 **********双人对战*********
 !finish_list[7] && two_players_scored < 1
 */
if (!finish_list[7] && two_players_scored < 1) {
    log("双人对战");
    sleep(random_time(delay_time));

    if (!text("双人对战").exists()) back_track();
    entry_model(11);

    // 点击随机匹配
    log("等待:" + "随机匹配");
    text("随机匹配").waitFor();
    sleep(random_time(delay_time * 2));
    text("随机匹配").findOne().parent().child(0).click();
    do_2_contest();
    sleep(random_time(delay_time));
    back();
    sleep(random_time(delay_time));
    back();
    my_click_clickable("退出");
}

/*
 **********发表观点*********
 */
log("发表观点 start")
if (!finish_list[9] && whether_complete_speech == "yes") {

    var speechs = [
        "好好学习，天天向上",
        // "大国领袖，高瞻远瞩",
        // "请党放心，强国有我",
        // "坚持信念，砥砺奋进",
        // "团结一致，共建美好",
        // "为人民谋幸福"
    ];

    sleep(random_time(delay_time));
    if (!text('发表观点').exists()) {
        back_track_flag = 2;
        back_track();
    }
    entry_model(13);
    // 随意找一篇文章
    sleep(random_time(delay_time * 2));
    className("android.widget.TextView").text("文化").findOne().parent().click();
    sleep(random_time(delay_time));
    var artcle = null;
    var c = false;
    while (!c) {
        swipe(500, 600, 500, 300, 600);
        log("滑动查找文章");
        artcle = id("general_card_title_id").findOnce();
        c = artcle.parent().parent().click();
        log("点击文章:" + artcle.text() + " c:" + c);
    }
    sleep(random_time(delay_time));

    log("等待欢迎发表你的观点");
    text('欢迎发表你的观点').waitFor();
    sleep(random_time(delay_time));
    my_click_clickable("欢迎发表你的观点");
    log("等待欢迎发表你的观点 end");
    sleep(random_time(delay_time));
    setText(speechs[random(0, speechs.length - 1)]);
    sleep(random_time(delay_time));
    my_click_clickable('发布');
    sleep(random_time(delay_time * 2));
    my_click_clickable('删除');
    sleep(random_time(delay_time));
    my_click_clickable('确认');
    sleep(random_time(delay_time));
    back();
}
log("发表观点 end");


if (pushplus_token) {
    back_track_flag = 1;
    back_track();
    // 获取今日得分
    var score = textStartsWith('今日已累积').findOne().text();
    score = score.match(/\d+/);
    sleep(random_time(delay_time));
    back();
    // 获取账号名
    var account = id('my_display_name').findOne().text();
    push_weixin_message(account, score);
}

device.cancelKeepingAwake();

log('脚本运行完成，时间：' + (new Date() - start) / 1000 / 60 + "分钟");

toast('脚本运行完成，时间：' + (new Date() - start) / 1000 / 60 + "分钟");
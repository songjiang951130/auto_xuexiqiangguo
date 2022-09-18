var delay_time = 1000
    // var utils = require('utils.js');
    // log("每日答题 start");
    // if (!false) {
    //     sleep(utils.random_time(delay_time));
    //     if (!className('android.view.View').depth(22).text('学习积分').exists()) utils.back_track(2);
    //     utils.entry_model(7);
    //     // 等待题目加载
    //     text('查看提示').waitFor();
    //     do_periodic_answer(5);
    //     click('返回');
    // }
    // log("每日答题 end");

// var articles = className('android.widget.FrameLayout').clickable(true).depth(4).drawingOrder(2).find();
// log(articles);
// var model = className('android.widget.TextView').depth(17).drawingOrder(1).findOnce(3);
// var c = model.click();
// log(c);
// log(model.text())



// function random_time(time) {
//     return time + random(100, 1000);
// }

// function handling_access_exceptions() {
//     // 在子线程执行的定时器，如果不用子线程，则无法获取弹出页面的控件
//     var thread_handling_access_exceptions = threads.start(function () {
//         while (true) {
//             textContains("访问异常").waitFor();
//             // 滑动按钮">>"位置
//             idContains("nc_1_n1t").waitFor();
//             var bound = idContains("nc_1_n1t").findOne().bounds();
//             // 滑动边框位置
//             text("向右滑动验证").waitFor();
//             var slider_bound = text("向右滑动验证").findOne().bounds();
//             // 通过更复杂的手势验证（先右后左再右）
//             var x_start = bound.centerX();
//             var dx = x_start - slider_bound.left;
//             var x_end = slider_bound.right - dx;
//             var x_mid = (x_end - x_start) * random(5, 8) / 10 + x_start;
//             var back_x = (x_end - x_start) * random(2, 3) / 10;
//             var y_start = random(bound.top, bound.bottom);
//             var y_end = random(bound.top, bound.bottom);
//             x_start = random(x_start - 7, x_start);
//             x_end = random(x_end, x_end + 10);
//             gesture(random_time(delay_time) * 2, [x_start, y_start], [x_mid, y_end], [x_mid - back_x, y_start], [x_end, y_end]);
//             sleep(random_time(delay_time));
//             if (textContains("刷新").exists()) {
//                 click("刷新");
//                 continue;
//             }
//             if (textContains("网络开小差").exists()) {
//                 click("确定");
//                 continue;
//             }
//             // 执行脚本只需通过一次验证即可，防止占用资源
//             break;
//         }
//     });
//     return thread_handling_access_exceptions;
// }

// handling_access_exceptions();
var text1 = ['2.拖拉机可以', '成市', '中心城区内', 'A.错误', 'B.正确', '一', '出题：“学习强国“学市'];
var text2 = ['1.鲁迅，原名周樟寿，后改为周树',
    '人。“鲁迅”是他1918年发表',
    '的',
    '所用的笔名，也是他影响最为广泛的',
    '笔名。',
    '《仿律》',
    '3',
    '《狂人日记》',
    'C',
    '《朝花夕拾》',
    'D.',
    '《内碱》'
];
var video_time_text = className('android.widget.TextView').clickable(false).depth(3).findOne().text();
log("短视频时长:" + video_time_text);
// var delay_time = 1000
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
var model = className('android.widget.TextView').depth(17).drawingOrder(1).findOnce(3);
var c = model.click();
log(c);
log(model.text())
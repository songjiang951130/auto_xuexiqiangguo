// // 模拟点击可点击元素
// function my_click_clickable(target) {
//     text(target).waitFor();
//     // 防止点到页面中其他有包含“我的”的控件，比如搜索栏
//     if (target == '我的') {
//         return id("comm_head_xuexi_mine").findOne().click();
//     } else {
//         return click(target);
//     }
// }
// function do_question() {
//     my_click_clickable('查看提示');
//     sleep(200);
//     var sc = captureScreen();
//     var tipsModel = text("提示").findOne().parent().parent().child(1).child(0);
//     var pos = tipsModel.bounds();
//     sc = images.clip(sc, pos.left, pos.top, pos.width(), device.height - pos.top);
//     sc = images.inRange(sc, '#800000', '#FF0000');
//     images.save(sc, "./range3.jpg");
//     var text3 = paddle.ocrText(sc, 8, true);
//     log(text3);
// }

// //请求横屏截图权限
// threads.start(function () {
//     try {
//         var beginBtn;
//         if (beginBtn = classNameContains("Button").textContains("开始").findOne(delay_time));
//         else (beginBtn = classNameContains("Button").textContains("允许").findOne(delay_time));
//         beginBtn.click();
//     } catch (error) { }
// });
// sleep(2000);
// requestScreenCapture(false);
// do_question();


function paddle_ocr_api(words_list) {
    var question = "";
    var options_text = [];
    var options_str = "";
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
                options_str = options_str + words_list[i];
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
    log("options_text:" + options_text);
    question = question.replace(/\s*/g, "");
    question = question.replace(/,/g, "，");
    question = question.replace(/\d\./, "");
    return [question, options_text];
}
var words_list = [
    ["2.先秦诸子散文中，以", "援引神", "话最多。", "A", "《韩非子》", "B.", "《墨子》", "C.", "《孟子》", "D.", "《庄子》"],
    ["2.先秦诸子散文中，以", "援引神", "话最多。", "A《韩非子》", "B.", "《墨子》", "C", "《孟子》", "D.", "《庄子》"],
];
words_list.forEach(function (v) {
    var res = paddle_ocr_api(v);
    log(res);
})



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
function do_question() {
    my_click_clickable('查看提示');
    sleep(200);
    var sc = captureScreen();
    var tipsModel = text("提示").findOne().parent().parent().child(1).child(0);
    var pos = tipsModel.bounds();
    sc = images.clip(sc, pos.left, pos.top, pos.width(), device.height - pos.top);
    sc = images.inRange(sc, '#800000', '#FF0000');
    images.save(sc, "./range3.jpg");
    var text3 = paddle.ocrText(sc, 8, true);
    log(text3);
}

//请求横屏截图权限
threads.start(function () {
    try {
        var beginBtn;
        if (beginBtn = classNameContains("Button").textContains("开始").findOne(delay_time));
        else (beginBtn = classNameContains("Button").textContains("允许").findOne(delay_time));
        beginBtn.click();
    } catch (error) { }
});
sleep(2000);
requestScreenCapture(false);
do_question();
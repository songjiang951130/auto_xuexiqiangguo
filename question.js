function do_question() {
    //请求横屏截图权限
    threads.start(function() {
        try {
            var beginBtn;
            if (beginBtn = classNameContains("Button").textContains("开始").findOne(delay_time));
            else(beginBtn = classNameContains("Button").textContains("允许").findOne(delay_time));
            beginBtn.click();
        } catch (error) {}
    });
    requestScreenCapture(false);
    sleep(2000);
    var sc = captureScreen();
    var tipsModel = text("提示").findOne().parent().parent().child(1).child(0);
    var pos = tipsModel.bounds();
    sc = images.clip(sc, pos.left, pos.top, pos.width(), device.height - pos.top);
    sc = images.inRange(sc, '#800000', '#FF0000');
    images.save(sc, "./range3.jpg");
    var text3 = paddle.ocrText(sc, 8, true);
    log(text3);
}

do_question();
function do_question() {
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
    sleep(2000);
    var rawImage = captureScreen();
    
    var tipsModel = text("提示").findOne().parent().parent().child(1).child(0);
    // var tipsModel = className("android.view.View").depth("23").clickable(true).findOne();
    log(tipsModel);
    var tipsBounds = tipsModel.bounds();
    log(tipsBounds);
    var text2 = tipsModel.text();
    log("text:" + text2);
    images.save(rawImage, "./num_not_found2.jpg");
    var img = images.inRange(rawImage, '#800000', '#FF0000');
    images.save(img, "./range2.jpg");
    img = images.clip(img, tipsBounds.left, tipsBounds.top, tipsBounds.right, tipsBounds.bottom);
    images.save(img, "./range3.jpg");
    var text3 = paddle.ocrText(img, 8, true);
    log(text3);
}

do_question();
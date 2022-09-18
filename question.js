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
className("android.view.View").depth(28).waitFor();
log("题目加载 等答题按钮出现");
log("clid:" + className("android.view.View").depth(28).findOne().child(1).text());
var pos = className("android.view.View").depth(28).findOne().bounds();
//识别范围中的题目文字
var rawImage = captureScreen();
var img = images.inRange(captureScreen(), '#000000', '#444444');
img = images.clip(img, pos.left, pos.top, pos.width(), device.height - pos.top);
var text = paddle.ocrText(img, 4, true);
log(text);
className('android.widget.RadioButton').depth(32).clickable(true).waitFor();

var question = result[0];
var options_text = result[1];

log("题目: " + question);
log("选项: " + options_text);
if (question) {
    log("选项匹配");
    do_contest_answer(32, question, options_text);
} else {
    log("选项加载 题目查找失败，选首个");
    className('android.widget.RadioButton').depth(32).findOne().click();
}
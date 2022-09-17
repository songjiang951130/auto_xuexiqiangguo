className("android.view.View").depth(28).waitFor();
log("题目加载 等答题按钮出现");
var questionPos = className("android.view.View").depth(28).findOne().bounds();
//识别范围中的题目文字


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
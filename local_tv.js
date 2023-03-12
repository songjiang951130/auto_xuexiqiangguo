var localTV = {};
localTV.doTask = function () {
    var taskName = "本地频道";
    console.log(taskName);
    var score = text(taskName).findOne().parent().child(3).child(0).text();
    console.log(taskName+" score:"+score);
    if(score > 0){
        return;
    }
    text(taskName).findOne().parent().child(4).click();
    sleep(500);
    var tab_depth = 27;
    var c = textEndsWith("学习平台").depth(tab_depth).findOne().bounds();
    click(c.centerX(), c.centerY());
    sleep(200);
    back();
}
module.exports = localTV;
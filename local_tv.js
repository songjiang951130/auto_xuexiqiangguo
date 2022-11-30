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
    var tab_depth = 26;
    className('android.widget.LinearLayout').clickable(true).depth(tab_depth).waitFor();
    className('android.widget.LinearLayout').clickable(true).depth(tab_depth).drawingOrder(1).findOne().click();
    sleep(500);
    back();
}

module.exports = localTV;
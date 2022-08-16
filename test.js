// 获取今日得分
function getTotalScore() {
    var total = textStartsWith("成长总积分").findOne().parent().child(3).text();
    // var b = c.child(0).findOne().text();
    console.log("cc:", c)
}


function findArticle() {
    var articles = id("general_card_title_id").className("android.widget.TextView").find();

}

function refresh(orientation) {
    if (orientation) swipe(device.width / 2, device.height * 13 / 15, device.width / 2, device.height * 2 / 15, random_time(delay_time / 2));
    else swipe(device.width / 2, device.height * 6 / 15, device.width / 2, device.height * 12 / 15, random_time(delay_time / 2));
    sleep(random_time(delay_time * 2));
}


function read(article) {
    click(article.bounds().centerX(), article.bounds().centerY());
    article.text
    var use_time = 0;
    while (!text('提醒').exists() || !text('点赞').exists()) {
        //向下滑动
        swipe(500, 1700, 500, 500, 2000);
        use_time += 2000;
    }
    log("本次滑动时间：", use_time)
    sleep(single_total_read - use_time);
    back();
}

// var single_total_read = 13000;
// findArticle();
// swipe(500, 1700, 500, 300, 1000);
// findArticle();
// swipe(500, 1700, 500, 300, 1000);
// findArticle();
// swipe(500, 1700, 500, 300, 1000);
// findArticle();
var articles = id("general_card_title_id").className("android.widget.TextView").find();

log(articles[0]);
log("x:", articles[0].bounds().centerX(), " y:", articles[0].bounds().centerY())
log("left:", articles[0].bounds().left, " top:",articles[0].bounds().top," right:",articles[0].bounds().right," bottom: ",articles[0].bounds().bottom)
click(articles[0].bounds().left, articles[0].bounds().top)
log("end")
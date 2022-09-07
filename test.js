// 获取今日得分
function getTotalScore() {
    var total = textStartsWith("成长总积分").findOne().parent().child(3).text();
    // var b = c.child(0).findOne().text();
    console.log("cc:", c)
}


function findArticle() {
    var articles = id("general_card_title_id").className("android.widget.TextView").depth(25).find();
    console.log("length : ", articles.length);
    return articles;

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

// var articles = findArticle();

// console.log("length : ", articles.length);

var result = ">答案：D、碘</span></p>".match(/答案：.*</)
log("body:" + result);
var result = result[0].slice(5, result[0].indexOf('<'));
log("result: " + result);



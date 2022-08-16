// 获取今日得分
function getTotalScore() {
    var total = textStartsWith("成长总积分").findOne().parent().child(3).text();
    // var b = c.child(0).findOne().text();
    console.log("cc:", c)
}

function findArticle() {
    var article = id('general_card_title_id').findOne();
    log(article)
    article.click();
    log("article:", article.click())
}

findArticle();


log("end")
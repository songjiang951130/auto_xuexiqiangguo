/**
 * 处理访问异常
 */
 function handling_access_exceptions() {
    if (text("访问异常").exists()) {
        // 滑动按钮位置
        className('android.view.View').depth(10).clickable(true).waitFor();
        var pos = className('android.view.View').depth(10).clickable(true).findOnce(1).bounds();
        // 滑动框右边界
        className('android.view.View').depth(9).clickable(false).waitFor();
        var right_border = className('android.view.View').depth(9).clickable(false).findOnce(0).bounds().right;
        while (text("访问异常").exists() || text("刷新").exists()) {
            // 位置取随机值
            var randomX = random(pos.left, pos.right);
            var randomY = random(pos.top, pos.bottom);
            swipe(randomX, randomY, randomX + right_border, randomY, random(200, 400));
            press(randomX + right_border, randomY, 1000);
            sleep(500);
            // 需要开启新线程获取控件
            threads.start(function () {
                if (text("刷新").exists()) {
                    click('刷新');
                }
            });
        }
        // 执行脚本只需通过一次验证即可，通过后将定时器关闭
        threads.shutDownAll();
    }
    if (textContains("网络开小差").exists()) {
        click('确定');
    }
}

/* 
处理访问异常，滑动验证
*/
var id_handling_access_exceptions;
// 在子线程执行的定时器，如果不用子线程，则无法获取弹出页面的控件
var thread_handling_access_exceptions = threads.start(function () {
    // 每2秒就处理访问异常
    id_handling_access_exceptions = setInterval(handling_access_exceptions, 4000);
});
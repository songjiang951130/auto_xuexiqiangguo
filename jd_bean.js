auto.waitFor();
app.launchApp('京东');
toast("进入京东");
sleep(10000);
while (!className("android.view.View").desc("我的").exists()) {
    back();
    sleep(200);
}

toast("点击我的");
className("android.view.View").desc("我的").findOnce().click();
sleep(3000);
if (className("android.widget.TextView").text("京豆").exists()) {
    console.info("进入京豆");
    let b = className("android.widget.TextView").text("京豆").findOnce().bounds();
    console.hide();
    click(b.centerX(), b.centerY());
    sleep(6000);
    if (className("android.widget.TextView").text("去签到领京豆").exists()) {
        toast("去签到领京豆");
        let b = className("android.widget.TextView").text("去签到领京豆").findOnce().bounds();
        click(b.centerX(), b.centerY());
        sleep(5000);
        if (className("android.widget.TextView").text("签到领京豆").exists()) {
            let b = className("android.widget.TextView").text("签到领京豆").findOnce().bounds();
            click(b.centerX(), b.centerY());
        }
    } else {
        console.error("领取京豆失败！");
    }
} else {
    console.error("领取京豆失败！");
}
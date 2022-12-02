var task_parent = 11;

var utils = {};
utils.entry_model = function (number) {
    var model = className('android.view.View').depth(task_parent).findOnce(number);
    model.child(4).click();
}

utils.random_time = function (time) {
    return time + random(100, 1000);
}

utils.back_track = function (back_track_flag) {
    app.launchApp('学习强国');
    var while_count = 0;
    while (!id('comm_head_title').exists() && while_count < 5) {
        //会存在app启动的情况
        sleep(2000);
        if (id('comm_head_title').exists()) {
            break;
        }
        while_count++;
        sleep(200);
        if (text("退出").exists()) {
            click("退出");
            sleep(200);
        }
        back();
        sleep(200);
    }
    log("switch " + back_track_flag)
    switch (back_track_flag) {
        case 0:
            // 去中心模块
            toast("等待-中间按钮")
            var home_bottom_tab = "home_bottom_tab_button_work"
            id(home_bottom_tab).waitFor();
            sleep(200);
            var home_bottom = id(home_bottom_tab).findOne().bounds();
            click(home_bottom.centerX(), home_bottom.centerY());
            // 去province模块
            sleep(200);
            var m = text("思想").findOne().parent().parent().child(4);
            if (m.text() == '亮点') {
                m = m.parent().child(4);
            }
            m.click();
            break;
        case 1:
            //我的->学习积分
            id("comm_head_xuexi_mine").findOne().click();
            text('学习积分').waitFor();
            click("学习积分");
            text('登录').waitFor();
            break;
        case 2:
            id("comm_head_xuexi_score").findOne().click();
            text('登录').waitFor();
            break;
    }
}

utils.unlock = function (lock_number) {
    console.log("解锁");
    if (!lock_number) {
        return;
    }
    device.wakeUpIfNeeded();
    // 等待屏幕亮起
    sleep(1000);
    //向下滑动、展示输入密码页
    swipe(500, 30, 500, 1000, 300);
    sleep(400);
    if(!text("输入密码").exists()){
        return;
    }
    //输入锁屏密码
    for (var l in lock_number) {
        var c = lock_number[l]
        // console.log("password:"+lock_number[l]);
        // if(text(lock_number[l]).exists()){
        //     console.log("password:"+textContains(lock_number[l]).findOne().text()+ " exists");
        // }
        var ract = text(c).findOne().bounds();
        click(ract.centerX(), ract.centerY())
        sleep(200);
    }
}
module.exports = utils;
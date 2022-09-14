var delay_time = 500;
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
    sleep(this.random_time(delay_time * 3));
    var while_count = 0;
    while (!id('comm_head_title').exists() && while_count < 5) {
        while_count++;
        back();
        sleep(this.random_time(delay_time));
    }
    switch (back_track_flag) {
        case 0:
            // 去中心模块
            id('home_bottom_tab_icon_large').waitFor();
            sleep(this.random_time(delay_time));
            var home_bottom = id('home_bottom_tab_icon_large').findOne().bounds();
            click(home_bottom.centerX(), home_bottom.centerY());
            // 去province模块
            className('adnroid.view.ViewGroup').depth(15).waitFor();
            sleep(this.random_time(delay_time));
            className('android.view.ViewGroup').depth(15).findOnce(2).child(3).click();
            break;
        case 1:
            break;
        case 2:
            click('我的');
            sleep(this.random_time(delay_time));
            click('学习积分');
            sleep(this.random_time(delay_time));
            text('登录').waitFor();
            break;
    }
}
module.exports = utils;



//请求横屏截图权限
threads.start(function () {
    try {
        var beginBtn;
        if (beginBtn = classNameContains("Button").textContains("开始").findOne(1000));
        else (beginBtn = classNameContains("Button").textContains("允许").findOne(1000));
        beginBtn.click();
    } catch (error) {
        console.log(error);
    }
});
requestScreenCapture(false);
console.log("获取截图权限");
launchApp("支付宝");

app.startActivity({
    action: 'VIEW',
    data: 'alipays://platformapi/startapp?appId=60000002',
    packageName: "com.eg.android.AlipayGphone"
})
console.log("打开支付宝");

delay(random(1, 2));
energyHarvester();

/**
 * 申请截屏权限 个别系统需要每次都申请截图权限 子线程自动允许
 */
function requestScreenCapturePermision() {
    threads.start(function () {
        for (let i = 0; i < 100; i++) {
            if (textExists("立即开始")) {
                click("立即开始");
                threads.currentThread().interrupt();
            }
        }
    });
    if (!requestScreenCapture()) {
        toast("请允许截图权限后重试");
        exit();
    }
    captureScreen();
}

/**
 * 循环获取能量 随机延迟是为了看起来更像人。。。
 * 也许大家会有 为什么没有点击找能量代码的疑惑
 * 是因为经过我的测试 #ffc2ff01 这个颜色 不仅在能量球上面有 而且找能量按钮也有这个颜色！
 * 于是我只需要用一个找色循环就可以实现收取能量球与进入下一页面两个操作 是不是很牛呢？ 嘻嘻嘻
 */
function energyHarvester() {
    var regionArray1 = [device.width * 0.14, 300, device.width * 0.74, 600], regionArray2 = [device.width * 0.75, 1300];
    delay(random(0.2, 0.5));
    while (true) {
        var count = 0;
        while (true) {
            if (count > 50) {
                break;
            }
            delay(random(1, 2));
            if (clickPoint("#55B949", regionArray1, "收集能量 : ")) continue;
            else break;
            count++;
        }
        delay(1);
        if (clickPoint("#fffe8600", regionArray2, "点击找能量，进入下个好友的蚂蚁森林 : ")) {
            delay(2);
            continue;
        }
        console.info("森林能量收集完毕");
        break;
    }

    if (findViewByClassAndText("android.view.View", "立即开启"))
        rescueEnergy();

    console.log("退出支付宝");
    while (!(findViewByClassAndText("TextView", "扫一扫"))) {
        delayBack(1);
    }
    console.log("退出");
    back();
}

function clickPoint(color, regionArray, logString) {
    image = captureScreen();
    point = findColor(image, color, { threshold: 4, region: regionArray });
    if (point) {
        click(point.x, point.y);
        console.log(logString + point);
        return true;
    }
    return false;
}

/**
 * 拯救消失的能量球
 * 观察能量球下落过程  发现大致有五条下落轨道
 * 首先截图能量拯救页面  测量能量球直径150px(不知道别的手机会不会不一样)
 * 截图测量发现  能量球1s大约下落678px(1513-835)  就是1ms -> 0.67px  
 * 在五条轨道的范围内进行区域找色
 */
function rescueEnergy() {
    console.info("开始拯救消失的绿色能量");
    randomClickBounds(findViewByClassAndText("android.view.View", "立即开启"));
    delay(3);
    var image, point, time, offset = 0;
    var regionArray = [100, 800, 900, 150];
    var color = "#ff128900";
    do {
        image = captureScreen();
        point = findColor(image, color, { threshold: 4, region: regionArray });
    } while (!point);
    console.info("开始收取能量");
    var errorCount = 0;
    while (errorCount < 30) {
        time = Date.now();
        image = captureScreen();
        point = findColor(image, color, { region: regionArray });
        if (point && !className("View").text("送TA机会").findOnce()) {
            offset += 0.5;
            errorCount = 0;
            time = Date.now() - time;
            click(point.x, (point.y + time + 70 + offset));
            console.log("拯救能量 : " + point + " " + time + " " + offset);
            continue;
        }
        errorCount++;
    }
    console.info("拯救能量结束");
}


//↓↓↓ 下面是一些工具人方法 用来获取控件、点击、延时之类的
function findViewByClassAndId(name, viewId) {
    return className(name).id(viewId).findOne(1000);
}

function findViewByClassAndDesc(name, descStr) {
    return className(name).desc(descStr).findOne(1000);
}

function findViewByClassAndText(name, s) {
    return className(name).text(s).findOne(1000);
}

function randomDelayClick(t1, t2, view) {
    delay(random(t1, t2));
    randomClickBounds(view);
}

function randomClickBounds(view) {
    if (view) {
        bounds = view.bounds();
        return click(random(bounds.left, bounds.right), random(bounds.top, bounds.bottom));
    }
    console.log("randomClickBounds view == null");
    return false;
}

function delay(seconds) {
    sleep(1000 * seconds);
}

function delayBack(seconds) {
    delay(seconds);
    back();
}

function textExists(str) {
    return textContains(str).exists();
}

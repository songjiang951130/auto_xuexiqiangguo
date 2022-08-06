var user_name = "韶华成书"
var water_count = 66
var times = 1
// var user_name = "韶华成书"
// var count = 66
app.startActivity({
    action: 'VIEW',
    data: 'alipays://platformapi/startapp?appId=60000002',
    packageName: 'com.eg.android.AlipayGphone'
})
sleep(3000)
swipe(500, 1700, 500, 500, 600);
text('查看更多好友').waitFor();
click('查看更多好友')
swipe(500, 1700, 500, 500, 600);
text(user_name).waitFor();
click(user_name);
sleep(300)
click("浇水")
console.log("开始浇水")
click(water_count + "克")
textStartsWith(water_count).findOne().click()
var i = 0;
while (i < times) {
    click("送给 TA")
    console.log("第几次浇水,{}", i)
    i++;
}
console.log("浇水ok")
var delay_time = 1000

function my_click_non_clickable(target) {
    log("waitfor 1");
    if (typeof (target) == 'string') {
        log("waitfor");
        text(target).waitFor();
        var tmp = text(target).findOne().bounds();
    } else {
        var tmp = target.bounds();
    }
    var randomX = random(tmp.left, tmp.right);
    var randomY = random(tmp.top, tmp.bottom);
    log("cc");
    click(randomX, randomY);
}
log("start");
id("general_card_title_id");
log("start 1");
var artcle = null;
while(artcle == null){
    swipe(500, 600, 500, 300, 300);
    artcle = id("general_card_title_id").findOnce();
    log("start 2");
}
my_click_non_clickable(artcle);
log("end");

9223372036854775807 long 最大
373486521275711488
9223372036854775807
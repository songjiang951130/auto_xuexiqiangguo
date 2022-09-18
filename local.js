//查找本地模块
var tab_depth = 2;
var localModel = className('android.widget.LinearLayout').depth(tab_depth).findOnce(15);
toast("点击本地模块 name:" + localModel.child(0).text());
log("点击本地模块 name2:" + localModel.child(0).text());
localModel.click();
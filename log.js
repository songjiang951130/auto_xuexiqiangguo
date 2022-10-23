var my_log = {};

my_log.config = function() {
    var d = new Date();
    var dateString = d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
    log("name:" + dateString);
    console.setGlobalLogConfig({
        "file": "./logs/" + "xxqg_" + dateString + ".log",
    });
}
module.exports = my_log;
var my_log = {};

my_log.config = function () {
    var d = new Date();
    var dateString = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
    console.setGlobalLogConfig({
        "file": "./logs/" + "xxqg_" + dateString + ".log",
        "maxBackupSize": 1024,
        "maxFileSize": 1024 * 1024,
    });
}
module.exports = my_log;
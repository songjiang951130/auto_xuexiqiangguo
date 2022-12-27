/**
 * 题目搜索工具类
 */

var question_search = {};

function search2(question) {
    var url = "https://www.hysgn.com/e/search/index.php";

    var keyboard = question
    var show = "title";
    var tempid = 1;
    var tbname = "news";
    var Submit = "搜索"

    var r2 = http.post(url, {
        "keyboard": keyboard,
        "show": show,
        "tempid": tempid,
        "tbname": tbname,
        "Submit": Submit
    });
    var body = r2.body.string();
    var result = body.match(/f00.*<\/b/);
    if (result == null) {
        log("url2:" + 'https://www.hysgn.com/e/search/index.php ' + question);
        return result;
    }
    result = result.toString().replace('f00\">', "");
    result = result.toString().replace('</b', "");
    result = result.toString().replace(/[A-z]、/, "");
    console.log("r2:" + result);
    return result;
}

question_search.getAnswerText = function (question) {
    if (question == undefined || question == null || question == '') {
        return null;
    }
    // log("searh question-raw:" + question);

    //qustion 选取文本最多的
    question = question.replace(/\d\./, "");
    question = question.replace(",", "，");
    var q_list = question.split("，");
    question = "";
    q_list.forEach(element => {
        var blank_list = element.split("         ");
        blank_list.forEach(b_element => {
            question = b_element.length > question.length ? b_element : question;
        });
    });
    //补全唐代诗人王维《田园乐》诗句
    // 此网站只支持十个字符的搜索
    var r1 = http.get('http://www.syiban.com/search/index/init.html?modelid=1&q=' + encodeURI(question.slice(0, 10)));
    result = r1.body.string().match(/答案：.*</);
    // log("searh question:" + question + " r1:" + result);
    if (result == null) {
        log("url:" + 'http://www.syiban.com/search/index/init.html?modelid=1&q=' + encodeURI(question.slice(0, 10)));
        return search2(question);
    } else {
        var result = result[0].slice(5, result[0].indexOf('<'));
        result = result.replace(/、/, "");
        // log('searh res: ' + result);
        return result;
    }
}
module.exports = question_search;
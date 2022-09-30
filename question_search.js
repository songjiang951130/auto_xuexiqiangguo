/**
 * 题目搜索工具类
 */

var question_search = {};
question_search.getAnswerText = function (question) {
    if (question == undefined || question == null || question == '') {
        return null;
    }
    log("question raw:" + question);

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
    var r1 = http.get('http://www.syiban.com/search/index/init.html?modelid=1&q=' + encodeURI(question.slice(0, 6)));
    result = r1.body.string().match(/答案：.*</);
    log("question:" + question + " r1:" + result);
    if (result == null) {
        log("url:" + 'http://www.syiban.com/search/index/init.html?modelid=1&q=' + encodeURI(question.slice(0, 10)))
        toast('答案查询失败');
    } else {
        var result = result[0].slice(5, result[0].indexOf('<'));
        result = result.replace(/、/, "");
        log('答案 site: ' + result);
        return result;
    }
}
module.exports = question_search;
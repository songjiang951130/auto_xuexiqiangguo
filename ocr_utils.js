function paddle_ocr_api(img) {
    var question = "";
    var options_text = [];
    var words_list = paddle.ocrText(img, 4, true);
    log("paddle ocr result:" + JSON.stringify(words_list))
    if (words_list) {
        // question是否读取完成的标志位
        var question_flag = false;
        for (var i in words_list) {
            if (!question_flag) {
                // 如果是选项则后面不需要加到question中
                if (words_list[i][0] == "A") question_flag = true;
                if (!question_flag) question += words_list[i];
            }
            // 这里不能用else，会漏读一次
            if (question_flag) {
                // 其他的就是选项了
                if (words_list[i][1] == '.') options_text.push(words_list[i].slice(2));
            }
            // //直接把第一个带.的文本作为题目。文本连接后的完整题目对搜题的网站不好
            // if (words_list[i].includes('.') && !question_flag) {
            //     question = words_list[i].slice(question.indexOf('.'));
            //     question_flag = true;
            // }
        }
    }
    question = question.replace(/\s*/g, "");
    question = question.replace(/,/g, "，");
    question = question.slice(question.indexOf('.') + 1);
    question = question.slice(0, 6);
    log("question:" + question + " options_text:" + options_text)
    return [question, options_text]
}
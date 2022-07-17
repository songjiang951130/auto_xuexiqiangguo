var pushplus_token = ["99ab8953122344c9bfefdbbe591612fd", "183cda2f82d346fa858e8d7233f027f1"];
/**
 * 推送通知到微信
 * @param {string} account 账号
 * @param {string} score 分数
 */
function push_weixin_message(account, score) {
    for (var t in pushplus_token) {
        http.postJson(
            'http://www.pushplus.plus/send',
            {
                token: pushplus_token[t],
                title:'账号[' + account + ']今日获得' + score + '分',
                content: '学习强国 账号名' + account + '今日已经获得' + score + '分'
            }
        );
    }
}

push_weixin_message("sdf", 100)

toast('运行完毕');
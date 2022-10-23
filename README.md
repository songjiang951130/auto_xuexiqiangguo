# 目录

- [脚本声明](#脚本声明)
  - [脚本主要不同点说明](#脚本主要不同点说明)
- [功能说明](#功能说明)
- [使用说明](#使用说明)
  - [安装Autoxjs](##安装Autoxjs)
- [额外衍生脚本](#额外衍生脚本)
- [常见问题](#常见问题)
- [待编写](#待编写)
- [免责声明](#免责声明)

<!-- /code_chunk_output -->



如果脚本好用请star一下噢，你的star是我的动力！

# 脚本声明
首先感谢原作者的付出，原项目地址见fork，
**本脚本适用于安卓系统，请将强国软件换为2.33.0版本（[安装包](https://github.com/dundunnp/auto_xuexiqiangguo/blob/version-15.6/%E5%AE%89%E8%A3%85%E5%8C%85/v2.33.0)），高版本没有截图权限，这一点会造成无法OCR**。**如果因为bug或各种原因不得不终止脚本，请重新运行脚本，脚本会自动跳过已完成的部分**
**如果遇到bug问题，请先查看[常见问题](#常见问题)，如果没有找到类似问题或还是不行请提isuee给我，附带代码截图**
**因为本人是帮女朋友完成任务，对答题准确率上没有太高的要求(已经优化提高正确率了)，每日最高可得44分**

## 脚本主要不同点说明
1. 新增锁屏密码支持，为了定时跑脚本而做的数字密码，配置变量 ```lock_number``` 即可
2. OCR采用百度开源OCR飞浆，没有选择百度OCR部分免费的，在正确率上通过题目文本分析提高了一部分正确率，详情见 question_search.js 和 paddle_ocr_api方法
3. 做了多版本适配，发现app有好几套UI，所以在depth选取层数时会有问题，这个功能也在完善中
4. 减少配置项更加方便，直接拷贝到【脚本】目录下即可运行
5. 设置静音运行

# 功能说明
本脚本支持 【登录】【我要选读文章】、【视听学习】、【视听学习时长】、【每日答题】、【挑战答题】、【四人赛】、【双人对战】、【发表观点】、【本地频道】，不支持【专项答题】【订阅】【每周答题】（app废了该功能），【强国运动】需要授予app读取运动数据权限


# 使用说明

脚本仅可以在Autox.js上使用，OCR使用百度飞浆（弃用百度OCR虽然每月1000额度，但是经不住随便玩）

## 安装Autoxjs
历史科普，本来有个auto.js的，后来作者不再更新，出了个付费的pro版本，后来又有大神出了个免费开源的autox.js。
安装地址：[autox地址](https://github.com/kkevsekk1/AutoX/releases/)

将整个项目复制到【脚本】文件夹下，运行xxqg_autojsx.js即可
<div align=center>
<img src="https://raw.githubusercontent.com/songjiang951130/auto_xuexiqiangguo/master/image/unzip_index.jpg" width="300px" style="zoom:33%;" />
</div>
<div align=center>
<img src="https://raw.githubusercontent.com/songjiang951130/auto_xuexiqiangguo/master/image/index.jpg" width="300px" style="zoom:33%;" />
</div>
点击右三角运行按钮，脚本就开始运行了



**如果喜欢的话可以star一下噢，谢谢！**
<div align=center>
<img src="https://s3.bmp.ovh/imgs/2022/01/2fc8345bdc719323.png" alt="msedge_WRzp0mov3N"  width="300px" style="zoom:33%;" />
</div>

**pushplus_token**

请根据[官网](http://www.pushplus.plus/)指导，获取token


# 常见问题

Q1: 点击运行脚本没有反应，甚至连学习强国都没有打开

A: 
1. 请确保Autox.js已经打开**无障碍服务权限**

***

Q2: 在四人赛、双人对战正确率感人

A: 还在优化中，主要为了跑任务，而不是拿高分

***
Q3: 一直要求打开无障碍服务权限

A: 需要将app设置后台自动启动等条件，试试添加进入电池白名单，任务栏进行锁定

***
Q4: 除上面的问题

A: 请在[GitHub](https://github.com/songjiang951130/hamibot-auto_xuexiqiangguo/issues)或议题上提出问题，问题尽量详细，包含强国版本，错误描述、日志截图、视频等，这样对大家解决问题都快


# 下一步计划
## 进行多个版本适配，目前只支持 2.33版本

# 计划完成情况
## 挑战答题判题错误 已经修复稳定运行
## 提高答题正确率，目前发现截图的问题; 答完题后需要歇1.5秒左右进行ocr。优化文本识别等
## 修复四人赛和双人对战的截图问题



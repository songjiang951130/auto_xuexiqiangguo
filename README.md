# **停止更新了，脚本目前可用，日期：2022年10月5日**

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



如果喜欢的话可以star一下噢，谢谢！

# 脚本声明
首先感谢原作者的付出，原项目地址见fork，
**本脚本适用于安卓系统，请将强国软件换为2.33.0版本（[安装包](https://github.com/dundunnp/auto_xuexiqiangguo/blob/version-15.6/%E5%AE%89%E8%A3%85%E5%8C%85/v2.33.0)），高版本没有截图权限，这一点会造成无法OCR**。**如果因为bug或各种原因不得不终止脚本，请重新运行脚本，脚本会自动跳过已完成的部分**
**如果遇到bug问题，请先查看[常见问题](#常见问题)，如果没有找到类似问题或还是不行请反馈bug给我**
**因为本人是帮女朋友完成任务，对答题准确率上没有太高的要求，只要跑完任务即可每日40-42分不等，因此如果有想合作的小伙伴请在Github上一起完善项目**

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
历史科普，本来有个auto.js的，后来作者不再更新，出了个付费的pro，后来有人出了个免费开源的autox.js。为什么选择？问就是回答贫穷限制了我<br/>
安装地址：[地址](https://github.com/kkevsekk1/AutoX/releases/)

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
Q3: 为什么我按照步骤配置好了第三方ocr服务，但正确率还是跟本地ocr差不多

A: 首先检查配置信息是否在提高正确率上选择了是、其次检查配置信息是否正确

***
Q4: 一直要求打开无障碍服务权限

A: 需要将app设置后台自动启动等条件

***
Q5: 除上面的问题

A: 请在[GitHub](https://github.com/songjiang951130/hamibot-auto_xuexiqiangguo/issues)或议题上提出问题，问题尽量详细，包含图片（配置信息、学习强国主页等有助于了解问题的图片）或视频，这样对大家解决问题都快


# todo


# done
## 挑战答题判题错误 已经修复稳定运行
## 提高答题正确率，目前发现截图的问题; 答完题后需要歇1.5秒左右进行ocr。优化文本识别等



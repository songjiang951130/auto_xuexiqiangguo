/**
 *  appid: 1253381438	
 *  SecretId: AKIDCDzWoreCtW0HNGvOfjZBZjfNr8B0bz94
 *  SecretKey: kFZfaUDiz3tVt31mKekdIjwwiGaicIk3
 *  
 *  #接口文档使用文档
 *  https://console.cloud.tencent.com/api/explorer?Product=ocr&Version=2018-11-19&Action=GeneralAccurateOCR&SignVersion=
 *
 * {"Response":{"Angel":359.989990234375,"RequestId":"51ec45df-78e4-4220-a16a-3998545f39db","TextDetections":[{"AdvancedInfo":"{\"Parag\":{\"ParagNo\":1}}","Confidence":99,"DetectedText":"文字识别OCR","ItemPolygon":{"Height":56,"Width":329,"X":54,"Y":32},"Polygon":[{"X":54,"Y":32},{"X":383,"Y":32},{"X":383,"Y":88},{"X":54,"Y":88}],"WordCoordPoint":[],"Words":[]},{"AdvancedInfo":"{\"Parag\":{\"ParagNo\":2}}","Confidence":99,"DetectedText":"观看产品视频介绍","ItemPolygon":{"Height":22,"Width":137,"X":456,"Y":50},"Polygon":[{"X":456,"Y":50},{"X":593,"Y":50},{"X":593,"Y":72},{"X":456,"Y":72}],"WordCoordPoint":[],"Words":[]},{"AdvancedInfo":"{\"Parag\":{\"ParagNo\":3}}","Confidence":98,"DetectedText":"文字识别(Optical Character Recognition， OCR) 基于腾讯优图实验室世界领先的深度学习技术,","ItemPolygon":{"Height":26,"Width":862,"X":54,"Y":118},"Polygon":[{"X":54,"Y":118},{"X":916,"Y":118},{"X":916,"Y":144},{"X":54,"Y":144}],"WordCoordPoint":[],"Words":[]},{"AdvancedInfo":"{\"Parag\":{\"ParagNo\":3}}","Confidence":99,"DetectedText":"将图片上的文字内容， 智能识别成为可编辑的文本。OCR 支持身份证、名片等卡证类和票据类的印","ItemPolygon":{"Height":26,"Width":874,"X":53,"Y":153},"Polygon":[{"X":53,"Y":153},{"X":927,"Y":153},{"X":927,"Y":179},{"X":53,"Y":179}],"WordCoordPoint":[],"Words":[]},{"AdvancedInfo":"{\"Parag\":{\"ParagNo\":3}}","Confidence":99,"DetectedText":"刷体识别，也支持运单等手写体识别， 支持提供定制化服务， 可以有效地代替人工录入信息。","ItemPolygon":{"Height":25,"Width":810,"X":54,"Y":188},"Polygon":[{"X":54,"Y":188},{"X":864,"Y":188},{"X":864,"Y":213},{"X":54,"Y":213}],"WordCoordPoint":[],"Words":[]}]}}
 */
import { cvm } from "tencentcloud-sdk-nodejs";

// 导入对应产品模块的client models。
const CvmClient = cvm.v20170312.Client

// 实例化要请求产品(以cvm为例)的client对象
const client = new CvmClient({
  // 腾讯云认证信息
  credential: {
    secretId: "AKIDCDzWoreCtW0HNGvOfjZBZjfNr8B0bz94",
    secretKey: "kFZfaUDiz3tVt31mKekdIjwwiGaicIk3",
  },
  // 产品地域
  region: "ap-shanghai",
  // 可选配置实例
  profile: {
    signMethod: "TC3-HMAC-SHA256", // 签名方法
    httpProfile: {
      reqMethod: "POST", // 请求方法
      reqTimeout: 30, // 请求超时时间，默认60s
    },
  },
})
// 通过client对象调用想要访问的接口（Action），需要传入请求对象（Params）以及响应回调函数
// 即：client.Action(Params).then(res => console.log(res), err => console.error(err))
// 如：查询云服务器可用区列表
client.DescribeZones().then(
  (data) => {
    console.log(data)
  },
  (err) => {
    console.error("error", err)
  }
)
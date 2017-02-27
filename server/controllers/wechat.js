'use strict'

const WX = require('../config').WX;
const util = require('../utils/string');

const schedule = require('node-schedule');
const reqwest = require('reqwest');

const crypto = require('crypto');
// const xml2js = require('xml2js');

const Wechat = require('../models/wechat');
const Order = require('../models/order');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;

const getRawBody = require('raw-body');

const URLS = {
  UNIFIED_ORDER: "https://api.mch.weixin.qq.com/pay/unifiedorder",
  ACCESS_TOKEN:  `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WX.APPID}&secret=${WX.APPSECRET}`,
  JSAPI_TICKET:  "https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=jsapi",
  API_TICKET: "https://api.weixin.qq.com/cgi-bin/ticket/getticket",
  OPENID: `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${WX.APPID}&secret=${WX.APPSECRET}`,
  USERINFO: "https://api.weixin.qq.com/sns/userinfo"
};

// -----------------------------------------------------------------------
// 定时刷新
schedule.scheduleJob('0 35 * * * *', function() {
  let access_token = null;
  // request
  reqwest(URLS.ACCESS_TOKEN)
    .then(function (resp) {
      if (resp.access_token !== undefined) {
        // 获取access_token
        access_token = resp.access_token;
        // console.log(resp);
        // ticket
        let p1 = reqwest(URLS.JSAPI_TICKET + `&access_token=${access_token}`).then(resp => resp)
        let p2 = reqwest(URLS.API_TICKET + `?access_token=${access_token}&type=wx_card`).then(resp => resp)

        Promise.all([p1, p2]).then(data => {
          let jsapi = data[0] ? data[0] : {};
          let api = data[1] ? data[1] : {};
          // console.log(jsapi);
          // console.log(api);
          if (jsapi.errcode !== undefined && jsapi.errcode == 0 &&
              api.errcode !== undefined && api.errcode == 0) {
            saveTokenAndTicket(access_token, jsapi.ticket, api.ticket);
          }
        });

      }
    });
});


// 存储token和jsapi_ticket
function saveTokenAndTicket(token, JSAPITicket, APITicket) {
  Wechat.findOne({}).exec().then((item) => {
    if (!item) {
      var wechat = new Wechat({
        TOKEN: token,
        JSAPI_TICKET: JSAPITicket,
        API_TICKET: APITicket
      });
      wechat.save();
    } else {
      Wechat.findByIdAndUpdate(
        item._id,
        { TOKEN: token,
          JSAPI_TICKET: JSAPITicket,
          API_TICKET: APITicket }
      ).then((doc, err) => {
        // console.log(doc, err);
      });
    }
  });


  // var url = 'mongodb://kzt:@Kzt2016@localhost:27027/exam?authSource=admin';
  // Use connect method to connect to the Server
  // MongoClient.connect(url, function(err, db) {
  //   if (err) {
  //     console.log(err);
  //     return;
  //   }
  //   var col = db.collection('wechat');
  //   col.findOne({}, function(err, r) {
  //     if (err) {
  //       console.log(err);
  //       return;
  //     }
  //     if (r) {
  //       console.log("[update] TOKEN");
  //       col.updateOne(r, {$set: {TOKEN: token, JSAPI_TICKET: JSAPITicket, API_TICKET: APITicket}}, function(err, r) {
  //         if (err) console.log(err);
  //         db.close();
  //       });
  //     } else {
  //       col.insertOne({TOKEN: token, JSAPI_TICKET: JSAPITicket, API_TICKET: APITicket}, function(err, r) {
  //         if (err) console.log(err);
  //         db.close();
  //       });
  //     }
  //   });
  // });
}


// -----------------------------------------------------------------------
// OpenId
function* getOpenId(code) {
  // console.log(code);
  let res = yield reqwest(URLS.OPENID + `&code=${code}&grant_type=authorization_code`).then(resp => resp);
  res = JSON.parse(res);
  console.log(res);
  return {
    errcode: res.errcode ? res.errcode : null,
    openid: res.openid,
    token: res.access_token
  }
}

exports.userinfo = function*(next) {
  let req = this.request.body;
  let data = yield getOpenId(req.code);
  // console.log(data);
  if (data.errcode) {
    return this.resp.error("获取openID错误");
  }
  let res = yield reqwest(URLS.USERINFO + `?access_token=${data.token}&openid=${data.openid}&lang=zh_CN`).then(resp => resp);
  res = JSON.parse(res);
  // console.log(res);
  if (res.errcode) {
    return this.resp.error("获取用户信息错误");
  }
  return this.resp.send({
    openid: res.openid,
    image: res.headimgurl,
    name: res.nickname
  });
}

// -----------------------------------------------------------------------
// JS-SDK 签名
exports.sign = function* (next) {

  let req = this.request.body;

  let wx = {};
  try {
    wx = yield Wechat.findOne({}).exec();
  } catch (e) {
    // console.log(e);
  }

  // console.log(wx);

  let data = {
    jsapi_ticket: wx.JSAPI_TICKET,
    noncestr: Math.random().toString(),
    timestamp: (new Date().getTime()).toString().substr(0, 10),
    url: req.url
  }

  let str = util.strcat(data);
  let sha1Code = crypto.createHash("sha1");
  let signature = sha1Code.update(str, 'utf-8').digest("hex");

  // console.log(str);

  return this.resp.send({
    nonceStr: data.noncestr,
    timestamp: data.timestamp,
    signature: signature,
    appId: WX.APPID
  })
}


exports.cardSign = function* (next) {

  let wx = {};

  try {
    wx = yield Wechat.findOne({}).exec();
  } catch (e) {
    // console.log(e);
  }

  let api_ticket = wx.API_TICKET;
  let app_id = WX.APPID;
  let time_stamp = (new Date().getTime()).toString().substr(0, 10);
  let nonce_str = Math.random().toString();

  let array = [api_ticket, app_id, time_stamp, nonce_str];
  array.sort();
  // console.log(array, array.join(''));
  let sha1Code = crypto.createHash("sha1");
  let signature = sha1Code.update(array.join(''), 'utf-8').digest("hex");

  return this.resp.send({
    // api_ticket,
    // app_id,
    time_stamp,
    nonce_str,
    signature
  })
}


// cardDecrypt


// ************************************** TEST ****************************************
// ********************************** 刷新当前token ************************************
exports.refresh = function* (next) {
  let access_token = null;
  // request
  yield reqwest(URLS.ACCESS_TOKEN)
    .then(function (resp) {
      if (resp.access_token !== undefined) {
        // 获取access_token
        access_token = resp.access_token;
        // console.log(resp);
        // ticket
        let p1 = reqwest(URLS.JSAPI_TICKET + `&access_token=${access_token}`).then(resp => resp)
        let p2 = reqwest(URLS.API_TICKET + `?access_token=${access_token}&type=wx_card`).then(resp => resp)

        Promise.all([p1, p2]).then(data => {
          let jsapi = data[0] ? data[0] : {};
          let api = data[1] ? data[1] : {};
          // console.log(jsapi);
          // console.log(api);
          if (jsapi.errcode !== undefined && jsapi.errcode == 0 &&
              api.errcode !== undefined && api.errcode == 0) {
            saveTokenAndTicket(access_token, jsapi.ticket, api.ticket);
          }
        });

      }
    });
}
// ************************************** TEST ****************************************
// ************************************************************************************


// -----------------------------------------------------------------------
// 统一下单
// exports.unifiedorder = function* (next) {
//
//   let req = this.request.body;
//
//   let trade_no = (new Date().getTime()).toString();
//
//   // 判断是否已生成订单
//   if (!req.orderId) {
//     let order = new Order({
//       trade_no: trade_no,
//       name: req.name,
//       phone: req.phone,
//       openId: req.openId,
//       certId: req.certId,
//       state: 0
//     });
//
//     let error = order.validateSync();
//     if (error) {
//       return this.resp.error(error.message);
//     }
//
//     try {
//       let data = yield order.save();
//       return this.resp.send(data);
//     } catch(e) {
//       return this.resp.error(e.message);
//     }
//
//   } else {
//     // console.log(req.orderId);
//     let order = {}
//     try {
//       order = yield Order.findOne({ _id: ObjectId(req.orderId) }).exec();
//     } catch (e) {
//       // TODO
//     }
//
//     // console.log(order);
//     if (!order || order.state != 0) {
//       this.body = {
//         code: 1,
//         message: "订单号错误"
//       }
//       return;
//     }
//     trade_no = order.trade_no;
//     req.openId = order.openId;
//   }
//
//   let obj = {
//     appid: WX.APPID,
//     body: "报名费",
//     mch_id: WX.MCH_ID,
//     nonce_str: Math.random().toString(),
//     notify_url: WX.NOTIFY_URL,
//     openid: req.openId,
//     out_trade_no: trade_no,
//     spbill_create_ip: this.request.ip,
//     total_fee: 101,
//     trade_type: "JSAPI"
//   }
//
//   let str = util.strcat(obj) + `&key=${WX.API_KEY}`;
//   let md5Code = crypto.createHash("md5");
//   obj.sign = md5Code.update(str, 'utf-8').digest("hex").toUpperCase();
//
//   let builder = new xml2js.Builder({rootName: "xml", allowSurrogateChars: true});
//   let xml = builder.buildObject(obj);
//
//   let res = yield reqwest({
//     url: URLS.UNIFIED_ORDER,
//     method: 'POST',
//     data: xml
//   }).then(resp => resp);
//
//   let data = yield util.xml2js(res.body);
//   if (!data.xml.prepay_id) {
//     console.log(data);
//   }
//
//   let wxPay = {
//     appId: WX.APPID,
//     nonceStr: obj.nonce_str,
//     package: `prepay_id=${data.xml.prepay_id}`,
//     signType: 'MD5',
//     timeStamp: (new Date().getTime()).toString().substr(0, 10)
//   }
//
//   str = util.strcat(wxPay) + `&key=${WX.API_KEY}`;
//   let md5c = crypto.createHash("md5");
//   wxPay.paySign = md5c.update(str, 'utf-8').digest("hex").toUpperCase();
//
//   // succes
//   wxPay.code = 0;
//
//   this.body = wxPay;
// }


// -----------------------------------------------------------------------
// 支付回调
// exports.notify = function* (next) {
//   let req = yield getRawBody(this.req, {
//     length: this.req.headers['content-length'],
//     limit: '1mb',
//     encoding: 'utf8'
//   })
//   // console.log(req);
//   let data = yield util.xml2js(req);
//   // console.log(data);
//   if (data.xml.result_code && data.xml.result_code == "SUCCESS") {
//
//     try {
//       let data = yield Order.findOneAndUpdate(
//         { trade_no: data.xml.out_trade_no },
//         { state: 1 },
//         { runValidators: true }
//       );
//     } catch(e) {
//       // return this.resp.error(e.message);
//     }
//   }
//
//   let builder = new xml2js.Builder({rootName: "xml", allowSurrogateChars: true});
//   let xml = builder.buildObject({return_code: "SUCCESS", return_msg: "OK"});
//   this.body = xml;
// }


// -----------------------------------------------------------------------
// -----------------------------------------------------------------------
// -----------------------------------------------------------------------
// // 公众号验证
// exports.validate = function* (next) {
//
//   let signature = this.query.signature;
//   let timestamp = this.query.timestamp;
//   let nonce = this.query.nonce;
//   let echostr = this.query.echostr;
//
//   // 1. 将token、timestamp、nonce三个参数进行字典序排序
//   let array = new Array(WX.TOKEN, timestamp, nonce);
//   array.sort();
//   let str = array.toString().replace(/,/g,"");
//   // 2. 将三个参数字符串拼接成一个字符串进行sha1加密
//   let sha1Code = crypto.createHash("sha1");
//   let code = sha1Code.update(str, 'utf-8').digest("hex");
//   // 3. 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
//   if (code===signature) {
//     this.body = echostr;
//   } else {
//     this.body = "error";
//   }
// }

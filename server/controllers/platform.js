'use strict'
const PlatformOrder = require('../models/platform-order');
const Certificate = require('../models/certificate');
const CertDetail = require('../models/certificate-detail');
const ObjectId = require('mongodb').ObjectID;
const ejs = require('ejs')
const fs  = require('co-fs')

const PAY = require('../config').PAY;
const PLATFORM = require('../config').PLATFORM;

const util = require('../utils/string');
const reqwest = require('reqwest');

const CardController = require('./card');
const PlatformCardController = require('./platform-card');
const VerificationController = require('./verification');

const URLS = {
  getOrderId: "http://120.236.138.221:7752/paymentPlatform/pay_getOrderId.action"
}

exports.pay = function* (next) {
  let req = this.request.body;

  let info = {
    agency_id: req.agency_id.toString(),
    prepay_id: req.prepay_id,
    time_stamp: req.time_stamp
  }

  if (!PLATFORM.AGENCY[info.agency_id]) return this.body = "agency_id不存在";

  let sign = util.getMD5Sign(info, PLATFORM.AGENCY[info.agency_id]);
  if (sign !== req.sign) return this.body = "签名错误";

      // let res = yield getOrderId(req.prepay_id);
      // if (res.errcode !== 0) return this.body = "获取order_id失败：" + res.errmsg;

  if (!req.prepay_id) {
    return this.body = "prepay_id不可为空";
  }

  let order = null;
  try {
    order = yield PlatformOrder.findOne({_id: ObjectId(req.prepay_id)}).exec();
  } catch(e) {
    return this.body = "服务器数据错误";
  }

  if (!order) return this.body = "该订单不存在";


  let data = {
    prepay_id: req.prepay_id,
    price: order.price,
    description: order.description,
    ordered: false
  }

  // 订单已提交
  if (order.orderId && order.orderId > 0) {
    data.ordered = true;
    data.form = {
      agencyname: PAY.AGENCY_NAME,
      orderid: order.orderId,
      timestamp: req.time_stamp
    }
    data.form.sign = util.getMD5Sign(data.form, PAY.KEY);
  }

  const html = yield fs.readFile(process.cwd() + '/server/views/platform.ejs', 'utf8');
  this.body = ejs.render(html, data);
}


exports.getPayForm = function*(next) {

  let req = this.request.body;

  // console.log(req);

  let order = null;
  try {
    order = yield PlatformOrder.findOne({_id: ObjectId(req.prepayId)}).exec();
  } catch(e) {
    return this.resp.error(e.message);
  }

  // ******************
  // **     Card     **
  // ******************
  // 验证优惠券，返回新的价格和卡券code - {price, code}
  let result = yield PlatformCardController.validate(req.prepayId, order.price, req.cardId, req.encryptCode)
  if (result.errcode !== 0) {
    console.log(result);
    return this.resp.error(result.errmsg);
  }

  result = result.data;

  if (!order) return this.resp.error("订单不存在");
  // --------------------------------------------------------------
  // ******************
  // **  获取OrderId  **
  // ******************
  // 待签名数据
  let stamp = (new Date().getTime()).toString();
  let data = {
    agencyName: PAY.AGENCY_NAME,
    amount: result.price, // 分为单位
    backMerchantUrl: PLATFORM.NOTIFY_URL,
    frontUrl: order.frontUrl,
    orderTime: util.getFormatDate(),
    partnerOrderId: order.tradeNo,
    timeStamp: stamp.substr(0, 10)
  };

  // 签名
  let sign = util.getMD5Sign(data, PAY.KEY);

  // console.log(data);
  // 发起请求
  let res = yield reqwest({
    url: URLS.getOrderId,
    method: 'POST',
    data: {
      data: new Buffer(JSON.stringify(data)).toString("base64"),
      sign
    }
  })
  .then(res => {
    return JSON.parse(new Buffer(res, "base64").toString());
  })
  .fail(err => {
    console.log(err);
    return err;
  });

  // --------------------------------------------------------------
  if (!res.retcode) {
    return this.resp.error(res);
  }

  if (res.retcode !== "0") {
    // 获取orderId失败
    return this.resp.error(res.retmsg);
  }

  // 成功获取orderId
  try {
    order = yield PlatformOrder.findOneAndUpdate(
      { _id: ObjectId(req.prepayId)},
      {
        orderId: res.orderid,
        openId: req.openId ? req.openId : '',
        cardId: req.cardId ? req.cardId : '',
        cardCode: result.code ? result.code : '',
        price: result.price
      },
      { runValidators: true }
    );

    let data = {
      agencyname: PAY.AGENCY_NAME,
      orderid: res.orderid,
      timestamp: stamp.substr(0, 10),
    }
    data.sign = util.getMD5Sign(data, PAY.KEY);
    console.log(data);
    return this.resp.send(data);
  } catch(e) {
    console.log(e);
    return this.resp.error(e.message);
  }
};


// [error]
// 0 成功
// 100 网络错误
// 101 签名错误
// 102 服务器数据错误
// 103
exports.getPrepayId = function* (next) {

  let req = this.request.body;

  let info = {
    agency_id: req.agency_id.toString(),
    front_url: req.front_url,
    notify_url: req.notify_url,
    out_trade_no: req.out_trade_no,
    time_stamp: req.time_stamp,
    total_price: parseInt(req.total_price)
  }

  if (!PLATFORM.AGENCY[info.agency_id]) {
    return this.resp.error("agency_id不存在", 104);
  }
  let sign = util.getMD5Sign(info, PLATFORM.AGENCY[info.agency_id]);

  if (sign !== req.sign) {
    return this.resp.error("签名错误", 101);
  }

  console.log(info);

  // 新建订单
  let order = new PlatformOrder({
    agencyId: info.agency_id,
    frontUrl: info.front_url,
    tradeNo: info.out_trade_no,
    notifyUrl: info.notify_url,
    price: info.total_price,
    description: req.description
  });

  // 数据校验
  let error = order.validateSync();
  if (error) {
    console.log(error.message);
    return this.resp.error("缺失必需数据或数据格式错误", 103);
  }

  // 插入数据库
  try {
    let data = yield order.save();
    // console.log(data);
    // 返回OrderId
    return this.resp.send(data._id);
  } catch(e) {
    console.log(e.message);
    return this.resp.error("服务器数据错误", 102);
  }
  // --------------------------------------------------------------
}


exports.notify = function* (next) {
  // {
  //   agencyName: '13025191592',
  //   attach: 'null',
  //   orderId: '20161010999007000007',
  //   pamentTime: '20161010141700',
  //   partnerOrderId: '1476081727641',
  //   sign: '0965a4b84e40db9afc4df573e2184693',
  //   status: '00',
  //   totalFee: '1'
  // }
  console.log("[Notify]");
  let req = this.request.body ? this.request.body : {};
  // console.log(req);

  let order = yield PlatformOrder.findOne({ tradeNo: req.partnerOrderId }).exec();
  if (!order) return;

  // 通知机构
  let notifyInfo = {
    agency_id: order.agencyId.toString(),
    order_id: req.orderId,
    out_trade_no: req.partnerOrderId,
    state: req.status,
    total_price: req.totalFee
  }
  if (!PLATFORM.AGENCY[notifyInfo.agency_id]) return;
  notifyInfo.sign = util.getMD5Sign(notifyInfo, PLATFORM.AGENCY[notifyInfo.agency_id]);

  // console.log(notifyInfo);

  // console.log(order);

  let result = yield reqwest({
    url: order.notifyUrl,
    method: 'POST',
    // contentType: 'application/json',
    // data: JSON.stringify(notifyInfo)
    data: notifyInfo
  })
  .then(res => res)
  .fail(err => {
    console.log(err);
    return "FAIL";
  }).catch(err => {
    console.log(err);
    return "FAIL";
  });

  // 订单状态修改
  if (req.status && req.status == "00") {
    // 请求中签名
    let sign1 = req.sign;
    delete req.sign;

    // 重新计算签名
    let sign2 = util.getMD5Sign(req, PAY.KEY);
    // 签名一致
    if (sign1 !== sign2) return;

    try {
      let order = yield PlatformOrder.findOneAndUpdate(
        { tradeNo: req.partnerOrderId },
        { state: 1 },
        { runValidators: true }
      );

      // 核销卡券 && 更改订单state
      if (order.cardCode && order.cardCode.length > 0) {
        yield CardController.consume(order.cardCode);
        order = yield PlatformOrder.findOneAndUpdate(
          { tradeNo: req.partnerOrderId },
          { state: 2 },
          { runValidators: true }
        );
      }
      // console.log(order);
    } catch(e) {
      console.log(e);
    }
  }

  // console.log(result);
  if (result && result === "SUCCESS") this.body = "SUCCESS";
}

exports.test = function*() {
  console.log(this.request.body);
  this.body = "SUCCESS";
  // this.body = "FAIL";
}

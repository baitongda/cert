'use strict'
const Order = require('../models/order');
const Certificate = require('../models/certificate');
const CertDetail = require('../models/certificate-detail');
const ObjectId = require('mongodb').ObjectID;

const PAY = require('../config').PAY;
const util = require('../utils/string');
const reqwest = require('reqwest');

const CardController = require('./card');
const VerificationController = require('./verification');

const URLS = {
  getOrderId: "http://120.236.138.221:7752/paymentPlatform/pay_getOrderId.action"
}

exports.getOrderId = function* (next) {

  let req = this.request.body;

  let res = yield VerificationController.validate(req.phone, req.verCode);
  if (res.errcode !== 0) {
    console.log(res);
    return this.resp.error(res.errmsg);
  }

  let cert = null;
  try {
    cert = yield Certificate.findOne({_id: req.certId}).exec();
    // 未找到对应Cert
    if (cert === null) {
      return this.resp.error("商品信息错误");
    }

    cert.detail = yield CertDetail.findOne({_id: cert.detailId}).exec();
    // 未找到对应CertDetail
    if (cert.detail === null || !cert.detail.kinds) {
      return this.resp.error("商品信息错误");
    }
  } catch (e) {
    return this.resp.error(e.message);
  }

  // 从kinds获取价格，构造订单描述
  cert.price = null;
  let description = cert.name;
  cert.detail.kinds.forEach(item => {
    if (item.id === req.kindId) {
      cert.price = item.price;
      description += `（${item.name}）`;
    }
  });

  if (cert.price === null) {
    return this.resp.error("该商品已下架");
  }

  // 验证优惠券，返回新的价格和卡券code - {price, code}
  res = yield CardController.validate(cert._id, cert.price, req.cardId, req.encryptCode)
  if (res.errcode !== 0) {
    console.log(res);
    return this.resp.error(res.errmsg);
  }
  // 获取到cert，包括新价格和code - {price, code}
  cert = res.data;

  // console.log(req, cert);
  // --------------------------------------------------------------
  // ******************
  // **  获取OrderId  **
  // ******************
  // 待签名数据
  let stamp = (new Date().getTime()).toString();
  let data = {
    agencyName: PAY.AGENCY_NAME,
    // 分为单位
    amount: parseInt(cert.price * 100),
    backMerchantUrl: PAY.NOTIFY_URL,
    frontUrl: PAY.FRONT_URL,
    orderTime: util.getFormatDate(),
    partnerOrderId: stamp,
    timeStamp: stamp.substr(0, 10)
  };

  // 签名
  let sign = util.getMD5Sign(data, PAY.KEY);

  // 发起请求
  try {
    res = yield reqwest({
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
    })

    console.log(res);
    // --------------------------------------------------------------
    if (res.retcode !== "0") {
      // 获取orderId失败
      return this.resp.error("一卡通平台下单失败：" + res.retmsg);
    }
  } catch (err) {
    return this.resp.error("一卡通平台下单失败");
  }


  // 成功获取orderId
  // 新建订单
  let order = new Order({
    state: 0,

    trade_no: stamp,
    description: description,
    openId: req.openId,
    certId: ObjectId(req.certId),
    orderId: res.orderid,

    price: cert.price,
    cardId: req.cardId ? req.cardId: "",
    cardCode: cert.code ? cert.code: "",

    name: req.name,
    phone: req.phone,
    userInfo: req.userInfo
  });

  // 数据校验
  let error = order.validateSync();
  if (error) {
    return this.resp.error(error.message);
  }

  // 插入数据库
  try {
    let data = yield order.save();
    console.log(data);
    // 返回响应
    return this.resp.send({
      orderId: data.orderId,
    });
  } catch(e) {
    return this.resp.error(e.message);
  }
  // --------------------------------------------------------------
}

// exports.pay = function* (next) {
//
// }

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
  let data = this.request.body ? this.request.body : {};
  if (data.status && data.status == "00") {

    // 请求中签名
    let sign1 = data.sign;
    delete data.sign;

    // 重新计算签名
    let sign2 = util.getMD5Sign(data, PAY.KEY);

    // 签名一致
    if (sign1 !== sign2) {
      return;
    }

    try {
      let order = yield Order.findOneAndUpdate(
        { trade_no: data.partnerOrderId },
        { state: 1 },
        { runValidators: true }
      );

      // 核销卡券 && 更改订单state
      if (order.cardCode && order.cardCode.length > 0) {
        yield CardController.consume(order.cardCode);
        let order = yield Order.findOneAndUpdate(
          { trade_no: data.partnerOrderId },
          { state: 2 },
          { runValidators: true }
        );
      }

    } catch(e) {
      console.log(e);
    }

  }
  this.body = "SUCCESS";
}

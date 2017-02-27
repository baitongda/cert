'use strict'
const ObjectId = require('mongodb').ObjectID;

const PlatformOrder = require('../models/platform-order');
const Card = require('../models/card');
const Wechat = require('../models/wechat');

const shared = require('./shared');
const reqwest = require('reqwest');

const WX_CARD_URL = {
  // 解码
  decrypt: "https://api.weixin.qq.com/card/code/decrypt?access_token=",
  // 查询code
  get: "https://api.weixin.qq.com/card/code/get?access_token=",
  // 核销
  consume: "https://api.weixin.qq.com/card/code/consume?access_token="
}


// 验证卡券适用范围
exports.get = function* (next) {
  let req = this.request.body;

  try {
    let card = yield Card.findOne({cardId: req.cardId}).exec();
    // 卡券不存在
    if (!card) {
      return this.resp.error("该类优惠券不存在");
    }

    // prepayId

    // 卡券使用限制
    if (card.certLimit.length !== 0) {
      return this.resp.error("该优惠券不适用于该商品");
    }

    return this.resp.send({
      reduceCost: card.reduceCost,
      title: card.title
    });

  } catch(e) {
    return this.resp.error(e.message);
  }
}


// 验证卡券存在，计算价格，返回新价格和code - {price, code}
exports.validate = function* (agencyId, price, cardId, encryptCode) {

  if (!cardId || !encryptCode) {
    return {
      errcode: 0,
      data: { price, code: null }
    }
  }

  let wx = null, card = null;
  try {
    let p1 = Wechat.findOne().exec();
    let p2 = Card.findOne({cardId: cardId}).exec();

    yield Promise.all([p1, p2]).then(data => {
      wx   = data[0];
      card = data[1];
    });
  } catch(e) {
    return { errcode: 1, errmsg: e }
  }

  if (!wx) {
    return { errcode: 1, errmsg: "服务器错误" }
  }

  if (!card) {
    return { errcode: 1, errmsg: "该类优惠券不存在" }
  }

  if (price < (card.leastCost * 100)) {
    return { errcode: 1, errmsg: "未达到优惠券使用金额" }
  }

  // 卡券使用限制
  if (card.certLimit.length !== 0) {
    // 不在使用范围内
    return { errcode: 1, errmsg: "该优惠券不适用于该商品" }
  }

  // 减免后价格
  price -= (card.reduceCost * 100);
  if (price < 0) price = 0;

  // 解码code
  let res = yield reqwest({
    url: WX_CARD_URL.decrypt + wx.TOKEN,
    method: "POST",
    data: JSON.stringify({
      encrypt_code: encryptCode
    })
  });

  // 解码结果错误
  if (res.errcode !== 0) {
    return { errcode: 1, errmsg: "卡券解码时异常 " + res.errmsg }
  }

  // 检验卡券code状态
  let code = res.code;
  res = yield reqwest({
    url: WX_CARD_URL.get + wx.TOKEN,
    method: "POST",
    data: JSON.stringify({
      card_id : cardId,
      code : code,
      check_consume : true
    })
  });

  // 卡券状态异常
  if (res.errcode !== 0) {
    return { errcode: 1, errmsg: "卡券状态异常 " + res.errmsg }
  }

  let order = null;
  try {
    order = yield PlatformOrder.findOne({state: 2, cardCode: code}).exec();
  } catch(e) {
    return { errcode: 1, errmsg: e }
  }

  // 卡券已在其他订单中使用
  if (order) {
    // TODO
    // yield consume(order.cardCode);
    return { errcode: 1, errmsg: "卡券已被使用" }
  }

  return {
    errcode: 0,
    errmsg: 'OK',
    data: { price, code }
  }
}

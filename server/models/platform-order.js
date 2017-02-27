'use strict'

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// {state}
// -1 - 已超时
//  0 - 未支付
//  1 - 已支付
//  2 - 已支付(优惠)
var platformOrderSchema = new Schema({
  tradeNo: {
    type: String,
    required: true
  },
  agencyId: {
    type: String,
    required: true
  },
  frontUrl: {
    type: String,
    required: true
  },
  notifyUrl: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  orderId: {
    type: String
  },
  description: {
    type: String
  },
  openId: {
    type: String
  },
  cardId: {
    type: String
  },
  cardCode: {
    type: String
  },
  state: {
    type: Number,
    default: 0
  }
});

const PlatformOrder = mongoose.model('platform_orders', platformOrderSchema);
module.exports = PlatformOrder;

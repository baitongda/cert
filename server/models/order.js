'use strict'

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// {state}
// -1 - 已超时
//  0 - 未支付
//  1 - 已支付
//  2 - 已支付(优惠)
var orderSchema = new Schema({
  trade_no: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  orderId: {
    type: String,
    required: true
  },
  openId: {
    type: String,
    required: true
  },
  certId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  price: {
    type: Number,
    required: true
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
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  userInfo: {
    type: Schema.Types.Mixed
  }
});

const Order = mongoose.model('orders', orderSchema);
module.exports = Order;

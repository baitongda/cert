'use strict'

const Order = require('../models/order');
const ObjectId = require('mongodb').ObjectID;

// 获取总订单数
exports.getCount = function* (next) {
  try {
    let count = yield Order.count().exec();
    return this.resp.send(count);
  } catch(e) {
    return this.resp.error(e.message);
  }
}

exports.getByOpenId = function* (next) {
  // console.log(this.params.id);
  try {
    let orders = yield Order.find( {openId: this.params.id} ).exec();

    // 修改超时状态
    for (let i = 0; i < orders.length; ++i) {
      if (orders[i].state == 0) {
        let date = parseInt(orders[i].trade_no.substr(0, 10));
        let now = parseInt(new Date().getTime().toString().substr(0, 10));
        // 已超时
        if (now - date > 1800) {
          let order = yield Order.findOneAndUpdate(
            { _id: ObjectId(orders[i]._id) },
            { state: -1 },
            { runValidators: true }
          );
          orders[i] = order;
        }
      }
    }
    return this.resp.send(orders);
  } catch(e) {
    return this.resp.error(e.message);
  }
}

// exports.add = function* (next) {
//   let req = this.request.body;
//   let trade_no = (new Date().getTime()).toString();
//
//   let order = new Order({
//     trade_no: trade_no,
//     name: req.name,
//     phone: req.phone,
//     openId: req.openId,
//     certId: req.certId,
//     state: 0
//   });
//
//   let error = order.validateSync();
//   if (error) {
//     return this.resp.error(error.message);
//   }
//
//   try {
//     let data = yield order.save();
//     return this.resp.send(data);
//   } catch(e) {
//     return this.resp.error(e.message);
//   }
// }

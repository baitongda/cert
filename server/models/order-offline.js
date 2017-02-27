// 'use strict'
//
// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;
//
// // {state}
// //  0 - 未支付
// //  1 - 已支付
// var orderOfflineSchema = new Schema({
//   trade_no: {
//     type: String,
//     required: true
//   },
//   orderId: {
//     type: String,
//     default: "null"
//   },
//   state: {
//     type: Number,
//     default: 0
//   },
//   price: {
//     type: Number,
//     default: -1
//   },
//   handler: {
//     type: String,
//     default: ""
//   },
//   remark: {
//     type: String,
//     default: ""
//   }
// });
//
// const OrderOffline = mongoose.model('orders_offline', orderOfflineSchema);
// module.exports = OrderOffline;

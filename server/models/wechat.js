'use strict'

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var wechatSchema = new Schema({
  TOKEN: {
    type: String,
    // required: true
  },
  JSAPI_TICKET: {
    type: String,
    // required: true
  },
  API_TICKET: {
    type: String,
    // required: true
  }
});

const Wechat = mongoose.model('wechat', wechatSchema, 'wechat');
module.exports = Wechat;

'use strict'

const ObjectId = require('mongodb').ObjectID;
const Verification = require('../models/verification');
const shared = require('./shared');

const VER = require('../config').VER;
const reqwest = require('reqwest');
const crypto = require('crypto');
const util = require('../utils/string');

exports.getCode = function* (next) {

  // return this.resp.send(0);

  let code = Math.random().toString().substr(2, 4);
  let phone = this.params.phone;

  if (!phone || phone.length !== 11) {
    return this.resp.error("手机号码格式错误");
  }

  try {
    let data = yield Verification.findOneAndUpdate(
      { phone },
      { code },
      { runValidators: true }
    );
    if (!data) {
      let verification = new Verification({ phone, code });
      yield verification.save();
    }
  } catch(e) {
    return this.resp.error(e.message);
  }

  let time = util.getFormatTime();
  let sign = VER.ACCOUNT_SID + VER.AUTH_TOKEN + time;
  let md5Code = crypto.createHash("md5");
  sign = md5Code.update(sign, 'utf-8').digest("hex").toUpperCase();

  let res = yield reqwest({
    url: VER.URL + sign,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json;charset=utf-8',
      'Authorization': new Buffer(`${VER.ACCOUNT_SID}:${time}`).toString('base64')
    },
    method: "POST",
    data: JSON.stringify({
      to: phone,
      appId: VER.APP_ID,
      templateId: "132105",
      datas: [code]
    })
  });

  if (!res.statusCode) {
    return this.resp.error("验证码服务错误");
  }

  if (res.statusCode !== "000000") {
    return this.resp.error(res.statusMsg);
  }

  this.resp.send(0);
}


exports.validate = function* (phone, verCode) {
  if (!phone || phone.length !== 11) {
    return { errcode: 1, errmsg: "手机号码格式不正确" }
  }

  try {
    let verification = yield Verification.findOne({ phone });
    if (!verification || !verCode || verification.code !== verCode) {
      return { errcode: 1, errmsg: "验证码错误" }
    }
  } catch(e) {
    return { errcode: 1, errmsg: "服务器错误" }
  }

  return { errcode: 0, errmsg: "验证通过" }
}

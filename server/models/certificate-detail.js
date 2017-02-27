'use strict'

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var certDetailSchema = new Schema({
  intro: {
    type: String,
    default: "暂无简介信息"
  },
  enterInfo: {
    type: String,
    default: "暂无报考相关信息"
  },
  kinds: {
    type: [Schema.Types.Mixed]
  },
  // 报名所需信息
  userInfoFields: {
    type: [Schema.Types.ObjectId]
  }
});

const CertDetail = mongoose.model('cert_details', certDetailSchema);
module.exports = CertDetail;

'use strict'

const ObjectId = require('mongodb').ObjectID;
const userInfoField = require('../models/userinfo-field');
const shared = require('./shared');


exports.getInfos = function* () {
  let req = this.request.body;
  let idList = req.userInfoFields;

  // console.log(req);
  let infos = [];
  if (idList) {
    for (let i = 0; i < idList.length; ++i) {
      try {
        let data = yield userInfoField.findOne({_id: idList[i]}).exec();
        // console.log(idList[i], data);
        if (!data) {
          return this.resp.error("获取报名信息字段错误");
        }
        infos.push(data);
      } catch(e) {
        return this.resp.error(e.message);
      }
    }
  }

  this.resp.send(infos);
}

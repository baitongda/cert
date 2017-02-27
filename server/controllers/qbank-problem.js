'use strict'

const ObjectId = require('mongodb').ObjectID;
const QBankProblem = require('../models/qbank-problem');
const shared = require('./shared');
const image = require('./shared/image');

module.exports = {
  getImageList: image.getImageList('qbank/problem'),
  getBatch: function* () {
    try {
      let data = yield QBankProblem.find({ chapterId: ObjectId(this.params.chapterId) }).skip(parseInt(this.params.index)).limit(15).exec();
      return this.resp.send(data);
    } catch(e) {
      return this.resp.error(e.message);
    }
  },
  getBatchPrev: function* () {
    let index = parseInt(this.params.index) - 15;
    let limit = 15;

    if (index < 0) {
      limit = 15 + index + 1;
      index = 0;
    }

    // console.log(index, limit);
    try {
      let data = yield QBankProblem.find({ chapterId: ObjectId(this.params.chapterId) }).skip(index).limit(limit).exec();
      return this.resp.send(data);
    } catch(e) {
      return this.resp.error(e.message);
    }
  }
}

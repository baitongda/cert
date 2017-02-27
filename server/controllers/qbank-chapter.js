'use strict'

const ObjectId = require('mongodb').ObjectID;
const QBankChapter = require('../models/qbank-chapter');
const QBankProblem = require('../models/qbank-problem');
const shared = require('./shared');

module.exports = {
  getAll: shared.getAll(QBankChapter),
  addOne: shared.addOne(QBankChapter),
  deleteOne: shared.deleteOne(QBankChapter),
  updateOne: shared.updateOne(QBankChapter),
  getByCategateId: function* (next) {
    // console.log(this.params.id);
    try {
      var chapters = yield QBankChapter.find({ categoryId: this.params.id }).exec();
      var data = [];
      for (let i = 0; i < chapters.length; ++i) {
        let count = yield QBankProblem.count({ chapterId: chapters[i]._id });
        data.push({
          _id: chapters[i]._id,
          name: chapters[i].name,
          count: count
        });
      }
      return this.resp.send(data);
    } catch(e) {
      return this.resp.error(e.message);
    }
  }
}

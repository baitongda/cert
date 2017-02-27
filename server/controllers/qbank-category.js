'use strict'

const ObjectId = require('mongodb').ObjectID;
const QBankCategory = require('../models/qbank-category');
const shared = require('./shared');

module.exports = {
  getAll: shared.getAll(QBankCategory),
  addOne: shared.addOne(QBankCategory),
  deleteOne: shared.deleteOne(QBankCategory),
  updateOne: shared.updateOne(QBankCategory)
}

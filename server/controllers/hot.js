'use strict'

const ObjectId = require('mongodb').ObjectID;
const Hot = require('../models/hot');

exports.get = function* (next) {
  try {
    let data = yield Hot.findOne().exec();
    return this.resp.send(data.hots);
  } catch(e) {
    return this.resp.error(e.message);
  }
}

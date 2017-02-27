'use strict'

const ObjectId = require('mongodb').ObjectID;
const Institution = require('../models/institution');
const shared = require('./shared');

module.exports = {
  getAll: shared.getAll(Institution),
  getOne: shared.getOne(Institution)
}

'use strict'

const ObjectId = require('mongodb').ObjectID;
const Calendar = require('../models/calendar');

exports.get = function* (next) {
  try {
    let data = yield Calendar.findOne().exec();
    return this.resp.send(data.calendars);
  } catch(e) {
    return this.resp.error(e.message);
  }
}

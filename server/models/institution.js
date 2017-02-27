'use strict'

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// {
//     "_id" : ObjectId("57c8ede0027a4799ecd108d1"),
//     "name" : "未知教育",
//     "info" : "暂无该机构信息"
// }

var institutionSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  info: {
    type: String,
    required: true
  }
});

const Institution = mongoose.model('institutions', institutionSchema);
module.exports = Institution;

'use strict'

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// {
//     "_id" : ObjectId("57c8ea27027a4799ecd108b2"),
//     "name" : "电气工程师",
//     "price" : 100.0,
//     "support" : "未知教育",
//     "category" : "57c8e564a640d9ca8ce305ef"
// }
var certificateSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  detailId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  institutionId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  registerDate: {
    type: String,
    required: true
  },
  examDate: {
    type: Date,
    required: true
  }
});

const Certificate = mongoose.model('certificates', certificateSchema);
module.exports = Certificate;

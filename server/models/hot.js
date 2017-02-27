'use strict'

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// {
//     "_id" : ObjectId("57d2798558bf29fff3688bd9"),
//     "certId" : "57c8ea27027a4799ecd108b2"
// }

var hotSchema = new Schema({
  hots: {
    type: [Schema.Types.ObjectId],
    required: true
  }
});

const Hot = mongoose.model('hots', hotSchema);
module.exports = Hot;

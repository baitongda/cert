'use strict'

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// {
//     "_id" : ObjectId("57c8e564a640d9ca8ce305ef"),
//     "name" : "建筑类"
// }

var categorySchema = new Schema({
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ""
  }
});

const Category = mongoose.model('categorys', categorySchema);
module.exports = Category;

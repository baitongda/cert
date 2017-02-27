'use strict'

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var QBankCategorySchema = new Schema({
  name: {
    type: String,
    required: true
  }
});

const QBankCategory = mongoose.model('qbank_categorys', QBankCategorySchema);
module.exports = QBankCategory;

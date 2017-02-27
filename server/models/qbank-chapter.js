'use strict'

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var QBankChapterSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    required: true
  },
});

const QBankChapter = mongoose.model('qbank_chapters', QBankChapterSchema);
module.exports = QBankChapter;

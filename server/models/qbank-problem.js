'use strict'

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var QBankProblemSchema = new Schema({
  chapterId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  problem: {
    type: String,
    required: true
  },
  choices: {
    type: Schema.Types.Mixed,
    required: true
  },
  answer: {
    type: [String],
    required: true
  },
  analysis: {
    type: String,
    required: true
  }
});

const QBankProblem = mongoose.model('qbank_problems', QBankProblemSchema);
module.exports = QBankProblem;

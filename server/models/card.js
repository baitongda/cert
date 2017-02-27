'use strict'

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// {state}
//  0 - 发放中
// -1 - 停用

var cardSchema = new Schema({
  cardId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  subTitle: {
    type: String,
    required: true
  },
  state: {
    type: Number,
    default: 0
  },
  reduceCost: {
    type: Number,
    required: true
  },
  leastCost: {
    type: Number,
    required: true
  },
  startDate: {
    type: String,
    required: true
  },
  endDate: {
    type: String,
    required: true
  },
  certLimit: {
    type: [Schema.Types.ObjectId],
    default: []
  },
  remark: {
    type: String,
    default: "无"
  }
});

const Card = mongoose.model('cards', cardSchema);
module.exports = Card;

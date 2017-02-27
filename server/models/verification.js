'use strict'

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var verificationSchema = new Schema({
  phone: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  }
});

const Verification = mongoose.model('verifications', verificationSchema);
module.exports = Verification;

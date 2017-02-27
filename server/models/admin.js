'use strict'

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var adminSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    required: true
  }
});

const Admin = mongoose.model('admin', adminSchema);
module.exports = Admin;

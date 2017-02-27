'use strict'

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var userInfoFieldsSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  remark: {
    type: String,
    default: ""
  }
});

const UserInfoField = mongoose.model('user_info_fields', userInfoFieldsSchema);
module.exports = UserInfoField;

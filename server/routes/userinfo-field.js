'use strict'

const router = require('koa-router')();
const userInfoField = require('../controllers/userinfo-field');

router
  .post('/', userInfoField.getInfos)

module.exports = router;

'use strict'

const router = require('koa-router')();
const wx = require('../controllers/wechat');

router
  // .get('/validate', wx.validate)
  .get('/card-sign', wx.cardSign)
  .post('/sign', wx.sign)
  // .post('/unifiedorder', wx.unifiedorder)
  .post('/userinfo', wx.userinfo)
  // .post('/notify', wx.notify)

  .get('/refresh', wx.refresh);

module.exports = router;

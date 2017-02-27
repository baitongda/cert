const router = require('koa-router')();
const jwt = require('koa-jwt');
const config = require('../config');
const send = require('koa-send');

const certificateRouter = require('./certificate');
const categoryRouter = require('./category');
const detailRouter = require('./certificate-detail');
const orderRouter = require('./order');
// const orderRouter = require('./order-offline');
const hotRouter = require('./hot');
const calendarRouter = require('./calendar');
const institutionRouter = require('./institution');
const wechatRouter = require('./wechat');
const payRouter = require('./pay');
const cardRouter = require('./card');
const verificationRouter = require('./verification');
const userInfoFieldRouter = require('./userinfo-field');

router.use('/api/wechat', wechatRouter.routes(), wechatRouter.allowedMethods());
router.use('/api/pay', payRouter.routes(), payRouter.allowedMethods());
router.use('/api/certificate', certificateRouter.routes(), certificateRouter.allowedMethods());
router.use('/api/category', categoryRouter.routes(), categoryRouter.allowedMethods());
router.use('/api/detail', detailRouter.routes(), detailRouter.allowedMethods());
router.use('/api/order', orderRouter.routes(), orderRouter.allowedMethods());
router.use('/api/hot', hotRouter.routes(), hotRouter.allowedMethods());
router.use('/api/calendar', calendarRouter.routes(), calendarRouter.allowedMethods());
router.use('/api/institution', institutionRouter.routes(), institutionRouter.allowedMethods());
router.use('/api/card', cardRouter.routes(), cardRouter.allowedMethods());
router.use('/api/verification', verificationRouter.routes(), verificationRouter.allowedMethods());
router.use('/api/userinfo-field', userInfoFieldRouter.routes(), userInfoFieldRouter.allowedMethods());
// router.use('/order-offline', orderOfflineRouter.routes(), orderOfflineRouter.allowedMethods());

const QBankCategory = require('./qbank-category');
const QBankChapter = require('./qbank-chapter');
const QBankProblem = require('./qbank-problem');

router.use('/api/qbank/category', QBankCategory.routes(), QBankCategory.allowedMethods());
router.use('/api/qbank/chapter', QBankChapter.routes(), QBankChapter.allowedMethods());
router.use('/api/qbank/problem', QBankProblem.routes(), QBankProblem.allowedMethods());

const platformFieldRouter = require('./platform');
router.use('/platform', platformFieldRouter.routes(), platformFieldRouter.allowedMethods());

router
  .get('/success', function* (next) {
    yield send(this, '/server/public/success.html');
  })
  .post('/success', function* (next) {
    console.log(this.request.body);
    yield send(this, '/server/public/success.html');
  });

module.exports = router;

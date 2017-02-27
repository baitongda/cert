'use strict'

const router = require('koa-router')();
const certificate = require('../controllers/certificate');

router
  .get('/', certificate.getAll)
  .get('/image/:id', certificate.getImageList)

module.exports = router;

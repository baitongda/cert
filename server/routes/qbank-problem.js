'use strict'

var router = require('koa-router')();
var problem = require('../controllers/qbank-problem');

router
  .get('/:chapterId/:index', problem.getBatch)
  .get('/prev/:chapterId/:index', problem.getBatchPrev)
  .get('/image/:id', problem.getImageList)

module.exports = router;

'use strict'

const ObjectId = require('mongodb').ObjectID;
const Category = require('../models/category');
const shared = require('./shared');

exports.getAll = shared.getAll(Category)

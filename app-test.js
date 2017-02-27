const koa = require('koa');
const http = require('http');
const logger = require('koa-logger');
const mongoose = require('mongoose');
const serve = require('koa-static');
const json = require('koa-json');
const send = require('koa-send');
const bodyParser = require('koa-bodyparser');

// app
const app = koa();

// mongoose
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/exam');

// -----------------------------------------------------------
// Dev Server

const webpackMiddleware = require("koa-webpack-dev-middleware");
const webpack = require("webpack");
const config = require("./webpack.dev.config");

app.use(webpackMiddleware(webpack(config), {
  contentBase: "./server/public/",
  // all options optional
  noInfo: false,
  // display no info to console (only warnings and errors)
  quiet: false,
  // display nothing to the console
  lazy: true,
  // switch into lazy mode
  // that means no watching, but recompilation on every request
  watchOptions: {
    aggregateTimeout: 300,
    poll: true
  },
  // delay after change (only lazy: false)
  publicPath: "/build/",
  // public path to bind the middleware to
  // use the same as in webpack
  headers: { "X-Custom-Header": "yes" },
  // custom headers
  stats: {
      colors: true
  }
  // options for formating the statistics
}));

// -----------------------------------------------------------

var slow = require('koa-slow');
app.use(slow());


app.use(bodyParser());
// json
app.use(json());
// app.use(json({ pretty: false, param: 'pretty' }));

// // mongodb
// app.use(mongo({
//   host: 'localhost',
//   port: 27017,
//   user: 'admin',
//   pass: '',
//   db: 'exam',
//   max: 100,
//   min: 1,
//   timeout: 30000,
//   log: false
// }));

// logger
app.use(logger());

// static files
app.use(serve(__dirname + '/server/public'));

// Utils
const resp = require('./server/utils/resp');
app.use(resp);

// router
const router = require('./server/routes/');
app.use(router.routes());

http.createServer(app.callback()).listen(3000, "127.0.0.1");

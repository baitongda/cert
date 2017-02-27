const koa = require('koa');
const http = require('http');
const logger = require('koa-logger');
const mongoose = require('mongoose');
const serve = require('koa-static');
const json = require('koa-json');
const send = require('koa-send');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');
const DB = require('./server/config').DB;
// app
const app = koa();

app.use(cors());
// mongoose
mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://localhost:${DB.port}/${DB.db}`,
  { auth: { authdb: DB.db }, user: DB.user, pass: DB.pass }
);

app.use(bodyParser());
// json
app.use(json());
// app.use(json({ pretty: false, param: 'pretty' }));

// logger
app.use(logger());

// static files
app.use(serve(__dirname + '/server/public'));

// router
const router = require('./server/routes/');
app.use(router.routes());

http.createServer(app.callback()).listen(3000, "127.0.0.1");

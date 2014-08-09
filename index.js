var koa = require('koa');
var route = require('koa-route');
var serve = require('koa-static');

var db = require('./db');
var render = require('./render');


var app = koa();

app.use(serve('public/'));
app.use(route.get('/', home));

function *home() {
  var results = yield db.query("SELECT * FROM `posts` ORDER BY `time` DESC LIMIT 10");
  this.body = yield render('home', { posts: results[0] });
}

app.listen(8300);


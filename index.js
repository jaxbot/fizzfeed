var koa = require('koa');
var route = require('koa-route');
var serve = require('koa-static');

var render = require('./render');


var app = koa();

app.use(serve('public/'));
app.use(route.get('/', home));

function *home() {
  this.body = yield render('home');
}

app.listen(8300);


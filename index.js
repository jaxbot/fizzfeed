var koa = require('koa');
var route = require('koa-route');
var serve = require('koa-static');

var db = require('./db');
var render = require('./render');

var app = koa();

app.use(serve('public/'));
app.use(route.get('/', home));
app.use(route.get('/random', random));
app.use(route.get('/post/:id', post));

function *home() {
  var results = yield db.query("SELECT * FROM `posts` ORDER BY `time` DESC LIMIT 10");
  this.body = yield render('home', { posts: results[0] });
}

function *post(id) {
  var results = yield db.query("SELECT * FROM `posts` WHERE `link` = " + db.escape(id));
  this.body = yield render('post', { post: results[0][0] });
}

function *random(id) {
  var results = yield db.query("SELECT * FROM `posts` ORDER BY RAND() LIMIT 1");
  this.response.redirect('/post/' + results[0][0].link);
}

app.listen(8300);


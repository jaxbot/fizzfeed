var koa = require('koa');
var route = require('koa-route');
var serve = require('koa-static');
var bodyParser = require('koa-body-parser');

var db = require('./db');
var render = require('./render');

var app = koa();

app.use(bodyParser());
app.use(serve('public/'));
app.use(route.get('/', home));
app.use(route.get('/random', random));
app.use(route.get('/post/:id', post));
app.use(route.get('/submit', submit));
app.use(route.get('/submit/:key', submit));
app.use(route.post('/submit', create));

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

function *submit(key) {
  this.body = yield render('submit', { referer: this.request.headers.referer, key: key || '' });
}

function *create() {
  var results = yield db.query("INSERT INTO `posts` (title, body, link, time) VALUES (" + db.escape(this.request.body.title) + ", " + db.escape('lol') + ", " + db.escape(this.request.body.source) + ", " + db.escape((new Date).getTime() / 1000) + ")");
  //this.response.redirect('/post/' + results[0][0].link);
}

app.listen(8300);


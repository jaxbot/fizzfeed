var koa = require('koa');
var route = require('koa-route');
var serve = require('koa-static');
var parse = require('co-busboy');
var bodyParser = require('koa-body-parser');

var fs = require('fs');
var yfs = require('./fs');

var db = require('./db');
var render = require('./render');

var app = koa();

app.use(bodyParser());
app.use(serve('public/'));
app.use(route.get('/', home));
app.use(route.get('/random', random));
app.use(route.get('/post/:id', post));
app.use(route.get('/submit', submit));
app.use(route.get('/edit/:id', submit));
app.use(route.get('/gallery', gallery));
app.use(route.post('/submit', create));
app.use(route.post('/upload', upload));
app.use(error404);

function *home() {
  var results = yield db.query("SELECT * FROM `posts` ORDER BY `time` DESC LIMIT 10");
  this.body = yield render('home', { posts: results[0] });
}

function *post(id) {
  var results = yield db.query("SELECT * FROM `posts` WHERE `link` = " + db.escape(id));
  if (!results[0][0]) return this.status = 404;

  this.body = yield render('post', { post: results[0][0] });
}

function *random(id) {
  var results = yield db.query("SELECT * FROM `posts` ORDER BY RAND() LIMIT 1");
  this.response.redirect('/post/' + results[0][0].link);
}

function *submit(id) {
  var post = {};

  if (typeof id == "string") {
    var results = yield db.query("SELECT * FROM `posts` WHERE `link` = " + db.escape(id));
    post = results[0][0];
  }

  this.body = yield render('submit', {
    referer: this.request.headers.referer,
    post: post
  });
}

function *create() {
  if (!(yield isAdmin(this.cookies.get("S")))) {
    this.body = "not admin";
    return;
  }

  var link;
  if (a = this.request.body.link)
    link = a;
  else {
    link = this.request.body.title.toLowerCase().replace(/\s/g, "-");

    var temp = link;
    var check = yield db.query("SELECT `link` FROM `posts` WHERE `link`=" + db.escape(temp));
    var i = 1;
    while (check[0].length > 0) {
	  temp = link + "-" + i;
	  i++;
      check = yield db.query("SELECT `link` FROM `posts` WHERE `link`=" + db.escape(temp));
    }
    link = temp;
  }

  var results = yield db.query("REPLACE INTO `posts` (title, body, link, img, description, time) VALUES (" +
    db.escape(this.request.body.title) + ", " +
    db.escape(this.request.body.body) + ", " + db.escape(link) + ", " +
    db.escape(this.request.body.img) + ", " + db.escape(this.request.body.description) + ", " +
    db.escape((new Date).getTime() / 1000) + ")");
  this.response.redirect('/post/' + link);
}

function *upload() {
  if (!(yield isAdmin(this.cookies.get("S")))) {
    this.body = "not admin";
    return;
  }

  var parts = parse(this);
  var part;

  part = yield parts;
  var stream = fs.createWriteStream("public/uploads/" + part.filename);
  part.pipe(stream);

  this.body = part.filename;
}

function *gallery() {
  if (!(yield isAdmin(this.cookies.get("S")))) {
    this.body = "not admin";
    return;
  }

  var files = yield yfs.readdir("public/uploads");

  var body = "";
  for (var i = 0; i < files.length; i++) {
    body += "<img src=\"uploads/" + files[i] + "\" class=\"gallery\">";
  }
  this.body = body;
}

function *error404(next) {
  yield next;
  if (404 != this.status) return;
  this.status = 404;

  this.body = yield render('404')
}

app.listen(8300);

function *isAdmin(cookie) {
  if (!cookie) return false;

  var results = yield db.query("SELECT `user` FROM `keys` WHERE `key` = " + db.escape(cookie));
  return (results[0] && results[0].length > 0)

}


// Import required node modules (see package.json)
var koa = require('koa');
var route = require('koa-route');
var serve = require('koa-static');
var parse = require('co-busboy');
var bodyParser = require('koa-body-parser');

// File system class (for uploading image)
var fs = require('fs');
// Yieldable file system for loading images
var yfs = require('./fs');

// Markdown parser
var marked = require("marked");

// Local database connection
var db = require('./db');
var render = require('./render');

var app = koa();

// App route configuration
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

// Homepage
function *home() {
  var results = yield db.query("SELECT * FROM `posts` ORDER BY `time` DESC LIMIT 10");
  this.body = yield render('home', { posts: results[0] });
}

// View post
function *post(id) {
  var results = yield db.query("SELECT * FROM `posts` WHERE `link` = " + db.escape(id));
  if (!results[0][0]) {
    this.status = 404;
    this.body = yield render('404')
    return;
  }

  var post = results[0][0];
  post.body = marked(post.body);
  this.body = yield render('post', { post: post });
}

// Load random post
function *random(id) {
  var results = yield db.query("SELECT * FROM `posts` ORDER BY RAND() LIMIT 1");
  this.response.redirect('/post/' + results[0][0].link);
}

// Submit post
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

// Page to show form for creating posts
function *create() {
  var link;
  if (a = this.request.body.link)
    link = a;
  else {
    link = this.request.body.title.toLowerCase().replace(/\s/g, "-");

    // Generate a unique link ID using brute force -- keep counting up the number
    // until we find one thats unused
    var check;
    var temp = link;
    var i = 0;
    do {
      temp = link + (i ? "-" + i : "");
      check = yield db.query("SELECT `link` FROM `posts` WHERE `link`=" + db.escape(temp));
      i++;
    } while (check[0].length > 0);
    link = temp;
  }

  var results = yield db.query("REPLACE INTO `posts` (title, body, link, img, description, time) VALUES (" +
    db.escape(this.request.body.title) + ", " +
    db.escape(this.request.body.body) + ", " + db.escape(link) + ", " +
    db.escape(this.request.body.img) + ", " + db.escape(this.request.body.description) + ", " +
    db.escape((new Date).getTime() / 1000) + ")");
  this.response.redirect('/post/' + link);
}

// File upload example
function *upload() {
  var parts = parse(this);
  var part;

  part = yield parts;
  var stream = fs.createWriteStream("public/uploads/" + part.filename);
  part.pipe(stream);

  this.body = part.filename;
}

// Displays files found in public/uploads
function *gallery() {
  var files = yield yfs.readdir("public/uploads");

  var body = "";
  for (var i = 0; i < files.length; i++) {
    body += "<img src=\"uploads/" + files[i] + "\" class=\"gallery\">";
  }
  this.body = body;
}

// Shows 404 error page
function *error404(next) {
  yield next;
  if (404 != this.status) return;
  this.status = 404;

  this.body = yield render('404')
}

// Start HTTP on 8300
app.listen(8300);


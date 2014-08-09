var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'fizzfeed',
  config: {}
});

connection.connect();

module.exports.query = function (query) {
  return function(callback) {
    connection.query(query, callback);
  }
}

module.exports.escape = function (str) {
  return connection.escape(str);
}


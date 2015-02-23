var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'fizzfeed',
  config: {}
});

connection.connect();

// Make a thunk out of the async query function for yielding
module.exports.query = function (query) {
  return function(callback) {
    connection.query(query, callback);
  }
}

// Make a thunk out of the escape function
module.exports.escape = function (str) {
  return connection.escape(str);
}


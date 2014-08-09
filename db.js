var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'fizzfeed'
});

connection.connect();

module.exports.query = function (query) {
  return function(callback) {
    connection.query(query, callback);
  }
}


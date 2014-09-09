var fs = require('fs');

module.exports.readdir = function (dir) {
  return function(callback) {
    fs.readdir(dir, callback);
  }
}


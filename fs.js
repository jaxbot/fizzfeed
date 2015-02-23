var fs = require('fs');

// Make a thunk out of the Node fs readdir function
// This allows us to run yield readdir
module.exports.readdir = function (dir) {
  return function(callback) {
    fs.readdir(dir, callback);
  }
}


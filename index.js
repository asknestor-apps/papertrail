var Path = require('path');

module.exports = function(robot) {
  robot.loadFile(Path.resolve(__dirname, "src"), "papertrail.js");
};

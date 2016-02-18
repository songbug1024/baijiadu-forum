var fs = require('fs');
var browserify = require('browserify');
var stringify = require('stringify');
var bundle = browserify();

module.exports = function (name) {
  bundle.transform(stringify(['.html', '.tpl', '.hbs']))
  bundle.add(__dirname + '/../src/pages/' + name + '.js');

  bundle.bundle().pipe(fs.createWriteStream(__dirname + '/bundles/' + name + '.js'));
}

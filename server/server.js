var loopback = require('loopback');
var boot = require('loopback-boot');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);

var app = module.exports = loopback();

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    console.log('Web server listening at: %s', app.get('url'));
  });
};

app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
  store: new RedisStore({
    host: 'localhost',
    port: '6379'
  }),
  secret: 'duorou123'
}));
app.use('/uploads', loopback.static(path.resolve(__dirname, '../uploads')));
app.use('/forum', loopback.static(path.resolve(__dirname, '../client/forum')));

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});

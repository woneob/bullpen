var express = require('express');
var bodyParser = require('body-parser');
var ejsengine = require('ejs-locals');

var app = express();
var routes = require('./config/routes');

app.engine('ejs', ejsengine);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('port', 3801);
app.use(express.static(__dirname + '/dist'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

routes(app);

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

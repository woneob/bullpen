var express = require('express');
var app = express();
var ejsengine = require('ejs-locals');

app.engine('ejs', ejsengine);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('port', 3801);
app.use(express.static(__dirname + '/dist'));

app.get('/', function(req, res) {
	res.send('hello');
});

app.listen(app.get('port'), function() {
	console.log('Express server listening on port ' + app.get('port'));
});
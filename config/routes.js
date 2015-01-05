var cheerio = require('cheerio');
var request = require('request');

module.exports = function(app) {
	app.get('/', function(req, res) {
		res.render('index');
	});
};

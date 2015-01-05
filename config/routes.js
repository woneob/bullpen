var cheerio = require('cheerio');
var request = require('request');

function stripScripts(s) {
	return s.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

module.exports = function(app) {
	app.get('/', function(req, res) {
		res.render('index');
	});
};

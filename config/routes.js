var cheerio = require('cheerio');
var request = require('request');
var iconv = require('iconv-lite');

function stripScripts(s) {
	return s.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

module.exports = function(app) {
	app.get('/', function(req, res) {
		var url = 'http://mlbpark.donga.com/';

		request(url, function(error, response, html){
			if (error) {
				throw error
			};

			var $ = cheerio.load(stripScripts(html));
			console.log(stripScripts(html))
		});

		res.render('index');
	});
};

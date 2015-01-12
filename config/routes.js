var cheerio = require('cheerio');
var request = require('request');
var iconv = require('iconv-lite');

function stripScripts(s) {
  return s.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

function getUserId(s) {
  return s.replace(/.+&id=(.+)'\)/g, '$1');
}

function listData(data) {
  var $ = cheerio.load(data);
  var $posts = $('tr[height="30"]');

  var arr = [];
  var lastid;

  $posts.each(function(i, elem) {
    var item = this.children[1].children[1].children[1];
    var obj = {};
    var $link;

    if (this.type === 'tag' && this.children) {
      item = item.children;

      obj.num = $(this).find('td[width="45"]').text();

      $link = $(this).find('td[width="383"] > a');
      obj.isReply = !!$link.find('img[src$="re.gif"]').length;
      obj.articleId = $link.attr('title');
      obj.subject = $link.text().trim();

      obj.commentCount = $(this).find('td[width="383"] .A12oreng').text();

      obj.author = $(this).find('td[width="82"] a').text();
      obj.userId = getUserId($(this).find('td[width="82"] li:first-child').attr('onclick'));
      obj.date = $(this).find('td[width="66"]').text();
      obj.views = $(this).find('td[width="40"]').text();

      arr.push(obj);
      lastid = obj.articleId;
    }
  });

  return {
    array: arr,
    lastid: lastid
  };
}

var mlbparkPath = 'http://mlbpark.donga.com';
var bullpenPath = '/mbs/articleL.php?mbsC=bullpen2';

module.exports = function(app, db) {
  app.get('/', function(req, res) {
    res.redirect('/list');
  });

  app.get('/list/:articleId?', function(req, res) {

    res.render('index');
  });

  app.post('/api/list', function(req, res) {
    var reqData = req.body;
    var page = Number(reqData.page);
    var lastid = Number(reqData.lastid);

    var reqOpts = {
      url: mlbparkPath + bullpenPath + '&cpage='  + page,
      encoding: null
    };

    request.get(reqOpts, function(err, resp, body) {
      body = iconv.decode(body, 'EUC-KR');
      body = stripScripts(body);

      var data = listData(body);
      data.page = page;
      res.json(data);
    });
  });

  app.post('/api/article', function(req, res) {
    var reqData = req.body;
    var articleId = reqData.articleId;

    var reqOpts = {
      url: mlbparkPath + '/mbs/articleV.php?mbsC=bullpen2&mbsIdx=' + articleId,
      encoding: null
    };

    request.get(reqOpts, function(err, resp, body) {
      body = iconv.decode(body, 'EUC-KR');
      body = stripScripts(body);

      var $ = cheerio.load(body);

      if (!$('body').length) {
        res.send(500, {
          status: 500,
          message: 'internal error',
          type: 'internal'
        });
      }

      var imgPathReplacement = function(str) {
        var host = req.headers.host;
        var imgpath = host + '/img';
        str = str.replace(/imgpark\.donga\.com/gim, imgpath + '/imgpark');
        return str;
      };

      var data = {};
      $('style, script').remove();
      data.subject = $('td[width="82%"] strong').text();

      var $author = $('td[width="18%"] font');
      data.authorNickname = $author.find('a').text();
      data.authorId = getUserId($author.find('li:first-child').attr('onclick'));

      data.article = imgPathReplacement($('.G13 div[align="justify"]').html());
      data.articleId = articleId;
      data.date = $('.D11[width="225"] font:last-child').text();
      data.ip = $('.D11[width="201"] font:last-child').text();

      var $viewAndVotes = $('.D11[width="76"] strong');
      data.views = $viewAndVotes.eq(0).text();
      data.votes = $viewAndVotes.eq(1).text();

      res.json(data);
    });
  });

  app.get('/img/*', function(req, res) {
    var opts = {};
    var servers = {
      imgpark : {
        host: 'http://imgpark.donga.com',
        referer: 'http://mlbpark.donga.com'
      }
    };
    var pathArray = req.path.replace(/^\/img/, '').split('/');
    var serverType = pathArray.splice(1, 1)[0];

    var currentServer = servers[serverType];
    opts.url = currentServer.host + pathArray.join('/');
    opts.headers = {};
    opts.headers.Referer = currentServer.referer;

    request.get(opts).pipe(res);
  });
};

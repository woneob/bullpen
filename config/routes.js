var http = require('http');
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

    var comment;

    if (this.type === 'tag' && this.children) {
      item = item.children;

      obj.num = item[1].children[0].children[0].data;
      obj.articleId = item[3].children[1].attribs.title;
      obj.subject = item[3].children[1].children[0].data.trim();

      comment = item[3].children[2].children[0].children[0].children[0].children[0].children[0];
      obj.commentCount = comment ? comment.children[0].data : '';

      obj.author = item[5].children[0].children[1].children[0].data;
      obj.userId = getUserId(item[5].children[0].children[0].children[0].children[0].attribs.onclick);
      obj.date = item[9].children[0].children[0].data;
      obj.views = item[11].children[0].children[0].data;

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

module.exports = function(app) {
  app.get('/', function(req, res) {
    res.redirect('/page/1');
  });

  app.get('/page/:pageNum', function(req, res) {
    var reqURL = mlbparkPath + '/mbs/articleL.php?mbsC=bullpen2&cpage=' + req.params.pageNum;

    http.get(reqURL, function(response) {
      response.pipe(iconv.decodeStream('EUC-KR')).collect(function(err, body) {
        body = stripScripts(body);

        res.render('index', {
          postArr: listData(body)
        });
      });
    });
  });

  app.get('/article/:articleId', function(req, res) {
    var reqParams = req.params;
    var articleId = reqParams.articleId;
    var reqURL = mlbparkPath + '/mbs/articleV.php?mbsC=bullpen2&mbsIdx=' + articleId;

    http.get(reqURL, function(response) {
      response.pipe(iconv.decodeStream('EUC-KR')).collect(function(err, body) {
        body = stripScripts(body);
        var $ = cheerio.load(body);

        if (!$('body').length) {
          res.send('존재하지 않는 게시물 입니다.');
        }

        var data = {};
        data.subject = $('td[width="82%"] strong').text();
        data.author = $('td[width="18%"] font');
        data.authorNickname = data.author[0].children[3].children[0].children[0].data;
        data.authorId = getUserId(data.author[0].children[1].children[1].children[0].attribs.onclick);
        data.article = $('.G13 div[align="justify"]').html();
        data.articleNumber = articleId;
        data.date = $('.D11[width="225"] font:last-child').text();
        data.ip = $('.D11[width="201"] font:last-child').text();
        data.viewAndVotes = $('.D11[width="76"] strong');
        data.views = data.viewAndVotes.eq(0).text();
        data.votes = data.viewAndVotes.eq(1).text();

        res.render('view', data);
      });
    });
  });
};

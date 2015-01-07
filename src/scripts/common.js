var isNode = (typeof process !== 'undefined' && typeof require !== 'undefined');
var isNodeWebkit = false;
var gui;
var win;

if(isNode) {
  try {
    isNodeWebkit = (typeof require('nw.gui') !== 'undefined');
  } catch(e) {
    isNodeWebkit = false;
  }
}

(function($) {
  if (isNodeWebkit) {
    gui = require('nw.gui');
    win = gui.Window.get();

    win.resizeTo(600, 700);
    win.setPosition('center');

    win.setResizable(true);
  }

  var articleOpen = (function() {
    var $target = $('#indexMain .mainWrap');
    var $list = $('#list');

    var open = function(res) {
      $target.html([
        '<h1>' + res.subject +'</h1>',
        '<dl>',
        '  <dt>번호</dt>',
        '  <dd>' + res.articleNumber + '</dd>',
        '  <dt>등록자</dt>',
        '  <dd>' + res.authorNickname + '(' + res.authorId + ')</dd>',
        '  <dt>등록일</dt>',
        '  <dd>' + res.date + '</dd>',
        '  <dt>IP</dt>',
        '  <dd>' + res.ip + '</dd>',
        '  <dt>조회수</dt>',
        '  <dd>' + res.views + '</dd>',
        '  <dt>추천수</dt>',
        '  <dd>' + res.votes + '</dd>',
        '</dl>',
        '<article>',
        '  ' + res.article,
        '</article>'
      ].join('\n'));
    };

    $list.on('click', '.articleOpener', function(e) {
      var articleId = this.dataset.articleid;

      $.ajax({
        url: '/api/article',
        type: 'POST',
        data: {
          articleId: articleId
        },
        dataType : 'json',
        success: function(res) {
          open(res);
        }
      });
    });
  })();

  var loadMore = (function() {
    var $button = $('#loadMore');
    var $target = $('#list');

    var createList = function(res) {
      var ul = document.createElement('ul');
      var $t;
      var li;

      for (var i = 0, len = res.length; i < len; i++) {
        $t = res[i];
        li = document.createElement('li');
        li.className = 'articleOpener';
        li.dataset.articleid = $t.articleId;
        li.innerHTML = [
          '<div>',
          $t.subject,
          '  <span class="comment">' + ($t.commentCount || '') + '</span>',
          '</div>',
          '<div class="meta">',
          $t.num, 
          $t.author + '(' + $t.userId + ')',
          $t.date,
          $t.views,
          '</div>'
        ].join('\n');

        ul.appendChild(li);
      }

      $target.append(ul);
    };

    var loadList = function() {
      var data = this.dataset;

      $.ajax({
        url: '/api/list',
        type: 'POST',
        data: {
          lastid: data.lastid,
          page: data.page
        },
        dataType : 'json',
        success: function(res) {
          createList(res.array);
          $button.attr({
            'data-lastid': res.lastid,
            'data-page': res.page
          });
        }
      });
    };

    $button.on('click', loadList);
  })();

  var sidebarResizer = (function() {
    var $splitter = $('#splitter');
    var $sidebar = $('#indexAside');

    $splitter.on('mousedown', function(e) {
      e.preventDefault();
      $(document).on({
        mousemove: function(e) {
          $sidebar.css({
            width: e.pageX
          });

          $(document.body).addClass('resizing');
        },
        mouseup: function(e) {
          $(this).off('mousemove');
          $(document.body).removeClass('resizing');
        }
      });
    });
  })();
})(jQuery);

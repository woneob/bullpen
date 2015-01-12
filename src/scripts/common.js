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

    win.resizeTo(900, 600);
    win.setPosition('center');

    win.setResizable(true);
  }

  var articleOpen = (function() {
    var $target = $('#indexMain .mainWrap');
    var $list = $('#list');

    var open = function(res) {
      $target.html([
        '<h1>' + res.subject +'</h1>',
        '<dl class="articleInfo">',
        '  <dt class="author">등록자</dt>',
        '  <dd class="author">' + res.authorNickname + '(' + res.authorId + ')</dd>',
        '  <dt class="ip">IP</dt>',
        '  <dd class="ip">' + res.ip + '</dd>',
        '  <dt class="date">등록일</dt>',
        '  <dd class="date">' + res.date + '</dd>',
        '  <dt class="views">조회수</dt>',
        '  <dd class="views">' + res.views + '</dd>',
        '  <dt class="votes">추천수</dt>',
        '  <dd class="votes">' + res.votes + '</dd>',
        '</dl>',
        '<article>',
        '  ' + res.article,
        '</article>'
      ].join('\n'));
    };

    var loadAjax = function(articleId) {
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
    };

    var clearCurrent = function() {
      $list.find('.current').removeClass('current');
    };

    $list.on('click', '.articleOpener', function(e) {
      if ($(this).hasClass('current')) {
        clearCurrent();
        $target.empty();
        return;
      }

      var articleId = this.dataset.articleid;

      history.pushState({
        articleId: articleId
      }, null, '/list/' + articleId);

      clearCurrent();
      $(this).addClass('current');
      loadAjax(articleId);
    });

    $(window).on("popstate", function(e) {
      var data = e.originalEvent.state.articleId;

      if (!data) {
        return;
      }

      loadAjax(data);
      clearCurrent();
      $list.find('[data-articleid="' + data +'"]').addClass('current');
    });

    $(document).ready(function() {
      var pathnameArray = window.location.pathname.split('/');

      if (pathnameArray.length <= 2) {
        return;
      }

      if (pathnameArray[1] === 'list' && pathnameArray[2].length) {
        loadAjax(pathnameArray[2]);
      }
    });
  })();

  var loadMore = (function() {
    var $button = $('#loadMore');
    var $target = $('#list');
    var $aside = $('.asideWrap');

    var createList = function(res) {
      var ul = document.createElement('ul');
      var $t;
      var li;

      for (var i = 0, len = res.length; i < len; i++) {
        $t = res[i];
        li = document.createElement('li');
        li.className = 'articleOpener';
        li.dataset.articleid = $t.articleId;

        if ($t.isReply) {
          li.dataset.reply = 'true';
        }

        li.innerHTML = [
          '<div>',
          '  <em class="subject">' + $t.subject + '</em>',
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

    var inInfinity = false;
    var isLoading = false;

    var loadList = function() {
      var data = $button.data();

      if (isLoading) {
        return;
      }

      $.ajax({
        url: '/api/list',
        type: 'POST',
        data: {
          lastid: data.lastid,
          page: data.page
        },
        dataType : 'json',
        beforeSend: function() {
          isLoading = true;
        },
        success: function(res) {
          createList(res.array);
          $button.data({
            lastid: res.lastid,
            page: +res.page + 1
          });
          inInfinity = true;
        },
        complete: function() {
          isLoading = false;
        }
      });
    };

    $button.on('click', loadList);
    $(document).ready(loadList);
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

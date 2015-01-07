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

  var loadMore = function() {
    var $button = $('#loadMore');
    var $target = $('#list');

    var createList = function(res) {
      var ul = document.createElement('ul');
      var $t;
      var li;

      for (var i = 0, len = res.length; i < len; i++) {
        $t = res[i];
        li = document.createElement('li');
        li.innerHTML = [
          '<a href="/article/' + $t.articleId + '"">',
          $t.subject,
          '  <span class="comment">' + ($t.commentCount || '') + '</span>',
          '</a>',
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
  };

  loadMore();
})(jQuery);

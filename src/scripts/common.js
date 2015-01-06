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
})(jQuery);

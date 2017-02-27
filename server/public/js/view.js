if (window.parent != window) {
  var origin = '*';
  var init = false;

  document.addEventListener("click", function(ev) {
    if (!init) {
      ev.stopPropagation();
      ev.preventDefault();
    }
  }, true);

  window.addEventListener('message', function(e) {
    // console.log(e);
    if (e.source != window.parent) return;
    var html = document.getElementsByTagName('html')[0];
    html.style.width = e.data + 'px';
  }, false);

  window.parent.postMessage(JSON.stringify({ url: window.location.href }), origin);

  document.addEventListener("DOMContentLoaded", function(e) {
    var html = document.getElementsByTagName('html')[0];
    html.style.height = '100%';

    var body = document.body;
    body.style.height = '100%';

    var content = body.childNodes;
    var wrapper = document.createElement('div');
    wrapper.id = 'view-wrapper';
    wrapper.setAttribute('style', 'height: 100%; width: 100%; overflow-x: hidden; overflow-y: scroll; -webkit-overflow-scrolling : touch;')
    for (var i = 0; i < content.length; ++i) {
      if (content[i].nodeType == 1) wrapper.appendChild(content[i])
    }
    body.innerHTML = '';
    body.appendChild(wrapper);
  });

  if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g)) {
    document.addEventListener("DOMContentLoaded", function(e) {
      var wrapper = document.getElementById('view-wrapper');
      wrapper.style['-webkit-overflow-scrolling'] = 'auto';

      var startY, startTopScroll;
      document.addEventListener('touchstart', function(e) {
        startY = e.touches[0].pageY;
    		startTopScroll = wrapper.scrollTop;
    		if (startTopScroll <= 0) wrapper.scrollTop = 1;
    		if (startTopScroll + wrapper.offsetHeight >= wrapper.scrollHeight)
    			wrapper.scrollTop = wrapper.scrollHeight - wrapper.offsetHeight - 1;
      });
    });
  }

  window.addEventListener("load", function(e) {
    var buy = window.goumai;
    if (typeof buy === 'function') {
      window.goumai = function(id, price) {
        if (price <= 0) return buy.apply(window, arguments);
        // console.log(id, price);
        window.parent.postMessage(JSON.stringify({
          id: id,
          price: price,
        }), origin);
      }
    }
    init = true;
  });
}

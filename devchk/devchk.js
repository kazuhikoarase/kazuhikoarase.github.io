$(function() {

  function formatNumber(n) {
    var digit = 2;
    var d = 1;
    for (var t = 0; t < digit; t += 1) { d *= 10; }
    n = +n;
    if (isNaN(n) ) {
      n = 0;
    }
    var i = '' + ~~n;
    var f = '' + ~~(Math.abs(n) * d % d);
    while (f.length < digit) {
      f = '0' + f;
    }
    return i + '.' + f;
  }

  $('BODY').css('margin', '0px').
    css('padding', '0px').css('overflow', 'hidden');

  function createSVGElement(tagName) {
    return $(document.createElementNS(
        'http:/' + '/www.w3.org/2000/svg', tagName) );
  }

  function setSVGSize(svg, width, height) {
    return svg.attr({
      version: '1.1',
      width: width, height: height,
      viewBox: '0 0 ' + width + ' ' + height
    });
  }

  function createX(w, h) {
    return createSVGElement('path').
      attr('fill', 'none').
      attr('stroke', '#0000ff').
      attr('d', 'M 0 0 L ' + w + ' ' + h +
        ' M 0 ' + h + ' L ' + w + ' 0');
  }

  function createWorld() {
    var _w = 0;
    var _h = 0;
    function enterFrame(event) {
      var w = $(window).width();
      var h = $(window).height();
      if (_w != w || _h != h) {
        _w = w;
        _h = h;
        setSVGSize($svg, _w, _h);
        $svg.html('');
        $svg.append(createX(_w, _h) );
      }

      $info.html('');
      function addInfo(msg) {
        $info.append($('<div></div>').addClass('info').text(msg) );
      }

      addInfo(navigator.userAgent);
      var tbl = [
        ['window-size', _w + 'x' + _h],
        ['do.absolute', ac0.absolute],
        ['do.alpha', formatNumber(ac0.alpha)],
        ['do.beta', formatNumber(ac0.beta)],
        ['do.gamma', formatNumber(ac0.gamma)],
        ['dm.x', formatNumber(ac1.x)],
        ['dm.y', formatNumber(ac1.y)],
        ['dm.z', formatNumber(ac1.z)],
        ['dmIG.x', formatNumber(ac2.x)],
        ['dmIG.y', formatNumber(ac2.y)],
        ['dmIG.z', formatNumber(ac2.z)]
      ];
      var $tbody = $('<tbody></tbody>');
      for (var i = 0; i < tbl.length; i += 1) {
        $tbody.append($('<tr></tr>').
            append($('<th></th>').text(tbl[i][0] + ':') ).
            append($('<td></td>').text('' + tbl[i][1]) ) );
      }
      $info.append($('<table></table>').
          addClass('info-tbl').append($tbody) );
    }

    var ac0 = { absolute: false, alpha: 0, beta: 0, gamma: 0 };
    var ac1 = { x: 0, y: 0, z: 0 };
    var ac2 = { x: 0, y: 0, z: 0 };

    window.addEventListener('deviceorientation', function(event) {
      ac0 = event;
    });
    window.addEventListener('devicemotion', function(event) {
      if (event.acceleration && event.acceleration.x != null) {
        ac1 = event.acceleration;
        ac2 = event.accelerationIncludingGravity;
      }
    });

    var $svg = createSVGElement('svg').css('position', 'absolute').
      css('left', '0px').css('top', '0px');
    var $info = $('<div></div>').css('position', 'absolute').
        css('left', '0px').css('top', '0px');
    var $body = $('<div></div>').
      css('position', 'relative').
      append($svg).
      append($info).
      on('enterFrame', enterFrame);
    return $body;
  }

  var $w = createWorld();
  $('#ph').append($w);

  function watch() {
    $w.trigger('enterFrame');
    window.setTimeout(watch, 50);
  }
  watch();

});

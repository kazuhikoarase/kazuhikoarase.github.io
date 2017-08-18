'use strict';

var $ = lessQuery;

$(function() {

  var formatNumber = function(n) {
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
  };

  $('BODY').css('margin', '0px').
    css('padding', '0px').css('overflow', 'hidden');

  var createSVGElement = function(tagName) {
    return $(document.createElementNS(
        'http:/' + '/www.w3.org/2000/svg', tagName) );
  };

  var setSVGSize = function(svg, width, height) {
    return svg.attr({
      version: '1.1',
      width: width, height: height,
      viewBox: '0 0 ' + width + ' ' + height
    });
  };

  var createX = function(w, h) {
    return createSVGElement('path').
      attr('fill', 'none').
      attr('stroke', '#0000ff').
      attr('d', 'M 0 0 L ' + w + ' ' + h +
        ' M 0 ' + h + ' L ' + w + ' 0');
  };

  var createWorld = function() {

    var _w = 0;
    var _h = 0;
    var _ac0 = { absolute: false, alpha: 0, beta: 0, gamma: 0 };
    var _ac1 = { x: 0, y: 0, z: 0 };
    var _ac2 = { x: 0, y: 0, z: 0 };

    var getTime = function() {
      return +new Date();
    };
    var _lastTime = getTime();

    $(window).on('deviceorientation', function(event) {
      _ac0 = event;
    });

    $(window).on('devicemotion', function(event) {
      if (event.acceleration && event.acceleration.x != null) {
        _ac1 = event.acceleration;
        _ac2 = event.accelerationIncludingGravity;
      }
    });

    var enterFrame = function(event) {

      var time = getTime();
      var dt = time - _lastTime;
      _lastTime = time;

      var w = $(window).width();
      var h = $(window).height();

      if (_w != w || _h != h) {
        _w = w;
        _h = h;
        setSVGSize($svg, _w, _h);
        $svg.children().remove();
        $svg.append(createX(_w, _h) );
      }

      $info.html('');

      var addInfo = function(msg) {
        $info.append($('<div></div>').
            addClass('box').text(msg) );
      };

      addInfo(navigator.userAgent);

      var tbl = [
        ['window-size', _w + 'x' + _h],
        ['do.absolute', _ac0.absolute],
        ['do.alpha', formatNumber(_ac0.alpha)],
        ['do.beta', formatNumber(_ac0.beta)],
        ['do.gamma', formatNumber(_ac0.gamma)],
        ['dm.x', formatNumber(_ac1.x)],
        ['dm.y', formatNumber(_ac1.y)],
        ['dm.z', formatNumber(_ac1.z)],
        ['dmIG.x', formatNumber(_ac2.x)],
        ['dmIG.y', formatNumber(_ac2.y)],
        ['dmIG.z', formatNumber(_ac2.z)],
        ['dt', formatNumber(dt)]
      ];

      var $tbody = $('<tbody></tbody>');
      for (var i = 0; i < tbl.length; i += 1) {
        $tbody.append($('<tr></tr>').
          append($('<th></th>').text(tbl[i][0] + ':') ).
          append($('<td></td>').text('' + tbl[i][1]) ) );
      }

      $info.append($('<br/>') ).
        append($('<div></div>').addClass('box').
        append($('<table></table>').
        addClass('info-tbl').append($tbody) ) );
    };

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
  };

  var $w = createWorld();
  $('#ph').append($w);

  var watch = function() {
    $w.trigger('enterFrame');
    window.setTimeout(watch, 50);
  };
  watch();

/*  
  function watch(timestamp) {
    $w.trigger('enterFrame');
    window.requestAnimationFrame(watch);
  }
  window.requestAnimationFrame(watch);
*/
});

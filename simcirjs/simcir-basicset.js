
!function($) {
  var graphics = function($target) {
    var buf = '';
    var moveTo = function(x, y) {
      buf += ' M ' + x + ' ' + y;
    };
    var lineTo = function(x, y) {
      buf += ' L ' + x + ' ' + y;
    };
    var curveTo = function(x1, y1, x, y) {
      buf += ' Q ' + x1 + ' ' + y1 + ' ' + x + ' ' + y;
    };
    var closePath = function() {
      buf += ' Z';
      $target.append(simcir.createSVGElement('path').
          attr('d', buf).
          css('stroke', '#000000').
          css('stroke-width', '1').
          css('fill', 'none') );
      buf = '';
    };
    var drawCircle = function(x, y, r) {
      $target.append(simcir.createSVGElement('circle').
          attr({cx: x, cy: y, r: r}).
          css('stroke', '#000000').
          css('stroke-width', '1').
          css('fill', 'none') );
    };
    return {
      moveTo: moveTo,
      lineTo: lineTo,
      curveTo: curveTo,
      closePath: closePath,
      drawCircle: drawCircle
    };
  };
  var drawBuffer = function(g, x, y, width, height) {
    g.moveTo(x, y);
    g.lineTo(x + width, y + height / 2);
    g.lineTo(x, y + height);
    g.lineTo(x, y);
    g.closePath();
  };
  var drawAND = function(g, x, y, width, height) {
    g.moveTo(x, y);
    g.curveTo(x + width, y, x + width, y + height / 2);
    g.curveTo(x + width, y + height, x, y + height);
    g.lineTo(x, y);
    g.closePath();
  };
  var drawOR = function(g, x, y, width, height) {
    var depth = width * 0.2;
    g.moveTo(x, y);
    g.curveTo(x + width, y, x + width, y + height / 2);
    g.curveTo(x + width, y + height, x, y + height);
    g.curveTo(x + depth, y + height, x + depth, y + height / 2);
    g.curveTo(x + depth, y, x, y);
    g.closePath();
  };
  var drawEOR = function(g, x, y, width, height) {
    drawOR(g, x + 3, y, width - 3, height);
    var depth = (width - 3) * 0.2;
    g.moveTo(x, y + height);
    g.curveTo(x + depth, y + height, x + depth, y + height / 2);
    g.curveTo(x + depth, y, x, y);
    g.closePath();
  };
  var drawNOT = function(g, x, y, width, height) {
    drawBuffer(g, x, y, width - 4, height);
    g.drawCircle(x + width - 2, y + height / 2, 2);
  };
  var drawNAND = function(g, x, y, width, height) {
    drawAND(g, x, y, width - 4, height);
    g.drawCircle(x + width - 2, y + height / 2, 2);
  };
  var drawNOR = function(g, x, y, width, height) {
    drawOR(g, x, y, width - 4, height);
    g.drawCircle(x + width - 2, y + height / 2, 2);
  };
  var drawENOR = function(g, x, y, width, height) {
    drawEOR(g, x, y, width - 4, height);
    g.drawCircle(x + width - 2, y + height / 2, 2);
  };
    
  var HIGH = 1;
  
  simcir.registerDevice('beta-sw', function(device) {
    // create a single output
    var out = device.addOutput();
    // create a button
    var $button = simcir.createSVGElement('rect').
      attr({x: 8, y: 8, width: 16, height: 16}).
      css('stroke', '#000000').
      css('fill', '#f0f0f0').
      css('pointer-events', 'visiblePainted');
    device.$ui.append($button);
    $button.on('mousedown', function(event) {
      event.preventDefault();
      event.stopPropagation();
      out.setValue(null);
    } );
    $button.on('mouseup', function(event) {
      out.setValue(HIGH);
    } );
    // set a default value
    out.setValue(HIGH);
  });

  simcir.registerDevice('beta-nand', function(device) {
    var in1 = device.addInput();
    var in2 = device.addInput();
    var out = device.addOutput();
    device.$ui.on('inputValueChange', function() {
      var b1 = in1.getValue() != null;
      var b2 = in2.getValue() != null;
      var o = !(b1 && b2);
      out.setValue(o? HIGH : null);
    } );
    var g = graphics(device.$ui);
    drawNAND(g, 8, 8, 16, 16);
  });

}(jQuery);


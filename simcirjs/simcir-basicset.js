//
// SimcirJS - basicset
//
// Copyright (c) 2014 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//

!function($) {

  var unit = simcir.unit;

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
      // fake
      //buf += ' Z';
      $target.append(simcir.createSVGElement('path').
          attr('d', buf).
          attr('class', 'simcir-basicset-symbol') );
      buf = '';
    };
    var drawCircle = function(x, y, r) {
      $target.append(simcir.createSVGElement('circle').
          attr({cx: x, cy: y, r: r}).
          attr('class', 'simcir-basicset-symbol') );
    };
    return {
      moveTo: moveTo,
      lineTo: lineTo,
      curveTo: curveTo,
      closePath: closePath,
      drawCircle: drawCircle
    };
  };
  // symbol draw functions
  var drawBUF = function(g, x, y, width, height) {
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
    drawBUF(g, x, y, width - 4, height);
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
  // logical functions
  var AND = function(a, b) { return a & b; };
  var OR = function(a, b) { return a | b; };
  var EOR = function(a, b) { return a ^ b; };
  var BUF = function(a) { return (a == 1)? 1 : 0; };
  var NOT = function(a) { return (a == 1)? 0 : 1; };

  var intValue = function(v) { return (v != null)? 1 : 0; };

  var createSwitchFactory = function(type) {
    return function(device) {
      var in1 = device.addInput();
      var out1 = device.addOutput();
      var on = (type == 'PushOff');
      var $button = simcir.createSVGElement('rect').
        attr({x: 8, y: 8, width: 16, height: 16, rx: 2, ry: 2}).
        css('pointer-events', 'visiblePainted');
      device.$ui.append($button);
      var button_mouseDownHandler = function(event) {
        event.preventDefault();
        event.stopPropagation();
        if (type == 'PushOn') {
          on = true;
          simcir.addClass($button, 'simcir-basicset-switch-pressed');
        } else if (type == 'PushOff') {
          on = false;
          simcir.addClass($button, 'simcir-basicset-switch-pressed');
        } else if (type == 'Toggle') {
          on = !on;
          simcir.addClass($button, 'simcir-basicset-switch-pressed');
        }
        updateOutput();
        $(document).on('mouseup', button_mouseUpHandler);
      };
      var button_mouseUpHandler = function(event) {
        if (type == 'PushOn') {
          on = false;
          simcir.removeClass($button, 'simcir-basicset-switch-pressed');
        } else if (type == 'PushOff') {
          on = true;
          simcir.removeClass($button, 'simcir-basicset-switch-pressed');
        } else if (type == 'Toggle') {
          // keep state
          if (!on) {
            simcir.removeClass($button, 'simcir-basicset-switch-pressed');
          }
        }
        updateOutput();
        $(document).off('mouseup', button_mouseUpHandler);
      };
      $button.on('mousedown', button_mouseDownHandler);
      simcir.addClass(device.$ui, 'simcir-basicset-switch');
      device.$ui.on('inputValueChange', function() {
        if (on) {
          out1.setValue(in1.getValue() );
        }
      } );
      var updateOutput = function() {
        out1.setValue(on? in1.getValue() : null);
      };
      updateOutput();
    };
  };

  var createLogicGateFactory = function(op, out, draw, singleInput) {
    return function(device) {
      var numInputs = singleInput? 1 :
        Math.max(2, device.deviceDef.numInputs || 2);
      for (var i = 0; i < numInputs; i += 1) {
        device.addInput();
      }
      device.addOutput();
      var inputs = device.getInputs();
      var outputs = device.getOutputs();
      device.$ui.on('inputValueChange', function() {
        var b = intValue(inputs[0].getValue() );
        if (op != null) {
          for (var i = 1; i < inputs.length; i += 1) {
            b = op(b, intValue(inputs[i].getValue() ) );
          }
        }
        b = out(b);
        outputs[0].setValue( (b == 1)? 1 : null);
      } );
      device.halfPitch = inputs.length > 2;
      var size = device.getSize();
      var g = graphics(device.$ui);
      draw(g, 
        (size.width - unit) / 2,
        (size.height - unit) / 2,
        unit, unit);
    };
  };

  simcir.registerDevice('DC', function(device) {
    device.addOutput().setValue(1);
    simcir.addClass(device.$ui, 'simcir-basicset-dc');
  } );

  // register switches
  simcir.registerDevice('PushOff', createSwitchFactory('PushOff') );
  simcir.registerDevice('PushOn', createSwitchFactory('PushOn') );
  simcir.registerDevice('Toggle', createSwitchFactory('Toggle') );

  // register logic gates
  simcir.registerDevice('BUF', createLogicGateFactory(null, BUF, drawBUF, true) );
  simcir.registerDevice('NOT', createLogicGateFactory(null, NOT, drawNOT, true) );
  simcir.registerDevice('AND', createLogicGateFactory(AND, BUF, drawAND, false) );
  simcir.registerDevice('NAND', createLogicGateFactory(AND, NOT, drawNAND, false) );
  simcir.registerDevice('OR', createLogicGateFactory(OR, BUF, drawOR, false) );
  simcir.registerDevice('NOR', createLogicGateFactory(OR, NOT, drawNOR, false) );
  simcir.registerDevice('EOR', createLogicGateFactory(EOR, BUF, drawEOR, false) );
  simcir.registerDevice('ENOR', createLogicGateFactory(EOR, NOT, drawENOR, false) );

}(jQuery);

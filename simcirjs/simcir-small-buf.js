//
// SimcirJS - small-buf
//
// Copyright (c) 2016 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//

// includes following device types:
//  SmallBUF

!function($, $s) {

  var unit = $s.unit;
  var maxFadeCount = 16;
  var fadeTimeout = 100;

  var Direction = { WE : 0, NS : 1, EW : 2, SN : 3 };

  $s.registerDevice('SmallBUF', function(device) {

    var in1 = device.addInput();
    var out1 = device.addOutput();
    device.$ui.on('inputValueChange', function() {
      out1.setValue(in1.getValue() );
    });

    var state = device.deviceDef.state || { direction : Direction.WE };
    device.getState = function() {
      return state;
    };

    device.getSize = function() {
      return { width : unit, height : unit };
    };

    var super_createUI = device.createUI;
    device.createUI = function() {
      super_createUI();

      var $path = $s.createSVGElement('path').
        css('pointer-events', 'none').css('opacity', 0);
      $s.addClass($path, 'simcir-connector');
      device.$ui.append($path);

      var $point = $s.createSVGElement('circle').
        css('pointer-events', 'none').css('opacity', 0).
        css('stroke-width', 3).attr('r', 2);
      $s.addClass($point, 'simcir-connector');
      device.$ui.append($point);

      var updatePoint = function() {
        $point.css('display', out1.getInputs().length > 1? '' : 'none');
      };

      updatePoint();

      var super_connectTo = out1.connectTo;
      out1.connectTo = function(inNode) {
        super_connectTo(inNode);
        updatePoint();
      };
      var super_disconnectFrom = out1.disconnectFrom;
      out1.disconnectFrom = function(inNode) {
        super_disconnectFrom(inNode);
        updatePoint();
      };

      var updateUI = function() {
        var x0, y0, x1, y1;
        x0 = y0 = x1 = y1 = unit / 2;
        var d = unit / 2;
        var direction = state.direction;
        if (direction == Direction.WE) {
          x0 -= d;
          x1 += d;
        } else if (direction == Direction.NS) {
          y0 -= d;
          y1 += d;
        } else if (direction == Direction.EW) {
          x0 += d;
          x1 -= d;
        } else if (direction == Direction.SN) {
          y0 += d;
          y1 -= d;
        }
        $path.attr('d', 'M' + x0 + ' ' + y0 + 'L' + x1 + ' ' + y1);
        $s.transform(in1.$ui, x0, y0);
        $s.transform(out1.$ui, x1, y1);
        $point.attr({cx : x1, cy : y1});
        if (direction == Direction.EW || direction == Direction.WE) {
          device.$ui.children('.simcir-device-body').
          attr({x: 0, y: unit / 4, width: unit, height: unit / 2});
        } else {
          device.$ui.children('.simcir-device-body').
          attr({x: unit / 4, y: 0, width: unit / 2, height: unit});
        }
      };

      updateUI();

      // fadeout a body.
      var fadeCount = 0;
      var setOpacity = function(opacity) {
        device.$ui.children('.simcir-device-body,.simcir-node').
          css('opacity', opacity);
        $path.css('opacity', 1 - opacity);
        $point.css('opacity', 1 - opacity);
      };
      var fadeout = function() {
        window.setTimeout(function() {
          if (fadeCount > 0) {
            fadeCount -= 1;
            setOpacity(fadeCount / maxFadeCount);
            fadeout();
          }
        }, fadeTimeout);
      };

      var device_mouseoutHandler = function(event) {
        fadeCount = maxFadeCount;
        fadeout();
      };
      var device_dblclickHandler = function(event) {
        state.direction = (state.direction + 1) % 4;
        updateUI();
        // update connectors.
        $(this).trigger('mousedown').trigger('mouseup');
      };
      var $title = $s.createSVGElement('title').
        text('Double-Click to change a direction.');
      device.$ui.on('mouseover', function(event) {
          setOpacity(1);
          fadeCount = 0;
        }).on('deviceAdd', function() {
          if ($(this).closest('BODY').length == 0) {
            setOpacity(0);
          }
          $(this).append($title).on('mouseout', device_mouseoutHandler).
            on('dblclick', device_dblclickHandler);
        }).on('deviceRemove', function() {
          $(this).off('mouseout', device_mouseoutHandler).
            off('dblclick', device_dblclickHandler);
          $title.remove();
        });

      // hide a label
      device.$ui.children('.simcir-device-label').css('display', 'none');
    };
  } );

}(jQuery, simcir);

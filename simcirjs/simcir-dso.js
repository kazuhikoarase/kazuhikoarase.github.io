//
// SimcirJS - transmitter
//
// Copyright (c) 2016 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//

// includes following device types:
//  Transmitter

'use strict';
!function($, $s) {

  // unit size
  var unit = $s.unit;

  var createDSOFactory = function() {

    var timeRanges = [10000, 5000, 2000, 1000];
    var maxTimeRange = timeRanges[0];

    var createProbe = function(color) {

      var samples = [];

      var model = {
        valueRange : 1,
        timeRange : maxTimeRange
      };

      var $path = $s.createSVGElement('path').
        css('fill', 'none').
        css('stroke-width', 1).
        css('stroke-linejoin', 'bevel').
        css('stroke', color);

      var setValueRange = function(valueRange) {
        model.valueRange = valueRange;
      };

      var setTimeRange = function(timeRange) {
        model.timeRange = timeRange;
      };

      var update = function(ts, x, y, width, height) {
        var d = '';
        for (var i = samples.length - 1; i >= 0; i -= 1) {
          var last = i - 1 >= 0 && ts - samples[i - 1].ts > model.timeRange;
          var val = samples[i].value;
          if (!last && i > 0 && i + 1 < samples.length &&
              samples[i - 1].value === val &&
              samples[i + 1].value === val) {
            continue;
          }
          if (typeof val != 'number') {
            val = 0;
          }
          var sx = x + width - (ts - samples[i].ts) / model.timeRange * width;
          var sy = y + height - val / model.valueRange * height;
          d += d == ''? 'M' : 'L';
          d += sx + ' ' + sy;
          if (last) {
            break;
          }
        }
        $path.attr('d', d);
      };

      var sample = function(ts, value) {
        samples.push({ts: ts, value: value});
        while (ts - samples[0].ts > maxTimeRange) {
          samples.shift();
        }
      };

      return {
        $ui : $path,
        setValueRange : setValueRange,
        setTimeRange : setTimeRange,
        update : update,
        sample : sample
      };
    };

    return function(device) {

      var numInputs = 4;
      var scale = 1;
      var gap = 2;

      for (var i = 0; i < numInputs; i += 1) {
        device.addInput();
      }

      device.getSize = function() {
        return { width : unit * 4,
          height : unit * (numInputs * scale + 2) };
      };

      var super_createUI = device.createUI;
      device.createUI = function() {
        super_createUI();

        var $display = $s.createSVGElement('g');
        device.$ui.append($display);
        $s.transform($display, unit / 2, unit / 2);

        var $rect = $s.createSVGElement('rect').
          css('stroke', 'none').css('fill', '#000000').
          attr({x: 0, y: 0, width: unit * 3,
            height: unit * numInputs * scale });
        $display.append($rect);

        var probes = [];
        for (var i = 0; i < device.getInputs().length; i += 1) {
          var inNode = device.getInputs()[i];
          $s.transform(inNode.$ui, 0, unit *
              (0.5 + 0.5 * scale + i * scale) );
          var probe = createProbe('#00ffcc');
          probes.push(probe);
          $display.append(probe.$ui);
        }
        var fontSize = 8;
        var rangeIndex = 0;
        var $rangeText = $s.createSVGElement('text').
          css('stroke', 'none').
          css('fill', '#000000').
          css('font-size', fontSize + 'px').attr({x : 2, y : fontSize + 2});
        var $range = $s.createSVGElement('g').
          append($s.createSVGElement('rect').
              css('stroke', 'none').
              css('fill', '#999999').
              attr({x : 0, y : 0, width: unit * 8, height : unit }) ).
          append($rangeText).
          on('mousedown', function(event) {
            var timeRange = timeRanges[rangeIndex];
            rangeIndex = (rangeIndex + 1) % timeRanges.length;
            $rangeText.text('TimeRange: ' + timeRange + 'ms');
            for (var i = 0; i < probes.length; i += 1) {
              probes[i].setTimeRange(timeRange);
            }
          }).trigger('mousedown');
        $s.transform($range, unit * 2 + unit / 2,
            unit * numInputs * scale + unit / 2);
        device.$ui.append($range);

        var $btn = $s.createSVGElement('g').
          append($s.createSVGElement('rect').
              css('stroke', 'none').
              css('fill', '#999999').
              attr({x : 0, y : 0, width: unit, height : unit }) );
        $s.transform($btn, unit / 2,
            unit * numInputs * scale + unit / 2);
        device.$ui.append($btn);


        var alive = false;
        var render = function(ts) {
          for (var i = 0; i < device.getInputs().length; i += 1) {
            probes[i].sample(ts, device.getInputs()[i].getValue() );
            probes[i].update(ts, 0, unit * i * scale + gap,
                unit * 15, unit * scale - gap * 2);
          }
          if (alive) {
            window.requestAnimationFrame(render);
          }
        };

        device.$ui.on('deviceAdd', function() {

            device.$ui.children('.simcir-device-body').
              attr('width', unit * 16);
            device.$ui.children('.simcir-device-label').
              attr('x', unit * 8);
            $rect.attr('width', unit * 15);

            alive = true;
            window.requestAnimationFrame(render);

          }).on('deviceRemove', function() {
            alive = false;
          });
      };
    };
  };

  $s.registerDevice('DSO', createDSOFactory() );

}(jQuery, simcir);

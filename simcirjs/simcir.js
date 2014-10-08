//
// SimcirJS
//
// Copyright (c) 2014 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//

var simcir = function($) {

  var createSVGElement = function(tagName) {
    return $(document.createElementNS(
        'http://www.w3.org/2000/svg', tagName) );
  };

  var createSVG = function(w, h) {
    return createSVGElement('svg').attr({
      version: '1.1',
      width: w, height: h,
      viewBox: '0 0 ' + w + ' ' + h
    });
  };

  var eachClass = function($o, f) {
    var className = $o.attr('class');
    if (className) {
      $.each(className.split(/\s+/g), f);
    }
  };

  var addClass = function($o, className, remove) {
    var newClass = '';
    eachClass($o, function(i, c) {
      if (!(remove && c == className) ) {
        newClass += '\u0020';
        newClass += c;
      }
    });
    if (!remove) {
      newClass += '\u0020';
      newClass += className;
    }
    $o.attr('class', newClass);
    return $o;
  };

  var removeClass = function($o, className) {
    return addClass($o, className, true);
  };

  var hasClass = function($o, className) {
    var found = false;
    eachClass($o, function(i, c) {
      if (c == className) {
        found = true;
      }
    } );
    return found;
  };

  var transform = function() {
    var attrX = 'simcir-transform-x';
    var attrY = 'simcir-transform-y';
    var num = function($o, k) {
      var v = $o.attr(k);
      return v? +v : 0;
    };
    return function($o, x, y) {
      if (arguments.length == 3) {
        $o.attr('transform', 'translate(' + x + ',' + y + ')');
        $o.attr(attrX, x);
        $o.attr(attrY, y);
      } else if (arguments.length == 1) {
        return {x: num($o, attrX), y: num($o, attrY)};
      }
    };
  }();

  var offset = function($o) {
    var x = 0;
    var y = 0;
    while ($o[0].nodeName != 'svg') {
      var pos = transform($o);
      x += pos.x;
      y += pos.y;
      $o = $o.parent();
    }
    return {x: x, y: y};
  };

  var enableEvents = function($o, enable) {
    $o.css('pointer-events', enable? 'visiblePainted' : 'none');
  };

  var controller = function() {
    var id = 'controller';
    return function($ui, controller) {
      if (arguments.length == 1) {
        return $.data($ui[0], id);
      } else if (arguments.length == 2) {
        $.data($ui[0], id, controller);
      }
    };
  }();

  var eventQueue = function() {
    var queue = [];
    var postEvent = function(event) {
      queue.push(event);
    };
    window.setInterval(function() {
      while (queue.length > 0) {
        var e = queue.shift();
        e.target.trigger(e.type);
      }
    }, 50);
    return {
      postEvent: postEvent
    };
  }();

  var unit = 16;
  var fontSize = 12;

  var createLabel = function(text) {
    return createSVGElement('text').
      text(text).
      css('font-size', fontSize + 'px');
  };

  var createNode = function(type, label) {
    var $node = createSVGElement('g').
      attr('simcir-node-type', type).
      attr('class', 'simcir-node');
    var node = createNodeController({
      $ui: $node, type: type, label: label });
    if (type == 'in') {
      controller($node, createInputNodeController(node) );
    } else if (type == 'out') {
      controller($node, createOutputNodeController(node) );
    } else {
      throw 'unknown type:' + type;
    }
    transform($node, 0, 0);
    return $node;
  };

  var createNodeController = function(node) {
    var _value = null;
    var setValue = function(value, force) {
      if (_value === value && !force) {
        return;
      }
      _value = value;
      eventQueue.postEvent({target: node.$ui, type: 'nodeValueChange'});
    };
    var getValue = function() {
      return _value;
    };

    node.$ui.attr('class', 'simcir-node simcir-node-type-' + node.type);

    var $circle = createSVGElement('circle').
      attr({cx: 0, cy: 0, r: 4});
    node.$ui.on('mouseover', function(event) {
      addClass(node.$ui, 'simcir-node-hover');
    } );
    node.$ui.on('mouseout', function(event) {
      removeClass(node.$ui, 'simcir-node-hover');
    } );
    node.$ui.append($circle);

    if (node.label) {
      var $label = createLabel(node.label).
        attr('class', 'simcir-node-label');
      if (node.type == 'in') {
        $label.attr('text-anchor', 'start').
          attr('x', 6).
          attr('y', fontSize / 2);
      } else if (node.type == 'out') {
        $label.attr('text-anchor', 'end').
          attr('x', -6).
          attr('y', fontSize / 2);
      }
      node.$ui.append($label);
    }
    node.$ui.on('nodeValueChange', function(event) {
      if (_value != null) {
        addClass(node.$ui, 'simcir-node-hot');
      } else {
        removeClass(node.$ui, 'simcir-node-hot');
      }
    } );
    return $.extend(node, {
      setValue: setValue,
      getValue: getValue
    });
  };

  var createInputNodeController = function(node) {
    var output = null;
    var setOutput = function(outNode) {
      output = outNode;
    };
    var getOutput = function() {
      return output;
    };
    return $.extend(node, {
      setOutput: setOutput,
      getOutput: getOutput
    });
  };

  var createOutputNodeController = function(node) {
    var inputs = [];
    var super_setValue = node.setValue;
    var setValue = function(value) {
      super_setValue(value);
      $.each(inputs, function(i, inputNode) {
        inputNode.setValue(value);
      } );
    };
    var connectTo = function(inNode) {
      if (inNode.getOutput() != null) {
        inNode.getOutput().disconnectFrom(inNode);
      }
      inNode.setOutput(node);
      inputs.push(inNode);
      inNode.setValue(node.getValue(), true);
    };
    var disconnectFrom = function(inNode) {
      if (inNode.getOutput() != node) {
        throw 'not connected.';
      }
      inNode.setOutput(null);
      inNode.setValue(null, true);
      inputs = $.grep(inputs, function(v) {
        return v != inNode;
      } );
    };
    var getInputs = function() {
      return inputs;
    };
    return $.extend(node, {
      setValue: setValue,
      getInputs: getInputs,
      connectTo: connectTo,
      disconnectFrom: disconnectFrom
    });
  };

  var createDevice = function(deviceDef) {
    var $dev = createSVGElement('g').
      attr('class', 'simcir-device');
    controller($dev, createDeviceController(
        {$ui: $dev, deviceDef: deviceDef}) );
    var factory = factories[deviceDef.type];
    if (factory) {
      factory(controller($dev) );
    }
    controller($dev).doLayout();
    return $dev;
  };

  var createDeviceController = function(device) {
    var addInput = function(label) {
      var $node = createNode('in', label);
      $node.on('nodeValueChange', function(event) {
        device.$ui.trigger('inputValueChange');
      });
      device.$ui.append($node);
      return controller($node);
    };
    var addOutput = function(label) {
      var $node = createNode('out', label);
      device.$ui.append($node);
      return controller($node);
    };
    var getSize = function() {
      var nodes = Math.max(device.getInputs().length,
          device.getOutputs().length);
      return { width: unit * 2,
        height: unit * Math.max(2, device.halfPitch?
            (nodes + 1) / 2 : nodes)};
    };
    var doLayout = function() {

      var size = device.getSize();
      var w = size.width;
      var h = size.height;

      $rect.attr({x: 0, y: 0, width: w, height: h});

      var pitch = device.halfPitch? unit / 2 : unit;
      var layoutNodes = function(nodes, x) {
        var offset = (h - pitch * (nodes.length - 1) ) / 2;
        $.each(nodes, function(i, node) {
          transform(node.$ui, x, pitch * i + offset);
        } );
      };
      layoutNodes(getInputs(), 0);
      layoutNodes(getOutputs(), w);
      
      $label.attr({x: w / 2, y: h + fontSize});
    };
    var getImpl = function(type) {
      return device.$ui.
        children('[simcir-node-type="' + type + '"].simcir-node').
        map(function() { return controller($(this) ); } );
    };
    var getInputs = function() {
      return getImpl('in');
    };
    var getOutputs = function() {
      return getImpl('out');
    };
    var disconnectAll = function() {
      $.each(getInputs(), function(i, inNode) {
        outNode = inNode.getOutput();
        if (outNode != null) {
          outNode.disconnectFrom(inNode);
        }
      } );
      $.each(getOutputs(), function(i, outNode) {
        $.each(outNode.getInputs(), function(i, inNode) {
          outNode.disconnectFrom(inNode);
        } );
      } );
    };

    var selected = false;
    var setSelected = function(value) {
      selected = value;
      if (selected) {
        addClass($rect, 'simcir-device-selected');
      } else {
        removeClass($rect, 'simcir-device-selected');
      }
    };
    var isSelected = function() {
      return selected;
    };
    
    device.$ui.attr('class', 'simcir-device');

    var $rect = createSVGElement('rect').attr('rx', 2).attr('ry', 2);
    device.$ui.append($rect);

    var label = device.deviceDef.label;
    if (typeof label == 'undefined') {
      label = device.deviceDef.type;
    }
    var $label = createLabel(label).
      attr('class', 'simcir-device-label').
      attr('text-anchor', 'middle');
    device.$ui.append($label);

    return $.extend(device, {
      addInput: addInput,
      addOutput: addOutput,
      getInputs: getInputs,
      getOutputs: getOutputs,
      disconnectAll: disconnectAll,
      setSelected: setSelected,
      isSelected: isSelected,
      getSize: getSize,
      doLayout: doLayout,
      halfPitch: false
    });
  };

  var createConnector = function(x1, y1, x2, y2) {
    return createSVGElement('path').
      attr('d', 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2).
      attr('class', 'simcir-connector');
  };

  var connect = function($node1, $node2) {
    var type1 = $node1.attr('simcir-node-type');
    var type2 = $node2.attr('simcir-node-type');
    if (type1 == 'in' && type2 == 'out') {
      controller($node2).connectTo(controller($node1) );
    } else if (type1 == 'out' && type2 == 'in') {
      controller($node1).connectTo(controller($node2) );
    }
  };

  var buildCircuit = function(data) {
    var $devices = [];
    var $devMap = {};
    var getNode = function(path) {
      if (!path.match(/^(\w+)\.([0-9]+)$/g) ) {
        throw 'unknown path:' + path;
      }
      var devId = RegExp.$1;
      var index = +RegExp.$2;
      return $($devMap[devId].children('.simcir-node')[index]);
    };
    $.each(data.devices, function(i, deviceDef) {
      var $dev = createDevice(deviceDef);
      transform($dev, deviceDef.x, deviceDef.y);
      $devices.push($dev);
      $devMap[deviceDef.id] = $dev;
    } );
    $.each(data.connectors, function(i, conn) {
      connect(getNode(conn.from), getNode(conn.to) );
    } );
    return $devices;
  };

  var createDeviceRefFactory = function(data) {
    return function(device) {
      var $devs = buildCircuit(data);
      var $ports = [];
      $.each($devs, function(i, $dev) {
        var deviceDef = controller($dev).deviceDef;
        if (deviceDef.type == 'In' || deviceDef.type == 'Out') {
          $ports.push($dev);
        }
      });
      $ports.sort(function($p1, $p2) {
        var x1 = controller($p1).deviceDef.x;
        var y1 = controller($p1).deviceDef.y;
        var x2 = controller($p2).deviceDef.x;
        var y2 = controller($p2).deviceDef.y;
        if (x1 == x2) {
          return (y1 < y2)? -1 : 1;
        }
        return (x1 < x2)? -1 : 1;
      } );
      $.each($ports, function(i, $dev) {
        var deviceDef = controller($dev).deviceDef;
        var inPort;
        var outPort;
        if (deviceDef.type == 'In') {
          inPort = device.addInput(deviceDef.label);
          outPort = controller($dev).getOutputs()[0];
          // force disconnect test devices that connected to In-port
          var inNode = controller($dev).getInputs()[0];
          if (inNode.getOutput() != null) {
            inNode.getOutput().disconnectFrom(inNode);
          }
        } else if (deviceDef.type == 'Out') {
          outPort = device.addOutput(deviceDef.label);
          inPort = controller($dev).getInputs()[0];
        } 
        inPort.$ui.on('nodeValueChange', function() {
          outPort.setValue(inPort.getValue() );
        } );
      } );
      var super_getSize = device.getSize;
      device.getSize = function() {
        var size = super_getSize();
        return {width: unit * 4, height: size.height};
      };
    };
  };

  var factories = {};
  var registerDevice = function(type, factory) {
    if (typeof factory == 'object') {
      factory = createDeviceRefFactory(factory);
    }
    factories[type] = factory;
  };

  var createScrollbar = function() {

    // vertical only.
    var _value = 0;
    var _min = 0;
    var _max = 0;
    var _barSize = 0;
    var _width = 0;
    var _height = 0;

    var $body = createSVGElement('rect');
    var $bar = createSVGElement('g').
      append(createSVGElement('rect') ).
      attr('class', 'simcir-scrollbar-bar');
    var $scrollbar = createSVGElement('g').
      attr('class', 'simcir-scrollbar').
      append($body).append($bar);

    var dragPoint = null;
    var bar_mouseDownHandler = function(event) {
      event.preventDefault();
      event.stopPropagation();
      var pos = transform($bar);
      dragPoint = {
          x: event.pageX - pos.x,
          y: event.pageY - pos.y};
      $(document).on('mousemove', bar_mouseMoveHandler);
      $(document).on('mouseup', bar_mouseUpHandler);
    };
    var bar_mouseMoveHandler = function(event) {
      calc(function(unitSize) {
        setValues( (event.pageY - dragPoint.y) /
            unitSize, _min, _max, _barSize); 
      });
    };
    var bar_mouseUpHandler = function(event) {
      $(document).off('mousemove', bar_mouseMoveHandler);
      $(document).off('mouseup', bar_mouseUpHandler);
    };
    $bar.on('mousedown', bar_mouseDownHandler);
    var body_mouseDownHandler = function(event) {
      var off = $scrollbar.parents('svg').offset();
      var pos = transform($scrollbar);
      var y = event.pageY - off.top - pos.y;
      var barPos = transform($bar);
      if (y < barPos.y) {
        setValues(_value - _barSize, _min, _max, _barSize); 
      } else {
        setValues(_value + _barSize, _min, _max, _barSize); 
      }
    };
    $body.on('mousedown', body_mouseDownHandler);

    var setSize = function(width, height) {
      _width = width;
      _height = height;
      layout();
    };
    var layout = function() {

      $body.attr({x: 0, y: 0, width: _width, height: _height});

      var visible = _max - _min > _barSize;
      $bar.css('display', visible? 'inline' : 'none');
      if (!visible) {
        return;
      }
      calc(function(unitSize) {
        $bar.children('rect').
          attr({x: 0, y: 0, width: _width, height: _barSize * unitSize});
        transform($bar, 0, _value * unitSize);
      } );
    };
    var calc = function(f) {
      f(_height / (_max - _min) );
    };
    var setValues = function(value, min, max, barSize) {
      value = Math.max(min, Math.min(value, max - barSize) ); 
      var changed = (value != _value);
      _value = value;
      _min = min;
      _max = max;
      _barSize = barSize;
      layout();
      if (changed) {
        $scrollbar.trigger('scrollValueChange');
      }
    };
    var getValue = function() {
      return _value;
    };
    controller($scrollbar, {
      setSize: setSize,
      setValues: setValues,
      getValue: getValue
    });
    return $scrollbar;
  };

  var createWorkspace = function(data) {

    data = $.extend({
      width: 800,
      height: 300,
      toolbox: [],
      devices: [],
      connectors: [],
    }, data);

    var workspaceWidth = data.width;
    var workspaceHeight = data.height;
    var barWidth = unit;
    var toolboxWidth = unit * 6 + barWidth;

    var $workspace = createSVG(
        workspaceWidth, workspaceHeight).
      attr('class', 'simcir-workspace');

    var $toolboxDevicePane = createSVGElement('g');
    var $scrollbar = createScrollbar();
    $scrollbar.on('scrollValueChange', function(event) {
      transform($toolboxDevicePane, 0,
          -controller($scrollbar).getValue() );
    });
    controller($scrollbar).setSize(barWidth, workspaceHeight);
    transform($scrollbar, toolboxWidth - barWidth, 0);
    var $toolboxPane = createSVGElement('g').
      attr('class', 'simcir-toolbox').
      append(createSVGElement('rect').
        attr({x: 0, y: 0,
          width: toolboxWidth,
          height: workspaceHeight}) ).
      append($toolboxDevicePane).
      append($scrollbar);

    var $devicePane = createSVGElement('g');
    transform($devicePane, toolboxWidth, 0);
    var $connectorPane = createSVGElement('g');
    var $temporaryPane = createSVGElement('g');
  
    enableEvents($connectorPane, false);
    enableEvents($temporaryPane, false);
    
    $workspace.append($toolboxPane);
    $workspace.append($devicePane);
    $workspace.append($connectorPane);
    $workspace.append($temporaryPane);

    //-------------------------------------------
    // APIs
    // 

    var addDevice = function($dev) {
      $devicePane.append($dev);
    };

    var removeDevice = function($dev) {
      // before remove, disconnect all
      controller($dev).disconnectAll();
      $dev.remove();
      updateConnectors();
    };

    var disconnect = function($inNode) {
      var inNode = controller($inNode);
      if (inNode.getOutput() != null) {
        inNode.getOutput().disconnectFrom(inNode);
      }
      updateConnectors();
    };

    var updateConnectors = function() {
      $connectorPane.children().remove();
      $devicePane.children('.simcir-device').each(function() {
        var device = controller($(this) );
        $.each(device.getInputs(), function(i, inNode) {
          if (inNode.getOutput() != null) {
            var p1 = offset(inNode.$ui);
            var p2 = offset(inNode.getOutput().$ui);
            $connectorPane.append(
                createConnector(p1.x, p1.y, p2.x, p2.y) );
          }
        } );
      } );
    };

    var loadToolbox = function(data) {
      var vgap = 8;
      var y = vgap;
      $.each(data.toolbox, function(i, deviceDef) {
        var $dev = createDevice(deviceDef);
        $toolboxDevicePane.append($dev);
        var size = controller($dev).getSize();
        transform($dev, (toolboxWidth - barWidth - size.width) / 2, y);
        y += (size.height + fontSize + vgap);
      } );
      controller($scrollbar).setValues(0, 0, y, workspaceHeight);
    };

    var text = function() {

      // renumber all id
      var devIdCount = 0;
      $devicePane.children('.simcir-device').each(function() {
        var $dev = $(this);
        var devId = 'dev' + devIdCount++;
        controller($dev).id = devId;
        var nodeIdCount= 0;
        $dev.children('.simcir-node').each(function() {
          var $node = $(this);
          controller($node).id = devId + '.' + nodeIdCount++;
        });
      });

      var toolbox = [];
      var devices = [];
      var connectors = [];
      var clone = function(obj) {
        return JSON.parse(JSON.stringify(obj) );
      };
      $toolboxDevicePane.children('.simcir-device').each(function() {
        var $dev = $(this);
        var device = controller($dev);
        toolbox.push(device.deviceDef);
      });
      $devicePane.children('.simcir-device').each(function() {
        var $dev = $(this);
        var device = controller($dev);
        $.each(device.getInputs(), function(i, inNode) {
          if (inNode.getOutput() != null) {
            connectors.push({from:inNode.id, to:inNode.getOutput().id});
          }
        });
        var pos = transform($dev);
        var deviceDef = clone(device.deviceDef);
        deviceDef.id = device.id;
        deviceDef.x = pos.x;
        deviceDef.y = pos.y;
        if (typeof deviceDef.label == 'undefined') {
          deviceDef.label = deviceDef.type;
        }
        devices.push(deviceDef);
      });

      var buf = '';
      var print = function(s) {
        buf += s;
      };
      var println = function(s) {
        print(s);
        buf += '\r\n';
      };
      var printArray = function(array) {
        $.each(array, function(i, item) {
          println('    ' + JSON.stringify(item) +
              (i + 1 < array.length? ',' : '') );
        });
      };
      println('{');
      println('  "width":' + workspaceWidth + ',');
      println('  "height":' + workspaceHeight + ',');
      println('  "toolbox":[');
      printArray(toolbox);
      println('  ],');
      println('  "devices":[');
      printArray(devices);
      println('  ],');
      println('  "connectors":[');
      printArray(connectors);
      println('  ]');
      print('}');
      return buf;
    };
    
    //-------------------------------------------
    // mouse operations

    var dragMoveHandler = null;
    var dragCompleteHandler = null;

    var isActiveNode = function($o) {
      return $o.closest('.simcir-node').length == 1 &&
        $o.closest('.simcir-toolbox').length == 0;
    };
    var adjustDevice = function($dev) {
      var pitch = unit / 2;
      var adjust = function(v) { return Math.round(v / pitch) * pitch; };
      var pos = transform($dev);
      var size = controller($dev).getSize();
      var x = Math.max(0, Math.min(pos.x,
          workspaceWidth - toolboxWidth - size.width) );
      var y = Math.max(0, Math.min(pos.y,
          workspaceHeight - size.height) );
      transform($dev, adjust(x), adjust(y) );
    };

    var beginConnect = function(event, $target) {
      var $srcNode = $target.closest('.simcir-node');
      var off = $workspace.offset();
      var pos = offset($srcNode);
      if ($srcNode.attr('simcir-node-type') == 'in') {
        disconnect($srcNode);
      }
      dragMoveHandler = function(event) {
        var x = event.pageX - off.left;
        var y = event.pageY - off.top;
        $temporaryPane.children().remove();
        $temporaryPane.append(createConnector(pos.x, pos.y, x, y) );
      };
      dragCompleteHandler = function(event) {
        $temporaryPane.children().remove();
        var $dst = $(event.target);
        if (isActiveNode($dst) ) {
          var $dstNode = $dst.closest('.simcir-node');
          connect($srcNode, $dstNode);
          updateConnectors();
        }
      };
    };

    var beginNewDevice = function(event, $target) {
      var $dev = $target.closest('.simcir-device');
      var pos = offset($dev);
      $dev = createDevice(controller($dev).deviceDef);
      transform($dev, pos.x, pos.y);
      $temporaryPane.append($dev);
      var dragPoint = {
        x: event.pageX - pos.x,
        y: event.pageY - pos.y};
      dragMoveHandler = function(event) {
        transform($dev, 
            event.pageX - dragPoint.x,
            event.pageY - dragPoint.y);
      };
      dragCompleteHandler = function(event) {
        var $target = $(event.target);
        if ($target.closest('.simcir-toolbox').length == 0) {
          $dev.detach();
          var pos = transform($dev);
          transform($dev, pos.x - toolboxWidth, pos.y);
          adjustDevice($dev);
          addDevice($dev);
        } else {
          $dev.remove();
        }
      };
    };
    
    var $selectedDevices = [];
    var addSelected = function($dev) {
      controller($dev).setSelected(true);
      $selectedDevices.push($dev);
    };
    var deselectAll = function() {
      $devicePane.children('.simcir-device').each(function() {
        controller($(this) ).setSelected(false);
      });
      $selectedDevices = [];
    };
    
    var beginMoveDevice = function(event, $target) {
      var $dev = $target.closest('.simcir-device');
      var pos = transform($dev);
      if (!controller($dev).isSelected() ) {
        deselectAll();
        addSelected($dev);
        // to front.
        $dev.parent().append($dev.detach() );
      }
      // disable events while dragging.
      enableEvents($dev, false);
      var dragPoint = {
        x: event.pageX - pos.x,
        y: event.pageY - pos.y};
      dragMoveHandler = function(event) {
        var curPos = transform($dev);
        var deltaPos = {
          x: event.pageX - dragPoint.x - curPos.x,
          y: event.pageY - dragPoint.y - curPos.y};
        $.each($selectedDevices, function(i, $dev) {
          var curPos = transform($dev);
          transform($dev, 
              curPos.x + deltaPos.x,
              curPos.y + deltaPos.y);
        });
        updateConnectors();
      };
      dragCompleteHandler = function(event) {
        var $target = $(event.target);
        enableEvents($dev, true);
        $.each($selectedDevices, function(i, $dev) {
          if ($target.closest('.simcir-toolbox').length == 0) {
            adjustDevice($dev);
            updateConnectors();
          } else {
            removeDevice($dev);
          }
        });
      };
    };

    var beginSelectDevice = function(event, $target) {
      var intersect = function(rect1, rect2) {
        return !(
            rect1.x > rect2.x + rect2.width ||
            rect1.y > rect2.y + rect2.height ||
            rect1.x + rect1.width < rect2.x ||
            rect1.y + rect1.height < rect2.y);
      };
      var pointToRect = function(p1, p2) {
        return {
          x: Math.min(p1.x, p2.x),
          y: Math.min(p1.y, p2.y),
          width: Math.abs(p1.x - p2.x),
          height: Math.abs(p1.y - p2.y)};
      };
      deselectAll();
      var off = $workspace.offset();
      var pos = offset($devicePane);
      var p1 = {x: event.pageX - off.left, y: event.pageY - off.top};
      dragMoveHandler = function(event) {
        deselectAll();
        var p2 = {x: event.pageX - off.left, y: event.pageY - off.top};
        var selRect = pointToRect(p1, p2);
        $devicePane.children('.simcir-device').each(function() {
          var $dev = $(this);
          var devPos = transform($dev);
          var devSize = controller($dev).getSize();
          var devRect = {
              x: devPos.x + pos.x,
              y: devPos.y + pos.y,
              width: devSize.width,
              height: devSize.height};
          if (intersect(selRect, devRect) ) {
            addSelected($dev);
          }
        });
        $temporaryPane.children().remove();
        $temporaryPane.append(createSVGElement('rect').
            attr(selRect).
            attr('class', 'simcir-selection-rect') );
      };
    };

    var mouseDownHandler = function(event) {
      var $target = $(event.target);
      event.preventDefault();
      if (isActiveNode($target) ) {
        beginConnect(event, $target);
      } else if ($target.closest('.simcir-device').length == 1) {
        if ($target.closest('.simcir-toolbox').length == 1) {
          beginNewDevice(event, $target);
        } else {
          beginMoveDevice(event, $target);
        }
      } else {
        beginSelectDevice(event, $target);
      }
      $(document).on('mousemove', mouseMoveHandler);
      $(document).on('mouseup', mouseUpHandler);
    };
    var mouseMoveHandler = function(event) {
      if (dragMoveHandler != null) {
        dragMoveHandler(event);
      }
    };
    var mouseUpHandler = function(event) {
      if (dragCompleteHandler != null) {
        dragCompleteHandler(event);
      }
      dragMoveHandler = null;
      dragCompleteHandler = null;
      $devicePane.children('.simcir-device').each(function() {
        enableEvents($(this), true);
      });
      $temporaryPane.children().remove();
      $(document).off('mousemove', mouseMoveHandler);
      $(document).off('mouseup', mouseUpHandler);
    };
    $workspace.on('mousedown', mouseDownHandler);

    //-------------------------------------------
    //

    loadToolbox(data);
    $.each(buildCircuit(data), function(i, $dev) {
      addDevice($dev);
    } );
    updateConnectors();

    controller($workspace, {
      text: text
    });

    return $workspace;
  };

  var createPortFactory = function(type) {
    return function(device) {
      var in1 = device.addInput();
      var out1 = device.addOutput();
      device.$ui.on('inputValueChange', function() {
        out1.setValue(in1.getValue() );
      } );
      var size = device.getSize();
      var cx = size.width / 2;
      var cy = size.height / 2;
      device.$ui.append(createSVGElement('circle').
        attr({cx: cx, cy: cy, r: unit / 2}).
        attr('class', 'simcir-port simcir-node-type-' + type) );
      device.$ui.append(createSVGElement('circle').
        attr({cx: cx, cy: cy, r: unit / 4}).
        attr('class', 'simcir-port-hole') );
    };
  };
  // register built-in devices
  registerDevice('In', createPortFactory('in') );
  registerDevice('Out', createPortFactory('out') );

  $(function() {
    $('.simcir').each(function() {
      !function($placeHolder) {

        var $workspace = simcir.createWorkspace(
            JSON.parse($placeHolder.text() ) );

        var $dataArea = $('<textarea></textarea>').
          addClass('simcir-json-data-area').
          attr('readonly', 'readonly').
          css('width', $workspace.attr('width') + 'px').
          css('height', $workspace.attr('height') + 'px');

        var showData = false;
        var toggle = function() {
          if (showData) {
            $dataArea.val(controller($workspace).text() );
          }
          $workspace.css('display', !showData? 'inline' : 'none');
          $dataArea.css('display', showData? 'inline' : 'none');
          showData = !showData;
        };

        $placeHolder.text('');
        $placeHolder.append($workspace);
        $placeHolder.append($dataArea);
        $placeHolder.on('click', function(event) {
          if (event.ctrlKey || event.metaKey) {
            toggle();
          }
        });
        toggle();

      }($(this) );
    });
  } );

  return {
    createSVGElement: createSVGElement,
    createWorkspace: createWorkspace,
    registerDevice: registerDevice,
    addClass: addClass,
    removeClass: removeClass,
    hasClass: hasClass,
    unit: unit
  };
}(jQuery);

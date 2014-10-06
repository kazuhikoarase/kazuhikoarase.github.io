//
// SimcirJS
//
// Copyright (c) 2014 kazuhiko arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//

var simcir = function($) {

  var SVG_NS = 'http://www.w3.org/2000/svg';

  var fontSize = 12;

  var createSVGElement = function(tagName) {
    return $(document.createElementNS(SVG_NS, tagName) );
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

  var controller = function($$ui, value) {
    if (arguments.length == 1) {
      return $.data($$ui[0], 'controller');
    } else if (arguments.length == 2) {
      $.data($$ui[0], 'controller', value);
    }
  };

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

  var createLabel = function(text) {
    return createSVGElement('text').
      text(text).
      css('font-size', fontSize + 'px');
  };

  var createNode = function(type, label) {
    var $node = createSVGElement('g').
      attr('simcir-node-type', type).
      attr('class', 'simcir-node');
    var node = createNodeController({ $ui: $node, label: label });
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

    var $circle = createSVGElement('circle').
      attr({cx: 0, cy: 0, r: 4}).
      attr('class', 'simcir-node-body');
    $circle.on('mouseover', function(event) {
      addClass($circle, 'simcir-node-body-hover');
    } );
    $circle.on('mouseout', function(event) {
      removeClass($circle, 'simcir-node-body-hover');
    } );
    node.$ui.append($circle);

    if (node.label) {
      var $label = createLabel(node.label).
        attr('text-anchor', 'middle'); // start, end
      node.$ui.append($label);
    }
    
    node.$ui.on('nodeValueChange', function(event) {
      if (_value != null) {
        addClass($circle, 'simcir-node-body-hot');
      } else {
        removeClass($circle, 'simcir-node-body-hot');
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
    controller($dev, createDeviceController({$ui: $dev, deviceDef: deviceDef}) );
    factories[deviceDef.type](controller($dev) );
    controller($dev).doLayout();
    return $dev;
  };

  var createDeviceController = function(device) {
    var addInput = function(label) {
      var $node = createNode('in');
      $node.on('nodeValueChange', function(event) {
        device.$ui.trigger('inputValueChange');
      });
      device.$ui.append($node);
      return controller($node);
    };
    var addOutput = function(label) {
      var $node = createNode('out');
      device.$ui.append($node);
      return controller($node);
    };
    var doLayout = function() {

      // todo

      device.deviceDef.width = 32;
      device.deviceDef.height = 32;
      
      var w = device.deviceDef.width;
      var h = device.deviceDef.height;

      $rect.attr({x: 0, y: 0, width: w, height: h});
      var y;
      y = 0;
      $.each(getInputs(), function(i, node) {
        transform(node.$ui, 0, y);
        y += 8;
      } );
      y = 0;
      $.each(getOutputs(), function(i, node) {
        transform(node.$ui, w, y);
        y += 8;
      } );

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

    var $rect = createSVGElement('rect').
      attr('class', 'simcir-device-body');
    device.$ui.append($rect);

    var $label = createLabel(device.deviceDef.label || '').
      attr('text-anchor', 'middle');
    device.$ui.append($label);

    return $.extend(device, {
      addInput: addInput,
      addOutput: addOutput,
      doLayout: doLayout,
      getInputs: getInputs,
      getOutputs: getOutputs,
      disconnectAll: disconnectAll
    });
  };

  var createConnector = function(x1, y1, x2, y2) {
    return createSVGElement('path').
      attr('d', 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2).
      attr('class', 'simcir-connector');
  };

  var createWorkspace = function(data) {

    data = $.extend({
      width: 320,
      height: 240,
      toolbox: [],
      devices: [],
      connectors: [],
    }, data);

    var workspaceWidth = data.width;
    var workspaceHeight = data.height;
    var toolboxWidth = 48;

    var $workspace = createSVG(
        workspaceWidth, workspaceHeight).
      attr('class', 'simcir-workspace');
    var $toolboxPane = createSVGElement('g').
      attr('class', 'simcir-toolbox').
      append(createSVGElement('rect').
        attr({x: 0, y: 0,
          width: toolboxWidth,
          height: workspaceHeight}).
        attr('class', 'simcir-toolbox-body') );
    var $devicePane = createSVGElement('g');
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

    var connect = function($node1, $node2) {
      var type1 = $node1.attr('simcir-node-type');
      var type2 = $node2.attr('simcir-node-type');
      if (type1 == 'in' && type2 == 'out') {
        controller($node2).connectTo(controller($node1) );
        updateConnectors();
      } else if (type1 == 'out' && type2 == 'in') {
        controller($node1).connectTo(controller($node2) );
        updateConnectors();
      }
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

    var load = function(data) {
      var $devs = {};
      var getNode = function(path) {
        if (!path.match(/^(\w+)\.([0-9]+)$/g) ) {
          throw 'unknown path:' + path;
        }
        var devId = RegExp.$1;
        var index = +RegExp.$2;
        return $($devs[devId].children('.simcir-node')[index]);
      };
      $.each(data.devices, function(i, deviceDef) {
        var $dev = createDevice(deviceDef);
        transform($dev, deviceDef.x, deviceDef.y);
        addDevice($dev);
        $devs[deviceDef.id] = $dev;
      } );
      $.each(data.connectors, function(i, conn) {
        connect(getNode(conn.from), getNode(conn.to) );
      } );
    };

    //-------------------------------------------
    // mouse operations

    var mousedown = false;
    var dragMoveHandler = null;
    var dragCompleteHandler = null;

    var isActiveNode = function($o) {
      return $o.closest('.simcir-node').length == 1 &&
        $o.closest('.simcir-toolbox').length == 0;
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
        }
      };
    };

    var beginNewDevice = function(event, $target) {
      var $dev = $target.closest('.simcir-device');
      var pos = transform($dev);

      $dev = createDevice(controller($dev).deviceDef);
      transform($dev, pos.x, pos.y);
      $temporaryPane.append($dev);
      var dragPoint = {
        x: event.pageX - pos.x,
        y: event.pageY - pos.y
      };
      dragMoveHandler = function(event) {
        transform($dev, 
            event.pageX - dragPoint.x,
            event.pageY - dragPoint.y);
      };
      dragCompleteHandler = function(event) {
        var $target = $(event.target);
        if ($target.closest('.simcir-toolbox').length == 0) {
          $dev.detach();
          addDevice($dev);
        } else {
          $dev.remove();
        }
      };
    };

    var beginMoveDevice = function(event, $target) {
      var $dev = $target.closest('.simcir-device');
      var pos = transform($dev);

      // disable events while dragging.
      enableEvents($dev, false);
      // to front.
      $dev.parent().append($dev.detach() );
      var dragPoint = {
        x: event.pageX - pos.x,
        y: event.pageY - pos.y
      };
      dragMoveHandler = function(event) {
        transform($dev, 
            event.pageX - dragPoint.x,
            event.pageY - dragPoint.y);
        updateConnectors();
      };
      dragCompleteHandler = function(event) {
        var $target = $(event.target);
        enableEvents($dev, true);
        if ($target.closest('.simcir-toolbox').length == 1) {
          removeDevice($dev);
        }
      };
    };

    var defaultMouseUpHandler = function(event) {
      mousedown = false;
      dragMoveHandler = null;
      dragCompleteHandler = null;
      $devicePane.find('.simcir-device').each(function() {
        enableEvents($(this), true);
      });
      $temporaryPane.children().remove();
    };

    var mouseDownHandler = function(event) {
      var $target = $(event.target);
      event.preventDefault();
      if (mousedown) {
        defaultMouseUpHandler();
      }
      mousedown = true;

      if (isActiveNode($target) ) {
        beginConnect(event, $target);
      } else if ($target.closest('.simcir-device').length == 1) {
        if ($target.closest('.simcir-toolbox').length == 1) {
          beginNewDevice(event, $target);
        } else {
          beginMoveDevice(event, $target);
        }
      }
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
      defaultMouseUpHandler();
    };

    $workspace.on('mousedown', mouseDownHandler);
    $(document).on('mousemove', mouseMoveHandler);
    $(document).on('mouseup', mouseUpHandler);

    //-------------------------------------------
    //
/*
    $workspace.on('mouseover', function(event) {
      var $target = $(event.target);
      if (hasClass($target, 'simcir-node-body') ) {
        addClass($target, 'simcir-node-body-hover');
      }
    } );
    $workspace.on('mouseout', function(event) {
      var $target = $(event.target);
      if (hasClass($target, 'simcir-node-body') ) {
        removeClass($target, 'simcir-node-body-hover');
      }
    } );
*/
/*
    var eventLogHandler = function(event) {
      console.log(event.type +
          ' - ' + event.target + 
          ' - ' + event.currentTarget);
      var off = $workspace.offset();
      var x = event.pageX - off.left;
      var y = event.pageY - off.top;
      if (event.type === 'mousedown') {
  //      $workspace.append(createDevice(x, y) );
        console.log('numdev:' + $(event.target).closest('.simcir-device').length);
      }
    };
    $workspace.on('mousedown', eventLogHandler);
    $workspace.on('mouseup', eventLogHandler);
*/
    load(data);

    !function() {
      var y = 8;
      $.each(data.toolbox, function(i, deviceDef) {
        var $dev = createDevice(deviceDef);
        transform($dev, 8, y);
        $toolboxPane.append($dev);
        y += (deviceDef.height + fontSize + 8);
      } );
    }();
    
    return $workspace;
  };

  var factories = {};
  var registerDevice = function(type, factory) {
    factories[type] = factory;
  };

  $(function() {
    $('.simcir').each(function() {
      !function($placeHolder) {
        var $workspace = simcir.createWorkspace(
            JSON.parse($placeHolder.text() ) );
        $placeHolder.text('');
        $placeHolder.append($workspace);
      }($(this) );
    });
  } );

  return {
    createSVGElement: createSVGElement,
    createWorkspace: createWorkspace,
    registerDevice: registerDevice
  };
}(jQuery);

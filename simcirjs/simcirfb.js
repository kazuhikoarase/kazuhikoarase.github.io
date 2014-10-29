
$(function() {

  var $s = simcir;

  var $simcir = $('#simcir-fb');
  var lastData = '';

  var getCircuitData = function() {
    return $s.controller(
        $simcir.find('.simcir-workspace') ).text();
  };

  var setup = function(data) {
    $simcir.children().remove();
    $s.setupSimcir($simcir, 
      $.extend(data || {}, {width: 800, height: 400}) );
    lastData = getCircuitData();
  };

  var dataRef = new Firebase('https://fiery-inferno-4495.firebaseio.com/');
  if (location.hash.length > 2) {
    dataRef.startAt(null, location.hash.substring(1) ).
      once('child_added', function(snapshot) {
        setup(snapshot.val().circuit);
      });
  } else {
    setup();
  }

  $('#simcir-fb-post-circuit').click(function (event) {
    var newData = getCircuitData();
    if (!lastData || lastData == newData) {
      return;
    }
    lastData = newData;
    if (newData.length >= 4096) {
      $('#simcir-fb-message').text('Too large circuit.');
      return;
    }
    var circuit = {};
    $.each(JSON.parse(newData), function(k, v) {
      if (k == 'devices' || k == 'connectors') {
        circuit[k] = v;
      }
    });
    if (circuit.devices.length == 0) {
      $('#simcir-fb-message').text('Empty circuit.');
      return;
    }
    $('#simcir-fb-message').text('');
    var ref = dataRef.push({timestamp: new Date().getTime(),
      circuit: circuit});
    ref.once('child_added', function(snapshot) {
      location.href = '#' + ref.name();
      $('#simcir-fb-message').text('Your circuit was successfully saved.' +
          ' Please remember a url in the address bar.');
    } );
  });

});

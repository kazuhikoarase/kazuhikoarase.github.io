//
// smiley
//
// @author Kazuhiko Arase
//

var smiley = function() {

  var applySmileys = function(s, handler) {
    var start = 0;
    while (start < s.length) {
      var found = false;
      var pos = s.length;
      var key = '';
      var i;
      for(var k in map) {
        if ( (i = s.indexOf(k, start) ) != -1 && i < pos) {
          key = k;
          pos = i;
          found = true;
        }
      }
      if (!found) {
        break;
      }
      handler.text(s.substring(start, pos) );
      handler.smiley(key, 'data:image/png;base64,' + map[key]);
      start = pos + key.length;
    }
    handler.text(s.substring(start) );
  };
  var createSmiley = function($target, key) {
    return $('<img/>').attr('src', 'data:image/png;base64,' + map[key]).
      on('click', function(event) {
        $target.trigger('textinput', {text: key});
      });
  };
  var getSmileys = function() {
    var $target = $('<div></div>');
    $target.append(createSmiley($target, ':)') );
    return $target;
  };

  var map = function() {

    var images = {
      "smile":"iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAByUDbMAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAKBJREFUeNq0VFsOgCAMo8QLyP3PqEeoEhIzoOADXMKH3Va2qgU31wsKDK3i5SFBK58R+5dE3Yv9AFHV5yXRynRU6BzVmlchAIdQKB8Sbut6mg2FH9CqWnX6ZD+S7Ulgkq78O+JzxG1d9oLOAs6cDJO4UK1ZflvNzvBAs6jLHWHMK7eBAalutk0Ks+6BIsHeOg3vg5rsi3vgzhzx1WkPAQYASHs2Jkuf3PAAAAAASUVORK5CYII="
    };

    var codes = {
      "smile": ":) :-)"
    };

    var map = {};
    for (var name in images) {
      var image = images[name];
      var names = codes[name].split(/\s+/g); 
      for (var i = 0; i < names.length; i += 1) {
        map[names[i]] = image;
      }
    }
    return map;
  }();

  return {
    applySmileys: applySmileys,
    getSmileys: getSmileys
  };
}();

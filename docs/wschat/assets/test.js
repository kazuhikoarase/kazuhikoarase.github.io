
$(function() {
  var uid = location.hash? location.hash.substring(1) : 'testuser001';
  var host = 'www-d3v.rhcloud.com:8443';
  $('#placeHolder').append(wschat({
    uid: uid,
    url: 'wss://' + host + '/wschat/wschat',
    fileuploadUrl: 'https://' + host + '/wschat/wschat-file',
    inputAssist: function() {
      return smiley.getSmileys();
    },
    decorator: function($target) {
      var s = $target.text();
      $target.text('');
      smiley.applySmileys(s, {
        text: function(text) {
          $target.append($('<span></span>').text(text) );
        },
        smiley: function(text, data) {
          $target.append($('<img/>').
              attr('src', data).
              attr('title', text) );
        }
      });
    }
  }) );
});

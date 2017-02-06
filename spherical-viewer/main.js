window.onload = function() {

  var params = function(query_string) {
    var params = {};
    var kvList = query_string.split(/&/g);
    for (var i = 0; i < kvList.length; i += 1) {
      var kv = kvList[i].split(/=/);
      if (kv.length == 2) {
        params[kv[0]] = decodeURIComponent(kv[1]);
        encodeURIComponent('/?&');
      }
    }
    return params;
  }(location.search? location.search.substring(1) : '');

  var imageUrl = document.getElementById('imageUrl');
  if (params.url) {
    imageUrl.value = params.url;
  }
  var getUrl = document.getElementById('getUrl');
  getUrl.addEventListener('click', function(event) {
    if (imageUrl.value) {
      location.href = '?url=' + encodeURIComponent(imageUrl.value);
    }
  });

  var opts = {
    src : params.url || 'my-picture.jpg',
    maxTextureSize : 2048
  };
  var viewer = spherical_viewer(opts);
  viewer.canvas.addEventListener('dblclick', function() {
    viewer.toggleFullscreen();
  });
  document.body.appendChild(viewer.canvas);
};

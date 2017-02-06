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
      var ptz = viewer.getPTZ();
      ptz.p = normalizeAngle(p);
      location.href = '?url=' + encodeURIComponent(imageUrl.value) + 
        '&p=' + ptz.p + '&t=' + ptz.t + '&z=' + ptz.z;
    }
  });

  var opts = {
    src : params.url || 'my-picture.jpg',
    maxTextureSize : 2048
  };
  
  var normalizeAngle = function(p) {
    var _2PI = Math.PI * 2;
    while (p < 0) { p += _2PI; }
    while (p >= _2PI) { p -= _2PI; }
    return p;
  };

  var ptz = {
    p : params.p? +params.p : 0,
    t : params.t? +params.t : 0,
    z : params.z? +params.z : 0
  };
  ptz.p = normalizeAngle(p);

  var viewer = spherical_viewer(opts);
  viewer.canvas.addEventListener('dblclick', function() {
    viewer.toggleFullscreen();
  });
  document.body.appendChild(viewer.canvas);
};

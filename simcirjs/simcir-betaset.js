
!function($) {
  /*
  $.fn.simcir = function() {
    this.each(function() {
      setup($(this) );
    });
  };
*/
  /*
  $.fn.simcir = function() {
    console.log('hi!');
  };
  */
  simcir.registerDevice('beta-sw', function(base) {
    var out = base.addOutput();
    var $rect = simcir.createSVGElement('rect').
      attr({x: 8, y: 8, width: 16, height: 16}).
      css('stroke', '#000000').
      css('fill', '#f0f0f0').
      css('pointer-events', 'visiblePainted');
    base.$ui.append($rect);
    out.setValue(1);
    $rect.on('mousedown', function(event) {
      out.setValue(null);
    } );
    $rect.on('mouseup', function(event) {
      out.setValue(1);
    } );
  });

  simcir.registerDevice('beta-nand', function(base) {
    var in1 = base.addInput();
    var in2 = base.addInput();
    var out = base.addOutput();
    base.$ui.on('inputValueChange', function() {
      var b1 = in1.getValue() != null;
      var b2 = in2.getValue() != null;
      var o = !(b1 && b2);
      out.setValue(o? 1 : null);
    } );
  });

}(jQuery);


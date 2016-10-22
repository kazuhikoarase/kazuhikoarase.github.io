$(function() {
  
  var funcs = [
    'toHanAscii',
    'toZenAscii',
    'toHanKana',
    'toZenKana',
    'toHan',
    'toZen',
    'normalize',
    'toKatakana',
    'toHiragana',
    'toHebon'
  ];

  $.each(funcs, function(i, func) {
    $('#funcs').append($('<input type="radio"/>').
        attr('id', func).attr('name', 'func').
          prop('checked', i == funcs.length - 1).
        on('click', function() { $('#t1').trigger('keyup'); }) ).
        append($('<label></label>').
        attr('for', func).text(func) ).
        append($('<br/>'));
  });
  $('#t1').on('keyup', function() {
    var func = $('input[name=func]:checked').attr('id');
    $('#t2').val(jaconv[func]($('#t1').val() ) );
  }).trigger('keyup');
  $('#t2').prop('readonly', true).css('background-color', '#f0f0f0');

});

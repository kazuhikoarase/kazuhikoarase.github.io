$(function() {
  
  var funcs = [
    'toHebon',
    'toKatakana',
    'toHiragana',
    'toHanAscii',
    'toZenAscii',
    'toHanKana',
    'toZenKana',
    'toHan',
    'toZen',
    'normalize'
  ];
  var $inTxt = $('<input type="text" />').addClass('txt').
    attr('placeholder', 'ここに文字を入力').
    on('keyup', function(event) {
      $.each(funcs, function(i, func) {
        $('#' + func).val(jaconv[func]($inTxt.val() ) );
      } );
    });
  
  var $body = $('#placeHolder').children('TBODY');
  var addRow = function($cell1, $cell2) {
    $body.append($('<tr></tr>').
        append($('<td></td>').addClass('lbl').append($cell1) ).
        append($('<td></td>').append($cell2) ) );
  };
  addRow($('<span></span>').text(''), $inTxt);
  $.each(funcs, function(i, func) {
    addRow($('<span></span>').text('jconv.' + func),
        $('<input type="text" />').
        addClass('txt').addClass('result').
        attr('id', func).
        attr('tabindex', '-1').
        prop('readonly', true) );
  });
  $inTxt.focus();
});

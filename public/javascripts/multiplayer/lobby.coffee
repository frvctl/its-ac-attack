$('#settings').click ->
  $('#settingsModal').modal('show')
  $('#settingsModal').removeClass 'hide'

if $('.table').length == 0
  $('#roomTable').append('<p> There are no currently active rooms, however, 
  	                      you can easily create you own and invite your 
  	                      friends to it!
  	                  </p>')

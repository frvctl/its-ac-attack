row = $('<tr>')

row.popover {
  placement: ->
    if mobileLayout()
      return "top"
    else
      return "left"
  , 
  trigger: 'manual'
}
row.click ->
  $('.leaderboard tbody tr').not(this).popover 'hide'
  $(this).popover 'toggle'

row.attr 'data-original-title', "<span class='user-derp'>derp</span>'s stats"

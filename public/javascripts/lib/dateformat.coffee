 # strftime for CommonJS

 # Based heavily on Philip S Tellis' version for client side javascript
 # Copyright (c) 2008, Philip S Tellis <philip@bluesmoon.info>
 # Copyright (c) 2010, James Smith <james@loopj.com>


xPad = (x, pad, r) ->
  r = 10  if typeof (r) is "undefined"
  while parseInt(x, 10) < r and r > 1
    x = pad.toString() + x
    r /= 10
  x.toString()
locales = {}
locales.en =
  a: [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ]
  A: [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ]
  b: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ]
  B: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]
  c: "%a %d %b %Y %T %Z"
  p: [ "AM", "PM" ]
  P: [ "am", "pm" ]
  x: "%d/%m/%y"
  X: "%T"

locales["en-US"] = locales.en
locales["en-US"].c = "%a %d %b %Y %r %Z"
locales["en-US"].x = "%D"
locales["en-US"].X = "%r"
locales["en-GB"] = locales.en
locales["en-AU"] = locales["en-GB"]
formats =
  a: (d) ->
    locales[d.locale].a[d.getDay()]

  A: (d) ->
    locales[d.locale].A[d.getDay()]

  b: (d) ->
    locales[d.locale].b[d.getMonth()]

  B: (d) ->
    locales[d.locale].B[d.getMonth()]

  c: "toLocaleString"
  C: (d) ->
    xPad parseInt(d.getFullYear() / 100, 10), 0

  d: [ "getDate", "0" ]
  e: [ "getDate", " " ]
  g: (d) ->
    xPad parseInt(formats.G(d) / 100, 10), 0

  G: (d) ->
    y = d.getFullYear()
    V = parseInt(formats.V(d), 10)
    W = parseInt(formats.W(d), 10)
    if W > V
      y++
    else y--  if W is 0 and V >= 52
    y

  H: [ "getHours", "0" ]
  I: (d) ->
    I = d.getHours() % 12
    xPad (if I is 0 then 12 else I), 0

  j: (d) ->
    ms = d - new Date("" + d.getFullYear() + "/1/1 GMT")
    ms += d.getTimezoneOffset() * 60000
    doy = parseInt(ms / 60000 / 60 / 24, 10) + 1
    xPad doy, 0, 100

  l: (d) ->
    l = d.getHours() % 12
    xPad (if l is 0 then 12 else l), " "

  m: (d) ->
    xPad d.getMonth() + 1, 0

  M: [ "getMinutes", "0" ]
  p: (d) ->
    locales[d.locale].p[(if d.getHours() >= 12 then 1 else 0)]

  P: (d) ->
    locales[d.locale].P[(if d.getHours() >= 12 then 1 else 0)]

  S: [ "getSeconds", "0" ]
  u: (d) ->
    dow = d.getDay()
    (if dow is 0 then 7 else dow)

  U: (d) ->
    doy = parseInt(formats.j(d), 10)
    rdow = 6 - d.getDay()
    woy = parseInt((doy + rdow) / 7, 10)
    xPad woy, 0

  V: (d) ->
    woy = parseInt(formats.W(d), 10)
    dow1_1 = (new Date("" + d.getFullYear() + "/1/1")).getDay()
    idow = woy + (if dow1_1 > 4 or dow1_1 <= 1 then 0 else 1)
    if idow is 53 and (new Date("" + d.getFullYear() + "/12/31")).getDay() < 4
      idow = 1
    else idow = formats.V(new Date("" + (d.getFullYear() - 1) + "/12/31"))  if idow is 0
    xPad idow, 0

  w: "getDay"
  W: (d) ->
    doy = parseInt(formats.j(d), 10)
    rdow = 7 - formats.u(d)
    woy = parseInt((doy + rdow) / 7, 10)
    xPad woy, 0, 10

  y: (d) ->
    xPad d.getFullYear() % 100, 0

  Y: "getFullYear"
  z: (d) ->
    o = d.getTimezoneOffset()
    H = xPad(parseInt(Math.abs(o / 60), 10), 0)
    M = xPad(o % 60, 0)
    (if o > 0 then "-" else "+") + H + M

  Z: (d) ->
    d.toString().replace /^.*\(([^)]+)\)$/, "$1"

  "%": (d) ->
    "%"

aggregates =
  c: "locale"
  D: "%m/%d/%y"
  h: "%b"
  n: "\n"
  r: "%I:%M:%S %p"
  R: "%H:%M"
  t: "\t"
  T: "%H:%M:%S"
  x: "locale"
  X: "locale"

exports.strftime = (d, fmt, locale) ->
  d.locale = locale = (if locales[locale] then locale else "en-US")
  while fmt.match(/%[cDhnrRtTxXzZ]/)
    fmt = fmt.replace(/%([cDhnrRtTxXzZ])/g, (m0, m1) ->
      f = aggregates[m1]
      (if f is "locale" then locales[locale][m1] else f)
    )
  str = fmt.replace(/%([aAbBCdegGHIjlmMpPSuUVwWyY%])/g, (m0, m1) ->
    f = formats[m1]
    if typeof (f) is "string"
      d[f]()
    else if typeof (f) is "function"
      f.call d, d
    else if typeof (f) is "object" and typeof (f[0]) is "string"
      xPad d[f[0]](), f[1]
    else
      m1
  )
  str

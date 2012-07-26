exports.cloneObject = cloneObject = (obj) ->
  clone = {}
  for i of obj
    if typeof (obj[i]) is "object"
      clone[i] = @cloneObject(obj[i])
    else
      clone[i] = obj[i]
  clone

exports.mergeRecursive = (obj1, obj2) ->
  for p of obj2
    try
      if obj2[p].constructor is Object
        obj1[p] = MergeRecursive(obj1[p], obj2[p])
      else
        obj1[p] = obj2[p]
    catch e
      obj1[p] = obj2[p]
  obj1

exports.capitalize = (string) ->
  string.charAt(0).toUpperCase() + string.slice(1)

exports.mongooseErrorHandler = (err, req) ->
  errors = err.errors
  for error of errors
    req.flash "error", errors[error].type

exports.sizeOfObject = sizeOfObject = (obj) ->
  size = 0
  key = undefined
  for key of obj
    size++  if obj.hasOwnProperty(key)
  size

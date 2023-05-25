const { errorResponse } = require('../utils/responseHandlers')
const { body, validationResult, check } = require('express-validator')

const errorCallback = ({ req, res, next, errors }) => {
  console.log('----------- 🚧 errorCallback 🚧 -----------')
  console.log(errors)
  console.log('----------- 🚧 errorCallback 🚧 -----------')

  // express-validator 驗證
  const errorsValidate = validationResult(req).array()
  if (errorsValidate.length > 0)
    return errorResponse({ res, errors: errorsValidate, statusCode: 400 })

  const errorsIsExist = errorDefault[errors.message]
  if (res)
    errorResponse({
      res,
      statusCode: errorsIsExist ? 400 : undefined,
      message: errorsIsExist,
      errors: errors.stack || errors,
    })
}

const errorDefault = {
  'Unexpected end of JSON input': '傳送格式錯誤',
}

module.exports = { errorCallback, errorDefault }

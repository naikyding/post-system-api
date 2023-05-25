const { errorResponse } = require('../utils/responseHandlers')
const { validationResult } = require('express-validator')

const errorCallback = ({ req, res, next, errors }) => {
  console.log('----------- 🚧 errorCallback 🚧 -----------')
  console.log(errors)
  console.log('----------- 🚧 errorCallback 🚧 -----------')

  // express-validator 驗證
  const errorsValidate = validationResult(req)
    // 指定回傳欄位
    .formatWith((errors) => errors.msg)
    .array()
  if (errorsValidate.length > 0)
    return errorResponse({ res, errors: errorsValidate, statusCode: 400 })

  const errorsIsExist = errorDefault[errors.name]
  const errorsData =
    errors.name === 'ValidationError'
      ? Object.values(errors.errors).map((item) => item.properties.message)
      : errors.stack

  if (res)
    errorResponse({
      res,
      statusCode: errorsIsExist ? 400 : undefined,
      message: errorsIsExist,
      errors: errorsData || errors,
    })
}

const errorDefault = {
  SyntaxError: '格式錯誤',
  ValidationError: '資料驗證失敗 (model)',
}

module.exports = { errorCallback, errorDefault }

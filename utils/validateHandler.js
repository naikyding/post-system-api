const { validationResult } = require('express-validator')
const { errorResponse } = require('../utils/responseHandlers')

const validateHandler = (req, res, next) => {
  // express-validator 驗證
  const errorsValidate = validationResult(req)
    .formatWith((errors) => errors.msg)
    .array()

  // 若有驗證有問題 log
  if (errorsValidate.length > 0) {
    console.log('--- 🚨 validateHandler 🚨 ---')
    console.log('errorsValidate', errorsValidate)
    console.log('--- 🚨 validateHandler 🚨 ---')
  }

  // 驗證沒有問題
  if (errorsValidate.length < 1) return next()

  // 驗證錯誤
  errorResponse({
    res,
    message: '資料驗證失敗',
    errors: errorsValidate,
    statusCode: 400,
  })
}

module.exports = validateHandler

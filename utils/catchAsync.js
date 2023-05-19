const { errorResponse } = require('../utils/responseHandlers')

const catchAsync = (func) => async (req, res, next) => {
  try {
    await func(req, res, next)
  } catch (errors) {
    console.log('----------- catchAsync Error -----------')
    console.log(errors)
    console.log('----------- catchAsync Error -----------')
    errorResponse({ res, errors })
  }
}

module.exports = catchAsync

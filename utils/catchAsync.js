const { errorResponse } = require('../utils/responseHandlers')

const catchAsync = (func) => async (req, res, next) => {
  try {
    await func(req, res, next)
  } catch (err) {
    console.log('----------- catchAsync Error -----------')
    console.log(err)
    console.log('----------- catchAsync Error -----------')

    errorResponse(req, res, next)
  }
}

module.exports = catchAsync

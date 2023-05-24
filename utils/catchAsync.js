const { errorResponse } = require('../utils/responseHandlers')

const errorCallback = ({ errors, res }) => {
  console.log('----------- catchAsync Error -----------')
  console.log(errors)
  console.log('----------- catchAsync Error -----------')
  console.log('errorCallback')
  if (res) errorResponse({ res, errors })
}

const catchAsync =
  (func, errorFunc = errorCallback) =>
  async (req, res, next) => {
    try {
      await func(req, res, next)
    } catch (errors) {
      console.log('catchAsync')
      errorFunc({ req, res, next, errors })
    }
  }

module.exports = catchAsync

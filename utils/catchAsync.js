const { errorCallback } = require('./errorHandler')

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

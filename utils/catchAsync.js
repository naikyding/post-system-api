const { errorCallback } = require('./errorHandler')

const catchAsync =
  (func, errorFunc = errorCallback) =>
  async (req, res, next) => {
    try {
      const result = await func(req, res, next)
      return result
    } catch (errors) {
      console.log('catchAsync')
      errorFunc({ req, res, next, errors })
    }
  }

module.exports = catchAsync

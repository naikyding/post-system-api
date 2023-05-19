const successResponse = (req, res, next) => {}

const errorResponse = ({ res, status, message, errors }) => {
  if (errors.status === 404) {
    message = '不存在的路由!'
    errors.stack = undefined
  }

  res.status(errors.status || 500).json({
    status: status || false,
    message: message || 'Something went wrong',
    errors: errors.stack,
  })
}

module.exports = {
  successResponse,
  errorResponse,
}

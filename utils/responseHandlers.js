const successResponse = ({ res, status, statusCode, message, data }) => {
  res.status(statusCode || 200).json({
    status: status || true,
    message: message || '操作成功',
    data: data || {},
  })
}

const errorResponse = ({ res, statusCode, status, message, errors }) => {
  if (errors.status === 404) {
    message = '不存在的路由!'
    errors.stack = undefined
  }

  res.status(statusCode || 500).json({
    status: status || false,
    message: message || 'Something went wrong',
    errors,
  })
}

module.exports = {
  successResponse,
  errorResponse,
}

const successResponse = ({ res, status, statusCode, message, data }) => {
  const dataByArray = Array.isArray(data) ? data : [data]

  res.status(statusCode || 200).json({
    status: status || true,
    message: message || '操作成功',
    data: dataByArray || [],
  })
}

const errorResponse = ({ res, statusCode, status, message, errors }) => {
  const defaultMessage = {
    400: '操作失敗',
    404: '路由不存在',
    500: 'Something went wrong',
  }

  const resMessage = message || defaultMessage[statusCode]

  res.status(statusCode || 500).json({
    status: status || false,
    message: resMessage || 'Something went wrong',
    errors: typeof errors === 'string' ? [errors] : errors,
  })
}

module.exports = {
  successResponse,
  errorResponse,
}

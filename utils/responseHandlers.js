const successResponse = (req, res, next) => {}
const errorResponse = (req, res, next) => {
  res.status(500).json({
    message: 'Something went wrong',
  })
}

module.exports = {
  successResponse,
  errorResponse,
}

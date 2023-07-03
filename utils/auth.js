const { errorResponse } = require('./responseHandlers')

// (middleware) 驗證 token 是否夾帶於 header
const auth = (req, res, next) => {
  const { authorization } = req.headers
  if (!authorization)
    return errorResponse({
      res,
      statusCode: 401,
      message: 'Missing authorization header',
    })

  next()
}

// 產生 JWT token
const generatorToken = () => {}

// 驗證 JWT token
const verifyToken = () => {}

module.exports = { auth, generatorToken, verifyToken }

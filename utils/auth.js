const { errorResponse } = require('./responseHandlers')
const jwt = require('jsonwebtoken')

// (middleware) 驗證 token 是否夾帶於 header
const auth = (req, res, next) => {
  const { authorization } = req.headers

  if (!authorization || !authorization.startsWith('Bearer '))
    return errorResponse({
      res,
      statusCode: 401,
      message: 'Invalid authorization header',
    })

  next()
}

// 產生 JWT token (exp 效期)
const generatorToken = (payload, exp = 120) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: exp,
  })
}

// 驗證 JWT token
const verifyToken = () => {}

module.exports = { auth, generatorToken, verifyToken }

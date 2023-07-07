const { errorResponse } = require('./responseHandlers')
const jwt = require('jsonwebtoken')
const refreshTokenModel = require('../models/refreshTokens.model')

/**
 * 身份驗証 middleware (headers authorization)
 * @param {object} req 請求物件
 * @param {object} res 響應物件
 * @param {function} next 下一個
 * @returns {function} 失敗 / 成功 => 下一步
 */
const auth = async (req, res, next) => {
  const { authorization } = req.headers

  if (!authorization || !authorization.startsWith('Bearer '))
    return errorResponse({
      res,
      statusCode: 401,
      message: 'Unauthorized',
      errors: 'Invalid authorization header',
    })

  const { error, payload } = await verifyToken(authorization.split(' ')[1])

  if (error)
    return errorResponse({
      res,
      statusCode: 401,
      message: 'Unauthorized',
      errors: error.message,
    })

  req.user = payload
  return next()
}

/**
 * 產生 JWT token (exp 效期)
 * @param {object} payload 夾帶資料
 * @param {number} exp 時效 (預設 120 秒)
 * @returns {string} JWT Token
 */
const generatorAccessToken = (payload, exp = 30) =>
  jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: exp,
  })

/**
 * 產生 refresh token
 * @param {object} payload 夾帶資料
 * @param {number} exp 時效 (預設 1d)
 * @returns {string} refresh Token
 */
const generatorRefreshToken = (payload, exp = '1d') =>
  jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: exp,
  })

/**
 * 驗證 token 功能
 * @param {string} token jwt token
 * @returns {object} 失敗 => error / 成功 payload
 */
const verifyToken = (token) =>
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, payload) => {
    if (error) return { error }
    return { payload }
  })

const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (error, payload) => {
    if (error) return { error }
    return { payload }
  })

const updateRefreshToken = async (_id, refreshToken) => {
  let userId = ''
  const updateItem = await refreshTokenModel.findOneAndUpdate(
    { userId: _id },
    { token: refreshToken }
  )

  if (!updateItem) {
    const createItem = await refreshTokenModel.create({
      userId: _id,
      token: refreshToken,
    })

    userId = createItem._id
  } else {
    userId = updateItem._id
  }

  return userId
}

module.exports = {
  auth,
  generatorAccessToken,
  generatorRefreshToken,
  verifyToken,
  verifyRefreshToken,
  updateRefreshToken,
}

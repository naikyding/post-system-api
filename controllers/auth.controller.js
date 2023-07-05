const { body, validationResult } = require('express-validator')
const usersModel = require('../models/users.model')
const refreshTokenModel = require('../models/refreshTokens.model')

const bcrypt = require('bcryptjs')
const { successResponse, errorResponse } = require('../utils/responseHandlers')
const {
  generatorAccessToken,
  generatorRefreshToken,
  updateRefreshToken,
  verifyRefreshToken,
} = require('../utils/auth')

const validation = {
  adminLogin: [
    body('email')
      .exists() // 欄位存在
      .withMessage('email 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('email 不可為空值')
      .bail()
      .isEmail()
      .withMessage('`email` 格式錯誤')
      .bail()
      .custom(async (email, { req }) => {
        const errorsValidate = validationResult(req)
          .formatWith((errors) => errors.msg)
          .array()

        if (errorsValidate.length > 0) return false
        // 找搜 email
        const matchUser = await usersModel.findOne({ email })
        if (!matchUser) throw new Error('電子郵件或密碼錯誤')

        req.matchUser = matchUser
        return true
      }),
    body('password')
      .exists() // 欄位存在
      .withMessage('密碼 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('密碼 不可為空值')
      .bail()
      .isString() // 為字串格式
      .withMessage('密碼 必須為字串格式')
      .bail()
      .custom(async (password, { req }) => {
        const errorsValidate = validationResult(req)
          .formatWith((errors) => errors.msg)
          .array()

        if (errorsValidate.length > 0) return false

        const matchPassword = await bcrypt.compareSync(
          password,
          req.matchUser.password
        )

        if (!matchPassword) throw new Error('電子郵件或密碼錯誤')
        return true
      }),
  ],

  createUsers: [
    body('email')
      .exists() // 欄位存在
      .withMessage('email 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('email 不可為空值')
      .bail()
      .isEmail()
      .withMessage('`email` 格式錯誤')
      .bail()
      .custom(async (email) => {
        const emailIncludes = await usersModel.findOne({ email })
        console.log(emailIncludes)
        if (emailIncludes) throw new Error('email 已存在')
        return true
      }),
    body('password')
      .exists() // 欄位存在
      .withMessage('password 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('password 不可為空值')
      .bail()
      .isLength({ min: 8 })
      .withMessage('密碼至少需要 8 個字元')
      .bail()
      .matches(
        /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&.,\/])[A-Za-z\d@$!%*?&.,\/]+$/
      )
      .withMessage('密碼需要包含英文字母、數字和符號 @$!%*?&.,/'),
    body('agents')
      .exists() // 欄位存在
      .withMessage('agents 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('agents 不可為空值')
      .bail()
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 agents `id`'),
    body('roles')
      .exists() // 欄位存在
      .withMessage('roles 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('roles 不可為空值')
      .bail()
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 roles `id`'),
  ],

  refreshToken: [
    body('refreshToken')
      .exists() // 欄位存在
      .withMessage('refreshToken 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('refreshToken 不可為空值'),
  ],
}

const userLogin = async (req, res) => {
  const { _id, email } = req.matchUser

  const accessToken = await generatorAccessToken({ _id, email })
  const refreshToken = await generatorRefreshToken({ _id, email })
  const refreshTokenId = await updateRefreshToken(_id, refreshToken)

  successResponse({
    res,
    message: '登入成功',
    data: { type: 'Bearer', accessToken, refreshToken },
  })
}

const createUsers = async (req, res) => {
  const { name, email, roles, agents, nickname, password } = req.body
  const createUser = await usersModel.create({
    name,
    email,
    roles,
    agents,
    nickname,
    password: bcrypt.hashSync(password, 12),
  })

  successResponse({ res, data: createUser._id })
}

const verifyHeadersToken = async (req, res) => {
  successResponse({ res, message: '驗證成功', data: req.user })
}

const refreshToken = async (req, res, next) => {
  const bodyRefreshToken = req.body.refreshToken
  const { error, payload } = await verifyRefreshToken(bodyRefreshToken)
  if (error)
    return errorResponse({
      res,
      statusCode: 401,
      message: 'Unauthorized',
      errors: error.message,
    })

  const matchRefreshItem = await refreshTokenModel.findOne({
    userId: payload._id,
    token: bodyRefreshToken,
  })

  if (!matchRefreshItem)
    return errorResponse({
      res,
      statusCode: 401,
      message: 'Unauthorized',
    })

  const accessToken = await generatorAccessToken({
    _id: payload._id,
    email: payload.email,
  })

  successResponse({
    res,
    message: '更新成功',
    data: { type: 'Bearer', accessToken },
  })
}

module.exports = {
  validation,

  userLogin,
  createUsers,
  verifyHeadersToken,
  refreshToken,
}

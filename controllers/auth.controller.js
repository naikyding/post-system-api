const { body, validationResult } = require('express-validator')
const usersModel = require('../models/users.model')
const bcrypt = require('bcryptjs')
const { successResponse } = require('../utils/responseHandlers')

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
        if (!matchUser)
          throw new Error({ statusCode: 403, message: '電子郵件或密碼錯誤' })
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
}

const userLogin = async (req, res) => {
  res.send(req.matchUser)
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

const verifyToken = async (req, res) => {
  res.send(req.headers.authorization)
}

module.exports = {
  validation,

  userLogin,
  createUsers,
  verifyToken,
}

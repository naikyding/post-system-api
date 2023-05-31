const catchAsync = require('../utils/catchAsync')

const { body, param } = require('express-validator')
const { successResponse, errorResponse } = require('../utils/responseHandlers')
const customersModel = require('../models/customers.model')
const agentsModel = require('../models/agents.model')

const validation = {
  createCustomer: [
    body('name')
      .exists() // 欄位存在
      .withMessage('欄位 `name` 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('`name` 不可為空值')
      .bail()
      .isString() // 為字串格式
      .withMessage('`name` 必須為字串格式'),

    body('gender')
      .exists() // 欄位存在
      .withMessage('欄位 `gender` 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('`gender` 不可為空值')
      .bail()
      .isIn(['male', 'female', 'non-binary'])
      .withMessage('`gender` 格式不正確'),

    body('email')
      .exists() // 欄位存在
      .withMessage('欄位 `email` 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('`email` 不可為空值')
      .bail()
      .isEmail()
      .withMessage('`email` 格式錯誤')
      .bail()
      .custom(async (email, { req }) => {
        const matchItem = await customersModel.findOne({
          email,
          agents: {
            $in: req.body.agent,
          },
        })
        console.log(matchItem)
        if (matchItem) throw new Error('相同 email 的帳號已存在')
      }),

    body('phone')
      // 若有值才驗證
      .if((phoneNumber) => phoneNumber)
      .isMobilePhone('zh-TW')
      .withMessage('`phone` 格式錯誤'),

    body('agent')
      .exists() // 欄位存在
      .withMessage('欄位 `agent` 必填')
      .bail()
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `id`')
      .bail() // id 不存在
      .custom(async (id) => {
        const matchItem = await agentsModel.findById(id)
        if (!matchItem) throw new Error('`id` 不存在')
      }),

    body('password')
      // 請混合使用 8 個字元以上的英文字母、數字和符號 (google rules)
      .exists() // 欄位存在
      .withMessage('欄位 `password` 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('`password` 不可為空值')
      .bail()
      .isLength({ min: 8 })
      .withMessage('密碼至少需要 8 個字元')
      .matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      .withMessage('密碼需要包含英文字母、數字和符號'),
  ],

  deleteCustomer: [
    param('id')
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `id`')
      .bail() // id 不存在
      .custom(async (id) => {
        const matchItem = await customersModel.findByIdAndDelete(id)
        if (!matchItem) throw new Error('`id` 不存在')
      }),
  ],
}

const getCustomers = catchAsync(async (req, res, next) => {
  const customersList = await customersModel.find()
  successResponse({ res, data: customersList })
})

const createCustomer = catchAsync(async (req, res, next) => {
  const {
    name,
    nickname,
    address,
    gender,
    googleId,
    facebookId,
    avatar,
    email,
    phone,
    note,
    password,
    agent,
  } = req.body

  const createdItem = await customersModel.create({
    name,
    nickname,
    address,
    gender,
    googleId,
    facebookId,
    avatar,
    email,
    phone,
    note,
    password,
    agents: [agent],
  })
  res.send(createdItem)
})

const deleteCustomer = catchAsync(getCustomers)

module.exports = {
  validation,

  getCustomers,
  createCustomer,
  deleteCustomer,
}

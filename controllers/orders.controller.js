const catchAsync = require('../utils/catchAsync')
const { successResponse, errorResponse } = require('../utils/responseHandlers')
const { body } = require('express-validator')

const agentsModel = require('../models/agents.model')
const customersModel = require('../models/customers.model')
const productsModel = require('../models/products.model')
const ordersModel = require('../models/orders.model')

const validation = {
  createOrder: [
    body('agent')
      .exists() // 欄位存在
      .withMessage('欄位 `agent` 必填')
      .bail()
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `agent id`')
      .bail() // id 不存在
      .custom(async (id) => {
        const matchItem = await agentsModel.findById(id)
        if (!matchItem) throw new Error('`agent id` 不存在')
      }),

    body('customer')
      .exists() // 欄位存在
      .withMessage('欄位 `customer` 必填')
      .bail()
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `customer id`')
      .bail() // id 不存在
      .custom(async (id) => {
        const matchItem = await customersModel.findById(id)
        if (!matchItem) throw new Error('`customer id` 不存在')
      }),

    body('totalPrice')
      .exists() // 欄位存在
      .withMessage('欄位 `totalPrice` 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('`totalPrice` 不可為空值')
      .bail()
      .isNumeric() // 為數格式 "123" 會過
      .withMessage('`totalPrice` 必須為數字格式')
      .bail()
      .not()
      .isIn([0, '0'])
      .withMessage('`totalPrice` 不可為 0'),

    // 驗證 items 子項目
    body('items.*.product')
      .exists() // 欄位存在
      .withMessage('欄位 `items.*.product` 必填')
      .bail()
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `items.*.product id`')
      .bail() // id 不存在
      .custom(async (id) => {
        const matchItem = await productsModel.findById(id)
        if (!matchItem) throw new Error('`items.*.product id` 不存在')
      }),
    body('items.*.price')
      .exists() // 欄位存在
      .withMessage('欄位 `items.*.price` 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('`items.*.price` 不可為空值')
      .bail()
      .isNumeric() // 為數格式 "123" 會過
      .withMessage('`items.*.price` 必須為數字格式')
      .bail()
      .not()
      .isIn([0, '0'])
      .withMessage('`items.*.price` 不可為 0'),
    body('items.*.quantify')
      .exists() // 欄位存在
      .withMessage('欄位 `items.*.quantify` 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('`items.*.quantify` 不可為空值')
      .bail()
      .isNumeric() // 為數格式 "123" 會過
      .withMessage('`items.*.quantify` 必須為數字格式')
      .bail()
      .not()
      .isIn([0, '0'])
      .withMessage('`items.*.quantify` 不可為 0'),
  ],
  deleteOrder: [],
}

const getOrderList = (req, res) => {
  res.send('GET Order List')
}

const createOrder = catchAsync((req, res) => {
  res.send(req.body)
})

const deleteOrder = catchAsync((req, res, next) => {
  res.send('deleteOrder')
})

module.exports = {
  validation,

  getOrderList,
  createOrder,
  deleteOrder,
}

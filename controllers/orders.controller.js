const catchAsync = require('../utils/catchAsync')
const { successResponse, errorResponse } = require('../utils/responseHandlers')
const { body, param } = require('express-validator')

const agentsModel = require('../models/agents.model')
const customersModel = require('../models/customers.model')
const productsModel = require('../models/products.model')
const extrasModel = require('../models/extras.model')

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
      .withMessage('`totalPrice` 不可為 0')
      .bail()
      .custom((totalPrice, { req }) => {
        const items = req.body.items
        let allPrice = items.reduce((acc, cur) => {
          return (acc += cur.price * cur.quantity)
        }, 0)

        if (allPrice !== totalPrice)
          throw new Error(
            `totalPrice 金額 $${totalPrice}  與 items 計算金額 $${allPrice} 不符`
          )

        return true
      }),

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
    body('items.*.quantity')
      .exists() // 欄位存在
      .withMessage('欄位 `items.*.quantity` 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('`items.*.quantity` 不可為空值')
      .bail()
      .isNumeric() // 為數格式 "123" 會過
      .withMessage('`items.*.quantity` 必須為數字格式')
      .bail()
      .not()
      .isIn([0, '0'])
      .withMessage('`items.*.quantity` 不可為 0'),
    body('items.*.extras')
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `items.*.extras id`')
      .bail() // id 不存在
      .custom(async (extrasIdArray) => {
        const extrasLength =
          typeof extrasIdArray === 'string' ? 1 : extrasIdArray.length

        // 查詢是否「包含」id 群
        const matchItems = await extrasModel.find({
          _id: { $in: extrasIdArray },
        })

        if (matchItems.length !== extrasLength)
          throw new Error('`extras` 中，有不存在的 ID')
      }),
  ],

  deleteOrder: [
    param('id')
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `id`')
      .bail() // id 不存在
      .custom(async (id) => {
        const matchItem = await ordersModel.findByIdAndDelete(id)
        if (!matchItem) throw new Error('`id` 不存在')
      }),
  ],

  deleteOrderItem: [
    param('id')
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `id`')
      .bail() // id 不存在
      .custom(async (id) => {
        // 刪除 order items 指定項目
        const pullItem = await ordersModel.updateOne(
          { 'items._id': id },
          { $pull: { items: { _id: id } } }
        )
        if (pullItem.modifiedCount < 1) throw new Error('`id` 不存在')
      }),
  ],

  updateOrderItem: [
    body('agent')
      .optional()
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `agent id`')
      .bail() // id 不存在
      .custom(async (id) => {
        const matchItem = await agentsModel.findById(id)
        if (!matchItem) throw new Error('`agent id` 不存在')
      }),

    body('customer')
      .optional()
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `customer id`')
      .bail() // id 不存在
      .custom(async (id) => {
        const matchItem = await customersModel.findById(id)
        if (!matchItem) throw new Error('`customer id` 不存在')
      }),

    body('totalPrice')
      .optional()
      .notEmpty()
      .withMessage('`totalPrice` 不可為空值')
      .bail()
      .isNumeric() // 為數格式 "123" 會過
      .withMessage('`totalPrice` 必須為數字格式')
      .bail()
      .not()
      .isIn([0, '0'])
      .withMessage('`totalPrice` 不可為 0')
      .bail()
      .custom((totalPrice, { req }) => {
        const items = req.body.items
        let allPrice = items.reduce((acc, cur) => {
          return (acc += cur.price * cur.quantity)
        }, 0)

        if (allPrice !== totalPrice)
          throw new Error(
            `totalPrice 金額 $${totalPrice}  與 items 計算金額 $${allPrice} 不符`
          )

        return true
      }),

    // 驗證 items 子項目
    body('items.*.status')
      .isBoolean()
      .withMessage('無效的 `items.*.status 應為布林格式`'),
    body('items.*.product')
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `items.*.product id`')
      .bail() // id 不存在
      .custom(async (id) => {
        const matchItem = await productsModel.findById(id)
        if (!matchItem) throw new Error('`items.*.product id` 不存在')
      }),
    body('items.*.price')
      .notEmpty()
      .withMessage('`items.*.price` 不可為空值')
      .bail()
      .isNumeric() // 為數格式 "123" 會過
      .withMessage('`items.*.price` 必須為數字格式')
      .bail()
      .not()
      .isIn([0, '0'])
      .withMessage('`items.*.price` 不可為 0'),
    body('items.*.quantity')
      .notEmpty()
      .withMessage('`items.*.quantity` 不可為空值')
      .bail()
      .isNumeric() // 為數格式 "123" 會過
      .withMessage('`items.*.quantity` 必須為數字格式')
      .bail()
      .not()
      .isIn([0, '0'])
      .withMessage('`items.*.quantity` 不可為 0'),
    body('items.*.extras')
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `items.*.extras id`')
      .bail() // id 不存在
      .custom(async (extrasIdArray) => {
        const extrasLength =
          typeof extrasIdArray === 'string' ? 1 : extrasIdArray.length

        // 查詢是否「包含」id 群
        const matchItems = await extrasModel.find({
          _id: { $in: extrasIdArray },
        })

        if (matchItems.length !== extrasLength)
          throw new Error('`extras` 中，有不存在的 ID')
      }),
  ],
}

const getOrderList = catchAsync(async (req, res) => {
  const orderList = await ordersModel
    .find()
    .populate({
      path: 'items',
      populate: {
        path: 'product extras',
      },
    })
    .lean()

  successResponse({ res, data: orderList })
})

const createOrder = catchAsync(async (req, res) => {
  let computedItemsData = req.body.items.reduce((acc, cur) => {
    let matchCurExtrasNum = 0
    const curExtrasLength = cur.extras.length
    let sameItem = false

    if (curExtrasLength > 0) {
      cur.extras.forEach((curExtra) => {
        console.log(curExtra)
        acc.forEach((accItem) => {
          accItem.extras.forEach((itemExtra) => {
            if (itemExtra === curExtra) matchCurExtrasNum++
          })

          if (
            matchCurExtrasNum === curExtrasLength &&
            accItem.extras.length === curExtrasLength
          ) {
            sameItem = true
            accItem.quantity++
          }
        })
      })
    } else {
      acc
        .filter((accItem) => accItem.extras.length < 1)
        .forEach((item) => {
          if (item.product === cur.product && item.quantity === cur.quantity) {
            sameItem = true
            item.quantity++
          }
        })
    }

    if (sameItem) return (acc = [...acc])
    else return (acc = [...acc, cur])
  }, [])

  const { customer, totalPrice, agent, note, isPaid, paymentType } = req.body

  const createdOrder = await ordersModel.create({
    customer,
    totalPrice,
    agent,
    note,
    isPaid,
    paymentType,

    items: computedItemsData,
  })

  successResponse({ res, statusCode: 201, data: createdOrder })
})

const updateOrderItem = catchAsync(async (req, res) => {
  console.log(req.body, req.params.id)
})

const deleteOrder = getOrderList
const deleteOrderItem = getOrderList

module.exports = {
  validation,

  getOrderList,
  createOrder,
  updateOrderItem,
  deleteOrder,
  deleteOrderItem,
}

const catchAsync = require('../utils/catchAsync')
const { successResponse } = require('../utils/responseHandlers')
const {
  body,
  param,
  query,
  validationResult,
  header,
} = require('express-validator')

const agentsModel = require('../models/agents.model')
const customersModel = require('../models/customers.model')
const productsModel = require('../models/products.model')
const extrasModel = require('../models/extras.model')

const ordersModel = require('../models/orders.model')

const validation = {
  getOrderList: [
    query('agent')
      .exists() // 欄位存在
      .withMessage('query `agent` 必填')
      .bail()
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `agent id`')
      .bail() // id 不存在
      .custom(async (id) => {
        const matchItem = await agentsModel.findById(id)
        if (!matchItem) throw new Error('`agent id` 不存在')
      }),

    query('limit')
      .optional()
      .isNumeric() // 為數格式 "123" 會過
      .withMessage('query `limit` 必須為數字格式'),
    query('status')
      .optional()
      .isString() // 為字串格式
      .withMessage('`name` 必須為字串格式')
      .isIn([
        'pending', // 待處理
        'inProgress', // 進行中
        'completed', // 完成
        'cancelled', // 取消
      ])
      .withMessage('query `status` 格式錯誤'),
    query('offset')
      .optional()
      .isNumeric() // 為數格式 "123" 會過
      .withMessage('query `offset` 必須為數字格式'),
    query('paid')
      .optional()
      .isBoolean()
      .withMessage('query `paid` 應為布林格式'),
    query('from')
      .optional()
      .isISO8601()
      .withMessage('query `from` 日期格式錯誤')
      .toDate(), // 驗證後轉為 Date 物件
    query('to')
      .optional()
      .isISO8601()
      .withMessage('query `to` 日期格式錯誤')
      .toDate(), // 驗證後轉為 Date 物件
  ],

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

    // 驗證配料加總金額
    body('items.*.extrasData')
      .isArray()
      .bail()
      .withMessage('欄位 `items.*.extras` 必須為陣列')
      .custom(async (extras) => {
        console.log('extras 驗證')

        const extraItemsId = extras.map((item) => item.extraItem)

        const matchExtrasItems = await extrasModel
          .find({
            _id: {
              $in: extraItemsId,
            },
          })
          .select('-agents -createdAt -updatedAt')
          .exec()

        extras.forEach((extraItemContent) => {
          const matchItem = matchExtrasItems.find(
            (item) => item._id == extraItemContent.extraItem
          )

          const { name: matchItemName, price: matchItemPrice } = matchItem
          const { quantity: reqExtraItemQuantity, price: reqExtraItemPrice } =
            extraItemContent
          const computedPrice = matchItemPrice * reqExtraItemQuantity

          if (reqExtraItemPrice !== computedPrice)
            throw new Error(
              `配料「${matchItemName}」金額加總錯誤!(送出金額為 $${reqExtraItemPrice}，正確金額該是 $${computedPrice})`
            )
        })
      }),

    // 驗證 items 子項目
    body('items.*.product')
      .exists() // 欄位存在
      .withMessage('欄位 `items.*.product` 必填')
      .bail()
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `items.*.product id`')
      .bail() // id 不存在
      .custom(async (id, { req }) => {
        const matchProductItem = await productsModel.findById(id)

        if (!matchProductItem) throw new Error('`items.*.product id` 不存在')
        req.matchProductItem = matchProductItem
      }),

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

    body('items.extras.*')
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `items.extras id`'),

    body('items.*.extrasData.*.extraItem')
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `items.*.extraItem id`')
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

        return true
      }),

    body('items.*.extrasData.*.quantity')
      .exists() // 欄位存在
      .withMessage('欄位 `items.*.extras.*.quantity` 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('`items.*.extras.*.quantity` 不可為空值')
      .bail()
      .isNumeric() // 為數格式 "123" 會過
      .withMessage('`items.*.extras.*.quantity` 必須為數字格式'),

    // 驗證「配料」金額
    body('items.*.extrasData.*.price')
      .exists() // 欄位存在
      .withMessage('欄位 `items.*.extras.*.price` 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('`items.*.extras.*.price` 不可為空值')
      .bail()
      .isNumeric() // 為數格式 "123" 會過
      .withMessage('`items.*.extras.*.price` 必須為數字格式'),

    // 驗證訂單「單項」金額
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
      .withMessage('`items.*.price` 不可為 0')
      .bail() // id 不存在
      .custom(async (price, { req }) => {
        // console.log(req.matchProductItem)
        // console.log(`驗證訂單「單項」金額 items.price`)
      }),

    body('items')
      .exists() // 欄位存在
      .bail() // id 不存在
      .custom(async (item, { req }) => {
        const productIdAry = item.map((item) => item.product)

        const matchProductItems = await productsModel
          .find({
            _id: { $in: productIdAry },
          })
          .exec()

        item.forEach((reqProductItem) => {
          const { name: originalProductName, price: originalProductPrice } =
            matchProductItems.find((item) => item._id == reqProductItem.product)
          const { quantity: reqProductQuantity, price: reqProductPrice } =
            reqProductItem

          const reqProductItemExtrasTotalPrice =
            reqProductItem.extrasData.length > 0
              ? reqProductItem.extrasData.reduce(
                  (acc, cur) => (acc += cur.price),
                  0
                )
              : 0

          const computedTotal =
            (originalProductPrice + reqProductItemExtrasTotalPrice) *
            reqProductQuantity

          if (reqProductPrice !== computedTotal)
            throw new Error(
              `訂單項目(${originalProductName})金額加總錯誤，收到 ${reqProductPrice} (應為 ${computedTotal})`
            )
        })
      }),

    // 驗證訂單「總金額」
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
      .custom((totalPrice, { req: { body } }) => {
        console.log(`驗證訂單「總金額」 totalPrice`)

        const { items } = body

        let allPrice = items.reduce((acc, cur) => {
          return (acc += cur.price)
        }, 0)

        if (allPrice !== totalPrice)
          throw new Error(
            `totalPrice 金額 $${totalPrice}  與計算金額 $${allPrice} 不符`
          )

        return true
      }),
  ],

  createOrderItem: [],

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
    param('orderId')
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `orderId`')
      .bail() // id 不存在
      .custom(async (id, { req }) => {
        const res = await ordersModel.findById(id)
        if (!res) throw new Error('`orderId` 不存在')
        req.matchOrder = res
      }),

    param('itemId')
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `itemId`')
      .bail() // itemId 不存在
      .custom(async (itemId, { req, res }) => {
        const matchItem = await req.matchOrder.items.find(
          (item) => item._id == req.params.itemId
        )
        if (!matchItem) throw new Error('`itemId` 不存在')
        req.matchOrderItem = matchItem
      }),

    // // 驗證「配料」金額
    body('extras.*.price')
      .isNumeric() // 為數格式 "123" 會過
      .withMessage('`items.*.extras.*.price` 必須為數字格式'),

    // // 驗證「配料」數量
    body('extras.*.quantity')
      .isNumeric() // 為數格式 "123" 會過
      .withMessage('`extras.*.quantity` 必須為數字格式'),

    // 驗証配料各項金額是否正確
    body('extras')
      .isArray()
      .withMessage('`extras` 應為陣列')
      .custom(async (extras) => {
        const extraItemIds = extras.map((item) => item.extraItem)
        const extrasData = await extrasModel.find({
          _id: { $in: extraItemIds },
        })

        extras.forEach((item) => {
          const originExtraItem = extrasData.find(
            (originalExtraItem) => originalExtraItem._id == item.extraItem
          )

          const originExtraItemPrice = originExtraItem.price
          const computedTotal = item.quantity * originExtraItemPrice

          if (item.price !== computedTotal)
            throw new Error(
              `配料 「${originExtraItem.name}」 金額計算錯誤，收到 $${item.price} (應為 $${computedTotal} / ${item.quantity} * ${originExtraItemPrice})`
            )
        })
      }),

    // 寫入資料庫
    body('totalPrice').custom(async (totalPrice, { req }) => {
      console.log('totalPrice')

      // 項目的金額 (舊)
      const oldOrderItemPrice = req.matchOrderItem.price

      // 配料總金額 (新)
      const updateExtrasPrice = req.body.extras.reduce(
        (acc, cur) => (acc += cur.price),
        0
      )

      const originProduct = await productsModel.findById(
        req.matchOrderItem.product
      )

      // 產品金額 (原)
      const originProductPrice = originProduct.price

      // 訂單總金額 (舊)
      const oldOrderListTotal = req.matchOrder.totalPrice

      // 訂單「項目」更新金額
      const updateItemPrice =
        (originProductPrice + updateExtrasPrice) * req.matchOrderItem.quantity

      // 訂單更新金額
      const updateTotalPrice =
        oldOrderListTotal - oldOrderItemPrice + updateItemPrice

      const res = await ordersModel.findOneAndUpdate(
        {
          _id: req.params.orderId,
          'items._id': req.params.itemId,
        },
        {
          $set: {
            'items.$.extrasData': req.body.extras,
            'items.$.price': updateItemPrice,
            totalPrice: updateTotalPrice,
          },
        },
        {
          new: true,
        }
      )

      if (!res) throw new Error(`更新發生錯誤`)
    }),
  ],

  updateOrderList: [
    body('isPaid')
      .optional()
      .notEmpty()
      .withMessage('`isPaid` 不可為空值')
      .bail()
      .isBoolean()
      .withMessage('query `paid` 應為布林格式'),
    body('status')
      .optional()
      .notEmpty()
      .withMessage('`status` 不可為空值')
      .bail()
      .isString()
      .withMessage('`status` 必須為字串格式')
      .bail()
      .custom((status) => {
        const statusFormatAry = [
          'pending', // 待處理
          'inProgress', // 進行中
          'completed', // 完成
          'cancelled', // 取消
        ]
        if (!statusFormatAry.includes(status))
          throw new Error('`status` 格式錯誤')

        return true
      }),
    param('id')
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `id`')
      .bail()
      .custom(async (id, { req }) => {
        const errorsValidate = validationResult(req)
          .formatWith((errors) => errors.msg)
          .array()

        // 沒有錯誤才更新
        if (errorsValidate.length > 0) return false

        // 更新資料
        const { status, isPaid } = req.body
        const matchOrder = await ordersModel.findByIdAndUpdate(id, {
          status, // 更新訂單狀態
          isPaid,
        })

        if (!matchOrder) throw new Error('`id` 不存在')
      }),
  ],

  getWaitingListFromOrderList: [
    header('mc-agent-id')
      .exists() // 欄位存在
      .withMessage('欄位 `agent` 必填')
      .bail()
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `agent id`')
      .bail()
      .custom(async (agentId) => {
        const matchAgent = await agentsModel.findById(agentId)
        if (!matchAgent) throw new Error(`無此商家!`)
      }),

    query('from')
      .optional()
      .isISO8601()
      .withMessage('query `from` 日期格式錯誤')
      .toDate(), // 驗證後轉為 Date 物件
    query('to')
      .optional()
      .isISO8601()
      .withMessage('query `to` 日期格式錯誤')
      .toDate(), // 驗證後轉為 Date 物件
  ],
}

const getOrderList = catchAsync(async (req, res) => {
  const { status, paid: isPaid, from, to, agent, paymentType } = req.query

  let filterContent = {}

  if (status) filterContent['status'] = status
  if (isPaid) filterContent['isPaid'] = isPaid
  if (agent) filterContent['agent'] = agent
  if (paymentType)
    filterContent['paymentType'] =
      paymentType === 'linePay' ? 'Line Pay' : paymentType

  if (from && to) {
    console.log(from, to)
    // 00:00 ~ 23:59 換台灣時間
    from.setHours(0 - 8, 0, 0, 0)
    to.setHours(23 - 8, 59, 59, 999)

    console.log(`指定搜尋時間: (utc +0)`, from, to)
    filterContent['createdAt'] = { $gte: from, $lte: to }
  }

  // 預設搜尋當日
  if (!from && !to) {
    const from = new Date()
    const to = new Date()

    // 台灣時間
    from.setHours(0 - 8, 0, 0, 0)
    to.setHours(23 - 8, 59, 59, 999)

    filterContent['createdAt'] = {
      $gte: from,
      $lte: to,
    }
  }

  let getOrderListQuery = ordersModel.find(filterContent)

  const sort = () => {
    if (status === 'completed' || status === 'cancelled')
      return { updatedAt: -1 }
    return { createAt: 1 }
  }

  let orderList = await getOrderListQuery
    .populate({
      path: 'items',
      populate: [
        {
          path: 'product',
          populate: {
            path: 'extras',
          },
        },
        {
          path: 'extras',
          select: '-createdAt -updatedAt',
        },
        {
          path: 'extrasData',
          populate: {
            path: 'extraItem',
            select: '-createdAt -updatedAt',
          },
        },
        {
          path: 'markers',
          select: '-createdAt -updatedAt -agent',
        },
      ],
    })
    .limit(req.query.limit - 0)
    .skip(req.query.offset - 0)
    .sort(sort())
    .lean()

  // 遍歷 orderList 進行條件填充
  orderList.forEach((order) => {
    order.items.forEach((item) => {
      let newExtrasData = []
      if (item.extras.length > 0) {
        newExtrasData = item.extras.map((extraItem) => {
          if (!extraItem.extraItem) {
            return {
              extraItem: extraItem,
              quantity: 1,
              price: extraItem.price,
            }
          }
        })
      } else if (item.extrasData) {
        if (item.extrasData.length > 0)
          newExtrasData = item.extrasData.map((item) => item)
      }

      item.extras = newExtrasData
    })
  })

  successResponse({ res, data: orderList })
})

const createOrder = catchAsync(async (req, res) => {
  let computedItemsData = req.body.items.reduce((acc, cur) => {
    let matchCurExtrasNum = 0
    let matchCurMarkersNum = 0

    const curExtrasLength = cur.extrasData.length
    const curMarkersLength = cur.markers.length

    let sameItem = false

    if (curMarkersLength > 0) {
      cur.markers.forEach((curMarkerItem) => {
        acc.forEach((accItem) => {
          accItem.markers.forEach((accMarkersItem) => {
            if (accMarkersItem === curMarkerItem) matchCurMarkersNum++
          })
        })
      })
    }

    if (curExtrasLength > 0) {
      cur.extrasData.forEach((curExtra) => {
        acc.forEach((accItem) => {
          accItem.extrasData.forEach((itemExtra) => {
            if (itemExtra === curExtra) matchCurExtrasNum++
          })

          if (
            matchCurExtrasNum === curExtrasLength &&
            accItem.extrasData.length === curExtrasLength &&
            accItem.product === cur.product &&
            matchCurMarkersNum === curMarkersLength
          ) {
            sameItem = true
            accItem.quantity++
          }
        })
      })
    } else {
      acc
        .filter((accItem) => accItem.extrasData.length < 1)
        .forEach((item) => {
          if (
            item.product === cur.product &&
            matchCurMarkersNum === curMarkersLength
          ) {
            sameItem = true
            item.quantity += cur.quantity
          }
        })
    }

    if (sameItem) return (acc = [...acc])
    else return (acc = [...acc, cur])
  }, [])

  const {
    customer,
    totalPrice,
    agent,
    note,
    isPaid,
    paymentType,
    mobileNoThreeDigits,
  } = req.body

  const createdOrder = await ordersModel.create({
    customer,
    totalPrice,
    agent,
    mobileNoThreeDigits,
    note,
    isPaid,
    paymentType,

    items: computedItemsData,
  })

  // 填充響應資料
  await ordersModel.populate(createdOrder, {
    path: 'items.extras.extraItem',
    model: extrasModel,
    select: '-agents -createAt -createdAt -updatedAt',
  })

  successResponse({ res, statusCode: 201, data: createdOrder })
})

const createOrderItem = catchAsync(async (req, res) => {
  res.send('createOrderItem')
})
const updateOrderList = getOrderList

const updateOrderItem = getOrderList

const deleteOrder = getOrderList
const deleteOrderItem = getOrderList

const getWaitingListFromOrderList = catchAsync(async (req, res) => {
  const { mobile, from, to } = req.query
  const agentId = req.headers['mc-agent-id']
  const filter = {
    // status: 'pending'
  }

  // if (mobile) filter['mobileNoThreeDigits'] = mobile
  if (agentId) filter['agent'] = agentId

  const formatFrom = from || new Date()
  const formatTo = to || new Date()

  // 台灣時間
  formatFrom.setHours(0 - 8, 0, 0, 0)
  formatTo.setHours(23 - 8, 59, 59, 999)

  filter['createdAt'] = {
    $gte: formatFrom,
    $lte: formatTo,
  }
  const orderList = await ordersModel.find(filter).populate({
    path: 'items',
    populate: [{ path: 'product', select: 'name type image price createdAt' }],
  })

  const orderListAll = orderList.reduce(
    (acc, cur) => {
      acc[cur.status] = [...acc[cur.status], cur]
      return acc
    },
    {
      pending: [],
      completed: [],
      cancelled: [],
    }
  )

  let returnIndex
  let formatData

  const matchInPendingList = orderListAll.pending.filter(
    (item) => item.mobileNoThreeDigits === mobile
  )
  if (mobile && matchInPendingList.length < 1) {
    formatData = { status: 'completed' }

    const matchCompletedItem = orderListAll.completed.filter(
      (item) => item.mobileNoThreeDigits === mobile
    )

    if (matchCompletedItem.length < 1) {
      return successResponse({
        res,
        data: '查無此訂單',
      })
    }

    formatData.items = matchCompletedItem
  } else {
    formatData = orderListAll.pending.reduce(
      (acc, cur, index) => {
        if (mobile && cur.mobileNoThreeDigits === mobile) returnIndex = index

        if (returnIndex === undefined || index <= returnIndex)
          acc.items = [...acc.items, cur]

        if (returnIndex !== undefined && index >= returnIndex) return acc

        acc.itemQuantity += cur.items.reduce((acc, cur) => {
          if (cur.product.type === '塑膠提袋') return acc
          return (acc += cur.quantity)
        }, 0)

        if (
          cur.items.length ===
          cur.items.filter((item) => item.product.type === '塑膠提袋').length
        )
          return acc
        acc.listQuantity += 1

        return acc
      },
      {
        status: 'pending',
        items: [],
        listQuantity: 0, // 訂單數
        itemQuantity: 0, // 商品數
      }
    )

    // 二個生產單位，可同時生產
    const computedQuantity =
      formatData.itemQuantity < 2
        ? formatData.itemQuantity
        : formatData.itemQuantity < 4
        ? Math.ceil(formatData.itemQuantity / 2)
        : (formatData.itemQuantity - 1) / 2

    formatData.range = {
      min: Math.round(computedQuantity * 5), // 最少一單位 5 分鐘
      max: Math.round(computedQuantity * 7), // 最多一單位 7 分鐘
    }
  }

  successResponse({
    res,
    data: formatData,
  })
})

module.exports = {
  validation,

  getOrderList,
  createOrder,
  createOrderItem,
  updateOrderList,
  updateOrderItem,
  deleteOrder,
  deleteOrderItem,
  getWaitingListFromOrderList,
}

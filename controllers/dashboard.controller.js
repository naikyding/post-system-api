const { query } = require('express-validator')
const { successResponse } = require('../utils/responseHandlers')

const ordersModel = require('../models/orders.model')

const validation = {
  getDashboard: [
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
    query('isPaid')
      .optional()
      .isBoolean()
      .withMessage('query `isPaid` 應為布林格式'),
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

const getDashboard = async (req, res) => {
  const { status, paid: isPaid, from, to } = req.query

  let filterContent = {}

  if (status) filterContent['status'] = status
  if (isPaid) filterContent['isPaid'] = isPaid
  if (from && to) {
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

  const orderList = await getOrderListQuery
    .populate({
      path: 'items',
      populate: {
        path: 'product extras',
      },
    })
    .limit(req.query.limit - 0)
    .skip(req.query.offset - 0)
    .sort(sort())
    .lean()

  successResponse({ res, data: orderList })
}

module.exports = { validation, getDashboard }

const { query, header } = require('express-validator')
const agentsModel = require('../models/agents.model')
const orderModel = require('../models/orders.model')
const { successResponse } = require('../utils/responseHandlers')
const { getAllPaymentTypeTotal } = require('../utils/dashboard')

const validation = {
  getBaseData: [
    header('mc-agents-id')
      .exists() // 欄位存在
      .withMessage('header `mc-agents-id` 必填')
      .bail()
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `agent id`')
      .bail() // id 不存在
      .custom(async (id, { req }) => {
        const matchItem = await agentsModel.findById(id)
        if (!matchItem) throw new Error('`agent id` 不存在')
        req.agentId = matchItem._id
        console.log(`req.agentId =>`, req.agentId)
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
}

const getBaseData = async (req, res, next) => {
  const { status, isPaid, from, to, payType } = req.query
  const agentId = req.agentId
  let filterContent = {}

  if (status) filterContent['status'] = status
  if (isPaid) filterContent['isPaid'] = isPaid === 'true' ? true : false
  if (agentId) filterContent['agent'] = agentId
  if (payType !== 'all')
    filterContent['paymentType'] = payType === 'linepay' ? 'Line Pay' : payType

  // 若有日期
  if (from && to) {
    // 00:00 ~ 23:59 換台灣時間
    from.setHours(0 - 8, 0, 0, 0)
    to.setHours(23 - 8, 59, 59, 999)

    console.log(`指定搜尋時間: (utc +0)`, from, to)
    filterContent['createdAt'] = { $gte: from, $lte: to }
  }

  // 若無日期 (預設搜尋當日)
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

  const searchOrderData = await orderModel
    .find(filterContent)
    .populate({
      path: 'items',
      populate: {
        path: 'product',
        populate: {
          path: 'extras',
        },
      },
    })
    .populate({
      path: 'items',
      populate: {
        path: 'extras',
      },
    })
    .lean()

  const total = getAllPaymentTypeTotal(searchOrderData)

  successResponse({ res, data: { total } })
}

module.exports = {
  validation,
  getBaseData,
}

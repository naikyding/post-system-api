const { query, header } = require('express-validator')
const agentsModel = require('../models/agents.model')
const orderModel = require('../models/orders.model')

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
  const { status, isPaid, from, to } = req.query
  const agentId = req.agentId

  console.log(status, isPaid, from, to, agentId)
}

module.exports = {
  validation,
  getBaseData,
}

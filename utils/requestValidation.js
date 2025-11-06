const { header, validationResult, body } = require('express-validator')
const agentsModel = require('../models/agents.model')
const extrasModel = require('../models/extras.model')

const mcActiveAgentId = (isRequired = true) => {
  const headerMcAgentId = header('mc-active-agent-id')

  if (isRequired) {
    headerMcAgentId
      .exists() // 欄位存在
      .withMessage('header `mc-active-agent-id` 必填')
      .bail()
  } else {
    headerMcAgentId.optional()
  }

  return headerMcAgentId
    .isMongoId() // 是否為 mongo id
    .withMessage('無效的 `agent id`')
    .bail() // id 不存在
    .custom(async (id, { req }) => {
      const matchItem = await agentsModel.findById(id)
      if (!matchItem) throw new Error('`agent id` 不存在')
      req.agentId = matchItem._id
    })
}

const extras = () => {
  return [
    body('extras')
      .optional() // extras 可以不傳，但如果有傳就要驗證
      .isArray()
      .withMessage('`配料`格式錯誤 (必須是陣列)'),
    body('extras.*') // 驗證陣列內每個元素
      .isMongoId()
      .withMessage('`配料` 中必須是有效的 ObjectId'),
    body('extras').custom(async (extrasIdArray, { req }) => {
      // 若非陣列
      if (!Array.isArray(extrasIdArray)) return true

      // 如果前面已經有錯誤，這裡就不要再查 DB
      if (validationResult(req).errors.length > 0) return true

      const matchItems = await extrasModel.find({
        _id: { $in: extrasIdArray },
      })

      if (matchItems.length !== extrasIdArray.length) {
        throw new Error('`extras` 中，有不存在的 ID')
      }

      // agent 不存在的配料
      const invalidExtrasItem = matchItems.find(
        (extras) =>
          !extras.agents.some(
            (agentId) =>
              String(agentId) === String(req.headers['mc-active-agent-id'])
          )
      )

      if (invalidExtrasItem) throw new Error('商家中不存在的配料!')

      return true
    }),
  ]
}

module.exports = {
  validateHeader: { mcActiveAgentId },
  validateBody: { extras },
}

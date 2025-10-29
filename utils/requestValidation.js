const { header } = require('express-validator')
const agentsModel = require('../models/agents.model')

const mcActiveAgentId = () => {
  return header('mc-active-agent-id')
    .exists() // 欄位存在
    .withMessage('header `mc-active-agent-id` 必填')
    .bail()
    .isMongoId() // 是否為 mongo id
    .withMessage('無效的 `agent id`')
    .bail() // id 不存在
    .custom(async (id, { req }) => {
      const matchItem = await agentsModel.findById(id)
      if (!matchItem) throw new Error('`agent id` 不存在')
      req.agentId = matchItem._id
      console.log(`req.agentId =>`, req.agentId)
    })
}

const headers = { mcActiveAgentId }

const body = {}

module.exports = {
  headers,
  body,
}

const catchAsync = require('../utils/catchAsync')
const userModel = require('../models/users.model')
const agentsModel = require('../models/agents.model')
const { header } = require('express-validator')

const validation = {
  getRoutes: [
    header('mc-agent-id')
      .exists() // 欄位存在
      .withMessage('「商家」必填')
      .bail()
      .isMongoId() // 是否為 mongo id
      .withMessage('「商家」無效')
      .bail() // id 不存在
      .custom(async (id) => {
        const matchItem = await agentsModel.findById(id)
        if (!matchItem) throw new Error('「商家」不存在')
      }),
  ],
}

const getRoutes = catchAsync(async (req, res) => {
  const userId = req.user._id
  const data = await userModel.findById(userId)

  res.send(data)
})

module.exports = {
  validation,

  getRoutes,
}

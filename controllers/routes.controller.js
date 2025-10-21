const catchAsync = require('../utils/catchAsync')
const userModel = require('../models/users.model')
const agentsModel = require('../models/agents.model')
const { header } = require('express-validator')
const { buildMenuTree } = require('../services/menus.service')
const { successResponse } = require('../utils/responseHandlers')

const validation = {
  getRoutes: [
    header('mc-agent-id')
      .exists() // 欄位存在
      .withMessage('header agent required')
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
  const data = await userModel
    .findById(userId)
    .select('agentRoles')
    .populate({
      path: 'agentRoles.roles',
      populate: {
        path: 'menus', // 這裡就是 Role 裡的 menus
        model: 'Menu',
      },
    })
    .lean()

  let allMenus = []

  data.agentRoles.forEach((agentRole) => {
    agentRole.roles.forEach((role) => {
      role.menus = buildMenuTree(role.menus)

      allMenus = [...role.menus]
    })
  })

  successResponse({ res, data: allMenus })
})

module.exports = {
  validation,

  getRoutes,
}

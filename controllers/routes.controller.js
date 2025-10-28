const catchAsync = require('../utils/catchAsync')
const userModel = require('../models/users.model')
const agentsModel = require('../models/agents.model')
const rolesModel = require('../models/roles.model')
const { header } = require('express-validator')
const { buildMenuTree } = require('../services/menus.service')
const { successResponse, errorResponse } = require('../utils/responseHandlers')

const validation = {
  getRoutes: [
    header('mc-active-agent-id')
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
    header('mc-active-role-id')
      .exists() // 欄位存在
      .withMessage('角色 id 必須')
      .bail()
      .isMongoId() // 是否為 mongo id
      .withMessage('「角色」無效')
      .bail() // id 不存在
      .custom(async (id) => {
        const matchItem = await rolesModel.findById(id)
        if (!matchItem) throw new Error('「角色」不存在')
      }),
  ],
}

const getRoutes = catchAsync(async (req, res) => {
  const userId = req.user._id
  const agentId = req.headers['mc-active-agent-id']
  const roleId = req.headers['mc-active-role-id']

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

  if (!data)
    return errorResponse({
      res,
      statusCode: 404,
      message: '角色不存在',
    })

  // 指定 agent 與 指定 role menus 處理後回傳
  data.agentRoles.forEach((item) => {
    if (String(item.agent) === agentId) {
      item.roles.forEach((role) => {
        if (String(role._id) === roleId) {
          role.menus = buildMenuTree(role.menus)
          allMenus = [...role.menus]
        }
      })
    }
  })

  successResponse({ res, data: allMenus })
})

module.exports = {
  validation,

  getRoutes,
}

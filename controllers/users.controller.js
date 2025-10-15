const usersModel = require('../models/users.model')
const agentsModel = require('../models/agents.model')
const rolesModel = require('../models/roles.model')

const catchAsync = require('../utils/catchAsync')
const { successResponse } = require('../utils/responseHandlers')
const { header, body } = require('express-validator')
const bcrypt = require('bcryptjs')

const validation = {
  getUsers: [
    header('mc-agent-id')
      .exists() // 欄位存在
      .withMessage('廠商 ID 必填 (`mc-agent-id`)')
      .bail()
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的廠商 ID (`header.mc-agents-id`)'),
  ],
  getUserBaseInfo: [
    header('mc-agent-id')
      .exists() // 欄位存在
      .withMessage('廠商 ID 必填 (`mc-agent-id`)')
      .bail()
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的廠商 ID (`header.mc-agents-id`)'),
  ],

  createUser: [
    body('email')
      .exists({ checkFalsy: true })
      .withMessage('欄位 `email` 必填')
      .bail()
      .isEmail()
      .withMessage('欄位 `email` 格式不正確')
      .bail()
      .custom(async (value) => {
        const existing = await usersModel.findOne({ email: value }).lean()
        if (existing) {
          throw new Error('該 email 已被使用')
        }
        return true
      }),

    body('password')
      .exists({ checkFalsy: true })
      .withMessage('欄位 `password` 必填')
      .bail()
      .isLength({ min: 8 })
      .withMessage('欄位 `password` 至少 8 字元'),

    body('agentRoles')
      .isArray({ min: 1 })
      .withMessage('至少需要指定一個與角色'),

    body('agentRoles.*.agent')
      .isMongoId()
      .withMessage('商家 `agent` 必須為有效的 ObjectId')
      .bail()
      .custom(async (id) => {
        const exists = await agentsModel.findById(id).lean()
        if (!exists) throw new Error(`指定的商家 agent ${id} 不存在`)
        return true
      }),
    body('agentRoles.*.roles')
      .isArray({ min: 1 })
      .withMessage('角色 `roles` 至少需要 1 個'),

    body('agentRoles.*.roles.*')
      .isMongoId()
      .withMessage('角色 `role` 必須為有效的 ObjectId')
      .bail()
      .custom(async (id) => {
        const exists = await rolesModel.findById(id).lean()
        if (!exists) throw new Error(`指定的 role ${id} 不存在`)
        return true
      }),
  ],
}

const getUsers = catchAsync(async (req, res) => {
  const agentId = req.headers['mc-agent-id']

  // 查詢符合 agentId 的使用者
  const users = await usersModel
    .find({ 'agentRoles.agent': agentId })
    .populate('agentRoles.agent', 'name') // 可選：帶出 agent 的 name
    .populate('agentRoles.roles', 'name') // 可選：帶出 role 的 name
    .lean()

  successResponse({ res, data: users })
})

const createUser = catchAsync(async (req, res) => {
  const { email, password, agentRoles, nickname, avatar, phone, note } =
    req.body

  // 準備要存的資料
  const userData = {
    email,
    password: bcrypt.hashSync(password, 12),
    agentRoles,
    nickname,
    avatar,
    phone,
    note,
  }

  // 建立使用者
  const newUser = await usersModel.create(userData)
  if (newUser) {
    successResponse({ res, data: newUser })
  }
})

const getUserBaseInfo = catchAsync(async (req, res) => {
  const { _id } = req.user
  const matchUser = await usersModel
    .findById(_id)

    .populate('agentRoles.agent', 'name') // 可選：帶出 agent 的 name
    .populate('agentRoles.roles', 'name') // 可選：帶出 role 的 name
    // .populate({
    //   path: 'roles',
    //   select: '-createdAt -updatedAt',
    //   populate: [
    //     {
    //       path: 'menus',
    //       select: '-createdAt -updatedAt',
    //       options: { sort: { sort: 1 } },
    //     },
    //     {
    //       path: 'operations',
    //       select: '-createdAt -updatedAt',
    //     },
    //   ],
    // })
    // .select('email roles agents nickname avatar phone note')
    .lean()

  successResponse({ res, data: matchUser })
})

module.exports = { validation, getUserBaseInfo, getUsers, createUser }

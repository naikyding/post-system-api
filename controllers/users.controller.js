const usersModel = require('../models/users.model')
const agentsModel = require('../models/agents.model')
const rolesModel = require('../models/roles.model')

const catchAsync = require('../utils/catchAsync')
const { successResponse, errorResponse } = require('../utils/responseHandlers')
const { header, body, param } = require('express-validator')
const bcrypt = require('bcryptjs')

const validation = {
  getUsers: [
    header('mc-active-agent-id')
      .exists() // 欄位存在
      .withMessage('廠商 ID 必填 (`mc-active-agent-id`)')
      .bail()
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的廠商 ID (`header.mc-agents-id`)'),
  ],
  getUserBaseInfo: [
    // header('mc-agent-id')
    //   .exists() // 欄位存在
    //   .withMessage('廠商 ID 必填 (`mc-agent-id`)')
    //   .bail()
    //   .isMongoId() // 是否為 mongo id
    //   .withMessage('無效的廠商 ID (`header.mc-agents-id`)'),
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

  deleteUser: [
    param('id')
      .exists()
      .withMessage('使用者 id 必填')
      .bail()
      .isMongoId()
      .withMessage('使用者 id 格式無效')
      .bail()
      .custom(async (id) => {
        const match = await usersModel.findById(id)
        if (!match) throw new Error('使用者 id 不存在')
        return true
      }),
  ],

  updateUser: [
    param('id')
      .exists()
      .withMessage('使用者 id 必填')
      .bail()
      .isMongoId()
      .withMessage('使用者 id 格式無效')
      .bail()
      .custom(async (id) => {
        const match = await usersModel.findById(id)
        if (!match) throw new Error('使用者 id 不存在')
        return true
      }),

    // email 可選，但若有傳入就要驗證格式 & 唯一性
    body('email')
      .optional({ checkFalsy: true })
      .isEmail()
      .withMessage('欄位 `email` 格式不正確')
      .bail()
      .custom(async (value, { req }) => {
        const existing = await usersModel.findOne({ email: value }).lean()
        if (existing && existing._id.toString() !== req.params.id) {
          throw new Error('該 email 已被使用')
        }
        return true
      }),

    // password 可選，但若有傳入就要驗證長度
    body('password')
      .optional()
      .isLength({ min: 8 })
      .withMessage('欄位 `password` 至少 8 字元'),

    // agentRoles 可選
    body('agentRoles')
      .optional()
      .isArray({ min: 1 })
      .withMessage('至少需要指定一個與角色'),

    body('agentRoles.*.agent')
      .optional()
      .isMongoId()
      .withMessage('商家 `agent` 必須為有效的 ObjectId')
      .bail()
      .custom(async (id) => {
        const exists = await agentsModel.findById(id).lean()
        if (!exists) throw new Error(`指定的商家 agent ${id} 不存在`)
        return true
      }),

    body('agentRoles.*.roles')
      .optional()
      .isArray({ min: 1 })
      .withMessage('角色 `roles` 至少需要 1 個'),

    body('agentRoles.*.roles')
      .isArray({ min: 1 })
      .withMessage('角色 `roles` 至少需要 1 個'),

    body('agentRoles.*.roles.*')
      .optional()
      .isMongoId()
      .withMessage('角色 `role` 必須為有效的 ObjectId')
      .bail()
      .custom(async (id) => {
        const exists = await rolesModel.findById(id).lean()
        if (!exists) throw new Error(`指定的 role ${id} 不存在`)
        return true
      }),
  ],

  updateUserPassword: [
    param('id')
      .exists()
      .withMessage('使用者 id 必填')
      .bail()
      .isMongoId()
      .withMessage('使用者 id 格式無效')
      .bail()
      .custom(async (id, { req, res }) => {
        const match = await usersModel.findById(id)
        if (!match) throw new Error('使用者 id 不存在')
        req.user = match
        return true
      }),
    body('oldPassword').exists().withMessage('舊密碼必填'),
    body('newPassword').exists().withMessage('新密碼必填'),
  ],
}

const getUsers = catchAsync(async (req, res) => {
  const agentId = req.headers['mc-active-agent-id']

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
    password: await bcrypt.hashSync(password, 12),
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
    .populate({
      path: 'agentRoles.agent',
      select: 'name',
    })
    .populate({
      path: 'agentRoles.roles',
      select: 'name',
    })
    .select('email roles agents nickname avatar phone note')
    .lean()

  successResponse({ res, data: matchUser })
})

const deleteUser = catchAsync(async (req, res) => {
  const userId = req.params.id

  const deletedItem = await usersModel.findByIdAndDelete(userId)
  if (!deletedItem) {
    return errorResponse({
      res,
      statusCode: 404,
      message: '刪除使用者發生錯誤，請重新操作!',
    })
  }
  successResponse({ res, data: deletedItem })
})

const updateUser = catchAsync(async (req, res) => {
  const userId = req.params.id
  let update = {}
  const allowedFields = [
    'email',
    'password',
    'agentRoles',
    'nickname',
    'avatar',
    'phone',
    'note',
  ]

  for (let field of allowedFields) {
    if (req.body[field] !== undefined && req.body[field] !== '') {
      update[field] = req.body[field]
    }
  }

  if (update.password) {
    update.password = await bcrypt.hashSync(update.password, 12)
  }

  const user = await usersModel
    .findByIdAndUpdate(userId, update, {
      new: true,
    })
    .lean()

  if (!user) {
    return res.status(404).json({ message: '使用者不存在' })
  }

  successResponse({ res, data: user })
})

const updateUserPassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body
  const userId = req.params.id
  const matchUser = req.user

  const isMatch = await bcrypt.compare(oldPassword, matchUser.password)

  if (!isMatch) {
    return errorResponse({
      res,
      statusCode: 404,
      message: '舊密碼不正確',
    })
  }

  if (!newPassword || newPassword.length < 8) {
    return errorResponse({
      res,
      statusCode: 404,
      message: '新密碼至少 8 字元',
    })
  }

  matchUser.password = await bcrypt.hashSync(newPassword, 12)
  const newUserData = await matchUser.save()

  if (newUserData) {
    successResponse({ res, data: newUserData })
  }
})

module.exports = {
  validation,
  getUserBaseInfo,
  getUsers,
  createUser,
  deleteUser,
  updateUser,
  updateUserPassword,
}

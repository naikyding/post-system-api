const catchAsync = require('../utils/catchAsync')
const agentModel = require('../models/agents.model')
const { successResponse, errorResponse } = require('../utils/responseHandlers')
const { body, param } = require('express-validator')

const validation = {
  createAgent: [
    body('name')
      .exists() // 欄位存在
      .withMessage('欄位 `name` 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('`name` 不可為空值')
      .bail()
      .isString() // 為字串格式
      .withMessage('`name` 必須為字串格式')
      .bail() // 名稱存在
      .custom(async (value) => {
        const user = await agentModel.findOne({ name: value })
        if (user) throw new Error('商家已存在')
      }),
  ],
  deleteAgent: [
    param('id')
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `id`')
      .bail() // id 不存在
      .custom(async (id) => {
        const matchItem = await agentModel.findByIdAndDelete(id)
        if (!matchItem) throw new Error('`id` 不存在')
      }),
  ],
}

const getAgents = catchAsync(async (req, res, next) => {
  const agentsData = await agentModel.find()
  successResponse({ res, data: agentsData })
})

const createAgent = catchAsync(async (req, res, next) => {
  const resData = await agentModel.create({
    name: req.body.name,
    description: req.body.description,
  })

  successResponse({ res, statusCode: 201, data: resData })
})

const deleteAgent = catchAsync(async (req, res, next) => {
  const agentsData = await agentModel.find()
  successResponse({ res, data: agentsData })
})

const updateAgent = catchAsync(async (req, res, next) => {})

module.exports = {
  validation,

  getAgents,
  createAgent,
  deleteAgent,
}

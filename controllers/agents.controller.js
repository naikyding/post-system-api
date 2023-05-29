const catchAsync = require('../utils/catchAsync')
const agentModel = require('../models/agents.model')
const { successResponse, errorResponse } = require('../utils/responseHandlers')
const { body, param } = require('express-validator')

const validation = {
  postAgents: [
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
  deleteAgents: [
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

const postAgents = catchAsync(async (req, res, next) => {
  const resData = await agentModel.create({
    name: req.body.name,
    description: req.body.description,
  })

  successResponse({ res, statusCode: 201, data: resData })
})

const deleteAgents = catchAsync(async (req, res, next) => {
  console.log('deleteAgents')

  const agentsData = await agentModel.find()
  successResponse({ res, data: agentsData })
})

module.exports = {
  validation,

  getAgents,
  postAgents,
  deleteAgents,
}

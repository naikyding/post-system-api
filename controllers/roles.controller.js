const rolesModel = require('../models/roles.model')
const catchAsync = require('../utils/catchAsync')
const { successResponse, errorResponse } = require('../utils/responseHandlers')
const { body, validationResult } = require('express-validator')

const validation = {
  createRole: [
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
        const user = await rolesModel.findOne({ name: value })
        if (user) throw new Error('角色已存在')
      }),
  ],
}

const getRoles = catchAsync(async (req, res) => {
  const data = await rolesModel.find()
  successResponse({ res, data })
})

const createRole = catchAsync(async (req, res, next) => {
  const createdRes = await rolesModel.create({
    name: req.body.name,
    description: req.body.description,
  })
  successResponse({ res, statusCode: 201, data: [createdRes] })
})

module.exports = {
  getRoles,
  createRole,
  validation,
}

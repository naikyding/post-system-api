const rolesModel = require('../models/roles.model')
const catchAsync = require('../utils/catchAsync')
const { successResponse, errorResponse } = require('../utils/responseHandlers')
const { body, param, validationResult } = require('express-validator')

const validation = {
  validateId: [
    param('id')
      .exists()
      .withMessage('項目 id 必填')
      .bail()
      .isMongoId()
      .withMessage('項目 id 格式無效')
      .bail()
      .custom(async (id) => {
        const matchItem = await rolesModel.findById(id)
        if (!matchItem) throw new Error('項目 id 不存在')
        return true
      }),
  ],

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

  deleteRole: [],
  patchRole: [],
}

const getRoles = catchAsync(async (req, res) => {
  const roles = await rolesModel
    .find()
    .find()
    .select('-createdAt -updatedAt')
    .lean()
    .exec()

  successResponse({ res, roles })
})

const deleteRole = catchAsync(async (req, res) => {
  res.send('Delete role')
})

const createRole = catchAsync(async (req, res, next) => {
  const createdRes = await rolesModel.create({
    name: req.body.name,
    description: req.body.description,
  })
  successResponse({ res, statusCode: 201, data: [createdRes] })
})

const patchRole = catchAsync(async (req, res) => {
  res.send('patchRole')
})

module.exports = {
  createRole,
  validation,

  getRoles,
  deleteRole,
  patchRole,
}

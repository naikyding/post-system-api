const rolesModel = require('../models/roles.model')
const catchAsync = require('../utils/catchAsync')
const { successResponse, errorResponse } = require('../utils/responseHandlers')
const { body } = require('express-validator')

const validation = {
  postRole: [
    body('name')
      .exists()
      .withMessage('欄位 `name` 必填')
      .bail()
      // 驗證不可為空
      .notEmpty()
      .withMessage('`name` 不可為空值')
      .bail()
      // 為字串格式
      .isString()
      .withMessage('`name` 必須為字串格式'),
  ],
}

const getRoles = catchAsync(async (req, res) => {
  console.log(req.id)
  const data = await rolesModel.find()
  successResponse({ res, data })
})

const postRole = catchAsync(async (req, res, next) => {
  console.log(req.id)
  const createdRES = await rolesModel.create({
    name: req.body.name,
    description: req.body.description,
  })

  res.send(createdRES)
})

module.exports = {
  getRoles,
  postRole,
  validation,
}

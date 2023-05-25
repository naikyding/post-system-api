const rolesModel = require('../models/roles.model')
const catchAsync = require('../utils/catchAsync')
const { successResponse, errorResponse } = require('../utils/responseHandlers')
const { body, validationResult, check } = require('express-validator')

const validation = {
  post: [
    // name 不為空
    body('name').notEmpty().withMessage('欄位 `name` 不可為空'),
  ],
}

const getRoles = catchAsync(async (req, res) => {
  const data = await rolesModel.find()
  successResponse({ res, data })
})

const postRole = catchAsync(async (req, res, next) => {
  const errors = validationResult(req).array()
  if (errors.length > 0) console.log(errors)

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

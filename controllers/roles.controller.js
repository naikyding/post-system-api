const rolesModel = require('../models/roles.model')
const catchAsync = require('../utils/catchAsync')
const { successResponse, errorResponse } = require('../utils/responseHandlers')
const { body, validationResult } = require('express-validator')

const validation = {
  post: [body('name').not().isEmpty().withMessage('name 不可為空')],
}

const getRoles = catchAsync(async (req, res) => {
  const data = await rolesModel.find()
  successResponse({ res, data })
})

const postRole = catchAsync(
  async (req, res) => {
    const errors = validationResult(req).array()

    const createdRES = await rolesModel.create({
      name: req.body.name,
      description: req.body.description,
    })

    res.send(createdRES)
  },
  ({ req, res, next, errors }) => {
    const validateErrors = validationResult(req).array()

    errorResponse({
      res,
      statusCode: 400,
      errors: validateErrors,
      message: '輸入格式錯誤',
    })
  }
)

module.exports = {
  getRoles,
  postRole,
  validation,
}

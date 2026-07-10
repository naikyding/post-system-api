const catchAsync = require('../utils/catchAsync')
const { body, validationResult, param } = require('express-validator')

const orderSourcesModel = require('../models/orderSources.model')
const { successResponse } = require('../utils/responseHandlers')
const { validateHeader } = require('../utils/requestValidation')

const validation = {
  getOrderSources: [validateHeader.mcActiveAgentId()],

  createOrderSource: [
    validateHeader.mcActiveAgentId(),

    body('name')
      .exists()
      .withMessage('「名稱」必填')
      .bail()
      .notEmpty()
      .withMessage('「名稱」不可為空值')
      .bail()
      .isString()
      .withMessage('「名稱」必須為字串格式')
      .bail()
      .custom(async (name, { req }) => {
        const errors = validationResult(req)
          .formatWith((e) => e.msg)
          .array()

        if (errors.length) return true

        const exists = await orderSourcesModel.findOne({
          agent: req.agentId,
          name,
        })

        if (exists) throw new Error(`「${name}」已存在!`)
      }),

    body('sort')
      .optional()
      .isInt({ min: 0 })
      .withMessage('「排序」必須為 0 以上整數'),

    body('status')
      .optional()
      .isIn(['active', 'inactive'])
      .withMessage('「狀態」無效'),

    body('isDefault')
      .optional()
      .isBoolean()
      .withMessage('「預設來源」必須為布林值'),
  ],

  updateOrderSource: [
    validateHeader.mcActiveAgentId(),

    param('id')
      .isMongoId()
      .withMessage('「來源」無效')
      .bail()
      .custom(async (id, { req }) => {
        const item = await orderSourcesModel.findById(id)

        if (!item) throw new Error('「來源」不存在')

        req.matchOrderSource = item
      }),

    body('name')
      .optional()
      .notEmpty()
      .withMessage('「名稱」不可為空值')
      .bail()
      .isString()
      .withMessage('「名稱」必須為字串格式')
      .bail()
      .custom(async (name, { req }) => {
        if (req.matchOrderSource.name === name) return true

        const exists = await orderSourcesModel.findOne({
          agent: req.agentId,
          name,
        })

        if (exists) throw new Error(`「${name}」已存在!`)
      }),

    body('sort')
      .optional()
      .isInt({ min: 0 })
      .withMessage('「排序」必須為 0 以上整數'),

    body('status')
      .optional()
      .isIn(['active', 'inactive'])
      .withMessage('「狀態」無效'),

    body('isDefault')
      .optional()
      .isBoolean()
      .withMessage('「預設來源」必須為布林值'),
  ],

  deleteOrderSource: [
    validateHeader.mcActiveAgentId(),

    param('id')
      .isMongoId()
      .withMessage('「來源」無效')
      .bail()
      .custom(async (id) => {
        const item = await orderSourcesModel.findById(id)

        if (!item) throw new Error('「來源」不存在')
      }),
  ],
}

const getOrderSourcesList = async (req) => {
  return orderSourcesModel
    .find({
      agent: req.agentId,
    })
    .select('-agent -createdAt -updatedAt')
    .sort({
      sort: 1,
      createdAt: 1,
    })
}

const getOrderSources = catchAsync(async (req, res) => {
  successResponse({
    res,
    data: await getOrderSourcesList(req),
  })
})

const createOrderSource = catchAsync(async (req, res) => {
  const { name, sort = 0, status = 'active', isDefault = false } = req.body

  // 若設為預設，取消其它預設
  if (isDefault) {
    await orderSourcesModel.updateMany(
      { agent: req.agentId },
      { isDefault: false }
    )
  }

  await orderSourcesModel.create({
    agent: req.agentId,
    name,
    sort,
    status,
    isDefault,
  })

  successResponse({
    res,
    data: await getOrderSourcesList(req),
  })
})

const updateOrderSource = catchAsync(async (req, res) => {
  const { name, sort, status, isDefault } = req.body

  const updateData = {}

  if (name !== undefined) updateData.name = name
  if (sort !== undefined) updateData.sort = sort
  if (status !== undefined) updateData.status = status
  if (isDefault !== undefined) updateData.isDefault = isDefault

  // 若設為預設，取消其它預設
  if (isDefault === true) {
    await orderSourcesModel.updateMany(
      {
        agent: req.agentId,
        _id: { $ne: req.params.id },
      },
      {
        isDefault: false,
      }
    )
  }

  await orderSourcesModel.findByIdAndUpdate(req.params.id, updateData)

  successResponse({
    res,
    data: await getOrderSourcesList(req),
  })
})

const deleteOrderSource = catchAsync(async (req, res) => {
  await orderSourcesModel.findByIdAndDelete(req.params.id)

  successResponse({
    res,
    data: await getOrderSourcesList(req),
  })
})

module.exports = {
  validation,

  getOrderSources,
  createOrderSource,
  updateOrderSource,
  deleteOrderSource,
}

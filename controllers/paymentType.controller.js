const catchAsync = require('../utils/catchAsync')
const { body, validationResult, param } = require('express-validator')

const paymentTypesModel = require('../models/paymentType.model')
const { successResponse } = require('../utils/responseHandlers')
const { validateHeader } = require('../utils/requestValidation')

const validation = {
  getPaymentTypes: [validateHeader.mcActiveAgentId()],

  createPaymentType: [
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

        const exists = await paymentTypesModel.findOne({
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
      .withMessage('預設付款方式」必須為布林值'),

    body('code')
      .exists()
      .withMessage('「代碼」必填')
      .bail()
      .notEmpty()
      .withMessage('「代碼」不可為空值')
      .bail()
      .isString()
      .withMessage('「代碼」必須為字串格式')
      .bail()
      .custom(async (code, { req }) => {
        const errors = validationResult(req)
          .formatWith((e) => e.msg)
          .array()

        if (errors.length) return true

        const exists = await paymentTypesModel.findOne({
          agent: req.agentId,
          code,
        })

        if (exists) throw new Error(`代碼「${code}」已存在!`)
      }),

    body('color').optional().isString().withMessage('「顏色」格式錯誤'),
  ],

  updatePaymentType: [
    validateHeader.mcActiveAgentId(),

    param('id')
      .isMongoId()
      .withMessage('「付款方式」無效')
      .bail()
      .custom(async (id, { req }) => {
        const item = await paymentTypesModel.findById(id)

        if (!item) throw new Error('「付款方式」不存在')

        req.matchPaymentType = item
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
        if (req.matchPaymentType.name === name) return true

        const exists = await paymentTypesModel.findOne({
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
      .withMessage('預設付款方式」必須為布林值'),

    body('code').not().exists().withMessage('「代碼 `code`」建立後不可修改'),

    body('color').optional().isString().withMessage('「顏色」格式錯誤'),
  ],

  deletePaymentType: [
    validateHeader.mcActiveAgentId(),

    param('id')
      .isMongoId()
      .withMessage('「付款方式」無效')
      .bail()
      .custom(async (id) => {
        const item = await paymentTypesModel.findById(id)

        if (!item) throw new Error('「付款方式」不存在')
      }),
  ],
}

const getPaymentTypesList = async (req) => {
  return paymentTypesModel
    .find({
      agent: req.agentId,
    })
    .select('-agent -createdAt -updatedAt')
    .sort({
      sort: 1,
      createdAt: 1,
    })
}

const getPaymentTypes = catchAsync(async (req, res) => {
  successResponse({
    res,
    data: await getPaymentTypesList(req),
  })
})

const createPaymentType = catchAsync(async (req, res) => {
  const {
    name,
    code,
    color = '#1976D2',
    sort = 0,
    status = 'active',
    isDefault = false,
  } = req.body

  // 若設為預設，取消其它預設
  if (isDefault) {
    await paymentTypesModel.updateMany(
      { agent: req.agentId },
      { isDefault: false }
    )
  }

  await paymentTypesModel.create({
    agent: req.agentId,
    name,
    code,
    color,
    sort,
    status,
    isDefault,
  })

  successResponse({
    res,
    data: await getPaymentTypesList(req),
  })
})

const updatePaymentType = catchAsync(async (req, res) => {
  if ('code' in req.body) {
    throw new Error('「代碼 `code`」建立後不可修改')
  }
  const { name, color, sort, status, isDefault } = req.body

  const updateData = {}

  if (name !== undefined) updateData.name = name
  if (color !== undefined) updateData.color = color
  if (sort !== undefined) updateData.sort = sort
  if (status !== undefined) updateData.status = status
  if (isDefault !== undefined) updateData.isDefault = isDefault

  // 若設為預設，取消其它預設                                                  YUG77
  if (isDefault === true) {
    await paymentTypesModel.updateMany(
      {
        agent: req.agentId,
        _id: { $ne: req.params.id },
      },
      {
        isDefault: false,
      }
    )
  }

  await paymentTypesModel.findByIdAndUpdate(req.params.id, updateData)

  successResponse({
    res,
    data: await getPaymentTypesList(req),
  })
})

const deletePaymentType = catchAsync(async (req, res) => {
  await paymentTypesModel.findByIdAndDelete(req.params.id)

  successResponse({
    res,
    data: await getPaymentTypesList(req),
  })
})

module.exports = {
  validation,

  getPaymentTypes,
  createPaymentType,
  updatePaymentType,
  deletePaymentType,
}

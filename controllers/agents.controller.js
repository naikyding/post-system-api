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
    body('code')
      .exists()
      .withMessage('欄位 `code` 必填')
      .bail()
      .notEmpty()
      .withMessage('`code` 不可為空值')
      .bail()
      .isString()
      .withMessage('`code` 必須為字串格式')
      .bail()
      .custom(async (value) => {
        const matchItem = await agentModel.findOne({
          code: value.toUpperCase(),
        })

        if (matchItem) {
          throw new Error('店家代碼已存在')
        }
      }),

    body('status')
      .optional()
      .isIn(['active', 'inactive'])
      .withMessage('無效的 `status`'),

    body('parentAgent')
      .optional({ nullable: true })
      .isMongoId()
      .withMessage('無效的 `cloneFromAgent`')
      .bail()
      .custom(async (id) => {
        const matchItem = await agentModel.findById(id)

        if (!matchItem) {
          throw new Error('來源店家不存在')
        }
      }),
  ],

  updateAgent: [
    param('id')
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `id`')
      .bail() // id 不存在
      .custom(async (id) => {
        const matchItem = await agentModel.findById(id)
        if (!matchItem) throw new Error('`id` 不存在')
      }),
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
      .custom(async (value, { req }) => {
        const agent = await agentModel.findOne({ name: value })

        if (agent && String(agent._id) !== req.params.id)
          throw new Error('商家已存在')
      }),
    body('code')
      .exists()
      .withMessage('欄位 `code` 必填')
      .bail()
      .notEmpty()
      .withMessage('`code` 不可為空值')
      .bail()
      .isString()
      .withMessage('`code` 必須為字串格式')
      .bail()
      .custom(async (value, { req }) => {
        const matchItem = await agentModel.findOne({
          code: value.toUpperCase(),
        })

        if (matchItem && matchItem._id.toString() !== req.params.id) {
          throw new Error('店家代碼已存在')
        }
      }),

    body('status')
      .optional()
      .isIn(['active', 'inactive'])
      .withMessage('無效的 `status`'),

    body('parentAgent')
      .optional({ nullable: true })
      .isMongoId()
      .withMessage('無效的 `parentAgent`')
      .bail()
      .custom(async (id, { req }) => {
        if (id === req.params.id) {
          throw new Error('來源店家不可為自己')
        }

        const matchItem = await agentModel.findById(id)

        if (!matchItem) {
          throw new Error('來源店家不存在')
        }
      }),
  ],
  deleteAgent: [
    param('id')
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `id`')
      .bail() // id 不存在
      .custom(async (id) => {
        const matchItem = await agentModel.findById(id)
        if (!matchItem) throw new Error('`id` 不存在')
      }),
  ],
}

const getAgents = catchAsync(async (req, res) => {
  const agentsData = await agentModel
    .find()
    .populate('parentAgent', 'name')
    .sort({ createdAt: -1 })

  successResponse({
    res,
    data: agentsData,
  })
})

const createAgent = catchAsync(async (req, res) => {
  const { name, description, image, code, status, parentAgent } = req.body

  const resData = await agentModel.create({
    name,
    description,
    image,
    code,
    status,
    parentAgent,

    createdBy: req.user?._id,
  })

  successResponse({
    res,
    statusCode: 201,
    data: resData,
  })
})

const deleteAgent = catchAsync(async (req, res, next) => {
  // await agentModel.findByIdAndUpdate(req.params.id, {
  //   status: 'inactive',
  // })
  await agentModel.findByIdAndDelete(req.params.id)

  return getAgents(req, res)
})

const updateAgent = catchAsync(async (req, res) => {
  const { name, description, image, code, status, parentAgent } = req.body

  const agentData = await agentModel.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        name,
        description,
        image,
        code,
        status,
        parentAgent,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  )

  if (!agentData) {
    throw new Error('找不到該資料')
  }

  successResponse({
    res,
    data: agentData,
  })
})

module.exports = {
  validation,

  getAgents,
  createAgent,
  deleteAgent,
  updateAgent,
}

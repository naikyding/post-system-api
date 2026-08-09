const catchAsync = require('../utils/catchAsync')
const agentModel = require('../models/agents.model')
const { successResponse, errorResponse } = require('../utils/responseHandlers')
const { body, param } = require('express-validator')
const cloneAgentService = require('../services/clone/cloneAgent.service')
const { Mongoose } = require('mongoose')

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

  createAgentBranch: [
    param('id')
      .isMongoId()
      .withMessage('無效的來源店家')
      .bail()
      .custom(async (id) => {
        const matchItem = await agentModel.findById(id)

        if (!matchItem) {
          throw new Error('來源店家不存在')
        }
      }),

    body('name')
      .exists()
      .withMessage('欄位 `name` 必填')
      .bail()
      .notEmpty()
      .withMessage('`name` 不可為空值')
      .bail()
      .custom(async (value) => {
        const matchItem = await agentModel.findOne({
          name: value,
        })

        if (matchItem) {
          throw new Error('商家已存在')
        }
      }),

    body('code')
      .exists()
      .withMessage('欄位 `code` 必填')
      .bail()
      .notEmpty()
      .withMessage('`code` 不可為空值')
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
const mongoose = require('mongoose')

const createAgentBranch = catchAsync(async (req, res) => {
  const session = await mongoose.startSession()

  try {
    session.startTransaction()

    const parentAgentId = req.params.id

    const { name, description, image, code, status = 'active' } = req.body

    /**
     * 建立分店
     */
    const [branch] = await agentModel.create(
      [
        {
          name,
          description,
          image,
          code: code.toUpperCase(),
          status,
          parentAgent: parentAgentId,
          createdBy: req.user?._id,
        },
      ],
      {
        session,
      }
    )

    /**
     * 複製總店資料
     */
    const copied = await cloneAgentService({
      fromAgentId: parentAgentId,
      toAgentId: branch._id,
      session,
    })

    /**
     * 全部成功
     */
    await session.commitTransaction()

    successResponse({
      res,
      statusCode: 201,
      message: '分店建立成功',
      data: {
        branch,
        copied,
      },
    })
  } catch (err) {
    /**
     * 任一步驟失敗全部取消
     */
    await session.abortTransaction()

    throw err
  } finally {
    session.endSession()
  }
})

module.exports = {
  validation,

  getAgents,
  createAgent,
  deleteAgent,
  updateAgent,
  createAgentBranch,
}

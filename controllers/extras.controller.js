const catchAsync = require('../utils/catchAsync')
const extrasModel = require('../models/extras.model')
const agentModel = require('../models/agents.model')

const { body, validationResult, param } = require('express-validator')
const { successResponse } = require('../utils/responseHandlers')
const { validateHeader } = require('../utils/requestValidation')
const extrasCategoryModel = require('../models/extrasCategory.model')

const validation = {
  getExtras: [validateHeader.mcActiveAgentId(false)],
  createExtra: [
    validateHeader.mcActiveAgentId(),

    body('name')
      .exists() // 欄位存在
      .withMessage('欄位 `name` 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('`name` 不可為空值')
      .bail()
      .isString() // 為字串格式
      .withMessage('`name` 必須為字串格式')
      .bail() // 名稱與agent 同時存在
      .custom(async (value, { req }) => {
        const errorsValidate = validationResult(req)
          .formatWith((errors) => errors.msg)
          .array()

        // 沒有錯誤才詢找，避免重覆報錯
        if (errorsValidate.length < 1) {
          const user = await extrasModel.findOne({
            name: value,
            type: req.body.type,
            agent: req.agentId,
          })
          if (user) throw new Error('廠家的配料已存在')
        }
      }),

    body('type')
      .optional()
      .notEmpty()
      .withMessage('`type` 不可為空值')
      .bail()
      .isString() // 為字串格式
      .withMessage('`type` 必須為字串格式'),

    body('status')
      .exists() // 欄位存在
      .withMessage('欄位 `status` 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('`status` 不可為空值')
      .bail()
      .isString() // 為字串格式
      .withMessage('`status` 必須為字串格式'),

    body('description')
      .exists() // 欄位存在
      .withMessage('欄位 `description` 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('`description` 不可為空值')
      .bail()
      .isString() // 為字串格式
      .withMessage('`description` 必須為字串格式'),
    body('price')
      .exists() // 欄位存在
      .withMessage('欄位 `price` 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('`price` 不可為空值')
      .bail()
      .isNumeric() // 為數格式 "123" 會過
      .withMessage('`price` 必須為數字格式'),

    body('category')
      .optional()
      .isMongoId()
      .withMessage('`category` 格式錯誤')
      .bail()
      .custom(async (category) => {
        const matchCategory = await extrasCategoryModel.findById(category)

        if (!matchCategory) {
          throw new Error('`category` 不存在')
        }

        return true
      }),
  ],

  deleteExtra: [
    validateHeader.mcActiveAgentId(false),
    param('id')
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `id`')
      .bail() // id 不存在
      .custom(async (id) => {
        const matchItem = await extrasModel.findByIdAndDelete(id)
        if (!matchItem) throw new Error('`id` 不存在')
      }),
  ],

  updateExtra: [
    param('id')
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `id`')
      .bail() // id 不存在
      .custom(async (id, { req }) => {
        const matchExtraItem = await extrasModel.findById(id)

        if (!matchExtraItem) throw new Error('`id` 不存在')
        req.matchExtraItem = matchExtraItem
      }),

    validateHeader.mcActiveAgentId(),

    body('type')
      .optional()
      .notEmpty()
      .withMessage('`type` 不可為空值')
      .bail()
      .isString() // 為字串格式
      .withMessage('`type` 必須為字串格式'),

    body('status')
      .optional()
      .notEmpty()
      .withMessage('`status` 不可為空值')
      .bail()
      .isString() // 為字串格式
      .withMessage('`status` 必須為字串格式'),

    body('category')
      .optional()
      .isMongoId()
      .withMessage('`category` 格式錯誤')
      .bail()
      .custom(async (category) => {
        const matchCategory = await extrasCategoryModel.findById(category)

        if (!matchCategory) {
          throw new Error('`category` 不存在')
        }

        return true
      }),

    body('name')
      .optional()
      .notEmpty()
      .withMessage('`name` 不可為空值')
      .bail()
      .isString() // 為字串格式
      .withMessage('`name` 必須為字串格式')
      .bail() // 名稱與agent 同時存在
      .custom(async (value, { req }) => {
        const errorsValidate = validationResult(req)
          .formatWith((errors) => errors.msg)
          .array()

        console.log('req.matchExtraItem', req.matchExtraItem)

        // 沒有錯誤才詢找，避免重覆報錯
        if (errorsValidate.length < 1) {
          if (req.matchExtraItem.name === req.body.name) return true
          else {
            const extraItem = await extrasModel.findOne({
              name: value,
              agent: req.agentId,
            })
            if (extraItem) throw new Error('名稱已存在')
          }
        }
      }),

    body('description')
      .optional()
      .notEmpty()
      .withMessage('`description` 不可為空值')
      .bail()
      .isString() // 為字串格式
      .withMessage('`description` 必須為字串格式'),

    body('price')
      .optional()
      .notEmpty()
      .withMessage('`price` 不可為空值')
      .bail()
      .isNumeric() // 為數格式 "123" 會過
      .withMessage('`price` 必須為數字格式')
      .bail()
      .custom(async (price, { req }) => {}),
  ],
}

const getExtras = catchAsync(async (req, res, next) => {
  const { status } = req.query

  const query = {}

  if (req.agentId) {
    query.agent = req.agentId
  }

  // status
  if (status) {
    query.status = status
  }

  const extrasData = await extrasModel.find(query).populate({
    path: 'category',
    select: '-createdAt -updatedAt',
    match: {
      status: 'available',
    },
  })

  successResponse({
    res,
    data: extrasData,
  })
})

const createExtra = catchAsync(async (req, res, next) => {
  const { name, description, price, type, status, category } = req.body

  const extrasData = await extrasModel.create({
    name,
    description,
    price,
    type,
    status,
    category,

    agent: req.agentId,
  })

  if (extrasData) getExtras(req, res, next)
})

const deleteExtra = catchAsync(async (req, res, next) => {
  return getExtras(req, res, next)
})

const updateExtra = catchAsync(async (req, res, next) => {
  const { name, description, type, image, price, status, category } = req.body
  const id = req.params.id

  const resData = await extrasModel.findByIdAndUpdate(id, {
    name,
    description,
    category,
    type,
    image,
    status,
    price,
  })

  if (resData) getExtras(req, res, next)
})

module.exports = {
  validation,

  getExtras,
  createExtra,
  deleteExtra,
  updateExtra,
}

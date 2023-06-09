const catchAsync = require('../utils/catchAsync')
const extrasModel = require('../models/extras.model')
const agentModel = require('../models/agents.model')

const { body, validationResult, param } = require('express-validator')
const { successResponse } = require('../utils/responseHandlers')

const validation = {
  createExtra: [
    body('agent')
      .exists() // 欄位存在
      .withMessage('欄位 `agent` 必填')
      .bail()
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
            agents: {
              $in: [req.body.agent],
            },
          })
          if (user) throw new Error('廠家的配料已存在')
        }
      }),
    body('type')
      .exists() // 欄位存在
      .withMessage('欄位 `type` 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('`type` 不可為空值')
      .bail()
      .isString() // 為字串格式
      .withMessage('`type` 必須為字串格式'),
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
      .withMessage('`price` 必須為數字格式')
      .bail()
      .not()
      .isIn([0, '0'])
      .withMessage('`price` 不可為 0'),
  ],
  deleteExtra: [
    param('id')
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `id`')
      .bail() // id 不存在
      .custom(async (id) => {
        const matchItem = await extrasModel.findByIdAndDelete(id)
        if (!matchItem) throw new Error('`id` 不存在')
      }),
  ],
}

const getExtras = catchAsync(async (req, res, next) => {
  const resData = await extrasModel.find()
  res.send(resData)
})

const createExtra = catchAsync(async (req, res, next) => {
  const { name, description, price, type, agent } = req.body

  const resData = await extrasModel.create({
    name,
    description,
    price,
    type,
    agents: [agent],
  })

  res.send(resData)
})

const deleteExtra = catchAsync(async (req, res, next) => {
  const extrasData = await extrasModel.find()
  successResponse({ res, data: extrasData })
})

module.exports = {
  validation,

  getExtras,
  createExtra,
  deleteExtra,
}

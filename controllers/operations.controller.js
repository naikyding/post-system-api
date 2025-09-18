const catchAsync = require('../utils/catchAsync')
const { body, param } = require('express-validator')

const operationsModel = require('../models/operations.model')
const menusModel = require('../models/menus.model')
const { successResponse } = require('../utils/responseHandlers')

// 驗證 id

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
        const matchItem = await operationsModel.findById(id)
        if (!matchItem) throw new Error('項目 id 不存在')
        return true
      }),
  ],

  getOperations: [],
  createOperation: [
    body('name').notEmpty().withMessage('name 是必填項目'),
    body('menuId')
      .notEmpty()
      .withMessage('menuId 是必填項目')
      .bail()
      .isMongoId()
      .withMessage('menuId 必須是有效的 MongoDB ObjectId')
      .bail()
      .custom(async (value) => {
        const exists = await menusModel.findById(value)
        if (!exists) {
          throw new Error('menuId 不存在，請確認是否為有效的 Menu ID')
        }
        return true
      }),

    body('action')
      .notEmpty()
      .withMessage('action 是必填項目')
      .isIn(['view', 'create', 'update', 'delete'])
      .withMessage('action 必須是 view/create/update/delete 之一'),
    body('description')
      .optional()
      .isString()
      .withMessage('description 必須是字串'),
    body('operate')
      .optional() // 可以不傳
      .isString()
      .withMessage('operate 必須是字串')
      .bail()
      .notEmpty()
      .withMessage('operate 不可以是空字串'),
  ],
  deleteOperation: [],
  patchOperation: [
    body('name').optional().isString().withMessage('name 必須是字串'),

    body('menuId')
      .optional()
      .isMongoId()
      .withMessage('menuId 必須是有效的 MongoDB ObjectId')
      .bail()
      .custom(async (value) => {
        const exists = await menusModel.findById(value)
        if (!exists) {
          throw new Error('menuId 不存在，請確認是否為有效的 Menu ID')
        }
        return true
      }),

    body('action')
      .optional()
      .isIn(['view', 'create', 'update', 'delete'])
      .withMessage('action 必須是 view/create/update/delete 之一'),

    body('description')
      .optional()
      .isString()
      .withMessage('description 必須是字串'),

    body('operate')
      .optional({ nullable: true }) // 可以不傳，也可以是 null
      .isString()
      .withMessage('operate 必須是字串')
      .notEmpty()
      .withMessage('operate 不可以是空字串'),
  ],
}

const getOperationsFun = catchAsync(async () => {
  const menus = await operationsModel
    .find()
    .select('-createdAt -updatedAt')
    .lean()
    .exec()

  return menus
})

const getOperations = catchAsync(async (req, res) => {
  const menus = await getOperationsFun()

  successResponse({
    res,
    data: menus,
  })
})

const createOperation = catchAsync(async (req, res) => {
  // const agentId = req.headers['mc-agents-id']

  const { name, description, menuId, operate, action } = req.body

  const data = {
    name,
    description,
    menuId,
    operate,
    action,
  }

  const operationSuccess = await operationsModel.create(data)
  if (!operationSuccess) throw new Error(`新增 ${name} 發生錯誤!`)

  successResponse({
    res,
    data: operationSuccess,
  })
})

const deleteOperation = catchAsync(async (req, res) => {
  const deleteId = req.params.id
  const deletedItem = await operationsModel.findByIdAndDelete(deleteId)
  if (!deletedItem) throw new Error(`刪除 ${deleteId} 發生錯誤!`)

  successResponse({
    res,
    data: deletedItem,
  })
})

const patchOperation = catchAsync(async (req, res) => {
  const patchItemId = req.params.id
  const allowedFields = ['name', 'description', 'menuId', 'operate', 'action']

  // 過濾欄位
  const updateData = {}
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field]
    }
  })

  // // 更新
  const updated = await operationsModel
    .findByIdAndUpdate(patchItemId, { $set: updateData }, { new: true })
    .lean()

  if (!updated) throw new Error(`修改 ${patchItemId} 發生錯誤!`)

  successResponse({
    res,
    data: updated,
  })
})

module.exports = {
  validation,

  getOperations,
  createOperation,
  deleteOperation,
  patchOperation,
}

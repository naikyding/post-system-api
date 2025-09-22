const catchAsync = require('../utils/catchAsync')
const { successResponse, errorResponse } = require('../utils/responseHandlers')
const { body, param, validationResult } = require('express-validator')
const { verifyToken } = require('../utils/auth')

const mongoose = require('mongoose')
const rolesModel = require('../models/roles.model')
const menusModel = require('../models/menus.model')
const operationsModel = require('../models/operations.model')
const agentsModel = require('../models/agents.model')
const userModel = require('../models/users.model')

const authValidateAndSaveMiddleware = async (req, res, next) => {
  // node 會將 header 解析為「小寫」
  const authHeader = req.headers['authorization']
  if (!authHeader) throw new Error(`缺少 authorization`)

  const token = authHeader.split(' ')[1]
  if (!token) throw new Error(`缺少 token`)

  try {
    const decoded = await verifyToken(token)
    const userId = decoded.payload._id

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error(`使用者 TOKEN 內包含無效的 MongoId: ${userId}`)
    }
    req.user = { id: userId }

    next()
  } catch {
    return res.status(401).json({ error: '無效的 token' })
  }
}

// 查詢陣列中 _id 是否存在該 model
const validateAry = async (ary, Model, fieldName = '欄位') => {
  // 檢查格式是否正確
  for (const id of ary) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(`${fieldName} 內包含無效的 MongoId: ${id}`)
    }
  }

  // 檢查重複
  const set = new Set(ary.map(String))
  if (set.size !== ary.length) {
    throw new Error(`${fieldName} 內不能有重複的 id`)
  }

  // 檢查是否存在於資料庫
  const count = await Model.countDocuments({ _id: { $in: ary } })
  if (count !== ary.length) {
    throw new Error(`${fieldName} 內包含不存在的項目`)
  }

  return true
}

const validation = {
  validateId: [
    param('id')
      .exists()
      .withMessage('指定項目必填')
      .bail()
      .isMongoId()
      .withMessage('指定項目 id 格式無效')
      .bail()
      .custom(async (id, { req }) => {
        const matchItem = await rolesModel.findById(id)
        if (!matchItem) throw new Error('指定項目 id 不存在')
        req.matchItem = matchItem
        return true
      }),
  ],

  createRole: [
    body('name')
      .exists()
      .withMessage('角色名稱必填')
      .bail()
      .isString()
      .withMessage('角色名稱必須是字串')
      .trim()
      .isLength({ min: 2 })
      .withMessage('角色名稱至少 2 個字')
      .custom(async (name) => {
        const exists = await rolesModel.findOne({ name })
        if (exists) {
          throw new Error('[名稱]已存在')
        }
        return true
      }),

    body('code')
      .exists()
      .withMessage('角色代碼必填')
      .bail()
      .isString()
      .withMessage('角色代碼必須是字串')
      .trim()
      .toLowerCase()
      .isLength({ min: 2 })
      .withMessage('角色代碼至少 2 個字')
      .bail()
      .custom(async (code) => {
        const exists = await rolesModel.findOne({ code })
        if (exists) {
          throw new Error('角色代碼已存在')
        }
        return true
      }),

    body('description')
      .optional()
      .isString()
      .withMessage('描述必須是字串')
      .trim(),

    body('status').optional().isBoolean().withMessage('狀態必須是布林值'),

    // menus 驗證
    body('menus')
      .optional()
      .isArray()
      .withMessage('menus 必須是陣列')
      .bail()
      .custom(async (ary) => {
        await validateAry(ary, menusModel, 'menus')
        return true
      }),

    // permissions 驗證
    body('operations')
      .optional()
      .isArray()
      .withMessage('operations 必須是陣列')
      .bail()
      .custom(async (ary) => validateAry(ary, operationsModel, 'operations')),

    // isSystem
    body('isSystem')
      .optional()
      .isBoolean()
      .withMessage('isSystem 必須是布林值'),

    // dataScope
    body('dataScope')
      .optional()
      .isIn(['all', 'self', 'dept', 'deptAndSub', 'custom'])
      .withMessage('dataScope 無效'),

    // dataScopeRefs 驗證
    body('dataScopeRefs')
      .optional()
      .isArray()
      .withMessage('dataScopeRefs 必須是陣列')
      .bail()
      .custom(async (ary) => validateAry(ary, agentsModel, 'dataScopeRefs')),
  ],

  deleteRole: [],
  patchRole: [
    // 驗證 id
    param('id')
      .exists()
      .withMessage('角色 id 必填')
      .bail()
      .isMongoId()
      .withMessage('角色 id 格式無效')
      .bail()
      .custom(async (id) => {
        const match = await rolesModel.findById(id)
        if (!match) throw new Error('角色 id 不存在')
        return true
      }),

    // name
    body('name')
      .optional()
      .notEmpty()
      .withMessage('角色名稱不可為空值')
      .bail()
      .isString()
      .withMessage('角色名稱必須是字串')
      .trim()
      .isLength({ min: 2 })
      .withMessage('角色名稱至少 2 個字')
      .bail()
      .custom(async (name, { req }) => {
        const exists = await rolesModel.findOne({
          name,
          _id: { $ne: req.params.id },
        })
        if (exists) throw new Error('[名稱]已存在')
        return true
      }),

    // code
    body('code')
      .optional()
      .notEmpty()
      .withMessage('角色代碼不可為空值')
      .bail()
      .isString()
      .withMessage('角色代碼必須是字串')
      .trim()
      .toLowerCase()
      .isLength({ min: 2 })
      .withMessage('角色代碼至少 2 個字')
      .bail()
      .custom(async (code, { req }) => {
        const exists = await rolesModel.findOne({
          code,
          _id: { $ne: req.params.id },
        })
        if (exists) throw new Error('角色代碼已存在')
        return true
      }),

    // description
    body('description')
      .optional()
      .isString()
      .withMessage('描述必須是字串')
      .trim(),

    // status
    body('status').optional().isBoolean().withMessage('狀態必須是布林值'),

    // menus
    body('menus')
      .optional()
      .isArray()
      .withMessage('menus 必須是陣列')
      .bail()
      .custom(async (ary) => {
        await validateAry(ary, menusModel, 'menus')
        return true
      }),

    // operations
    body('operations')
      .optional()
      .isArray()
      .withMessage('operations 必須是陣列')
      .bail()
      .custom(async (ary) => validateAry(ary, operationsModel, 'operations')),

    // isSystem
    body('isSystem')
      .optional()
      .isBoolean()
      .withMessage('isSystem 必須是布林值'),

    // dataScope
    body('dataScope')
      .optional()
      .isIn(['all', 'self', 'dept', 'deptAndSub', 'custom'])
      .withMessage('dataScope 無效'),

    // dataScopeRefs
    body('dataScopeRefs')
      .optional()
      .isArray()
      .withMessage('dataScopeRefs 必須是陣列')
      .bail()
      .custom(async (ary) => validateAry(ary, agentsModel, 'dataScopeRefs')),
  ],
}

const getRoles = catchAsync(async (req, res) => {
  const roles = await rolesModel
    .find()
    .select('-createdAt -updatedAt')
    .lean()
    .exec()

  successResponse({ res, data: roles })
})

const createRole = catchAsync(async (req, res) => {
  const userId = req.user.id
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return errorResponse({
      res,
      statusCode: 400,
      message: 'user 無效的 MongoId: ${userId}',
    })
  }

  const allowedFields = [
    'name',
    'code',
    'description',
    'status',
    'menus',
    'operations',
    'isSystem',
    'dataScope',
    'dataScopeRefs',
  ]

  const data = allowedFields.reduce((acc, cur) => {
    if (req.body[cur] !== undefined) acc[cur] = req.body[cur]
    return acc
  }, {})

  data['createdBy'] = userId
  data['updatedBy'] = userId

  const createdRole = await rolesModel.create(data)
  if (!createdRole) {
    return errorResponse({
      res,
      statusCode: 400,
      message: '新增 roles 發生錯誤',
    })
  }

  successResponse({ res, statusCode: 201, data: createdRole })
})

const deleteRole = catchAsync(async (req, res) => {
  const deleteItem = req.matchItem

  const deletedItemIsSystemSetting = deleteItem.isSystem
  if (deletedItemIsSystemSetting)
    return errorResponse({
      res,
      statusCode: 403,
      message: '此角色為系統設置，無法刪除!',
    })

  const deleted = await rolesModel.findByIdAndDelete(req.params.id)
  if (!deleted) {
    return errorResponse({
      res,
      statusCode: 404,
      message: '刪除角色發生錯誤，請重新操作!',
    })
  }
  successResponse({ res, data: deleted })
})

const patchRole = catchAsync(async (req, res) => {
  const updateUserId = req.user.id
  const updateRoleItemId = req.params.id

  const allowedFields = [
    'name',
    'code',
    'description',
    'status',
    'menus',
    'operations',
    'isSystem',
    'dataScope',
    'dataScopeRefs',
  ]

  const data = allowedFields.reduce(
    (acc, cur) => {
      if (req.body[cur] !== undefined) acc[cur] = req.body[cur]
      return acc
    },
    {
      updatedBy: updateUserId,
    }
  )

  const updated = await rolesModel.findByIdAndUpdate(
    updateRoleItemId,
    { $set: data },
    { new: true }
  )

  if (!updated) {
    return errorResponse({
      res,
      statusCode: 400,
      message: '修改 roles 發生錯誤',
    })
  }

  successResponse({ res, data: updated })
})

module.exports = {
  authValidateAndSaveMiddleware,
  createRole,
  validation,

  getRoles,
  deleteRole,
  patchRole,
}

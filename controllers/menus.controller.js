const catchAsync = require('../utils/catchAsync')
const { body, param } = require('express-validator')

const menusModel = require('../models/menus.model')
const { successResponse } = require('../utils/responseHandlers')
const menusService = require('../services/menus.service')

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
        const matchItem = await menusModel.findById(id)
        if (!matchItem) throw new Error('項目 id 不存在')
        return true
      }),
  ],

  getMenus: [],
  createMenu: [
    body('sort')
      .notEmpty()
      .withMessage('sort 是必填項目')
      .isInt()
      .withMessage('sort 必須是整數'),
    body('status')
      .notEmpty()
      .withMessage('status 是必填項目')
      .isBoolean()
      .withMessage('status 必須是布林值'),
    // body('icon').notEmpty().withMessage('icon 是必填項目'),
    body('name')
      .notEmpty()
      .withMessage('name 是必填項目')
      .custom(async (value) => {
        const exists = await menusModel.findOne({ name: value })
        if (exists) throw new Error('name 已存在，請使用其他名稱')
        return true
      }),

    // body('description').notEmpty().withMessage('description 是必填項目'),
    body('routeName')
      .notEmpty()
      .withMessage('routeName 是必填項目')
      .custom(async (value) => {
        const exists = await menusModel.findOne({ routeName: value })
        if (exists) throw new Error('routeName 已存在，請使用其他名稱')
        return true
      }),
    body('path').notEmpty().withMessage('path 是必填項目'),
    body('component').notEmpty().withMessage('component 是必填項目'),
    body('parentId')
      .optional() // parentId 可以不傳

      .isMongoId()
      .withMessage('parentId 必須是合法的 MongoId 格式')
      .bail() // 如果格式錯誤就停止往下驗證
      .custom(async (value) => {
        const exists = await menusModel.findById(value)
        if (!exists) {
          throw new Error('parentId 不存在於 menusModel')
        }
        return true
      }),
    // 商家 (option)
    // header('mc-agents-id')
    //   .notEmpty()
    //   .withMessage('mc-agents-id 是必填項目')
    //   .isMongoId()
    //   .withMessage('mc-agents-id 必須是有效的 MongoDB ObjectId'),
  ],
  deleteMenu: [],
  patchMenu: [
    body('sort')
      .optional()
      .notEmpty()
      .withMessage('「排序 sort」不可為空值')
      .bail()
      .isInt({ min: 0 })
      .withMessage('「排序 sort」必須是整數且 >= 0')
      .toInt(),

    body('status')
      .optional()
      .notEmpty()
      .withMessage('「狀態 status」不可為空值')
      .bail()
      .isBoolean()
      .withMessage('「狀態 status」必須是布林值')
      .toBoolean(),

    body('icon')
      .optional()
      .notEmpty()
      .withMessage('「icon」不可為空值')
      .bail()
      .isString()
      .withMessage('「icon」必須是字串')
      .isLength({ max: 50 })
      .withMessage('「icon」最長 50 字元'),

    body('name')
      .optional()
      .notEmpty()
      .withMessage('「名稱 name」不可為空值')
      .bail()
      .isString()
      .withMessage('「名稱 name」必須是字串')
      .isLength({ max: 100 })
      .withMessage('「名稱 name」最長 100 字元')
      .bail()
      .custom(async (name, { req }) => {
        // 檢查名稱唯一性（排除自己）
        const exists = await menusModel.findOne({
          name,
          _id: { $ne: req.params.id },
        })
        if (exists) {
          return Promise.reject('「名稱 name」已存在，請使用其他名稱')
        }
        return true
      }),

    body('description')
      .optional()
      .isString()
      .withMessage('「描述 description」必須是字串')
      .isLength({ max: 255 })
      .withMessage('「描述 description」最長 255 字元'),

    body('routeName')
      .optional()
      .notEmpty()
      .withMessage('「路由名稱 routeName」不可為空值')
      .bail()
      .isString()
      .withMessage('「路由名稱 routeName」必須是字串'),

    body('path')
      .optional()
      .notEmpty()
      .withMessage('「路徑 path」不可為空值')
      .bail()
      .isString()
      .withMessage('「路徑 path」必須是字串'),

    body('component')
      .optional()
      .notEmpty()
      .withMessage('「component」不可為空值')
      .bail()
      .isString()
      .withMessage('「component」必須是字串'),
  ],
}

const getMenus = catchAsync(async (req, res) => {
  const { include } = req.query

  const menus =
    include === 'operations'
      ? await menusService.getMenusIncludeOperations()
      : await menusService.getMenus()

  successResponse({
    res,
    data: menus,
  })
})

const createMenu = catchAsync(async (req, res) => {
  // const agentId = req.headers['mc-agents-id']

  const allowedFields = [
    'sort',
    'status',
    'icon',
    'name',
    'description',
    'routeName',
    'path',
    'component',
    'parentId',
    'redirect',
  ]

  const data = allowedFields.reduce((acc, cur) => {
    if (req.body[cur] !== undefined) {
      acc[cur] = req.body[cur]
    }
    return acc
  }, {})

  const menus = await menusModel.create(data)

  successResponse({
    res,
    data: menus,
  })
})

const deleteMenu = catchAsync(async (req, res) => {
  const deleteId = req.params.id
  const deletedItem = await menusModel.findByIdAndDelete(deleteId)
  if (!deletedItem) throw new Error(`刪除 ${deleteId} 發生錯誤!`)

  successResponse({
    res,
    data: deletedItem,
  })
})

const patchMenu = catchAsync(async (req, res) => {
  const patchItemId = req.params.id
  const allowedFields = [
    'sort',
    'status',
    'icon',
    'name',
    'description',
    'routeName',
    'path',
    'component',
    'redirect',
  ]

  // 過濾欄位
  const updateData = {}
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field]
    }
  })

  // 更新
  const updated = await menusModel
    .findByIdAndUpdate(patchItemId, { $set: updateData }, { new: true })
    .lean()

  if (!updated) throw new Error(`刪除 ${patchItemId} 發生錯誤!`)

  successResponse({
    res,
    data: updated,
  })
})

module.exports = {
  validation,

  getMenus,
  createMenu,
  deleteMenu,
  patchMenu,
}

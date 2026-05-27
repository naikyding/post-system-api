const catchAsync = require('../utils/catchAsync')
const extrasCategoryModel = require('../models/extrasCategory.model')
const { successResponse } = require('../utils/responseHandlers')
const { body, param } = require('express-validator')

const validation = {
  // 取得單筆
  getExtraCategoryItem: [param('id').isMongoId().withMessage('無效的 `id`')],

  // 建立分類
  createExtraCategory: [
    body('name')
      .exists()
      .withMessage('欄位 `name` 必填')
      .bail()
      .notEmpty()
      .withMessage('`name` 不可為空值')
      .bail()
      .isString()
      .withMessage('`name` 必須為字串格式'),

    body('slug')
      .exists()
      .withMessage('欄位 `slug` 必填')
      .bail()
      .notEmpty()
      .withMessage('`slug` 不可為空值')
      .bail()
      .isString()
      .withMessage('`slug` 必須為字串格式')
      .bail()
      .custom(async (value) => {
        const matchItem = await extrasCategoryModel.findOne({
          slug: value,
        })

        if (matchItem) {
          throw new Error('slug 已存在')
        }
      }),

    body('status')
      .optional()
      .isIn(['draft', 'available', 'hidden'])
      .withMessage('無效的 `status`'),

    body('sort').optional().isNumeric().withMessage('`sort` 必須為數字格式'),
  ],

  // 更新分類
  updateExtraCategory: [
    param('id')
      .isMongoId()
      .withMessage('無效的 `id`')
      .bail()
      .custom(async (id, { req }) => {
        const matchItem = await extrasCategoryModel.findById(id)

        if (!matchItem) {
          throw new Error('`id` 不存在')
        }

        req.matchItem = matchItem
      }),

    body('name')
      .optional()
      .notEmpty()
      .withMessage('`name` 不可為空值')
      .bail()
      .isString()
      .withMessage('`name` 必須為字串格式'),

    body('slug')
      .optional()
      .notEmpty()
      .withMessage('`slug` 不可為空值')
      .bail()
      .isString()
      .withMessage('`slug` 必須為字串格式')
      .bail()
      .custom(async (value, { req }) => {
        if (req.matchItem.slug === value) return true

        const matchItem = await extrasCategoryModel.findOne({
          slug: value,
        })

        if (matchItem) {
          throw new Error('slug 已存在')
        }
      }),

    body('status')
      .optional()
      .isIn(['draft', 'available', 'hidden'])
      .withMessage('無效的 `status`'),

    body('sort').optional().isNumeric().withMessage('`sort` 必須為數字格式'),
  ],

  // 刪除分類
  deleteExtraCategory: [
    param('id')
      .isMongoId()
      .withMessage('無效的 `id`')
      .bail()
      .custom(async (id) => {
        const matchItem = await extrasCategoryModel.findById(id)

        if (!matchItem) {
          throw new Error('`id` 不存在')
        }
      }),
  ],
}

// 取得全部分類
const getExtraCategories = catchAsync(async (req, res) => {
  const categories = await extrasCategoryModel
    .find()
    .sort({ sort: 1, createdAt: 1 })
    .lean()

  successResponse({
    res,
    data: categories,
  })
})

// 取得單筆分類
const getExtraCategoryItem = catchAsync(async (req, res) => {
  const item = await extrasCategoryModel.findById(req.params.id)

  successResponse({
    res,
    data: item,
  })
})

// 建立分類
const createExtraCategory = catchAsync(async (req, res) => {
  const { name, slug, status, sort, image } = req.body

  await extrasCategoryModel.create({
    name,
    slug,
    status,
    sort,
    image,
  })

  return getExtraCategories(req, res)
})

// 更新分類
const updateExtraCategory = catchAsync(async (req, res) => {
  const { name, slug, status, sort, image } = req.body

  await extrasCategoryModel.findByIdAndUpdate(req.params.id, {
    name,
    slug,
    status,
    sort,
    image,
  })

  return getExtraCategories(req, res)
})

// 刪除分類
const deleteExtraCategory = catchAsync(async (req, res) => {
  await extrasCategoryModel.findByIdAndDelete(req.params.id)

  return getExtraCategories(req, res)
})

// // 刪除分類 (上線使用)
// const deleteExtraCategory = catchAsync(async (req, res) => {
//   // 軟刪除（推薦）
//   await extrasCategoryModel.findByIdAndUpdate(req.params.id, {
//     status: 'hidden',
//   })

//   return getExtraCategories(req, res)
// })

module.exports = {
  validation,

  getExtraCategories,
  getExtraCategoryItem,

  createExtraCategory,
  updateExtraCategory,
  deleteExtraCategory,
}

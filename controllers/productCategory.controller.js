const catchAsync = require('../utils/catchAsync')
const productCategoryModel = require('../models/productCategory.model')
const { successResponse } = require('../utils/responseHandlers')
const { body, param } = require('express-validator')

const validation = {
  // 取得單筆
  getProductCategoryItem: [param('id').isMongoId().withMessage('無效的 `id`')],

  // 建立分類
  createProductCategory: [
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
        const matchItem = await productCategoryModel.findOne({
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
  updateProductCategory: [
    param('id')
      .isMongoId()
      .withMessage('無效的 `id`')
      .bail()
      .custom(async (id, { req }) => {
        const matchItem = await productCategoryModel.findById(id)

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

        const matchItem = await productCategoryModel.findOne({
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
  deleteProductCategory: [
    param('id')
      .isMongoId()
      .withMessage('無效的 `id`')
      .bail()
      .custom(async (id) => {
        const matchItem = await productCategoryModel.findById(id)

        if (!matchItem) {
          throw new Error('`id` 不存在')
        }
      }),
  ],
}

// 取得全部分類
const getProductCategories = catchAsync(async (req, res) => {
  const categories = await productCategoryModel
    .find()
    .sort({ sort: 1, createdAt: 1 })
    .lean()

  successResponse({
    res,
    data: categories,
  })
})

// 取得單筆分類
const getProductCategoryItem = catchAsync(async (req, res) => {
  const item = await productCategoryModel.findById(req.params.id)

  successResponse({
    res,
    data: item,
  })
})

// 建立分類
const createProductCategory = catchAsync(async (req, res) => {
  const { name, slug, status, sort, image } = req.body

  await productCategoryModel.create({
    name,
    slug,
    status,
    sort,
    image,
  })

  return getProductCategories(req, res)
})

// 更新分類
const updateProductCategory = catchAsync(async (req, res) => {
  const { name, slug, status, sort, image } = req.body

  await productCategoryModel.findByIdAndUpdate(req.params.id, {
    name,
    slug,
    status,
    sort,
    image,
  })

  return getProductCategories(req, res)
})

// 刪除分類
const deleteProductCategory = catchAsync(async (req, res) => {
  await productCategoryModel.findByIdAndDelete(req.params.id)

  return getProductCategories(req, res)
})

// // 刪除分類 (上線使用)
// const deleteProductCategory = catchAsync(async (req, res) => {
//   // 軟刪除（推薦）
//   await productCategoryModel.findByIdAndUpdate(req.params.id, {
//     status: 'hidden',
//   })

//   return getProductCategories(req, res)
// })

module.exports = {
  validation,

  getProductCategories,
  getProductCategoryItem,

  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
}

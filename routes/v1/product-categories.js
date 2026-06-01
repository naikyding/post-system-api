const express = require('express')

const router = express.Router()

const { auth } = require('../../utils/auth')

const {
  validation,

  getProductCategories,
  getProductCategoryItem,

  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
} = require('../../controllers/productCategory.controller')

const validateHandler = require('../../utils/validateHandler')

// 取得全部分類
router.get('/', auth, getProductCategories)

// 取得單筆分類
router.get(
  '/:id',
  auth,
  validation.getProductCategoryItem,
  validateHandler,
  getProductCategoryItem
)

// 建立分類
router.post(
  '/',
  auth,
  validation.createProductCategory,
  validateHandler,
  createProductCategory
)

// 更新分類
router.patch(
  '/:id',
  auth,
  validation.updateProductCategory,
  validateHandler,
  updateProductCategory
)

// 刪除分類（軟刪除）
router.delete(
  '/:id',
  auth,
  validation.deleteProductCategory,
  validateHandler,
  deleteProductCategory
)

module.exports = router

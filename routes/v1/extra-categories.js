const express = require('express')

const router = express.Router()

const { auth } = require('../../utils/auth')

const {
  validation,
  getExtraCategories,
  getExtraCategoryItem,

  createExtraCategory,
  updateExtraCategory,
  deleteExtraCategory,
} = require('../../controllers/extraCategory.controller')

const validateHandler = require('../../utils/validateHandler')

// 取得全部分類
router.get('/', auth, getExtraCategories)

// 取得單筆分類
router.get(
  '/:id',
  auth,
  validation.getExtraCategoryItem,
  validateHandler,
  getExtraCategoryItem
)

// 建立分類
router.post(
  '/',
  auth,
  validation.createExtraCategory,
  validateHandler,
  createExtraCategory
)

// 更新分類
router.patch(
  '/:id',
  auth,
  validation.updateExtraCategory,
  validateHandler,
  updateExtraCategory
)

// 刪除分類（軟刪除）
router.delete(
  '/:id',
  auth,
  validation.deleteExtraCategory,
  validateHandler,
  deleteExtraCategory
)

module.exports = router

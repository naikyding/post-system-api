const express = require('express')
const router = express.Router()
const { auth } = require('../../utils/auth')
const validateHandler = require('../../utils/validateHandler')

const {
  validation,

  getProducts,
  createProduct,
  deleteProduct,

  createProductExtrasItem,
  deleteProductExtrasItem,
} = require('../../controllers/products.controller')

router.get('/', auth, validation.getProduct, validateHandler, getProducts)

router.post('/', auth, validation.createProduct, validateHandler, createProduct)
router.delete(
  '/:id',
  auth,
  validation.deleteProduct,
  validateHandler,
  deleteProduct
)

// 產品新增 配料
router.post(
  '/:productId/extras',
  validation.createProductExtrasItem,
  validateHandler,
  createProductExtrasItem
)

// 產品刪除 配料
router.delete(
  '/:productId/extras/:extrasId',
  validation.deleteProductExtrasItem,
  validateHandler,
  deleteProductExtrasItem
)

module.exports = router

const express = require('express')
const router = express.Router()
const { auth } = require('../../utils/auth')
const validateHandler = require('../../utils/validateHandler')

const {
  validation,

  getProducts,
  createProduct,
  deleteProduct,
} = require('../../controllers/products.controller')

router.get('/', auth, getProducts)
router.post('/', auth, validation.createProduct, validateHandler, createProduct)
router.delete(
  '/:id',
  auth,
  validation.deleteProduct,
  validateHandler,
  deleteProduct
)

module.exports = router

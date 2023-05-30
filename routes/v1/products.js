const express = require('express')
const router = express.Router()

const validateHandler = require('../../utils/validateHandler')

const {
  validation,

  getProducts,
  createProduct,
  deleteProduct,
} = require('../../controllers/products.controller')

router.get('/', getProducts)
router.post('/', validation.createProduct, validateHandler, createProduct)
router.delete('/', validation.deleteProduct, validateHandler, deleteProduct)

module.exports = router

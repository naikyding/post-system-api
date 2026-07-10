const express = require('express')
const router = express.Router()

const { auth } = require('../../utils/auth')
const {
  validation,

  getOrderSources,
  createOrderSource,
  updateOrderSource,
  deleteOrderSource,
} = require('../../controllers/orderSources.controller')
const validateHandler = require('../../utils/validateHandler')
validateHandler

router.get(
  '/',
  auth,
  validation.getOrderSources,
  validateHandler,
  getOrderSources
)

router.post(
  '/',
  auth,
  validation.createOrderSource,
  validateHandler,
  createOrderSource
)

router.delete(
  '/:id',
  auth,
  validation.deleteOrderSource,
  validateHandler,
  deleteOrderSource
)

router.patch(
  '/:id',
  auth,
  validation.updateOrderSource,
  validateHandler,
  updateOrderSource
)

module.exports = router

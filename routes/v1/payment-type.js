const express = require('express')
const router = express.Router()

const { auth } = require('../../utils/auth')
const {
  validation,

  getPaymentTypes,
  createPaymentType,
  updatePaymentType,
  deletePaymentType,
} = require('../../controllers/paymentType.controller')
const validateHandler = require('../../utils/validateHandler')
validateHandler

router.get(
  '/',
  auth,
  validation.getPaymentTypes,
  validateHandler,
  getPaymentTypes
)

router.post(
  '/',
  auth,
  validation.createPaymentType,
  validateHandler,
  createPaymentType
)

router.delete(
  '/:id',
  auth,
  validation.deletePaymentType,
  validateHandler,
  deletePaymentType
)

router.patch(
  '/:id',
  auth,
  validation.updatePaymentType,
  validateHandler,
  updatePaymentType
)

module.exports = router

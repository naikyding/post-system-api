const express = require('express')
const router = express.Router()

const validateHandler = require('../../utils/validateHandler')

const {
  validation,

  getCustomers,
  createCustomer,
  deleteCustomer,
} = require('../../controllers/customers.controller')

router.get('/', getCustomers)
router.post('/', validation.createCustomer, validateHandler, createCustomer)
router.delete(
  '/:id',
  validation.deleteCustomer,
  validateHandler,
  deleteCustomer
)

module.exports = router

const express = require('express')
const router = express.Router()

const validateHandler = require('../../utils/validateHandler')

const {
  validation,

  getOrderList,
  createOrder,
  deleteOrder,
  deleteOrderItem,
} = require('../../controllers/orders.controller')

router.get('/', getOrderList)
router.post('/', validation.createOrder, validateHandler, createOrder)
router.delete('/:id', validation.deleteOrder, validateHandler, deleteOrder)
router.delete(
  '/item/:id',
  validation.deleteOrderItem,
  validateHandler,
  deleteOrderItem
)

module.exports = router

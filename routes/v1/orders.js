const express = require('express')
const router = express.Router()

const validateHandler = require('../../utils/validateHandler')

const {
  validation,

  getOrderList,
  updateOrderItem,
  updateOrderList,
  createOrder,
  deleteOrder,
  deleteOrderItem,
} = require('../../controllers/orders.controller')

router.get('/', validation.getOrderList, validateHandler, getOrderList)
router.post('/', validation.createOrder, validateHandler, createOrder)

router.patch(
  '/:id',
  validation.updateOrderList,
  validateHandler,
  updateOrderList
)
router.patch(
  '/item/:id',
  validation.updateOrderItem,
  validateHandler,
  updateOrderItem
)

router.delete('/:id', validation.deleteOrder, validateHandler, deleteOrder)
router.delete(
  '/item/:id',
  validation.deleteOrderItem,
  validateHandler,
  deleteOrderItem
)

module.exports = router

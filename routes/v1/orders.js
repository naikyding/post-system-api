const express = require('express')
const router = express.Router()
const { auth } = require('../../utils/auth')
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

router.get('/', auth, validation.getOrderList, validateHandler, getOrderList)
router.post('/', auth, validation.createOrder, validateHandler, createOrder)

router.patch(
  '/:id',
  auth,
  validation.updateOrderList,
  validateHandler,
  updateOrderList
)
router.patch(
  '/item/:id',
  auth,
  validation.updateOrderItem,
  validateHandler,
  updateOrderItem
)

router.delete('/:id', validation.deleteOrder, validateHandler, deleteOrder)
router.delete(
  '/item/:id',
  auth,
  validation.deleteOrderItem,
  validateHandler,
  deleteOrderItem
)

module.exports = router

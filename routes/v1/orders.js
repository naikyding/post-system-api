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
  createOrderItem,
  deleteOrder,
  deleteOrderItem,
} = require('../../controllers/orders.controller')

router.get('/', auth, validation.getOrderList, validateHandler, getOrderList)
router.post('/', auth, validation.createOrder, validateHandler, createOrder)
router.post(
  '/:id',
  auth,
  validation.createOrderItem,
  validateHandler,
  createOrderItem
)

router.patch(
  '/:id',
  auth,
  validation.updateOrderList,
  validateHandler,
  updateOrderList
)

router.patch(
  '/:orderId/item/:itemId',
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

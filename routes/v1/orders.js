const express = require('express')
const router = express.Router()

const {
  getOrderList,
  createOrder,
  deleteOrder,
} = require('../../controllers/orders.controller')

router.get('/', getOrderList)
router.post('/', createOrder)
router.delete('/:id', deleteOrder)

module.exports = router

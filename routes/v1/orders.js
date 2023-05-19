const express = require('express')
const router = express.Router()

const {
  getOrderList,
  addOrderList,
} = require('../../controllers/orders.controller')

router
  .get('/', getOrderList)
  .post('/', addOrderList)
  .delete('/', (req, res) => {
    res.send('DELETE order')
  })

module.exports = router

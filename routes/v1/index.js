const express = require('express')
const router = express.Router()

const indexRouter = require('./main')
const orderRouter = require('./orders')

router.use('/', indexRouter)
router.use('/orders', orderRouter)

module.exports = router

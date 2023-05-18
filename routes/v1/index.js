const express = require('express')
const router = express.Router()

const indexRouter = require('./main')
const orderRouter = require('./order')

router.use('/', indexRouter)
router.use('/order', orderRouter)

module.exports = router

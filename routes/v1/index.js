const express = require('express')
const router = express.Router()

const indexRouter = require('./main')
const orderRouter = require('./orders')
const rolesRouter = require('./roles')

router.use('/', indexRouter)
router.use('/orders', orderRouter)
router.use('/roles', rolesRouter)

module.exports = router

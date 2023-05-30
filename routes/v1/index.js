const express = require('express')
const router = express.Router()

const indexRouter = require('./main')
const orderRouter = require('./orders')
const rolesRouter = require('./roles')
const agentsRouter = require('./agents')
const extrasRouter = require('./extras')
const productRouter = require('./products')

router.use('/', indexRouter)
router.use('/orders', orderRouter)
router.use('/roles', rolesRouter)
router.use('/agents', agentsRouter)
router.use('/extras', extrasRouter)
router.use('/products', productRouter)

module.exports = router

const express = require('express')
const router = express.Router()

const indexRouter = require('./main')
const orderRouter = require('./orders')
const rolesRouter = require('./roles')
const agentsRouter = require('./agents')

router.use('/', indexRouter)
router.use('/orders', orderRouter)
router.use('/roles', rolesRouter)
router.use('/agents', agentsRouter)

module.exports = router

const express = require('express')
const router = express.Router()

const indexRouter = require('./main')
const orderRouter = require('./orders')
const rolesRouter = require('./roles')
const agentsRouter = require('./agents')
const extrasRouter = require('./extras')
const productRouter = require('./products')
const customersRouter = require('./customers')
const authRouter = require('./auth')
const usersRouter = require('./users')
const dashboardRouter = require('./dashboard')
const markersRouter = require('./markers')

router.use('/', indexRouter)
router.use('/orders', orderRouter)
router.use('/roles', rolesRouter)
router.use('/agents', agentsRouter)
router.use('/extras', extrasRouter)
router.use('/products', productRouter)
router.use('/customers', customersRouter)
router.use('/auth', authRouter)
router.use('/users', usersRouter)
router.use('/dashboard', dashboardRouter)
router.use('/markers', markersRouter)

module.exports = router

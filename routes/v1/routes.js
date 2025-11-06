const express = require('express')
const router = express.Router()
const { getRoutes, validation } = require('../../controllers/routes.controller')
const { auth } = require('../../utils/auth')
const validateHandler = require('../../utils/validateHandler')

router.get('/', auth, validation.getRoutes, validateHandler, getRoutes)

module.exports = router

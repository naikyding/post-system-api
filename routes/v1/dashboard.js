const express = require('express')
const router = express.Router()

const validateHandler = require('../../utils/validateHandler')

const {
  validation,
  getDashboard,
} = require('../../controllers/dashboard.controller')

router.get('/', validation.getDashboard, validateHandler, getDashboard)

module.exports = router

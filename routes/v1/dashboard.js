const express = require('express')
const router = express.Router()
const { auth } = require('../../utils/auth')
const {
  validation,
  getBaseData,
} = require('../../controllers/dashboard.controller')
const validateHandler = require('../../utils/validateHandler')

router.get('/base', auth, validation.getBaseData, validateHandler, getBaseData)

module.exports = router

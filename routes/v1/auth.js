const express = require('express')
const router = express.Router()
const { auth } = require('../../utils/auth')
const validateHandler = require('../../utils/validateHandler')
const {
  validation,

  userLogin,
  createUsers,
  verifyToken,
} = require('../../controllers/auth.controller')
const { errorResponse } = require('../../utils/responseHandlers')

router.get('/verify-token', auth, verifyToken)
router.post('/login', validation.adminLogin, validateHandler, userLogin)
router.post('/users', validation.createUsers, validateHandler, createUsers)

module.exports = router

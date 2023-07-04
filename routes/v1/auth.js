const express = require('express')
const router = express.Router()
const { auth } = require('../../utils/auth')
const validateHandler = require('../../utils/validateHandler')
const {
  validation,

  userLogin,
  createUsers,
  verifyHeadersToken,
} = require('../../controllers/auth.controller')

router.get('/verify-token', auth, verifyHeadersToken)
router.post('/login', validation.adminLogin, validateHandler, userLogin)
router.post('/users', validation.createUsers, validateHandler, createUsers)

module.exports = router

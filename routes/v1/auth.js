const express = require('express')
const router = express.Router()

const validateHandler = require('../../utils/validateHandler')
const {
  validation,

  adminLogin,
} = require('../../controllers/auth.controller')

router.get('/login', (req, res) => {
  res.send('GET /auth/login')
})

router.post('/login', validation.adminLogin, validateHandler, adminLogin)

module.exports = router

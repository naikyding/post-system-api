const express = require('express')
const router = express.Router()

const validateHandler = require('../../utils/validateHandler')
const {
  validation,

  userLogin,
  createUsers,
} = require('../../controllers/auth.controller')

router.get('/login', (req, res) => {
  res.send('GET /auth/login')
})

router.post('/login', validation.adminLogin, validateHandler, userLogin)
router.post('/users', validation.createUsers, validateHandler, createUsers)

module.exports = router

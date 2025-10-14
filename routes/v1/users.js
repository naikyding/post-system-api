const express = require('express')
const router = express.Router()
const { auth } = require('../../utils/auth')
const {
  validation,
  getUserBaseInfo,
  getUsers,
  createUser,
} = require('../../controllers/users.controller')
const validateHandler = require('../../utils/validateHandler')

router.get('/', auth, validation.getUsers, validateHandler, getUsers)
router.post('/', auth, validation.createUser, validateHandler, createUser)

// 取得使用者資料
router.get(
  '/base-info',
  auth,
  validation.getUserBaseInfo,
  validateHandler,
  getUserBaseInfo
)

module.exports = router

const express = require('express')
const router = express.Router()
const { auth } = require('../../utils/auth')
const { getUserBaseInfo } = require('../../controllers/users.controller')

// 取得使用者資料
router.get('/base-info', auth, getUserBaseInfo)

module.exports = router

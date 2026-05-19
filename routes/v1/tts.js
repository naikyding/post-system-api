const express = require('express')
const router = express.Router()

const { auth } = require('../../utils/auth')
const { postTts } = require('../../controllers/tts.controller')

const validateHandler = require('../../utils/validateHandler')
validateHandler

router.post('/', auth, validateHandler, postTts)

module.exports = router

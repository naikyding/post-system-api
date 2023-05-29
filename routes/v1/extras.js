const express = require('express')
const router = express.Router()

const validateHandler = require('../../utils/validateHandler')

const {
  validation,

  getExtras,
  postExtras,
  deleteExtras,
} = require('../../controllers/extras.controller')

router.get('/', getExtras)
router.post('/', validation.postExtras, validateHandler, postExtras)
router.delete('/', deleteExtras)

module.exports = router

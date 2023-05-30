const express = require('express')
const router = express.Router()

const validateHandler = require('../../utils/validateHandler')

const {
  validation,

  getExtras,
  createExtra,
  deleteExtra,
} = require('../../controllers/extras.controller')

router.get('/', getExtras)
router.post('/', validation.createExtra, validateHandler, createExtra)
router.delete('/:id', validation.deleteExtra, validateHandler, deleteExtra)

module.exports = router

const express = require('express')
const router = express.Router()

const validateHandler = require('../../utils/validateHandler')

const {
  validation,

  getExtras,
  createExtra,
  deleteExtra,
  updateExtra,
} = require('../../controllers/extras.controller')

router.get('/', getExtras)
router.post('/', validation.createExtra, validateHandler, createExtra)
router.delete('/:id', validation.deleteExtra, validateHandler, deleteExtra)
router.patch('/:id', validation.updateExtra, validateHandler, updateExtra)

module.exports = router

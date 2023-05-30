const express = require('express')
const router = express.Router()

const validateHandler = require('../../utils/validateHandler')

const {
  getRoles,
  createRole,
  validation,
} = require('../../controllers/roles.controller')

router
  .get('/', getRoles)
  .post('/', validation.createRole, validateHandler, createRole)
  .delete('/', () => {})

module.exports = router

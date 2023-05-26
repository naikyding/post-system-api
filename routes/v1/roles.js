const express = require('express')
const router = express.Router()

const validateHandler = require('../../utils/validateHandler')

const {
  getRoles,
  postRole,
  validation,
} = require('../../controllers/roles.controller')

router
  .get('/', getRoles)
  .post('/', validation.postRole, validateHandler, postRole)
  .delete('/', () => {})

module.exports = router

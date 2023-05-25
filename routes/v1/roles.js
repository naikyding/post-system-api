const express = require('express')
const router = express.Router()

const {
  getRoles,
  postRole,
  validation,
} = require('../../controllers/roles.controller')

router
  .get('/', getRoles)
  .post('/', validation.postRole, postRole)
  .delete('/', () => {})

module.exports = router

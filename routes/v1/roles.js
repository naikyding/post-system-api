const express = require('express')
const router = express.Router()

const { getRoles, postRole } = require('../../controllers/roles.controller')

router
  .get('/', getRoles)
  .post('/', postRole)
  .delete('/', () => {})

module.exports = router

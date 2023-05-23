const express = require('express')
const router = express.Router()
const { getRoles, postRole } = require('../../controllers/roles.controller')

router.get('/', getRoles)
router.post('/', postRole)

module.exports = router

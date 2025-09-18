const express = require('express')
const router = express.Router()

const validateHandler = require('../../utils/validateHandler')
const { auth } = require('../../utils/auth')

const {
  validation,

  getRoles,
  deleteRole,
  createRole,
  patchRole,
} = require('../../controllers/roles.controller')

router.get('/', auth, getRoles)

router.delete(
  '/:id',
  auth,
  validation.validateId,
  validateHandler,
  validation.deleteRole,
  validateHandler,
  deleteRole
)

router.post('/', validation.createRole, validateHandler, createRole)

router.patch(
  '/:id',
  auth,
  validation.validateId,
  validateHandler,
  validation.patchRole,
  validateHandler,
  patchRole
)

module.exports = router

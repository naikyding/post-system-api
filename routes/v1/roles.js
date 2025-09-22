const express = require('express')
const router = express.Router()

const validateHandler = require('../../utils/validateHandler')
const { auth } = require('../../utils/auth')

const {
  authValidateAndSaveMiddleware,
  validation,

  getRoles,
  deleteRole,
  createRole,
  patchRole,
} = require('../../controllers/roles.controller')

router.get('/', auth, getRoles)

router.post(
  '/',
  auth,
  authValidateAndSaveMiddleware,
  validation.createRole,
  validateHandler,
  createRole
)

router.delete(
  '/:id',
  auth,
  validation.validateId,
  validateHandler,
  validation.deleteRole,
  validateHandler,
  deleteRole
)

router.patch(
  '/:id',
  auth,
  validation.validateId,
  validateHandler,
  authValidateAndSaveMiddleware,
  validation.patchRole,
  validateHandler,
  patchRole
)

module.exports = router

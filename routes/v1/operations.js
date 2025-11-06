const express = require('express')
const router = express.Router()

const { auth } = require('../../utils/auth')
const {
  validation,

  getOperations,
  createOperation,
  deleteOperation,
  patchOperation,
} = require('../../controllers/operations.controller')
const validateHandler = require('../../utils/validateHandler')

router.get('/', auth, validation.getOperations, getOperations)

router.post(
  '/',
  auth,
  validation.createOperation,
  validateHandler,
  createOperation
)

router.delete(
  '/:id',
  auth,
  validation.validateId,
  validateHandler,
  validation.deleteOperation,
  validateHandler,
  deleteOperation
)

router.patch(
  '/:id',
  auth,
  validation.validateId,
  validateHandler,
  validation.patchOperation,
  validateHandler,
  patchOperation
)

module.exports = router

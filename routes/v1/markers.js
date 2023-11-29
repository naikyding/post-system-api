const express = require('express')
const router = express.Router()

const { auth } = require('../../utils/auth')
const {
  validation,

  getMarkers,
  createMarker,
  deleteMarker,
  patchMarker,
} = require('../../controllers/markers.controller')
const validateHandler = require('../../utils/validateHandler')
validateHandler

router.get('/', auth, validation.getMarkers, validateHandler, getMarkers)

router.post('/', auth, validation.createMarker, validateHandler, createMarker)

router.delete(
  '/:id',
  auth,
  validation.deleteMarker,
  validateHandler,
  deleteMarker
)

router.patch('/:id', auth, validation.patchMarker, validateHandler, patchMarker)

module.exports = router

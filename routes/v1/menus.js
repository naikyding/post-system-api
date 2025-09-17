const express = require('express')
const router = express.Router()

const { auth } = require('../../utils/auth')
const {
  validation,

  getMenus,
  createMenu,
  deleteMenu,
  patchMenu,
} = require('../../controllers/menus.controller')
const validateHandler = require('../../utils/validateHandler')
validateHandler

router.get('/', auth, validation.getMenus, getMenus)

router.post('/', auth, validation.createMenu, validateHandler, createMenu)

router.delete(
  '/:id',
  auth,
  validation.validateId,
  validateHandler,
  validation.deleteMenu,
  validateHandler,
  deleteMenu
)

router.patch(
  '/:id',
  auth,
  validation.validateId,
  validateHandler,
  validation.patchMenu,
  validateHandler,
  patchMenu
)

module.exports = router

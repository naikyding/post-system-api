const express = require('express')
const router = express.Router()
const { auth } = require('../../utils/auth')

const validateHandler = require('../../utils/validateHandler')

const {
  validation,

  getAgents,
  createAgent,
  deleteAgent,
  updateAgent,
  createAgentBranch,
} = require('../../controllers/agents.controller')

router.get('/', auth, getAgents)
router.post('/', auth, validation.createAgent, validateHandler, createAgent)
router.delete(
  '/:id',
  auth,
  validation.deleteAgent,
  validateHandler,
  deleteAgent
)

router.patch('/:id', auth, validation.updateAgent, validateHandler, updateAgent)

router.post(
  '/:id/branches',
  auth,
  validation.createAgentBranch,
  validateHandler,
  createAgentBranch
)

module.exports = router

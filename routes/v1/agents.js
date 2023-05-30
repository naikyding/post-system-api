const express = require('express')
const router = express.Router()

const validateHandler = require('../../utils/validateHandler')

const {
  validation,

  getAgents,
  createAgent,
  deleteAgent,
} = require('../../controllers/agents.controller')

router.get('/', getAgents)
router.post('/', validation.createAgent, validateHandler, createAgent)
router.delete('/:id', validation.deleteAgent, validateHandler, deleteAgent)

module.exports = router

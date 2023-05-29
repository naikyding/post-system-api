const express = require('express')
const router = express.Router()

const validateHandler = require('../../utils/validateHandler')

const {
  validation,

  getAgents,
  postAgents,
  deleteAgents,
} = require('../../controllers/agents.controller')

router.get('/', getAgents)
router.post('/', validation.postAgents, validateHandler, postAgents)
router.delete('/:id', validation.deleteAgents, validateHandler, deleteAgents)

module.exports = router

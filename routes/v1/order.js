const express = require('express')
const router = express.Router()

router
  .get('/', (req, res) => {
    res.send('GET order')
  })
  .post('/', (req, res) => {
    res.send('POST order')
  })
  .delete('/', (req, res) => {
    res.send('DELETE order')
  })

module.exports = router

const Marker = require('../../models/markers.model')
const cloneSimpleCollection = require('./cloneSimpleCollection.service')

module.exports = ({ fromAgentId, toAgentId, session }) =>
  cloneSimpleCollection({
    Model: Marker,
    fromAgentId,
    toAgentId,
    session,
    fields: ['name', 'description', 'sort'],
  })

const OrderSource = require('../../models/orderSources.model')
const cloneSimpleCollection = require('./cloneSimpleCollection.service')

module.exports = ({ fromAgentId, toAgentId, session }) =>
  cloneSimpleCollection({
    Model: OrderSource,
    fromAgentId,
    toAgentId,
    session,
    fields: ['name', 'sort', 'status', 'isDefault'],
  })

const PaymentType = require('../../models/paymentType.model')
const cloneSimpleCollection = require('./cloneSimpleCollection.service')

module.exports = ({ fromAgentId, toAgentId, session }) =>
  cloneSimpleCollection({
    Model: PaymentType,
    fromAgentId,
    toAgentId,
    session,
    fields: ['name', 'code', 'color', 'sort', 'status', 'isDefault'],
  })

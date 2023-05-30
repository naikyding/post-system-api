const catchAsync = require('../utils/catchAsync')

const validation = {
  createCustomer: [],
  deleteCustomer: [],
}

const getCustomers = catchAsync(async (req, res, next) => {
  res.send('GET Customer')
})
const createCustomer = catchAsync(async (req, res, next) => {
  res.send('POST Customer')
})
const deleteCustomer = catchAsync(async (req, res, next) => {
  res.send('DELETE Customer')
})

module.exports = {
  validation,

  getCustomers,
  createCustomer,
  deleteCustomer,
}

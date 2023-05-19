const catchAsync = require('../utils/catchAsync')
const { successResponse, errorResponse } = require('../utils/responseHandlers')

const getOrderList = (req, res) => {
  res.send('GET Order List')
}

const addOrderList = catchAsync((req, res) => {
  successResponse({ res, data: req.body, statusCode: 201 })
  // errorResponse({ res })
})

module.exports = { getOrderList, addOrderList }

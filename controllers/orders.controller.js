const catchAsync = require('../utils/catchAsync')

const getOrderList = (req, res) => {
  res.send('GET orderlsit')
}

const addOrderList = catchAsync((req, res) => {
  req.body.text()
  console.log(req.body)
  res.send('Post orderlsit')
})

module.exports = { getOrderList, addOrderList }

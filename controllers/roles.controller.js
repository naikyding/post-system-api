const catchAsync = require('../utils/catchAsync')

const getRoles = catchAsync((req, res, next) => {
  res.send('getRoles')
})

const postRole = catchAsync((req, res, next) => {
  res.send('postRole')
})

module.exports = { getRoles, postRole }

const usersModel = require('../models/users.model')
const catchAsync = require('../utils/catchAsync')
const { successResponse } = require('../utils/responseHandlers')

const getUserBaseInfo = catchAsync(async (req, res) => {
  const { _id } = req.user
  const matchUser = await usersModel
    .findById(_id)
    .select('email roles agents nickname avatar phone note')

  successResponse({ res, data: matchUser })
})

module.exports = { getUserBaseInfo }

const usersModel = require('../models/users.model')
const catchAsync = require('../utils/catchAsync')
const { successResponse } = require('../utils/responseHandlers')

const getUserBaseInfo = catchAsync(async (req, res) => {
  const { _id } = req.user
  const matchUser = await usersModel
    .findById(_id)
    .populate({
      path: 'agents',
      select: '-createdAt -updatedAt',
    })
    .populate({
      path: 'roles',
      select: '-createdAt -updatedAt',
    })
    .select('email roles agents nickname avatar phone note')
    .lean()

  successResponse({ res, data: matchUser })
})

module.exports = { getUserBaseInfo }

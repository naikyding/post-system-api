const rolesModel = require('../models/roles.model')
const catchAsync = require('../utils/catchAsync')

const getRoles = (req, res, next) => {
  res.send('roles LIST')
}

const postRole = catchAsync(async (req, res, next) => {
  const createdRES = await rolesModel
    .create({
      name: req.body.name,
      description: req.body.description,
    })
    .catch((err) => console.log(err))

  res.send(createdRES)
})

module.exports = {
  getRoles,
  postRole,
}

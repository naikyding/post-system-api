const rolesModel = require('../models/roles.model')

const getRoles = (req, res, next) => {
  res.send('roles LIST')
}

const postRole = async (req, res, next) => {
  const createdRES = await rolesModel
    .create({
      name: req.body.name,
      description: req.body.description,
    })
    .catch((err) => console.log(err))

  res.send(createdRES)
}

module.exports = {
  getRoles,
  postRole,
}

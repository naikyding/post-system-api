const mongoose = require('mongoose')
const roleSchema = new mongoose.Schema(
  {
    name: {
      required: true,
      type: String,
    },
    description: {
      required: true,
      type: String,
    },
    menu: {
      type: Array,
      default: [],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)
const roles = mongoose.model('role', roleSchema)

module.exports = roles

const mongoose = require('mongoose')
const roleSchema = new mongoose.Schema(
  {
    name: {
      required: [true, '欄位 `name` 必填'],
      type: String,
    },
    description: {
      // required: [true, '欄位 `description` 必填'],
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

module.exports = mongoose.model('Role', roleSchema)

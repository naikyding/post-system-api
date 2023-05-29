const mongoose = require('mongoose')

const agentSchema = new mongoose.Schema(
  {
    name: {
      required: [true, '欄位 `name` 必填'],
      type: String,
    },
    description: {
      // required: [true, '欄位 `description` 必填'],
      type: String,
    },
    image: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
    // admin: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    //   },
    // ],
    // editor: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    //   },
    // ],
    // visitor: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    //   },
    // ],
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

module.exports = mongoose.model('Agent', agentSchema)

const mongoose = require('mongoose')

const customerSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '`name`必填'],
    },
    description: {
      type: String,
      required: [true, '`description`必填'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'non-binary'],
      required: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      required: [true, '`email`必填'],
    },
    phone: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    googleId: {
      type: String,
      default: '',
    },
    facebookId: {
      type: String,
      default: '',
    },
    password: {
      type: String,
      required: [true, '`password`必填'],
    },
    note: {
      type: String,
      default: '',
    },
    agents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'agents 是必填項目'],
        ref: 'Agent',
      },
    ],
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

module.exports = mongoose.model('Customer', customerSchema)

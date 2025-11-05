const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    email: {
      required: [true, '欄位 `email` 必填'],
      type: String,
    },
    password: {
      required: [true, '欄位 `password` 必填'],
      type: String,
    },

    agentRoles: [
      {
        agent: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Agent',
          required: [true, '商家 `agent` 是必填項目'],
        },
        roles: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role',
            required: [true, '角色 `role` 是必填項目'],
          },
        ],
      },
    ],

    nickname: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: 'https://avatar.iran.liara.run/public',
    },
    phone: {
      type: String,
      default: '',
    },
    note: {
      type: String,
      default: '',
    },

    // Auth2
    googleId: { type: String, default: '' },
    appleId: { type: String, default: '' },
    lineId: { type: String, default: '' },
    facebook: { type: String, default: '' },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

module.exports = mongoose.model('User', userSchema)

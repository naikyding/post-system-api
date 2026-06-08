const mongoose = require('mongoose')

const agentSchema = new mongoose.Schema(
  {
    name: {
      required: [true, '欄位 `name` 必填'],
      type: String,
      trim: true,
    },

    description: {
      type: String,
      default: '',
      trim: true,
    },

    // 店家狀態
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },

    // 店家代碼（唯一）
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    image: {
      type: String,
      default: '',
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

module.exports = mongoose.model('Agent', agentSchema)

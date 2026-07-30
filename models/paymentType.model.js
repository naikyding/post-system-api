const mongoose = require('mongoose')

const paymentTypeSchema = new mongoose.Schema(
  {
    // 名稱
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // 唯一代碼 (程式使用)
    code: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    // 所屬店家
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      required: true,
      index: true,
    },

    // 顯示顏色
    color: {
      type: String,
      default: '#1976D2',
    },

    // 排序
    sort: {
      type: Number,
      default: 0,
    },

    // 狀態
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },

    // 預設付款方式
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

// 每個 Agent 只能有一個預設付款方式
paymentTypeSchema.index(
  {
    agent: 1,
    isDefault: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDefault: true,
    },
  }
)

// 每個 Agent 的 code 不可重複
paymentTypeSchema.index(
  {
    agent: 1,
    code: 1,
  },
  {
    unique: true,
  }
)

module.exports = mongoose.model('PaymentType', paymentTypeSchema)

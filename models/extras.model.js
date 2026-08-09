const mongoose = require('mongoose')

const extrasSchema = new mongoose.Schema(
  {
    // 舊分類（過渡期保留）
    type: {
      type: String,
    },

    // 上架狀態
    status: {
      type: String,
      enum: ['active', 'inactive', 'deprecated'],
      default: 'inactive',
    },

    // 所屬店家
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      required: [true, 'agent 是必填項目'],
      index: true,
    },

    // 新分類
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExtrasCategory',
      default: null,
    },

    name: {
      type: String,
      required: [true, 'name 是必填項目'],
      trim: true,
    },

    description: {
      type: String,
      required: [true, 'description 是必填項目'],
      trim: true,
    },

    image: {
      type: String,
      default: '',
    },

    price: {
      type: Number,
      required: [true, 'price 是必填項目'],
      min: 0,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

// 同店家不可建立同名配料
extrasSchema.index(
  {
    agent: 1,
    name: 1,
  },
  {
    unique: true,
  }
)

// 常用查詢
extrasSchema.index({
  agent: 1,
  category: 1,
})

module.exports = mongoose.model('Extra', extrasSchema)

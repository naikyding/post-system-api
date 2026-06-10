const mongoose = require('mongoose')

const extrasCategorySchema = new mongoose.Schema(
  {
    // 分類狀態
    status: {
      type: String,
      enum: [
        'draft', // 草稿
        'available', // 啟用中
        'hidden', // 隱藏
      ],
      default: 'draft',
    },

    // 分類名稱
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // 分類代碼（英文）
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    // 所屬店家
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      required: [true, 'agent 是必填項目'],
      index: true,
    },

    // 排序
    sort: {
      type: Number,
      default: 0,
    },

    // 分類圖片
    image: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

// 同店家 slug 不可重覆
extrasCategorySchema.index(
  {
    agent: 1,
    slug: 1,
  },
  {
    unique: true,
  }
)

// 同店家 name 不可重覆
extrasCategorySchema.index(
  {
    agent: 1,
    name: 1,
  },
  {
    unique: true,
  }
)

module.exports = mongoose.model('ExtrasCategory', extrasCategorySchema)

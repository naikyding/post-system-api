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
      unique: true,
      lowercase: true,
      trim: true,
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

module.exports = mongoose.model('ExtrasCategory', extrasCategorySchema)

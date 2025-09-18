const mongoose = require('mongoose')

const operationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name 是必填項目'],
    },
    description: {
      type: String,
      default: null, // 非必填
    },
    menuId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu', // 對應 menus.model.js 的 model 名稱
      required: [true, 'menuId 是必填項目'],
    },
    operate: {
      type: String,
      default: null, // 可以是 null 或字串
    },
    action: {
      type: String,
      required: [true, 'action 是必填項目'],
      enum: ['view', 'create', 'update', 'delete'],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

module.exports = mongoose.model('Operations', operationSchema)

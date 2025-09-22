const mongoose = require('mongoose')

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '角色名稱必填'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, '角色代碼必填'], // e.g. admin, editor, viewer
      lowercase: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    status: {
      type: Boolean,
      default: true, // true=啟用, false=停用
    },

    // 前端能看到哪些選單（UI 控制）
    menus: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Menu' }],

    // 能做哪些操作（API 控制）
    operations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Operation' }],

    // 系統內建角色（不可刪、限制編輯）
    isSystem: {
      type: Boolean,
      default: false,
    },

    // 可選：資料範圍（若未來有需要資料級存取控制）
    dataScope: {
      type: String,
      enum: ['all', 'self', 'dept', 'deptAndSub', 'custom'],
      default: 'all',
    },
    // 當 dataScope=custom 時，可指定資料可見的單位/群組等（依你的業務實體調整）
    dataScopeRefs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agent',
        default: undefined,
      },
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

// 索引
roleSchema.index({ code: 1 }, { unique: true })
roleSchema.index({ name: 1 })

module.exports = mongoose.model('Role', roleSchema)

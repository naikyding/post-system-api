const mongoose = require('mongoose')

const menuSchema = new mongoose.Schema(
  {
    sort: {
      type: Number,
      required: [true, 'sort 是必填項目'],
    },
    status: {
      type: Boolean,
      required: [true, 'status 是必填項目'],
    },
    icon: {
      type: String,
      // required: [true, 'icon 是必填項目'],
    },
    name: {
      type: String,
      required: [true, 'name 是必填項目'],
    },
    description: {
      type: String,
      // required: [true, 'description 是必填項目'],
    },

    routeName: {
      type: String,
      required: [true, 'routeName 是必填項目'],
    },
    path: {
      type: String,
      required: [true, 'path 是必填項目'],
    },
    component: {
      type: String,
      required: [true, 'component 是必填項目'],
    },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Menu', // 注意這裡要填自己 model 的名字
      default: null, // 沒有父層時可為 null
    },
    redirect: {
      type: String,
      default: null,
    },
    // agentId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Agent', // 這裡的 'Agent' 要對應到你 agents model 的名稱
    //   required: [true, 'agentId 是必填項目'],
    // },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

module.exports = mongoose.model('Menu', menuSchema)

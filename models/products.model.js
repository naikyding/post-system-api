const mongoose = require('mongoose')

const productsSchema = new mongoose.Schema(
  {
    // 商品狀態
    status: {
      type: String,
      enum: [
        'available', // 上架中
        'hidden', // 下架／隱藏
        'archived', // 封存／停用
      ],
      // required: [true, '商品狀態是必填項目'],
      default: 'inactive',
    },

    // 舊分類（過渡期保留）
    type: {
      type: String,
      required: [true, 'type 是必填項目'],
    },

    // 新分類（正式關聯）
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductCategory',
      default: null,
    },

    name: {
      type: String,
      required: [true, 'name 是必填項目'],
    },
    description: {
      type: String,
      required: [true, 'description 是必填項目'],
    },
    image: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'price 是必填項目'],
    },
    agents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'agents 是必填項目'],
        ref: 'Agent',
      },
    ],
    extras: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Extra',
        },
      ],
      default: [], // 預設為空陣列
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

module.exports = mongoose.model('Product', productsSchema)

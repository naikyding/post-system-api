const mongoose = require('mongoose')

const productsSchema = new mongoose.Schema(
  {
    // 商品狀態
    status: {
      type: String,
      enum: [
        'active', // 上架
        'inactive', // 下架
        'deprecated', // 棄用
      ],
      // required: [true, '商品狀態是必填項目'],
      default: 'inactive',
    },

    type: {
      type: String,
      required: [true, 'type 是必填項目'],
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

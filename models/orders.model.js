const mongoose = require('mongoose')

const ordersSchema = mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, '欄位 `customer` 必填'],
  },

  items: {
    type: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: [true, '欄位 `product` 必填'],
        },
        extras: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Extra',
          },
        ],
      },
    ],
    default: [],
  },

  totalPrice: {
    type: Number,
    required: [true, '欄位 `totalPrice` 必填'],
  },

  isPaid: {
    type: Boolean,
    default: false,
    // required: [true, '欄位 `isPaid` 必填'],
  },

  status: {
    type: String,
    enum: [
      'pending', // 待處理
      'inProgress', // 進行中
      'completed', // 完成
      'cancelled', // 取消
      'awaitingPayment', // 等待付款
    ],
    default: 'pending',
  },

  note: {
    type: String,
    default: '',
  },

  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: [true, '欄位 `agent` 必填'],
  },
})

module.exports = mongoose.model('Order', ordersSchema)

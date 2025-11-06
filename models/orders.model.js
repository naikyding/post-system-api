const mongoose = require('mongoose')

const ordersSchema = mongoose.Schema(
  {
    // 消費者
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      // required: [true, '欄位 `customer` 必填'],
    },

    // 後台 使用者 User
    operator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // required: [true, '欄位 `customer` 必填'],
    },

    items: {
      type: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, '欄位 `items.product` 必填'],
          },
          extras: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Extra',
              required: [true, '欄位 `item.extras` ExtrasId 必填'],
            },
          ],
          extrasData: [
            {
              extraItem: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Extra',
                required: [true, '欄位 `items.extrasData.extraItem` 必填'],
              },
              quantity: {
                type: Number,
                required: [true, '欄位 `extras.extrasData.quantity` 必填'],
              },
              price: {
                type: Number,
                required: [true, '欄位 `extras.extrasData.price` 必填'],
              },
            },
          ],
          quantity: {
            type: Number,
            required: [true, '欄位 `items.quantity` 必填'],
          },
          price: {
            type: Number,
            required: [true, '欄位 `items.price` 必填'],
          },
          status: {
            type: Boolean,
            default: false,
          },
          notes: {
            type: String,
            default: '',
          },
          markers: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Markers',
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
      ],
      default: 'pending',
    },

    // 手機未三碼
    mobileNoThreeDigits: {
      type: String,
      default: '',
    },

    note: {
      type: String,
      default: '',
    },

    paymentType: {
      type: String,
      default: '',
    },

    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      required: [true, '欄位 `agent` 必填'],
    },
    scheduledAt: {
      type: Date,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

ordersSchema.pre('validate', function (next) {
  if (!!this.customer === !!this.operator) {
    const error = new Error('customer 或 operator 至少且只能有一個存在!')
    error.statusCode = 400 // 自訂 HTTP 狀態碼
    return next(error)
  }
  next()
})

module.exports = mongoose.model('Order', ordersSchema)

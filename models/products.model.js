const mongoose = require('mongoose')

const productsSchema = new mongoose.Schema(
  {
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
    extras: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Extra',
      },
    ],
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

module.exports = mongoose.model('Product', productsSchema)

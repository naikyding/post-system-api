const mongoose = require('mongoose')

const orderSourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      required: true,
      index: true,
    },

    sort: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

orderSourceSchema.index(
  {
    agent: 1,
    name: 1,
  },
  {
    unique: true,
  }
)

module.exports = mongoose.model('OrderSource', orderSourceSchema)

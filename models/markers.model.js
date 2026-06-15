const mongoose = require('mongoose')

const markersSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name 是必填項目'],
    },

    description: {
      type: String,
      default: '',
    },

    agent: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'agent 是必填項目'],
      ref: 'Agent',
    },

    // 排序
    sort: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

markersSchema.index(
  {
    agent: 1,
    name: 1,
  },
  {
    unique: true,
  }
)

module.exports = mongoose.model('Markers', markersSchema)

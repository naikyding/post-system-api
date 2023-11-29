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
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

module.exports = mongoose.model('Markers', markersSchema)

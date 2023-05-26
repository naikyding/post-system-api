const mongoose = require('mongoose')

const extrasSchema = new mongoose.Schema({
  type: {
    required: [true, 'type 是必填項目'],
    type: String,
  },
  name: {
    required: [true, 'name 是必填項目'],
    type: String,
  },
  description: {
    required: [true, 'description 是必填項目'],
    type: String,
  },
  image: {
    required: [true, 'name 是必填項目'],
    type: String,
  },
  price: {
    required: [true, 'price 是必填項目'],
    type: Number,
  },
  agents: {
    required: [true, 'agents 是必填項目'],
    type: Number,
  },
})

module.exports = mongoose.model('Extra', extrasSchema)

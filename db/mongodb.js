const mongoose = require('mongoose')
const catchAsync = require('../utils/catchAsync')

const connectDB = catchAsync(async () => {
  const dbURL = process.env.MONGO_URL.replace(
    '<password>',
    process.env.MONGO_PASSWORD
  )
  await mongoose.connect(dbURL)
  console.log('----------- ✅ MongoDB connected -----------')
})

module.exports = connectDB

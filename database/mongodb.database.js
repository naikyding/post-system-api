const mongoose = require('mongoose')
const catchAsync = require('../utils/catchAsync')

const mongoDbConnect = catchAsync(async () => {
  const databaseUrl = process.env.MONGODB_DATABASE_URL.replace(
    '<password>',
    process.env.MONGODB_DATABASE_PASSWORD
  )
  await mongoose.connect(databaseUrl)
  console.log('------------- ✅ MongoDB Connected ✅ -------------')
})

module.exports = mongoDbConnect

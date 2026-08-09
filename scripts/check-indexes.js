// scripts/check-indexes.js
// 執行：node scripts/check-indexes.js

const mongoose = require('mongoose')
const path = require('path')

require('dotenv').config({
  path: path.resolve(__dirname, '../.env.local'),
})

const databaseUrl = process.env.MONGODB_DATABASE_URL.replace(
  '<password>',
  process.env.MONGODB_DATABASE_PASSWORD
)

const ProductCategory = require('../models/productCategory.model')
const ExtrasCategory = require('../models/extrasCategory.model')
const Extra = require('../models/extras.model')
const Marker = require('../models/markers.model')
const OrderSource = require('../models/orderSources.model')
const PaymentType = require('../models/paymentType.model')

async function printIndexes(Model) {
  const indexes = await Model.collection.indexes()

  console.log('\n========================================')
  console.log(`Collection : ${Model.collection.name}`)
  console.log('========================================')

  indexes.forEach((index) => {
    console.log(`Name   : ${index.name}`)
    console.log(`Key    : ${JSON.stringify(index.key)}`)
    console.log(`Unique : ${index.unique ? 'Yes' : 'No'}`)
    console.log('----------------------------------------')
  })
}

async function main() {
  try {
    await mongoose.connect(databaseUrl)

    await printIndexes(ProductCategory)
    await printIndexes(ExtrasCategory)
    await printIndexes(Extra)
    await printIndexes(Marker)
    await printIndexes(OrderSource)
    await printIndexes(PaymentType)

    await mongoose.disconnect()

    console.log('\n✅ Done')
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

main()

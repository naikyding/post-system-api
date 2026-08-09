// scripts/sync-all-indexes.js
// 執行：node scripts/sync-all-indexes.js

const mongoose = require('mongoose')
const path = require('path')

require('dotenv').config({
  path: path.resolve(__dirname, '../.env.local'),
})

const ProductCategory = require('../models/productCategory.model')
const ExtrasCategory = require('../models/extrasCategory.model')
const Extra = require('../models/extras.model')
const Marker = require('../models/markers.model')
const OrderSource = require('../models/orderSources.model')
const PaymentType = require('../models/paymentType.model')

const databaseUrl = process.env.MONGODB_DATABASE_URL.replace(
  '<password>',
  process.env.MONGODB_DATABASE_PASSWORD
)

const models = [
  ProductCategory,
  ExtrasCategory,
  Extra,
  Marker,
  OrderSource,
  PaymentType,
]

async function sync(Model) {
  console.log('\n========================================')
  console.log(`Model      : ${Model.modelName}`)
  console.log(`Collection : ${Model.collection.name}`)
  console.log('========================================')

  const beforeIndexes = await Model.collection.indexes()

  const dropped = await Model.syncIndexes()

  const afterIndexes = await Model.collection.indexes()

  console.log('\nCurrent Indexes:')

  afterIndexes.forEach((index) => {
    console.log(`- ${index.name}`)
  })

  if (dropped.length) {
    console.log('\nDropped Indexes:')

    dropped.forEach((index) => {
      console.log(`- ${index}`)
    })
  } else {
    console.log('\nDropped Indexes: None')
  }

  const added = afterIndexes
    .map((i) => i.name)
    .filter((name) => !beforeIndexes.some((i) => i.name === name))

  if (added.length) {
    console.log('\nCreated Indexes:')

    added.forEach((index) => {
      console.log(`- ${index}`)
    })
  } else {
    console.log('\nCreated Indexes: None')
  }

  console.log('\n✔ Sync Completed')
}

async function main() {
  try {
    console.log('Connecting MongoDB...')

    await mongoose.connect(databaseUrl)

    console.log('✅ Connected')

    for (const model of models) {
      await sync(model)
    }

    console.log('\n========================================')
    console.log('✅ All indexes synced successfully.')
    console.log('========================================')
  } catch (err) {
    console.error('\n❌ Sync indexes failed')
    console.error(err)

    process.exitCode = 1
  } finally {
    await mongoose.disconnect()

    console.log('\n🔌 MongoDB disconnected')
  }
}

main()

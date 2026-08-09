const mongoose = require('mongoose')
const path = require('path')

require('dotenv').config({
  path: path.resolve(__dirname, '../.env.local'),
})

const ExtrasCategory = require('../models/extrasCategory.model')

const databaseUrl = process.env.MONGODB_DATABASE_URL.replace(
  '<password>',
  process.env.MONGODB_DATABASE_PASSWORD
)

async function run() {
  try {
    await mongoose.connect(databaseUrl)

    const indexes = await ExtrasCategory.collection.indexes()

    const hasOldIndex = indexes.some((index) => index.name === 'slug_1')

    if (hasOldIndex) {
      await ExtrasCategory.collection.dropIndex('slug_1')
      console.log('✅ 已刪除 slug_1')
    } else {
      console.log('ℹ️ slug_1 不存在')
    }

    await mongoose.disconnect()

    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

run()

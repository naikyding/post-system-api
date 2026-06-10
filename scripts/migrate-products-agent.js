// 這個腳本用來將 products collection 中的 agents 欄位陣列資料遷移到 agent 欄位
// 執行方式： node scripts/migrate-products-agent.js
const mongoose = require('mongoose')
const Product = require('../models/products.model')

const path = require('path')

require('dotenv').config({
  path: path.resolve(__dirname, '../.env.local'),
})

const databaseUrl = process.env.MONGODB_DATABASE_URL.replace(
  '<password>',
  process.env.MONGODB_DATABASE_PASSWORD
)

async function migrate() {
  try {
    await mongoose.connect(databaseUrl)

    const products = await Product.find({
      agents: {
        $exists: true,
        $ne: [],
      },
    })

    console.log(`Found ${products.length} products`)

    for (const product of products) {
      if (product.agent) continue

      await Product.updateOne(
        {
          _id: product._id,
        },
        {
          $set: {
            agent: product.agents[0],
          },
        }
      )
    }

    console.log('Migration Done')

    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

migrate()

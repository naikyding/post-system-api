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

// migrate()

async function check() {
  try {
    await mongoose.connect(databaseUrl)

    await Product.updateMany(
      {
        agents: {
          $exists: true,
        },
      },
      {
        $unset: {
          agents: '',
        },
      }
    )

    const products = await Product.find({
      agents: {
        $exists: true,
      },
    }).lean()

    console.log(`Found ${products.length} products with agents field\n`)

    let missingAgentCount = 0

    for (const product of products) {
      if (!product.agent) {
        missingAgentCount++

        console.log('============================')
        console.log('❌ Missing agent')
        console.log('_id   :', product._id)
        console.log('name  :', product.name)
        console.log('agents:', product.agents)
        console.log()
      }
    }

    console.log('----------------------------')
    console.log(`總共保留 agents 欄位：${products.length}`)
    console.log(`沒有 agent 的資料：${missingAgentCount}`)

    if (missingAgentCount === 0) {
      console.log('✅ 所有資料都已有 agent，可安全移除 agents 欄位。')
    } else {
      console.log('❌ 請先完成 agent 遷移，再移除 agents 欄位。')
    }

    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

// check()
async function removeLegacyAgentsField() {
  await mongoose.connect(databaseUrl)

  const missingAgentCount = await Product.countDocuments({
    $or: [{ agent: { $exists: false } }, { agent: null }],
  })

  if (missingAgentCount > 0) {
    console.log(
      `❌ 還有 ${missingAgentCount} 筆沒有 agent，取消移除 agents 欄位`
    )
    return
  }

  const result = await Product.updateMany(
    {
      agents: {
        $exists: true,
      },
    },
    {
      $unset: {
        agents: '',
      },
    }
  )

  console.log(`✅ 已移除 ${result.modifiedCount} 筆 products 的 agents 欄位`)
}

removeLegacyAgentsField()

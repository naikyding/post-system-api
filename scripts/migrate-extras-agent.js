// 這個腳本用來將 Extra collection 中的 agents 欄位陣列資料遷移到 agent 欄位
// 執行方式： node scripts/migrate-extras-agent.js
const mongoose = require('mongoose')
const Extra = require('../models/extras.model')

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

    const extras = await Extra.find({
      agents: {
        $exists: true,
        $ne: [],
      },
    })

    for (const extra of extras) {
      if (extra.agent) continue

      await Extra.updateOne(
        {
          _id: extra._id,
        },
        {
          $set: {
            agent: extra.agents[0],
          },
        }
      )

      console.log(`Updated: ${extra.name}`)
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
  await mongoose.connect(databaseUrl)
  const missingAgent = await Extra.countDocuments({
    $or: [{ agent: { $exists: false } }, { agent: null }],
  })

  if (missingAgent > 0) {
    console.log(`❌ 還有 ${missingAgent} 筆沒有 agent，取消刪除 agents`)
    process.exit(1)
  }

  const result = await Extra.updateMany(
    {
      agents: { $exists: true },
    },
    {
      $unset: {
        agents: '',
      },
    }
  )

  console.log(`✅ 已移除 ${result.modifiedCount} 筆 agents 欄位`)
}

check()

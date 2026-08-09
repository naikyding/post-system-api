// scripts/check-duplicate-extras.js
// 執行：node scripts/check-duplicate-extras.js

const mongoose = require('mongoose')
const path = require('path')

require('dotenv').config({
  path: path.resolve(__dirname, '../.env.local'),
})

const Extra = require('../models/extras.model')

const databaseUrl = process.env.MONGODB_DATABASE_URL.replace(
  '<password>',
  process.env.MONGODB_DATABASE_PASSWORD
)

async function main() {
  try {
    await mongoose.connect(databaseUrl)

    const duplicates = await Extra.aggregate([
      {
        $group: {
          _id: {
            agent: '$agent',
            name: '$name',
          },
          count: {
            $sum: 1,
          },
          ids: {
            $push: '$_id',
          },
        },
      },
      {
        $match: {
          count: {
            $gt: 1,
          },
        },
      },
    ])

    if (!duplicates.length) {
      console.log('✅ 沒有重複資料')
      return
    }

    console.log(`找到 ${duplicates.length} 組重複資料\n`)

    for (const item of duplicates) {
      console.log('====================================')
      console.log(`Agent : ${item._id.agent}`)
      console.log(`Name  : ${item._id.name}`)
      console.log(`Count : ${item.count}`)
      console.log('====================================')

      const docs = await Extra.find({
        _id: {
          $in: item.ids,
        },
      }).lean()

      docs.forEach((doc, index) => {
        console.log(`\n----- Document ${index + 1} -----`)
        console.dir(doc, {
          depth: null,
          colors: true,
        })
      })

      console.log('\n')
    }
  } catch (err) {
    console.error(err)
  } finally {
    await mongoose.disconnect()
  }
}

main()

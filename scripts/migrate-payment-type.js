const mongoose = require('mongoose')
const { Types } = mongoose
const path = require('path')

const ordersModel = require('../models/orders.model')

require('dotenv').config({
  path: path.resolve(__dirname, '../.env.local'),
})

const databaseUrl = process.env.MONGODB_DATABASE_URL.replace(
  '<password>',
  process.env.MONGODB_DATABASE_PASSWORD
)

async function main() {
  await mongoose.connect(databaseUrl)

  const CASH_ID = new Types.ObjectId('6a684209396c3ccde21ea073')
  const LINE_PAY_ID = new Types.ObjectId('6a684243396c3ccde21ea079')
  const [cashResult, linePayResult, emptyResult] = await Promise.all([
    ordersModel.collection.updateMany(
      { paymentType: 'cash' },
      { $set: { paymentType: CASH_ID } }
    ),

    ordersModel.collection.updateMany(
      { paymentType: { $in: ['Line Pay', 'linePay'] } },
      { $set: { paymentType: LINE_PAY_ID } }
    ),

    ordersModel.collection.updateMany(
      { paymentType: '' },
      { $set: { paymentType: null } }
    ),
  ])

  console.log({
    cash: cashResult.modifiedCount,
    linePay: linePayResult.modifiedCount,
    empty: emptyResult.modifiedCount,
  })

  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

const menusModel = require('../models/menus.model')

async function getMenus() {
  const menus = await menusModel
    .find()
    .select('-createdAt -updatedAt')
    .sort({ sort: 1 }) // 1 = 升冪, -1 = 降冪
    .lean()
    .exec()

  return menus
}

async function getMenusIncludeOperations() {
  const result = await menusModel
    .aggregate([
      {
        $lookup: {
          from: 'operations', // 要關聯的 collection 名稱 (資料表)
          localField: '_id', // menus 裡的欄位 (這裡是 _id)
          foreignField: 'menuId', // operations 裡的欄位 (這裡是 menuId)
          as: 'operations', // 關聯後要存放的欄位名稱
        },
      },
    ])
    .sort({ sort: 1 }) // 1 = 升冪, -1 = 降冪
    .exec()

  return result
}

module.exports = { getMenus, getMenusIncludeOperations }

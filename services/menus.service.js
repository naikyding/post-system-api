const menusModel = require('../models/menus.model')

function buildTree(items, parentId = null) {
  return items
    .filter((item) => {
      // parentId 為 null → 代表最上層
      return (
        (item.parentId ? String(item.parentId) : null) ===
        (parentId ? String(parentId) : null)
      )
    })
    .sort((a, b) => a.sort - b.sort) // 依 sort 排序
    .map((item) => ({
      ...item,
      children: buildTree(items, item._id), // 遞迴往下找子層
    }))
}

async function getMenus() {
  const menus = await menusModel
    .aggregate([
      {
        $lookup: {
          from: 'menus',
          localField: '_id',
          foreignField: 'parentId',
          as: 'children',
        },
      },
      {
        $match: {
          $or: [{ parentId: null }, { parentId: { $exists: false } }],
        },
        // $match: { parentId: { $exists: false } }, // 只保留 root 節點
        // 📌 $match 是什麼
        // 在 MongoDB 的 aggregate pipeline 裡，$match 就像 SQL 的 WHERE 條件，用來過濾文件。
        // 只有符合條件的文件才會繼續往下傳遞。

        // 📌 { parentId: { $exists: false } } 的意思
        // $exists: false → 表示「這個欄位不存在」。
        // 所以這個條件會過濾出 沒有 parentId 欄位的文件。
        // 換句話說：
        // 如果一筆 menu 沒有 parentId → 它就是 root 節點（最上層選單）。
        // 如果有 parentId → 它就是子選單，不會出現在頂層。
      },
    ])
    .sort({ sort: 1 }) // 1 = 升冪, -1 = 降冪
    .exec()

  return menus
}

async function getMenusIncludeOperations() {
  const result = await menusModel
    .aggregate([
      {
        $lookup: {
          from: 'menus',
          localField: '_id',
          foreignField: 'parentId',
          as: 'children',
          pipeline: [
            {
              $lookup: {
                from: 'operations',
                localField: '_id',
                foreignField: 'menuId',
                as: 'operations',
              },
            },
          ],
        },
      },
      // {
      //   $match: {
      //     $or: [{ parentId: null }, { parentId: { $exists: false } }],
      //   },
      //   // $match: { parentId: { $exists: false } }, // 只保留 root 節點
      //   // 📌 $match 是什麼
      //   // 在 MongoDB 的 aggregate pipeline 裡，$match 就像 SQL 的 WHERE 條件，用來過濾文件。
      //   // 只有符合條件的文件才會繼續往下傳遞。

      //   // 📌 { parentId: { $exists: false } } 的意思
      //   // $exists: false → 表示「這個欄位不存在」。
      //   // 所以這個條件會過濾出 沒有 parentId 欄位的文件。
      //   // 換句話說：
      //   // 如果一筆 menu 沒有 parentId → 它就是 root 節點（最上層選單）。
      //   // 如果有 parentId → 它就是子選單，不會出現在頂層。
      // },
      {
        //無限填充
        $graphLookup: {
          from: 'menus', // 關聯的 collection
          startWith: '$_id', // 從 root 的 _id 開始往下找
          connectFromField: '_id', // 當前文件的 _id
          connectToField: 'parentId', // 子節點的 parentId
          as: 'children', // 結果存放欄位
          depthField: 'level', // (可選) 紀錄層級深度
          restrictSearchWithMatch: {}, // (可選) 可以加條件過濾
        },
      },
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
  console.log(result)
  return buildTree(result)
}

module.exports = { getMenus, getMenusIncludeOperations }

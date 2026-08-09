const ExtrasCategory = require('../../models/extrasCategory.model')

module.exports = async ({ fromAgentId, toAgentId, session }) => {
  try {
    const categories = await ExtrasCategory.find({
      agent: fromAgentId,
    }).lean()

    if (!categories.length) {
      return {
        map: new Map(),
        count: 0,
      }
    }

    const cloneData = categories.map((category) => ({
      agent: toAgentId,

      name: category.name,
      slug: category.slug,
      status: category.status,
      sort: category.sort,
      image: category.image,
    }))

    const created = await ExtrasCategory.insertMany(cloneData, {
      session,
    })

    const extrasCategoryMap = new Map()

    categories.forEach((category, index) => {
      extrasCategoryMap.set(String(category._id), created[index]._id)
    })

    return {
      map: extrasCategoryMap,
      count: created.length,
    }
  } catch (err) {
    throw new Error(`Clone ExtrasCategory 失敗：${err.message}`)
  }
}

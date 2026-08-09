const ProductCategory = require('../../models/productCategory.model')

module.exports = async ({ fromAgentId, toAgentId, session }) => {
  try {
    const categories = await ProductCategory.find({
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
      includeInDashboard: category.includeInDashboard,
      image: category.image,
    }))

    const created = await ProductCategory.insertMany(cloneData, {
      session,
    })

    const productCategoryMap = new Map()

    categories.forEach((category, index) => {
      productCategoryMap.set(String(category._id), created[index]._id)
    })

    return {
      map: productCategoryMap,
      count: created.length,
    }
  } catch (err) {
    throw new Error(`Clone ProductCategory 失敗：${err.message}`)
  }
}

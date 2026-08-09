const Product = require('../../models/products.model')

module.exports = async ({
  fromAgentId,
  toAgentId,
  productCategoryMap,
  extrasMap,
  session,
}) => {
  try {
    const products = await Product.find({
      agent: fromAgentId,
    }).lean()

    if (!products.length) {
      return {
        count: 0,
      }
    }

    const cloneProducts = products.map((product) => ({
      agent: toAgentId,

      status: product.status,

      type: product.type,

      category: product.category
        ? productCategoryMap.get(String(product.category))
        : null,

      name: product.name,

      description: product.description,

      image: product.image,

      price: product.price,

      extras: product.extras
        .map((id) => extrasMap.get(String(id)))
        .filter(Boolean),

      isQuickAdd: product.isQuickAdd,
    }))

    const created = await Product.insertMany(cloneProducts, {
      session,
    })

    return {
      count: created.length,
    }
  } catch (err) {
    throw new Error(`Clone Product 失敗：${err.message}`)
  }
}

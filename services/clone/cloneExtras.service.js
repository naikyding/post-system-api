const Extra = require('../../models/extras.model')

module.exports = async ({
  fromAgentId,
  toAgentId,
  extrasCategoryMap,
  session,
}) => {
  try {
    const extras = await Extra.find({
      agent: fromAgentId,
    }).lean()

    if (!extras.length) {
      return {
        map: new Map(),
        count: 0,
      }
    }

    const cloneData = extras.map((extra) => ({
      agent: toAgentId,

      category: extra.category
        ? extrasCategoryMap.get(String(extra.category))
        : null,

      type: extra.type,

      status: extra.status,

      name: extra.name,

      description: extra.description,

      image: extra.image,

      price: extra.price,
    }))

    const created = await Extra.insertMany(cloneData, {
      session,
    })

    const extrasMap = new Map()

    extras.forEach((extra, index) => {
      extrasMap.set(String(extra._id), created[index]._id)
    })

    return {
      map: extrasMap,
      count: created.length,
    }
  } catch (err) {
    throw new Error(`Clone Extra 失敗：${err.message}`)
  }
}

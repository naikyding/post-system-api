module.exports = async ({
  Model,
  fromAgentId,
  toAgentId,
  fields = [],
  session,
}) => {
  try {
    const data = await Model.find({
      agent: fromAgentId,
    }).lean()

    if (!data.length) {
      return {
        count: 0,
      }
    }

    const cloneData = data.map((item) => {
      const newItem = {
        agent: toAgentId,
      }

      fields.forEach((field) => {
        newItem[field] = item[field]
      })

      return newItem
    })

    const created = await Model.insertMany(cloneData, {
      session,
    })

    return {
      count: created.length,
    }
  } catch (err) {
    err.message = `[Clone ${Model.modelName}] ${err.message}`
    throw err
  }
}

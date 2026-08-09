// clone 總入口
const cloneProductCategories = require('./cloneProductCategories.service')
const cloneExtrasCategories = require('./cloneExtrasCategories.service')
const cloneExtras = require('./cloneExtras.service')
const cloneProducts = require('./cloneProducts.service')

const cloneMarkers = require('./cloneMarkers.service')
const cloneOrderSources = require('./cloneOrderSources.service')
const clonePaymentTypes = require('./clonePaymentTypes.service')

module.exports = async ({ fromAgentId, toAgentId, session }) => {
  /**
   * 1. Product Category
   */
  const { map: productCategoryMap, count: productCategories } =
    await cloneProductCategories({
      fromAgentId,
      toAgentId,
      session,
    })

  /**
   * 2. Extras Category
   */
  const { map: extrasCategoryMap, count: extrasCategories } =
    await cloneExtrasCategories({
      fromAgentId,
      toAgentId,
      session,
    })

  /**
   * 3. Extras
   */
  const { map: extrasMap, count: extras } = await cloneExtras({
    fromAgentId,
    toAgentId,
    extrasCategoryMap,
    session,
  })

  /**
   * 4. Products
   */
  const { count: products } = await cloneProducts({
    fromAgentId,
    toAgentId,
    productCategoryMap,
    extrasMap,
    session,
  })

  /**
   * 5. Markers
   */
  const { count: markers } = await cloneMarkers({
    fromAgentId,
    toAgentId,
    session,
  })

  /**
   * 6. Order Sources
   */
  const { count: orderSources } = await cloneOrderSources({
    fromAgentId,
    toAgentId,
    session,
  })

  /**
   * 7. Payment Types
   */
  const { count: paymentTypes } = await clonePaymentTypes({
    fromAgentId,
    toAgentId,
    session,
  })

  return {
    productCategories,
    extrasCategories,
    extras,
    products,
    markers,
    orderSources,
    paymentTypes,
  }
}

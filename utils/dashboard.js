const getAllPaymentTypeTotal = (orderData) => {
  const formatData = orderData.reduce(
    (init, cur) => {
      const paymentCode = cur.paymentType?.code ?? 'unknown'

      const formatQuantity = cur.items.reduce(
        (init, cur) => {
          if (cur.product?.category?.includeInDashboard === false) return init

          init.item += cur.quantity
          return init
        },
        {
          item: 0,
        }
      )

      const matchItem = init[cur.status].find(
        (item) => item.type === paymentCode
      )

      if (matchItem) {
        matchItem.total += cur.totalPrice
        matchItem.orderQuantity += 1
        matchItem.itemQuantity += formatQuantity.item
        matchItem.data.push({
          items: cur.items,
          createdAt: cur.createdAt,
          total: cur.totalPrice,
          mobile: cur.mobileNoThreeDigits,
        })
      } else {
        init[cur.status].push({
          type: paymentCode,
          name: cur.paymentType?.name ?? '未知',
          color: cur.paymentType?.color ?? null,
          total: cur.totalPrice,
          orderQuantity: 1,
          itemQuantity: formatQuantity.item,
          data: [
            {
              items: cur.items,
              createdAt: cur.createdAt,
              total: cur.totalPrice,
              mobile: cur.mobileNoThreeDigits,
            },
          ],
        })
      }

      return init
    },
    {
      completed: [],
      readyForPickup: [],
      pending: [],
      cancelled: [],
    }
  )

  return formatData
}

const computedTotalProductItem = (data) => {
  let computedAry = []

  data.forEach((item) => {
    item.data.forEach((dataItem) => {
      dataItem.items.forEach((itemsItem) => {
        // extrasData
        if (itemsItem.extrasData.length > 0) {
          itemsItem.extrasData.forEach((item) => {
            const matchItem = computedAry.find(
              (accItem) => accItem.id === item.extraItem._id
            )

            if (matchItem) {
              matchItem.quantity += item.quantity
            } else {
              computedAry.push({
                id: item.extraItem._id,
                type: item.extraItem?.type,
                category: item.extraItem.category?.name,
                name: `${item.extraItem.name} (${item.extraItem.description})`,
                quantity: item.quantity,
              })
            }
          })
        }

        // product
        const matchProductItem = computedAry.find(
          (accItem) => accItem.id === itemsItem.product._id
        )

        if (matchProductItem) {
          matchProductItem.quantity += itemsItem.quantity
        } else {
          computedAry.push({
            id: itemsItem.product._id,
            type: itemsItem.product?.type,
            category: itemsItem.product.category?.name,
            name: itemsItem.product.name,
            quantity: itemsItem.quantity,
          })
        }
      })
    })
  })

  return computedAry
}

module.exports = {
  getAllPaymentTypeTotal,
  computedTotalProductItem,
}

const getAllPaymentTypeTotal = (orderData) => {
  const formatData = orderData.reduce(
    (init, cur) => {
      const matchItem = init[cur.status].find(
        (item) => item.type === cur.paymentType
      )

      const formatQuantity = cur.items.reduce(
        (init, cur) => {
          if (cur.product.type === '塑膠提袋') init['bag'] += 1
          else init['item'] += 1
          return init
        },
        {
          item: 0,
          bag: 0,
        }
      )

      if (matchItem) {
        matchItem['total'] += cur.totalPrice
        matchItem['orderQuantity'] += 1
        matchItem['itemQuantity'] += formatQuantity['item']
        matchItem['bagQuantity'] += formatQuantity['bag']
      } else {
        init[cur.status] = [
          ...init[cur.status],
          {
            type: cur.paymentType,
            total: cur.totalPrice,
            orderQuantity: 1,
            itemQuantity: formatQuantity['item'],
            bagQuantity: formatQuantity['bag'],
          },
        ]
      }
      return init
    },
    {
      completed: [
        {
          type: 'cash',
          orderQuantity: 0,
          itemQuantity: 0,
          bagQuantity: 0,
          total: 0,
        },
        {
          type: 'Line Pay',
          orderQuantity: 0,
          itemQuantity: 0,
          bagQuantity: 0,
          total: 0,
        },
      ],
      cancelled: [
        {
          type: 'cash',
          orderQuantity: 0,
          itemQuantity: 0,
          bagQuantity: 0,
          total: 0,
        },
        {
          type: 'Line Pay',
          orderQuantity: 0,
          itemQuantity: 0,
          bagQuantity: 0,
          total: 0,
        },
      ],
    }
  )

  return formatData
}

module.exports = {
  getAllPaymentTypeTotal,
}

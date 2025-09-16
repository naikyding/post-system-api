const getAllPaymentTypeTotal = (orderData) => {
  const formatData = orderData.reduce(
    (init, cur) => {
      console.log(cur)
      const matchItem = init[cur.status].find(
        (item) => item.type === cur.paymentType
      )

      const formatQuantity = cur.items.reduce(
        (init, cur) => {
          if (cur.product && cur.product.type === '塑膠提袋') init['bag'] += 1
          else init['item'] += cur.quantity
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
        matchItem['data'] = [
          ...matchItem['data'],
          {
            items: cur.items,
            createdAt: cur.createdAt,
            total: cur.totalPrice,
            mobile: cur.mobileNoThreeDigits,
          },
        ]
        console.log(123)
      } else {
        init[cur.status] = [
          ...init[cur.status],
          {
            type: cur.paymentType,
            total: cur.totalPrice,
            orderQuantity: 1,
            itemQuantity: formatQuantity['item'],
            bagQuantity: formatQuantity['bag'],
            data: [
              {
                items: cur.items,
                createdAt: cur.createdAt,
                total: cur.totalPrice,
                mobile: cur.mobileNoThreeDigits,
              },
            ],
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
          data: [],
        },
        {
          type: 'Line Pay',
          orderQuantity: 0,
          itemQuantity: 0,
          bagQuantity: 0,
          total: 0,
          data: [],
        },
      ],
      pending: [
        {
          type: 'cash',
          orderQuantity: 0,
          itemQuantity: 0,
          bagQuantity: 0,
          total: 0,
          data: [],
        },
        {
          type: 'Line Pay',
          orderQuantity: 0,
          itemQuantity: 0,
          bagQuantity: 0,
          total: 0,
          data: [],
        },
      ],
      cancelled: [
        {
          type: 'cash',
          orderQuantity: 0,
          itemQuantity: 0,
          bagQuantity: 0,
          total: 0,
          data: [],
        },
        {
          type: 'Line Pay',
          orderQuantity: 0,
          itemQuantity: 0,
          bagQuantity: 0,
          total: 0,
          data: [],
        },
        {
          type: null,
          orderQuantity: 0,
          itemQuantity: 0,
          bagQuantity: 0,
          total: 0,
          data: [],
        },
      ],
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
              computedAry = [
                ...computedAry,
                {
                  id: item.extraItem._id,
                  type: item.extraItem.type,
                  name: item.extraItem.name,
                  quantity: item.quantity,
                },
              ]
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
          computedAry = [
            ...computedAry,
            {
              id: itemsItem.product._id,
              type: itemsItem.product.type,
              name: itemsItem.product.name,
              quantity: itemsItem.quantity,
            },
          ]
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

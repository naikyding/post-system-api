const getAllPaymentTypeTotal = (orderData) => {
  const formatData = orderData.reduce(
    (init, cur) => {
      const matchItem = init[cur.status].find(
        (item) => item.type === cur.paymentType
      )

      const formatQuantity = cur.items.reduce(
        (init, cur) => {
          if (cur.product?.category?.includeInDashboard === false) return init
          else init['item'] += cur.quantity
          return init
        },
        {
          item: 0,
        }
      )

      if (matchItem) {
        matchItem['total'] += cur.totalPrice
        matchItem['orderQuantity'] += 1
        matchItem['itemQuantity'] += formatQuantity['item']
        matchItem['data'] = [
          ...matchItem['data'],
          {
            items: cur.items,
            createdAt: cur.createdAt,
            total: cur.totalPrice,
            mobile: cur.mobileNoThreeDigits,
          },
        ]
      } else {
        init[cur.status] = [
          ...init[cur.status],
          {
            type: cur.paymentType,
            total: cur.totalPrice,
            orderQuantity: 1,
            itemQuantity: formatQuantity['item'],
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

          total: 0,
          data: [],
        },
        {
          type: 'Line Pay',
          orderQuantity: 0,
          itemQuantity: 0,

          total: 0,
          data: [],
        },
      ],
      readyForPickup: [
        {
          type: 'cash',
          orderQuantity: 0,
          itemQuantity: 0,

          total: 0,
          data: [],
        },
        {
          type: 'Line Pay',
          orderQuantity: 0,
          itemQuantity: 0,

          total: 0,
          data: [],
        },
      ],
      pending: [
        {
          type: 'cash',
          orderQuantity: 0,
          itemQuantity: 0,

          total: 0,
          data: [],
        },
        {
          type: 'Line Pay',
          orderQuantity: 0,
          itemQuantity: 0,

          total: 0,
          data: [],
        },
      ],
      cancelled: [
        {
          type: 'cash',
          orderQuantity: 0,
          itemQuantity: 0,

          total: 0,
          data: [],
        },
        {
          type: 'Line Pay',
          orderQuantity: 0,
          itemQuantity: 0,

          total: 0,
          data: [],
        },
        {
          type: null,
          orderQuantity: 0,
          itemQuantity: 0,
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
                  category: item.extraItem.category?.name,
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
              category: itemsItem.product.category?.name,
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

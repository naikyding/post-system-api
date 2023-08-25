const catchAsync = require('../utils/catchAsync')
const productsModel = require('../models/products.model')
const agentsModel = require('../models/agents.model')
const extrasModel = require('../models/extras.model')

const { successResponse } = require('../utils/responseHandlers')
const { body, validationResult, param, header } = require('express-validator')

const validation = {
  getProduct: [
    header('mc-agents-id')
      .exists() // 欄位存在
      .withMessage('廠商 ID 必填 (`header.mc-agents-id`)')
      .bail()
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的廠商 ID (`header.mc-agents-id`)'),
  ],

  getProductItem: [
    param('productId')
      .exists() // 欄位存在
      .withMessage('欄位 `productId` 必填')
      .bail()
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `productId`'),
  ],

  createProduct: [
    body('agent')
      .exists() // 欄位存在
      .withMessage('欄位 `agent` 必填')
      .bail()
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `id`')
      .bail() // id 不存在
      .custom(async (id) => {
        const matchItem = await agentsModel.findById(id)
        if (!matchItem) throw new Error('`id` 不存在')
      }),

    body('name')
      .exists() // 欄位存在
      .withMessage('欄位 `name` 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('`name` 不可為空值')
      .bail()
      .isString() // 為字串格式
      .withMessage('`name` 必須為字串格式')
      .bail() // 名稱與agent 同時存在
      .custom(async (value, { req }) => {
        const errorsValidate = validationResult(req)
          .formatWith((errors) => errors.msg)
          .array()

        // 沒有錯誤才詢找，避免重覆報錯
        if (errorsValidate.length < 1) {
          const user = await productsModel.findOne({
            name: value,
            type: req.body.type,
            agents: {
              $in: [req.body.agent],
            },
          })
          if (user) throw new Error('商品已存在')
        }
      }),

    body('type')
      .exists() // 欄位存在
      .withMessage('欄位 `type` 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('`type` 不可為空值')
      .bail()
      .isString() // 為字串格式
      .withMessage('`type` 必須為字串格式'),

    body('description')
      .exists() // 欄位存在
      .withMessage('欄位 `description` 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('`description` 不可為空值')
      .bail()
      .isString() // 為字串格式
      .withMessage('`description` 必須為字串格式'),

    body('price')
      .exists() // 欄位存在
      .withMessage('欄位 `price` 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('`price` 不可為空值')
      .bail()
      .isNumeric() // 為數格式 "123" 會過
      .withMessage('`price` 必須為數字格式')
      .bail()
      .not()
      .isIn([0, '0'])
      .withMessage('`price` 不可為 0'),

    body('extras')
      .exists() // 欄位存在
      .withMessage('欄位 `extras` 必填')
      .bail()
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `id`')
      .bail() // id 不存在
      .custom(async (extrasIdArray) => {
        const extrasLength =
          typeof extrasIdArray === 'string' ? 1 : extrasIdArray.length

        // 查詢是否「包含」id 群
        const matchItems = await extrasModel.find({
          _id: { $in: extrasIdArray },
        })

        if (matchItems.length !== extrasLength)
          throw new Error('`extras` 中，有不存在的 ID')
      }),
  ],

  deleteProduct: [
    param('id')
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `id`')
      .bail() // id 不存在
      .custom(async (id) => {
        const matchItem = await productsModel.findByIdAndDelete(id)
        if (!matchItem) throw new Error('`id` 不存在')
      }),
  ],

  createProductExtrasItem: [
    param('productId')
      .exists() // 欄位存在
      .withMessage('欄位 `productId` 必填')
      .bail()
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `productId`')
      .bail()
      .custom(async (productId) => {
        const matchProduct = await productsModel.findById(productId)
        if (!matchProduct) throw new Error('productId Error: 產品不存在 ')
      }),
    body('extras')
      .exists() // 欄位存在
      .withMessage('欄位 `extras` 必填')
      .bail()
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `extras id`')
      .bail()
      // extras id 是否存在
      .custom(async (extrasId) => {
        const matchExtrasItem = await extrasModel.findById(extrasId)
        if (!matchExtrasItem) throw new Error('extrasId Error: 配料不存在 ')
      })
      .bail()
      .custom(async (extrasId, { req }) => {
        const productId = req.params.productId

        await productsModel.findByIdAndUpdate(productId, {
          $addToSet: { extras: extrasId },
        })
      }),
  ],

  deleteProductExtrasItem: [
    param('productId')
      .exists() // 欄位存在
      .withMessage('欄位 `productId` 必填')
      .bail()
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `productId`')
      .bail()
      .custom(async (productId) => {
        const matchProduct = await productsModel.findById(productId)
        if (!matchProduct) throw new Error('productId Error: 產品不存在 ')
      }),
    param('extrasId')
      .exists() // 欄位存在
      .withMessage('欄位 `extrasId` 必填')
      .bail()
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 `extrasId`')
      .bail()
      .custom(async (extrasId, { req }) => {
        const productId = req.params.productId
        const errorsValidate = validationResult(req)
          .formatWith((errors) => errors.msg)
          .array()

        // 若沒有錯誤才執行
        if (errorsValidate.length < 1) {
          await productsModel.findByIdAndUpdate(productId, {
            $pull: { extras: extrasId },
          })
        }
      }),
  ],
}

const getProducts = catchAsync(async (req, res) => {
  let formatAllProducts

  const allProducts = await productsModel
    .find({ agents: { $in: [req.headers['mc-agents-id']] } })
    .select('-createdAt -updatedAt -agents') // 不顯示項目
    // 依 id 填充內容
    .populate({
      path: 'extras',
      select: '-createdAt -updatedAt -agents',
    })
    .sort({ price: 1 })
    .lean() // 資訊不在擁有 mongoose 嵌入操作，為一般 js 物件
  // const cloneProduct = JSON.parse(JSON.stringify(allProducts))

  if (allProducts.length > 0) {
    formatAllProducts = allProducts.reduce((acc, cur) => {
      // product.extras type 相同整合
      const formatExtras = cur.extras.reduce((extraAcc, extraCur) => {
        const matchExtraAccTypeItem = extraAcc.find(
          (accItem) => accItem.type === extraCur.type
        )
        if (matchExtraAccTypeItem) {
          matchExtraAccTypeItem.items.push(extraCur)
          return extraAcc
        }
        return (extraAcc = [
          ...extraAcc,
          { type: extraCur.type, items: [extraCur] },
        ])
      }, [])

      cur.extras = formatExtras

      // product  type 相同整合
      const matchTypeItem = acc.find((item) => item.type === cur.type)
      if (matchTypeItem) {
        matchTypeItem.items.push(cur)
        return acc
      }

      return (acc = [
        ...acc,
        {
          type: cur.type,
          items: [cur],
        },
      ])
    }, [])
  }

  if (formatAllProducts) {
    formatAllProducts = [
      ...formatAllProducts.filter((item) => item.type !== '塑膠提袋'),
      formatAllProducts.find((item) => item.type === '塑膠提袋'),
    ]
  }

  res.setHeader('Cache-Control', 'public, max-age=3600') // 快取 1 小時
  successResponse({ res, data: formatAllProducts || allProducts })
})

const createProduct = catchAsync(async (req, res) => {
  const { name, type, description, agent, extras, price, image } = req.body
  const createItem = await productsModel.create({
    type,
    name,
    description,
    agents: [agent],
    extras: typeof extras === 'string' ? [extras] : extras,
    image,
    price,
  })

  res.send(createItem)
})

const deleteProduct = getProducts

const getProductItem = async (productId) => {
  const productItem = await productsModel.findById(productId)
  return productItem
}

// 新增產品 配料
const createProductExtrasItem = catchAsync(async (req, res) => {
  const productItem = await getProductItem(req.params.productId)

  successResponse({ res, data: productItem })
})

// 刪除產品 配料
const deleteProductExtrasItem = catchAsync(async (req, res) => {
  const productItem = await getProductItem(req.params.productId)

  successResponse({ res, data: productItem })
})

module.exports = {
  validation,

  getProducts,
  createProduct,
  deleteProduct,

  createProductExtrasItem,
  deleteProductExtrasItem,
}

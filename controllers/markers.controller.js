const catchAsync = require('../utils/catchAsync')
const { body, validationResult, header, param } = require('express-validator')

const agentsModel = require('../models/agents.model')
const markersModel = require('../models/markers.model')
const { successResponse } = require('../utils/responseHandlers')

const validation = {
  getMarkers: [
    header('mc-active-agent-id')
      .exists() // 欄位存在
      .withMessage('「商家」必填')
      .bail()
      .isMongoId() // 是否為 mongo id
      .withMessage('「商家」無效')
      .bail() // id 不存在
      .custom(async (id) => {
        const matchItem = await agentsModel.findById(id)
        if (!matchItem) throw new Error('「商家」不存在')
      }),
  ],

  createMarker: [
    body('agent')
      .exists() // 欄位存在
      .withMessage('「商家」必填')
      .bail()
      .isMongoId() // 是否為 mongo id
      .withMessage('「商家」無效')
      .bail() // id 不存在
      .custom(async (id) => {
        const matchItem = await agentsModel.findById(id)
        if (!matchItem) throw new Error('「商家」不存在')
      }),

    body('name')
      .exists() // 欄位存在
      .withMessage('「名稱」必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('「名稱」不可為空值')
      .bail()
      .isString() // 為字串格式
      .withMessage('「名稱」必須為字串格式')
      .bail() // marker 存在?
      .custom(async (marker, { req }) => {
        const errorsValidate = validationResult(req)
          .formatWith((errors) => errors.msg)
          .array()

        // 沒有錯誤才詢找，避免重覆報錯
        if (errorsValidate.length < 1) {
          const matchMarkerItem = await markersModel.findOne({
            name: marker,
            agent: req.body.agent,
          })
          if (matchMarkerItem) throw new Error(`「${marker}」已存在!`)
        }
      }),
  ],

  deleteMarker: [
    header('mc-active-agent-id')
      .exists() // 欄位存在
      .withMessage('「商家」必填')
      .bail()
      .isMongoId() // 是否為 mongo id
      .withMessage('「商家」無效')
      .bail() // id 不存在
      .custom(async (id) => {
        const matchItem = await agentsModel.findById(id)
        if (!matchItem) throw new Error('「商家」不存在')
      }),
    param('id')
      .exists() // 欄位存在
      .withMessage('「標記」必填')
      .bail()
      .isMongoId() // 是否為 mongo id
      .withMessage('「標記」無效')
      .bail()
      .custom(async (markerId, { req }) => {
        const matchMarkerItem = await markersModel.findById(markerId)
        if (!matchMarkerItem) throw new Error('「標記」不存在')
        req.matchMarkerItem = matchMarkerItem
      }),
  ],

  patchMarker: [
    header('mc-active-agent-id')
      .exists() // 欄位存在
      .withMessage('「商家」必填')
      .bail()
      .isMongoId() // 是否為 mongo id
      .withMessage('「商家」無效')
      .bail() // id 不存在
      .custom(async (id) => {
        const matchItem = await agentsModel.findById(id)
        if (!matchItem) throw new Error('「商家」不存在')
      }),
    param('id')
      .exists() // 欄位存在
      .withMessage('「標記」必填')
      .bail()
      .isMongoId() // 是否為 mongo id
      .withMessage('「標記」無效')
      .bail()
      .custom(async (markerId, { req }) => {
        const matchMarkerItem = await markersModel.findById(markerId)
        if (!matchMarkerItem) throw new Error('「標記」不存在')
        req.matchMarkerItem = matchMarkerItem
      }),

    body('name')
      .optional() // 有值才驗證
      .notEmpty()
      .withMessage('「名稱」不可為空值')
      .bail()
      .isString() // 為字串格式
      .bail() // marker 存在?
      .custom(async (marker, { req }) => {
        const matchMarkerItem = await markersModel.findOne({
          name: marker,
          agent: req.headers['mc-active-agent-id'],
        })

        if (matchMarkerItem) throw new Error(`「${marker}」已存在!`)
      }),
  ],
}

const getMarkersList = catchAsync(async (req) => {
  const agentId = req.headers['mc-active-agent-id'] || req.body.agent
  const markersList = await markersModel
    .find({
      agent: agentId,
    })
    .select('-agent -createdAt -updatedAt')

  return markersList
})

const getMarkers = catchAsync(async (req, res) => {
  const markers = await getMarkersList(req)

  successResponse({
    res,
    data: markers,
  })
})

const createMarker = catchAsync(async (req, res) => {
  const { name, agent, description } = req.body
  await markersModel.create({
    name,
    agent,
    description,
  })

  const markersList = await getMarkersList(req)
  successResponse({
    res,
    data: markersList,
  })
})

const deleteMarker = catchAsync(async (req, res) => {
  const markerId = req.params.id
  await markersModel.findByIdAndDelete(markerId)

  const markersList = await getMarkersList(req)

  successResponse({
    res,
    data: markersList,
  })
})

const patchMarker = catchAsync(async (req, res) => {
  const markId = req.params.id
  const { name, description } = req.body

  await markersModel.findByIdAndUpdate(markId, {
    name,
    description,
  })

  const markersList = await getMarkersList(req)

  successResponse({
    res,
    data: markersList,
  })
})

module.exports = {
  validation,

  getMarkers,
  createMarker,
  deleteMarker,
  patchMarker,
}

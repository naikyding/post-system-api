const catchAsync = require('../utils/catchAsync')
const { createTTS, deleteTTS } = require('../utils/tts')
const fs = require('fs')

const postTts = catchAsync(async (req, res) => {
  const { text } = req.body

  if (!text) {
    return res.status(400).json({
      message: 'text is required',
    })
  }

  // 告訴瀏覽器這是 mp3 音訊
  res.setHeader('Content-Type', 'audio/mpeg')

  const audioPath = await createTTS(text)
  const stream = fs.createReadStream(audioPath)

  // 傳送 mp3
  stream.pipe(res)

  let isDeleted = false

  const cleanup = () => {
    // if (isDeleted) return
    // isDeleted = true
    // deleteTTS(audioPath)
  }

  // response 傳送完成
  res.on('finish', cleanup)

  // 使用者中斷連線
  res.on('close', cleanup)

  // stream error
  stream.on('error', (error) => {
    console.error('audio stream error:', error)

    cleanup()

    if (!res.headersSent) {
      res.status(500).json({
        message: 'audio stream error',
      })
    }
  })

  // // 直接串流回前端
  // res.sendFile(path.resolve(audioPath))
})

module.exports = {
  postTts,
}

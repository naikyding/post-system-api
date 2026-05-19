const { EdgeTTS } = require('node-edge-tts')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

const tempDir = path.join(process.cwd(), 'temp')

// 沒有 temp 就建立
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir)
}

const createTTS = async (text) => {
  const tts = new EdgeTTS({ voice: 'zh-TW-HsiaoChenNeural' })

  const fileName = `${crypto.randomUUID()}.mp3`

  const filePath = path.join(tempDir, fileName)

  await tts.ttsPromise(text, filePath)

  return filePath
}

/**
 * 清除暫存 mp3
 */
const deleteTTS = (audioPath) => {
  fs.unlink(audioPath, (error) => {
    if (error) {
      console.error('delete audio error:', error)
      return
    }

    console.log('deleted audio:', audioPath)
  })
}

module.exports = {
  createTTS,
  deleteTTS,
}

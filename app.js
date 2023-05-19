const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const { errorResponse } = require('./utils/responseHandlers')

// cors
const cors = require('cors')

const indexRouter = require('./routes/index')
const v1Routes = require('./routes/v1')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app
  .use(logger('dev'))
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use(cookieParser())
  .use(express.static(path.join(__dirname, 'public')))
  .use(cors())

app.use('/', indexRouter)

// v1 APIs
app.use('/v1', v1Routes)

// catch 404 and forward to error handler
app.use((req, res, next) => next(createError(404)))

// error handler
app.use((errors, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = errors.message
  res.locals.error = req.app.get('env') === 'development' ? errors : {}
  console.log('error handler')
  errorResponse({ res, errors })
})

process.on('uncaughtException', (error) => {
  console.log('--------------- 未被補獲的錯誤 (start) -------------------')
  console.error('未被補獲的錯誤 (uncaughtException):', error)
  console.log('--------------- 未被補獲的錯誤 (end) -------------------')
})

process.on('unhandledRejection', (error) => {
  console.log(
    '--------------- reject 未被處錯的錯誤 (start) -------------------'
  )
  console.error('未被處錯的錯誤 (unhandledRejection):', error)
  console.log('--------------- reject 未被處錯的錯誤 (end) -------------------')
})

module.exports = app

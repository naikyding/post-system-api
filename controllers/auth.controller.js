const { body } = require('express-validator')

const validation = {
  adminLogin: [
    body('account')
      .exists() // 欄位存在
      .withMessage('欄位 `account` 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('`account` 不可為空值')
      .bail()
      .isString() // 為字串格式
      .withMessage('`account` 必須為字串格式'),
    body('password')
      .exists() // 欄位存在
      .withMessage('欄位 `password` 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('`password` 不可為空值')
      .bail()
      .isString() // 為字串格式
      .withMessage('`password` 必須為字串格式'),
  ],
}

const adminLogin = (req, res) => {
  res.send(req.body)
}

module.exports = {
  validation,

  adminLogin,
}

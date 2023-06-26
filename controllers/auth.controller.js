const { body } = require('express-validator')

const validation = {
  adminLogin: [
    body('account')
      .exists() // 欄位存在
      .withMessage('帳號 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('帳號 不可為空值')
      .bail()
      .isString() // 為字串格式
      .withMessage('帳號 必須為字串格式'),
    body('password')
      .exists() // 欄位存在
      .withMessage('密碼 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('密碼 不可為空值')
      .bail()
      .isString() // 為字串格式
      .withMessage('密碼 必須為字串格式'),
  ],

  createUsers: [
    body('email')
      .exists() // 欄位存在
      .withMessage('email 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('email 不可為空值')
      .bail()
      .isEmail()
      .withMessage('`email` 格式錯誤'),
    body('password')
      .exists() // 欄位存在
      .withMessage('password 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('password 不可為空值')
      .bail()
      .isLength({ min: 8 })
      .withMessage('密碼至少需要 8 個字元')
      .matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      .withMessage('密碼需要包含英文字母、數字和符號 @$!%*?&'),
    body('agents')
      .exists() // 欄位存在
      .withMessage('agents 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('agents 不可為空值')
      .bail()
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 agents `id`'),
    body('roles')
      .exists() // 欄位存在
      .withMessage('roles 必填')
      .bail() // 不可為空
      .notEmpty()
      .withMessage('roles 不可為空值')
      .bail()
      .isMongoId() // 是否為 mongo id
      .withMessage('無效的 roles `id`'),
  ],
}

const userLogin = (req, res) => {
  res.send(req.body)
}

const createUsers = (req, res) => {
  res.send(req.body)
}

module.exports = {
  validation,

  userLogin,
  createUsers,
}

;[
  // USER
  {
    _id: 'u001',
    email: 'staff@monster.com',
    password: '...',
    merchantId: 'm001', // 使用者所屬商家
    roles: ['staff'], // 角色 Id
    nickname: '小明',
    status: 'active',
  },

  // Agent 角色是 全平台共用的模板，但可標記 scope 決定適用範圍（全域或某些商家）。
  {
    _id: 'admin',
    name: '系統管理員',
    description: '擁有所有功能',
    permissions: [
      'dashboard.view',
      'order.view',
      'order.create',
      'setting.product.create',
      'setting.ingredient.update',
    ],
    agent: 'global', // 或 "merchant"
  },

  // Page 用於前端 router 與選單顯示，不含 CRUD 細節。
  {
    _id: 'dashboard',
    name: 'dashboard',
    path: '/dashboard',
    component: 'dashboard/index.vue',
    permissions: ['dashboard.view'], // 進入此頁需要的最低權限
    sort: 1,
  },

  // Permission
  {
    code: 'dashboard.view',
    page: 'dashboard',
    resource: null,
    action: 'view',
    description: '檢視儀表板',
  },
  {
    code: 'setting.view',
    page: 'setting',
    resource: null,
    action: 'view',
    description: '進入設定主頁',
  },
  {
    code: 'setting.product.view',
    page: 'setting',
    resource: 'product',
    action: 'view',
    description: '查看產品清單',
  },
]

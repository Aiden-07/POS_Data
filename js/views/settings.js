const SettingsView = {
  users: [
    {
      id: 'u-001',
      name: 'Aiden-HB',
      account: 'aiden_hb',
      phone: '13800010001',
      role: '华北区域经理',
      status: '启用',
      lastLogin: '2026-06-26 09:42'
    },
    {
      id: 'u-002',
      name: 'Lily-SJZ',
      account: 'lily_sjz',
      phone: '13800010002',
      role: '营业所负责人',
      status: '启用',
      lastLogin: '2026-06-25 18:20'
    },
    {
      id: 'u-003',
      name: 'POS-Admin',
      account: 'pos_admin',
      phone: '13800010003',
      role: '系统管理员',
      status: '启用',
      lastLogin: '2026-06-26 10:16'
    }
  ],
  roles: [
    {
      id: 'r-001',
      name: '系统管理员',
      description: '拥有平台全部功能和全部数据权限',
      functions: ['全部菜单', '新建', '编辑', '删除', '导出', '审批'],
      dataScope: '全部数据',
      dataScopeValue: '全部区域',
      users: 1,
      status: '启用'
    },
    {
      id: 'r-002',
      name: '华北区域经理',
      description: '负责华北区域 POS 数据收取、质检和台账查看',
      functions: ['文件收取', '质量检查', '台账与汇总', '数据分析', '导出'],
      dataScope: '按区域',
      dataScopeValue: '华北区域',
      users: 1,
      status: '启用'
    },
    {
      id: 'r-003',
      name: '营业所负责人',
      description: '仅管理所属营业所下经销商和门店数据',
      functions: ['文件收取', '质量检查', '台账与汇总'],
      dataScope: '按营业所',
      dataScopeValue: '石家庄营业所',
      users: 1,
      status: '启用'
    }
  ],
  selectedUserId: 'u-001',
  modules: [
    { group: '首页概览', actions: ['查看'] },
    { group: '文件收取', actions: ['查看', '新建', '编辑', '导出'] },
    { group: '质量检查', actions: ['查看', '编辑', '审批', '导出'] },
    { group: '台账与汇总', actions: ['查看', '导出'] },
    { group: '数据分析', actions: ['查看', '导出'] },
    { group: '系统设置', actions: ['查看', '新建', '编辑', '删除'] }
  ],
  orgOptions: {
    region: ['华北区域', '华中区域', '东北区域', '华东区域', '西北区域', '华南区域'],
    office: ['石家庄营业所', '北京营业所', '呼和浩特营业所', '天津营业所'],
    dealer: ['河北聚昊商贸', '邯郸格耀商贸', '维多利商业', '益尚客商贸']
  },
  fieldTypes: ['时间', '组织', '门店', '产品', '数量', '金额'],
  fieldConfigs: [
    { id: 'field-month', key: 'month', name: '年月', aliases: ['月份', '销售月份', '年月'], type: '时间', required: true, qa: true, ledger: true, enabled: true, order: 10 },
    { id: 'field-acc', key: 'acc', name: 'ACC', aliases: ['ACC', '账号', '客户编码'], type: '组织', required: true, qa: true, ledger: true, enabled: true, order: 20 },
    { id: 'field-dealer', key: 'dealerName', name: '经销商名称', aliases: ['经销商', '经销商名称', '客户名称'], type: '组织', required: true, qa: true, ledger: true, enabled: true, order: 30 },
    { id: 'field-store-code', key: 'storeCode', name: '门店编码', aliases: ['门店编码', '门店编号', 'Store ID'], type: '门店', required: true, qa: true, ledger: true, enabled: true, order: 40 },
    { id: 'field-store-name', key: 'storeName', name: '门店名称', aliases: ['门店名称', '门店', 'Store Name'], type: '门店', required: true, qa: true, ledger: true, enabled: true, order: 50 },
    { id: 'field-product-code', key: 'productCode', name: '产品编码', aliases: ['产品编码', '商品编码', 'SKU'], type: '产品', required: true, qa: true, ledger: true, enabled: true, order: 60 },
    { id: 'field-product-name', key: 'productName', name: '产品名称', aliases: ['产品名称', '商品名称', 'SKU名称'], type: '产品', required: true, qa: true, ledger: true, enabled: true, order: 70 },
    { id: 'field-barcode', key: 'barcode69', name: '69码', aliases: ['69码', '条形码', 'Barcode'], type: '产品', required: true, qa: true, ledger: true, enabled: true, order: 80 },
    { id: 'field-quantity', key: 'quantity', name: '销售数量', aliases: ['销售数量', '数量', '销量'], type: '数量', required: true, qa: true, ledger: true, enabled: true, order: 90 },
    { id: 'field-amount', key: 'amount', name: '销售金额', aliases: ['销售金额', '金额', '含税销售额'], type: '金额', required: true, qa: true, ledger: true, enabled: true, order: 100 },
    { id: 'field-cost', key: 'cost', name: '销售成本', aliases: ['销售成本', '成本', '成本金额'], type: '金额', required: true, qa: true, ledger: true, enabled: true, order: 110 },
    { id: 'field-retail', key: 'retailPrice', name: '零售价', aliases: ['零售价', '建议零售价', '单价'], type: '金额', required: true, qa: true, ledger: true, enabled: true, order: 120 }
  ],
  logs: [
    {
      id: 'log-001',
      time: '2026-06-26 09:12:03',
      user: 'Aiden-HB',
      account: 'aiden_hb',
      module: '登录登出',
      action: '登录',
      target: 'POS数据管理平台',
      detail: '用户通过账号密码登录系统',
      before: '-',
      after: '在线',
      ip: '10.12.8.21',
      device: 'Mac / Chrome',
      result: '成功'
    },
    {
      id: 'log-002',
      time: '2026-06-26 10:22:18',
      user: 'Lily-SJZ',
      account: 'lily_sjz',
      module: '质量检查',
      action: '查看',
      target: '门店 S0091005',
      detail: '查看保定市聚昊商贸有限公司门店质检明细',
      before: '-',
      after: '-',
      ip: '10.12.9.35',
      device: 'Windows / Edge',
      result: '成功'
    },
    {
      id: 'log-003',
      time: '2026-06-26 10:35:41',
      user: 'Aiden-HB',
      account: 'aiden_hb',
      module: '质量检查',
      action: '修改',
      target: '异常数据 QA-202606-018',
      detail: '在标准POS表中修改产品名称缺失异常',
      before: '产品名称：空；AI判断：产品名称缺失',
      after: '产品名称：好丽友果滋果心黄金奇异果味软糖70g；AI判断：已回填',
      ip: '10.12.8.21',
      device: 'Mac / Chrome',
      result: '成功'
    },
    {
      id: 'log-004',
      time: '2026-06-26 11:06:25',
      user: 'POS-Admin',
      account: 'pos_admin',
      module: '质量检查',
      action: '驳回',
      target: '异常数据 QA-202606-022',
      detail: '驳回门店编码缺失的质检记录，要求业务补充门店编码',
      before: '状态：待审核',
      after: '状态：已驳回；原因：门店编码缺失',
      ip: '10.12.1.10',
      device: 'Mac / Safari',
      result: '成功'
    },
    {
      id: 'log-005',
      time: '2026-06-26 11:40:09',
      user: 'Aiden-HB',
      account: 'aiden_hb',
      module: '台账与汇总',
      action: '导出',
      target: '标准化 POS 明细台账',
      detail: '导出筛选范围内华北区域 POS 明细数据',
      before: '-',
      after: '导出 480 条单据',
      ip: '10.12.8.21',
      device: 'Mac / Chrome',
      result: '成功'
    },
    {
      id: 'log-006',
      time: '2026-06-26 12:08:33',
      user: 'POS-Admin',
      account: 'pos_admin',
      module: '系统设置',
      action: '编辑',
      target: '角色 华北区域经理',
      detail: '调整角色功能权限和数据权限范围',
      before: '数据权限：全部区域',
      after: '数据权限：华北区域',
      ip: '10.12.1.10',
      device: 'Mac / Safari',
      result: '成功'
    },
    {
      id: 'log-007',
      time: '2026-06-26 18:18:02',
      user: 'Lily-SJZ',
      account: 'lily_sjz',
      module: '登录登出',
      action: '退出',
      target: 'POS数据管理平台',
      detail: '用户主动退出登录',
      before: '在线',
      after: '离线',
      ip: '10.12.9.35',
      device: 'Windows / Edge',
      result: '成功'
    }
  ],

  renderAction() {
    return '';
  },

  render() {
    const route = Store.getState().currentView;
    if (route === 'settings-roles') return this.renderRoles();
    if (route === 'settings-fields') return this.renderFields();
    if (route === 'settings-logs') return this.renderLogs();
    return this.renderUsers();
  },

  renderUsers() {
    return `
      <section class="settings-page animate-[fadeIn_0.4s_ease-out]">
        <div class="settings-filter-row">
          <label class="settings-search">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input id="settings-user-search" type="text" placeholder="搜索用户姓名、账号、手机号">
          </label>
          <select id="settings-user-status" class="settings-select">
            <option>全部状态</option>
            <option>启用</option>
            <option>停用</option>
          </select>
          <select id="settings-user-role" class="settings-select">
            <option>全部角色</option>
            ${this.roles.map((role) => `<option>${role.name}</option>`).join('')}
          </select>
        </div>

        <div class="settings-card settings-table-card">
          <div class="settings-table-head">
            <span></span>
            <div class="settings-table-head-actions">
              <button id="settings-new-user" class="settings-primary-button" type="button">
                <i class="fa-solid fa-user-plus"></i>
                <span>新建用户</span>
              </button>
            </div>
          </div>
          <table class="settings-table">
            <thead>
              <tr>
                <th>用户姓名</th>
                <th>登录账号</th>
                <th>所属角色</th>
                <th>继承数据权限</th>
                <th>状态</th>
                <th>最近登录</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody id="settings-user-tbody">
              ${this.renderUserRows(this.users)}
            </tbody>
          </table>
        </div>
      </section>
    `;
  },

  renderUserRows(users) {
    return users.map((user) => `
      <tr class="${user.id === this.selectedUserId ? 'active' : ''}" data-user-id="${user.id}">
        <td>
          <strong>${user.name}</strong>
          <span>${user.phone}</span>
        </td>
        <td>${user.account}</td>
        <td>${user.role}</td>
        <td>${this.getRoleScopeText(this.getRoleForUser(user))}</td>
        <td><em class="settings-status ${user.status === '启用' ? 'enabled' : 'disabled'}">${user.status}</em></td>
        <td>${user.lastLogin}</td>
        <td class="settings-row-actions">
          <button type="button" data-user-action="edit" data-user-id="${user.id}">编辑</button>
          <button type="button" data-user-action="toggle" data-user-id="${user.id}">${user.status === '启用' ? '停用' : '启用'}</button>
          <button type="button" data-user-action="reset" data-user-id="${user.id}">重置密码</button>
          <button type="button" class="danger" data-user-action="delete" data-user-id="${user.id}">删除</button>
        </td>
      </tr>
    `).join('');
  },

  renderPermissionPreview(user) {
    const role = this.getRoleForUser(user);
    const scopeText = this.getRoleScopeText(role);
    return `
      <aside class="settings-card settings-preview-card" id="settings-permission-preview">
        <div class="settings-preview-head">
          <span><i class="fa-solid fa-shield-halved"></i></span>
          <div>
            <h3>权限预览</h3>
            <p>${user.name}</p>
          </div>
        </div>
        <dl class="settings-preview-list">
          <div>
            <dt>当前角色</dt>
            <dd>${user.role}</dd>
          </div>
          <div>
            <dt>继承功能权限</dt>
            <dd>${role.functions.join('、')}</dd>
          </div>
          <div>
            <dt>继承数据权限</dt>
            <dd>${scopeText}</dd>
          </div>
        </dl>
        <div class="settings-scenario">
          <strong>场景说明</strong>
          <p>用户 ${user.name} 被分配角色：${user.role}。该用户不单独配置数据权限，自动继承角色下的功能权限和数据权限：${scopeText}。在文件收取、质量检查、台账与汇总、数据分析页面中，仅能查看该角色权限范围内的经销商、门店及对应 POS 明细数据。</p>
        </div>
      </aside>
    `;
  },

  getRoleForUser(user) {
    return this.roles.find((item) => item.name === user.role) || this.roles[0];
  },

  getRoleScopeText(role) {
    if (!role) return '-';
    return role.dataScopeValue ? `${role.dataScope}：${role.dataScopeValue}` : role.dataScope;
  },

  renderRoles() {
    return `
      <section class="settings-page animate-[fadeIn_0.4s_ease-out]">
        <div class="settings-filter-row">
          <label class="settings-search">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input id="settings-role-search" type="text" placeholder="搜索角色名称或说明">
          </label>
        </div>

        <div class="settings-card settings-table-card">
          <div class="settings-table-head">
            <span></span>
            <div class="settings-table-head-actions">
              <button id="settings-new-role" class="settings-primary-button" type="button">
                <i class="fa-solid fa-plus"></i>
                <span>新建角色</span>
              </button>
            </div>
          </div>
          <table class="settings-table">
            <thead>
              <tr>
                <th>角色名称</th>
                <th>角色说明</th>
                <th>功能权限</th>
                <th>角色数据权限</th>
                <th>关联用户</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody id="settings-role-tbody">
              ${this.renderRoleRows(this.roles)}
            </tbody>
          </table>
        </div>
      </section>
    `;
  },

  renderRoleRows(roles) {
    return roles.map((role) => `
      <tr>
        <td><strong>${role.name}</strong></td>
        <td>${role.description}</td>
        <td>${role.functions.length} 项</td>
        <td>${this.getRoleScopeText(role)}</td>
        <td>${role.users} 人</td>
        <td class="settings-row-actions">
          <button type="button" data-role-action="edit" data-role-id="${role.id}">编辑</button>
          <button type="button" class="danger" data-role-action="delete" data-role-id="${role.id}">删除</button>
        </td>
      </tr>
    `).join('');
  },

  renderFields() {
    return `
      <section class="settings-page settings-field-page animate-[fadeIn_0.4s_ease-out]">
        <div class="settings-card settings-field-impact">
          <div>
            <strong>字段配置会同步影响质量检查和台账与汇总</strong>
            <p>质量检查按“启用 + 参与质量检查”的字段校验原始 POS 表；台账与汇总按“启用 + 显示在台账”的字段展示表头。区域、营业所由组织架构生成，不受字段配置控制。</p>
          </div>
        </div>

        <div class="settings-card settings-table-card settings-field-table-card">
          <div class="settings-table-head">
            <span></span>
            <div class="settings-table-head-actions">
              <button id="settings-new-field" class="settings-table-tool-button" type="button">
                <i class="fa-solid fa-plus"></i>
                <span>新增字段</span>
              </button>
              <button id="settings-save-fields" class="settings-primary-button" type="button">
                <i class="fa-solid fa-floppy-disk"></i>
                <span>保存配置</span>
              </button>
            </div>
          </div>
          <table class="settings-table settings-field-table">
            <thead>
              <tr>
                <th>排序</th>
                <th>标准字段名</th>
                <th>参与质量检查</th>
                <th>显示在台账</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody id="settings-field-tbody">
              ${this.renderFieldRows(this.fieldConfigs)}
            </tbody>
          </table>
        </div>
      </section>
    `;
  },

  renderFieldRows(fields) {
    return this.sortFields(fields).map((field, index, sorted) => `
      <tr>
        <td>
          <div class="settings-field-order">
            <button type="button" data-field-action="up" data-field-id="${field.id}" ${index === 0 ? 'disabled' : ''} title="上移"><i class="fa-solid fa-chevron-up"></i></button>
            <button type="button" data-field-action="down" data-field-id="${field.id}" ${index === sorted.length - 1 ? 'disabled' : ''} title="下移"><i class="fa-solid fa-chevron-down"></i></button>
          </div>
        </td>
        <td><strong>${field.name}</strong><span>${field.key}</span></td>
        <td>${this.renderFieldSwitch(field, 'qa')}</td>
        <td>${this.renderFieldSwitch(field, 'ledger')}</td>
        <td><em class="settings-status ${field.enabled ? 'enabled' : 'disabled'}">${field.enabled ? '启用' : '停用'}</em></td>
        <td class="settings-row-actions">
          <button type="button" data-field-action="edit" data-field-id="${field.id}">编辑</button>
          <button type="button" data-field-action="toggle" data-field-id="${field.id}">${field.enabled ? '停用' : '启用'}</button>
        </td>
      </tr>
    `).join('');
  },

  renderFieldSwitch(field, prop) {
    return `
      <label class="settings-switch">
        <input type="checkbox" data-field-toggle="${prop}" data-field-id="${field.id}" ${field[prop] ? 'checked' : ''}>
        <span></span>
      </label>
    `;
  },

  sortFields(fields) {
    return [...fields].sort((a, b) => a.order - b.order);
  },

  getQaFields() {
    return this.sortFields(this.fieldConfigs).filter((field) => field.enabled && field.qa);
  },

  getLedgerFields() {
    return this.sortFields(this.fieldConfigs).filter((field) => field.enabled && field.ledger);
  },

  getLedgerFieldColumns() {
    const valueMap = {
      month: (item) => item.month,
      acc: (item) => item.acc,
      dealerName: (item) => item.dealer,
      storeCode: (item) => item.storeCode,
      storeName: (item) => item.storeName,
      productCode: (item) => item.barcode,
      productName: (item) => item.productName,
      barcode69: (item) => item.barcode,
      quantity: (item) => item.quantity,
      amount: (item) => `￥${item.amount}`,
      cost: (item) => `￥${item.cost}`,
      retailPrice: (item) => `￥${item.retailPrice}`
    };
    const metaMap = {
      month: { width: 'w-24' },
      acc: { width: 'w-20' },
      dealerName: { width: 'w-36', truncate: true },
      storeCode: { width: 'w-28', mono: true },
      storeName: { width: 'w-44', truncate: true },
      productCode: { width: 'w-36', mono: true },
      productName: { width: 'w-56', truncate: true },
      barcode69: { width: 'w-36', mono: true },
      quantity: { width: 'w-24', align: 'right' },
      amount: { width: 'w-24', align: 'right' },
      cost: { width: 'w-24', align: 'right' },
      retailPrice: { width: 'w-20', align: 'right' }
    };
    return this.getLedgerFields().map((field) => ({
      key: field.key,
      label: field.name,
      order: field.order,
      value: valueMap[field.key] || (() => '-'),
      ...(metaMap[field.key] || {})
    }));
  },

  renderLogs() {
    const stats = this.getLogStats(this.logs);
    return `
      <section class="settings-page settings-log-page animate-[fadeIn_0.4s_ease-out]">
        <div class="settings-filter-row settings-log-filter">
          <select id="settings-log-range" class="settings-select">
            <option>今天</option>
            <option>近7天</option>
            <option>近30天</option>
            <option>自定义</option>
          </select>
          <select id="settings-log-user" class="settings-select">
            <option>全部用户</option>
            ${this.users.map((user) => `<option>${user.name}</option>`).join('')}
          </select>
          <select id="settings-log-module" class="settings-select">
            <option>全部模块</option>
            ${['登录登出', '文件收取', '质量检查', '台账与汇总', '系统设置'].map((item) => `<option>${item}</option>`).join('')}
          </select>
          <select id="settings-log-action" class="settings-select">
            <option>全部操作</option>
            ${['登录', '退出', '查看', '编辑', '修改', '审核通过', '驳回', '导出'].map((item) => `<option>${item}</option>`).join('')}
          </select>
          <label class="settings-search settings-log-search">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input id="settings-log-keyword" type="text" placeholder="搜索用户、门店、单据编号、异常数据">
          </label>
          <button id="settings-log-reset" class="settings-secondary-button" type="button">
            <i class="fa-solid fa-rotate-right"></i>
            <span>重置</span>
          </button>
        </div>

        <div class="settings-log-stats">
          ${this.renderLogStatCard('今日登录', stats.login, 'fa-right-to-bracket')}
          ${this.renderLogStatCard('今日操作', stats.operations, 'fa-list-check')}
          ${this.renderLogStatCard('质检修改', stats.qaChanges, 'fa-pen-to-square')}
          ${this.renderLogStatCard('驳回记录', stats.rejects, 'fa-circle-xmark')}
        </div>

        <div class="settings-card settings-table-card settings-log-table-card">
          <div class="settings-table-head">
            <span class="settings-table-title">操作日志</span>
            <div class="settings-table-head-actions">
              <button id="settings-log-export" class="settings-table-tool-button" type="button">
                <i class="fa-solid fa-download"></i>
                <span>导出</span>
              </button>
            </div>
          </div>
          <table class="settings-table settings-log-table">
            <thead>
              <tr>
                <th>时间</th>
                <th>用户</th>
                <th>模块</th>
                <th>操作类型</th>
                <th>操作对象</th>
                <th>操作详情</th>
                <th>IP / 设备</th>
                <th>结果</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody id="settings-log-tbody">
              ${this.renderLogRows(this.logs)}
            </tbody>
          </table>
        </div>
      </section>
    `;
  },

  renderLogStatCard(label, value, icon) {
    return `
      <div class="settings-card settings-log-stat">
        <span><i class="fa-solid ${icon}"></i></span>
        <div>
          <strong>${value}</strong>
          <p>${label}</p>
        </div>
      </div>
    `;
  },

  renderLogRows(logs) {
    return logs.map((log) => `
      <tr>
        <td><strong>${log.time}</strong></td>
        <td>
          <strong>${log.user}</strong>
          <span>${log.account}</span>
        </td>
        <td>${log.module}</td>
        <td><em class="settings-log-action ${this.getLogActionClass(log.action)}">${log.action}</em></td>
        <td>${log.target}</td>
        <td>${log.detail}</td>
        <td>
          <strong>${log.ip}</strong>
          <span>${log.device}</span>
        </td>
        <td><em class="settings-status enabled">${log.result}</em></td>
        <td class="settings-row-actions">
          <button type="button" data-log-action="detail" data-log-id="${log.id}">详情</button>
        </td>
      </tr>
    `).join('');
  },

  getLogStats(logs) {
    return {
      login: logs.filter((log) => log.action === '登录').length,
      operations: logs.filter((log) => !['登录', '退出'].includes(log.action)).length,
      qaChanges: logs.filter((log) => log.module === '质量检查' && ['修改', '编辑'].includes(log.action)).length,
      rejects: logs.filter((log) => log.action === '驳回').length
    };
  },

  getLogActionClass(action) {
    if (['登录', '退出'].includes(action)) return 'session';
    if (['修改', '编辑'].includes(action)) return 'edit';
    if (['驳回'].includes(action)) return 'reject';
    if (['导出'].includes(action)) return 'export';
    return 'view';
  },

  bindEvents() {
    const route = Store.getState().currentView;
    if (route === 'settings-roles') {
      this.bindRoleEvents();
    } else if (route === 'settings-fields') {
      this.bindFieldEvents();
    } else if (route === 'settings-logs') {
      this.bindLogEvents();
    } else {
      this.bindUserEvents();
    }
  },

  bindUserEvents() {
    document.getElementById('settings-new-user')?.addEventListener('click', () => this.openUserDialog());
    document.getElementById('settings-user-search')?.addEventListener('input', () => this.filterUsers());
    document.getElementById('settings-user-status')?.addEventListener('change', () => this.filterUsers());
    document.getElementById('settings-user-role')?.addEventListener('change', () => this.filterUsers());
    document.getElementById('settings-user-tbody')?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-user-action]');
      if (!button) return;
      this.handleUserAction(button.dataset.userAction, button.dataset.userId);
    });
  },

  bindRoleEvents() {
    document.getElementById('settings-new-role')?.addEventListener('click', () => this.openRoleDialog());
    document.getElementById('settings-role-search')?.addEventListener('input', () => this.filterRoles());
    document.getElementById('settings-role-tbody')?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-role-action]');
      if (!button) return;
      this.handleRoleAction(button.dataset.roleAction, button.dataset.roleId);
    });
  },

  bindFieldEvents() {
    document.getElementById('settings-new-field')?.addEventListener('click', () => this.openFieldDialog());
    document.getElementById('settings-save-fields')?.addEventListener('click', () => Dialog.toast('字段配置已保存，质量检查与台账表头将按最新配置生效', 'success'));
    document.getElementById('settings-field-tbody')?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-field-action]');
      if (!button) return;
      this.handleFieldAction(button.dataset.fieldAction, button.dataset.fieldId);
    });
    document.getElementById('settings-field-tbody')?.addEventListener('change', (event) => {
      const input = event.target.closest('[data-field-toggle]');
      if (!input) return;
      const field = this.fieldConfigs.find((item) => item.id === input.dataset.fieldId);
      if (!field) return;
      field[input.dataset.fieldToggle] = input.checked;
      this.refreshFieldRows();
    });
  },

  bindLogEvents() {
    ['settings-log-range', 'settings-log-user', 'settings-log-module', 'settings-log-action'].forEach((id) => {
      document.getElementById(id)?.addEventListener('change', () => this.filterLogs());
    });
    document.getElementById('settings-log-keyword')?.addEventListener('input', () => this.filterLogs());
    document.getElementById('settings-log-reset')?.addEventListener('click', () => this.resetLogFilters());
    document.getElementById('settings-log-export')?.addEventListener('click', () => this.exportLogs());
    document.getElementById('settings-log-tbody')?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-log-action]');
      if (!button) return;
      this.openLogDetail(button.dataset.logId);
    });
  },

  filterUsers() {
    const keyword = document.getElementById('settings-user-search')?.value.trim().toLowerCase() || '';
    const status = document.getElementById('settings-user-status')?.value || '全部状态';
    const role = document.getElementById('settings-user-role')?.value || '全部角色';
    const rows = this.users.filter((user) => {
      const keywordMatch = !keyword || `${user.name} ${user.account} ${user.phone}`.toLowerCase().includes(keyword);
      const statusMatch = status === '全部状态' || user.status === status;
      const roleMatch = role === '全部角色' || user.role === role;
      return keywordMatch && statusMatch && roleMatch;
    });
    const tbody = document.getElementById('settings-user-tbody');
    if (tbody) tbody.innerHTML = this.renderUserRows(rows);
  },

  filterRoles() {
    const keyword = document.getElementById('settings-role-search')?.value.trim().toLowerCase() || '';
    const rows = this.roles.filter((role) => !keyword || `${role.name} ${role.description}`.toLowerCase().includes(keyword));
    const tbody = document.getElementById('settings-role-tbody');
    if (tbody) tbody.innerHTML = this.renderRoleRows(rows);
  },

  filterFields() {
    const tbody = document.getElementById('settings-field-tbody');
    if (tbody) tbody.innerHTML = this.renderFieldRows(this.fieldConfigs);
  },

  refreshFieldRows() {
    this.filterFields();
  },

  getFilteredLogs() {
    const user = document.getElementById('settings-log-user')?.value || '全部用户';
    const module = document.getElementById('settings-log-module')?.value || '全部模块';
    const action = document.getElementById('settings-log-action')?.value || '全部操作';
    const keyword = document.getElementById('settings-log-keyword')?.value.trim().toLowerCase() || '';
    return this.logs.filter((log) => {
      const userMatch = user === '全部用户' || log.user === user;
      const moduleMatch = module === '全部模块' || log.module === module;
      const actionMatch = action === '全部操作' || log.action === action;
      const keywordMatch = !keyword || `${log.user} ${log.account} ${log.module} ${log.action} ${log.target} ${log.detail} ${log.before} ${log.after}`.toLowerCase().includes(keyword);
      return userMatch && moduleMatch && actionMatch && keywordMatch;
    });
  },

  filterLogs() {
    const tbody = document.getElementById('settings-log-tbody');
    if (tbody) tbody.innerHTML = this.renderLogRows(this.getFilteredLogs());
  },

  resetLogFilters() {
    const defaults = {
      'settings-log-range': '今天',
      'settings-log-user': '全部用户',
      'settings-log-module': '全部模块',
      'settings-log-action': '全部操作',
      'settings-log-keyword': ''
    };
    Object.entries(defaults).forEach(([id, value]) => {
      const node = document.getElementById(id);
      if (node) node.value = value;
    });
    this.filterLogs();
  },

  handleUserAction(action, id) {
    const user = this.users.find((item) => item.id === id);
    if (!user) return;
    if (action === 'edit') {
      this.openUserDialog(user);
    } else if (action === 'toggle') {
      user.status = user.status === '启用' ? '停用' : '启用';
      App.mountView('settings-users');
    } else if (action === 'reset') {
      Dialog.toast(`${user.name} 密码已重置为初始密码`);
    } else if (action === 'delete') {
      this.users = this.users.filter((item) => item.id !== id);
      if (this.selectedUserId === id) this.selectedUserId = this.users[0]?.id || null;
      App.mountView('settings-users');
    }
  },

  handleRoleAction(action, id) {
    const role = this.roles.find((item) => item.id === id);
    if (!role) return;
    if (action === 'edit') {
      this.openRoleDialog(role);
    } else if (action === 'delete') {
      this.roles = this.roles.filter((item) => item.id !== id);
      App.mountView('settings-roles');
    }
  },

  handleFieldAction(action, id) {
    const field = this.fieldConfigs.find((item) => item.id === id);
    if (!field) return;
    if (action === 'edit') {
      this.openFieldDialog(field);
    } else if (action === 'toggle') {
      field.enabled = !field.enabled;
      this.refreshFieldRows();
    } else if (action === 'up' || action === 'down') {
      this.moveField(field, action);
      this.refreshFieldRows();
    }
  },

  moveField(field, direction) {
    const sorted = this.sortFields(this.fieldConfigs);
    const index = sorted.findIndex((item) => item.id === field.id);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;
    const target = sorted[targetIndex];
    const nextOrder = field.order;
    field.order = target.order;
    target.order = nextOrder;
  },

  openLogDetail(id) {
    const log = this.logs.find((item) => item.id === id);
    const overlay = document.getElementById('overlay-container');
    if (!log || !overlay) return;
    overlay.innerHTML = `
      <div class="settings-log-detail-backdrop">
        <aside class="settings-log-detail">
          <div class="settings-log-detail-head">
            <div>
              <h3>日志详情</h3>
              <p>${log.id}</p>
            </div>
            <button type="button" class="settings-modal-close" aria-label="关闭"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <dl class="settings-log-detail-list">
            <div><dt>时间</dt><dd>${log.time}</dd></div>
            <div><dt>用户</dt><dd>${log.user}（${log.account}）</dd></div>
            <div><dt>模块</dt><dd>${log.module}</dd></div>
            <div><dt>操作类型</dt><dd>${log.action}</dd></div>
            <div><dt>操作对象</dt><dd>${log.target}</dd></div>
            <div><dt>操作详情</dt><dd>${log.detail}</dd></div>
            <div><dt>IP / 设备</dt><dd>${log.ip} / ${log.device}</dd></div>
            <div><dt>结果</dt><dd>${log.result}</dd></div>
          </dl>
          <div class="settings-log-change-card">
            <strong>变更前</strong>
            <p>${log.before}</p>
          </div>
          <div class="settings-log-change-card after">
            <strong>变更后</strong>
            <p>${log.after}</p>
          </div>
        </aside>
      </div>
    `;
    const close = () => {
      overlay.innerHTML = '';
    };
    overlay.querySelector('.settings-modal-close')?.addEventListener('click', close);
    overlay.querySelector('.settings-log-detail-backdrop')?.addEventListener('click', (event) => {
      if (event.target.classList.contains('settings-log-detail-backdrop')) close();
    });
  },

  exportLogs() {
    const rows = this.getFilteredLogs();
    const headers = ['时间', '用户', '账号', '模块', '操作类型', '操作对象', '操作详情', '变更前', '变更后', 'IP', '设备', '结果'];
    const csvRows = [
      headers.join(','),
      ...rows.map((log) => [
        log.time,
        log.user,
        log.account,
        log.module,
        log.action,
        log.target,
        log.detail,
        log.before,
        log.after,
        log.ip,
        log.device,
        log.result
      ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
    ];
    const blob = new Blob([`\uFEFF${csvRows.join('\n')}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '系统日志.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    Dialog.toast(`已导出 ${rows.length} 条系统日志`);
  },

  openFieldDialog(field = null) {
    const overlay = document.getElementById('overlay-container');
    if (!overlay) return;
    const editing = Boolean(field);
    overlay.innerHTML = `
      <div class="settings-modal-backdrop">
        <form id="settings-field-form" class="settings-modal">
          <div class="settings-modal-head">
            <div>
              <h3>${editing ? '编辑字段' : '新增字段'}</h3>
              <p>字段会影响质量检查校验和台账表头展示</p>
            </div>
            <button type="button" class="settings-modal-close" aria-label="关闭"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="settings-form-grid">
            <label>标准字段名<input name="name" value="${field?.name || ''}" required></label>
            <label>字段标识<input name="key" value="${field?.key || ''}" ${editing ? 'readonly' : ''} required></label>
            <label>状态<select name="enabled"><option value="true" ${field?.enabled !== false ? 'selected' : ''}>启用</option><option value="false" ${field?.enabled === false ? 'selected' : ''}>停用</option></select></label>
          </div>
          <div class="settings-field-form-switches">
            ${this.renderFieldFormCheck('qa', '参与质量检查', field?.qa !== false)}
            ${this.renderFieldFormCheck('ledger', '显示在台账', field?.ledger !== false)}
          </div>
          <div class="settings-modal-actions">
            <button type="button" class="settings-secondary-button settings-modal-cancel">取消</button>
            <button type="submit" class="settings-primary-button">保存字段</button>
          </div>
        </form>
      </div>
    `;
    this.bindModalClose(overlay);
    document.getElementById('settings-field-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const nextField = {
        id: field?.id || `field-${Date.now()}`,
        key: String(data.get('key')).trim(),
        name: String(data.get('name')).trim(),
        aliases: field?.aliases || [String(data.get('name')).trim()],
        type: field?.type || '组织',
        required: true,
        qa: data.get('qa') === 'on',
        ledger: data.get('ledger') === 'on',
        enabled: data.get('enabled') === 'true',
        order: field?.order || (Math.max(...this.fieldConfigs.map((item) => item.order), 0) + 10)
      };
      if (editing) {
        Object.assign(field, nextField);
      } else {
        this.fieldConfigs.push(nextField);
      }
      overlay.innerHTML = '';
      App.mountView('settings-fields');
    });
  },

  renderFieldFormCheck(name, label, checked) {
    return `
      <label>
        <input type="checkbox" name="${name}" ${checked ? 'checked' : ''}>
        <span>${label}</span>
      </label>
    `;
  },

  openUserDialog(user = null) {
    const overlay = document.getElementById('overlay-container');
    if (!overlay) return;
    const editing = Boolean(user);
    overlay.innerHTML = `
      <div class="settings-modal-backdrop">
        <form id="settings-user-form" class="settings-modal">
          <div class="settings-modal-head">
            <div>
              <h3>${editing ? '编辑用户' : '新建用户'}</h3>
              <p>设置账号、密码和所属角色，权限自动继承角色配置</p>
            </div>
            <button type="button" class="settings-modal-close" aria-label="关闭"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="settings-form-grid">
            <label>用户姓名<input name="name" value="${user?.name || ''}" required></label>
            <label>登录账号<input name="account" value="${user?.account || ''}" required></label>
            <label>初始密码<input name="password" type="password" value="${editing ? '******' : ''}" required></label>
            <label>手机号/邮箱<input name="phone" value="${user?.phone || ''}"></label>
            <label>分配角色<select name="role">${this.roles.map((role) => `<option ${user?.role === role.name ? 'selected' : ''}>${role.name}</option>`).join('')}</select></label>
            <label>账号状态<select name="status"><option ${user?.status === '启用' ? 'selected' : ''}>启用</option><option ${user?.status === '停用' ? 'selected' : ''}>停用</option></select></label>
          </div>
          <div class="settings-modal-note">用户不再单独配置数据权限。保存后将继承所选角色的功能权限和数据权限。</div>
          <div class="settings-modal-actions">
            <button type="button" class="settings-secondary-button settings-modal-cancel">取消</button>
            <button type="submit" class="settings-primary-button">保存用户</button>
          </div>
        </form>
      </div>
    `;
    this.bindModalClose(overlay);
    document.getElementById('settings-user-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const nextUser = {
        id: user?.id || `u-${Date.now()}`,
        name: data.get('name'),
        account: data.get('account'),
        phone: data.get('phone') || '-',
        role: data.get('role'),
        status: data.get('status'),
        lastLogin: user?.lastLogin || '尚未登录'
      };
      if (editing) {
        Object.assign(user, nextUser);
      } else {
        this.users.unshift(nextUser);
        this.selectedUserId = nextUser.id;
      }
      overlay.innerHTML = '';
      App.mountView('settings-users');
    });
  },

  openRoleDialog(role = null) {
    const overlay = document.getElementById('overlay-container');
    if (!overlay) return;
    const editing = Boolean(role);
    overlay.innerHTML = `
      <div class="settings-modal-backdrop">
        <form id="settings-role-form" class="settings-modal wide">
          <div class="settings-modal-head">
            <div>
              <h3>${editing ? '编辑角色' : '新建角色'}</h3>
              <p>配置功能权限和默认数据权限</p>
            </div>
            <button type="button" class="settings-modal-close" aria-label="关闭"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="settings-form-grid settings-role-form-grid">
            <label>角色名称<input name="name" value="${role?.name || ''}" required></label>
            <label>
              <span class="settings-label-with-help">
                数据权限策略
                <span class="settings-help-wrap">
                  <button class="settings-help-button" type="button" aria-label="数据权限说明">?</button>
                  <span class="settings-help-popover">
                    ${this.renderScopeRuleGrid()}
                  </span>
                </span>
              </span>
              <select name="dataScope" id="settings-role-scope-type">${['全部数据', '按区域', '按营业所', '按经销商', '仅本人相关数据'].map((item) => `<option ${role?.dataScope === item ? 'selected' : ''}>${item}</option>`).join('')}</select>
            </label>
            <label>
              <span>数据权限范围</span>
              <select name="dataScopeValue" id="settings-role-scope-value">${this.renderRoleScopeOptions(role?.dataScope || '按区域', role?.dataScopeValue)}</select>
            </label>
          </div>
          <div class="settings-permission-tree">
            ${this.modules.map((module) => `
              <div class="settings-permission-row">
                <strong>${module.group}</strong>
                <div>
                  ${module.actions.map((action) => `
                    <label><input type="checkbox" name="functions" value="${module.group}:${action}" ${(role?.functions || []).includes(module.group) || (role?.functions || []).includes(action) ? 'checked' : ''}>${action}</label>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
          <div class="settings-modal-actions">
            <button type="button" class="settings-secondary-button settings-modal-cancel">取消</button>
            <button type="submit" class="settings-primary-button">保存角色</button>
          </div>
        </form>
      </div>
    `;
    this.bindModalClose(overlay);
    document.getElementById('settings-role-scope-type')?.addEventListener('change', (event) => {
      const scopeValue = document.getElementById('settings-role-scope-value');
      if (scopeValue) scopeValue.innerHTML = this.renderRoleScopeOptions(event.target.value);
    });
    document.getElementById('settings-role-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const functionValues = data.getAll('functions');
      const nextRole = {
        id: role?.id || `r-${Date.now()}`,
        name: data.get('name'),
        description: role?.description || `${data.get('name')}权限配置`,
        functions: [...new Set(functionValues.map((item) => item.split(':')[0]))],
        dataScope: data.get('dataScope'),
        dataScopeValue: data.get('dataScopeValue'),
        users: role?.users || 0,
        status: role?.status || '启用'
      };
      if (editing) {
        Object.assign(role, nextRole);
      } else {
        this.roles.unshift(nextRole);
      }
      overlay.innerHTML = '';
      App.mountView('settings-roles');
    });
  },

  bindModalClose(overlay) {
    const close = () => {
      overlay.innerHTML = '';
    };
    overlay.querySelector('.settings-modal-close')?.addEventListener('click', close);
    overlay.querySelector('.settings-modal-cancel')?.addEventListener('click', close);
  },

  renderRoleScopeOptions(scopeType, selected = '') {
    const map = {
      '全部数据': ['全部区域'],
      '按区域': this.orgOptions.region,
      '按营业所': this.orgOptions.office,
      '按经销商': this.orgOptions.dealer,
      '仅本人相关数据': ['本人上传/处理/待办数据']
    };
    return (map[scopeType] || map['按区域']).map((item) => `<option ${selected === item ? 'selected' : ''}>${item}</option>`).join('');
  },

  renderScopeRuleGrid() {
    return `
      <div class="settings-rule-grid compact">
        <div><strong>按区域</strong><span>只能查看所选区域下的营业所、经销商、门店和 POS 明细。</span></div>
        <div><strong>按营业所</strong><span>只能查看该营业所及其下属经销商、门店数据。</span></div>
        <div><strong>按经销商</strong><span>只能查看指定经销商及其门店数据。</span></div>
        <div><strong>仅本人相关数据</strong><span>用于流程待办、上传记录等个人范围数据。</span></div>
      </div>
    `;
  }
};

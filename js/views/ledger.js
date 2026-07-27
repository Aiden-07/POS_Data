const LEDGER_DEFAULT_COLUMNS = [
  'transactionDate', 'dealerName', 'team', 'region', 'salesOffice', 'acc',
  'orionStoreCode', 'orionStoreName', 'orionProductCode', 'orionBarcode',
  'orionProductName', 'quantity', 'amount', 'cost', 'retailPrice'
];

const LedgerView = {
  edits: new Map(),
  editingRowKey: '',
  compoundFiltersExpanded: false,
  compoundFilters: [],
  appliedCompoundFilters: [],
  compoundPositionBound: false,
  compoundEventsBound: false,
  filters: {
    year: '2026',
    month: '06',
    startMonth: '2026-01',
    endMonth: '2026-07',
    keyword: '',
    keywordField: 'all',
    org: {
      region: '',
      office: '',
      dealer: ''
    }
  },
  orgNavigator: {
    level: 'region',
    region: '',
    office: '',
    dealer: ''
  },
  visibleColumnKeys: [...LEDGER_DEFAULT_COLUMNS],
  columnPreferenceLoaded: false,
  groupBy: '',
  collapsedGroups: new Set(),
  closePanelsBound: false,
  searchDropdownCloseBound: false,
  advancedFiltersExpanded: false,
  selectedStartMonth: '2026-01',
  selectedEndMonth: '2026-07',
  monthPickerViewYear: 2026,
  monthRangeSelectingEnd: false,
  monthRangeError: '',
  keywordFieldOptions: [
    { value: 'all', label: '全部' },
    { value: 'acc', label: 'ACC' },
    { value: 'customerStoreName', label: '客户门店名称' },
    { value: 'customerStoreNo', label: '客户门店号' },
    { value: 'orionStoreName', label: '好丽友交易处名称' },
    { value: 'orionStoreCode', label: '好丽友交易处编码' },
    { value: 'dealer', label: '经销商' },
    { value: 'customerProductName', label: '客户产品名称' },
    { value: 'customerProductCode', label: '客户产品号' },
    { value: 'orionProductName', label: '好丽友产品名称' },
    { value: 'orionProductCode', label: '好丽友产品编码' },
    { value: 'orionBarcode', label: '好丽友条形码' }
  ],
  compoundFilterFieldOptions: [
    { value: 'partnerErp', label: '客户系统' },
    { value: 'dealer', label: '经销商' },
    { value: 'acc', label: 'ACC' },
    { value: 'orionStoreCode', label: '好丽友交易处编码' },
    { value: 'orionStoreName', label: '好丽友交易处名称' },
    { value: 'orionProductCode', label: '好丽友产品编码' },
    { value: 'orionBarcode', label: '好丽友条形码' },
    { value: 'orionProductName', label: '好丽友产品名称' }
  ],

  tableColumns: [
    { key: 'transactionDate', label: '时间', width: 'w-28', value: (item) => item.transactionDate },
    { key: 'partnerErp', label: '客户系统', width: 'w-32', value: (item) => String(item.partnerErp || '-').replace(/\s*ERP\s*$/i, '') || '-' },
    { key: 'dealerName', label: '经销商', width: 'w-36', truncate: true, value: (item) => item.dealer },
    { key: 'customerStoreNo', label: '客户门店号', width: 'w-32', mono: true, value: (item) => item.customerStoreNo },
    { key: 'rawTransactionCode', label: '原始交易出码', width: 'w-36', mono: true, value: (item) => item.rawTransactionCode },
    { key: 'customerStoreName', label: '客户门店名称', width: 'w-44', truncate: true, value: (item) => item.customerStoreName },
    { key: 'team', label: 'TEAM', width: 'w-28', value: (item) => item.salesTeam },
    { key: 'region', label: '区域', width: 'w-28', value: (item) => item.fullRegion },
    { key: 'salesOffice', label: '营业所', width: 'w-32', value: (item) => item.salesOffice },
    { key: 'acc', label: 'ACC', width: 'w-24', value: (item) => item.acc },
    { key: 'orionStoreCode', label: '好丽友交易处编码', width: 'w-40', mono: true, value: (item) => item.storeCode },
    { key: 'orionStoreName', label: '好丽友交易处名称', width: 'w-48', truncate: true, value: (item) => item.storeName },
    { key: 'customerProductCode', label: '客户产品号', width: 'w-32', mono: true, value: (item) => item.customerProductCode },
    { key: 'customerProductName', label: '客户产品名称', width: 'w-52', truncate: true, value: (item) => item.customerProductName },
    { key: 'customerBarcode', label: '客户条形码', width: 'w-36', mono: true, value: (item) => item.customerBarcode },
    { key: 'orionProductCode', label: '好丽友产品编码', width: 'w-36', mono: true, value: (item) => item.productCode },
    { key: 'orionBarcode', label: '好丽友条形码', width: 'w-40', mono: true, value: (item) => item.barcode },
    { key: 'orionProductName', label: '好丽友产品名称', width: 'w-56', truncate: true, value: (item) => item.productName },
    { key: 'quantity', label: '销售数量', width: 'w-24', align: 'right', value: (item) => item.quantity },
    { key: 'amount', label: '销售金额', width: 'w-24', align: 'right', value: (item) => `￥${item.amount}` },
    { key: 'cost', label: '成本', width: 'w-24', align: 'right', value: (item) => `￥${item.cost}` },
    { key: 'retailPrice', label: '零售单价', width: 'w-24', align: 'right', value: (item) => `￥${item.retailPrice}` }
  ],

  standardData: [
    { storeName: '保定市聚昊商贸有限公司', storeCode: 'S0091005', confidence: '100%', aiNote: 'POS表数据完整，校验合规，AI未发现异常', dealer: '河北聚昊商贸', salesTeam: '华北 Team', region: '华北区域', salesOffice: '石家庄营业所' },
    { storeName: '多客隆购物中心（会盟大街）', storeCode: 'S0219489', confidence: '97.9%', aiNote: '产品名称缺失，依据产品编码反检索且唯一性，已回填', dealer: '洛阳多客隆商贸', salesTeam: '华中 Team', region: '华中区域', salesOffice: '郑州营业所' },
    { storeName: '邯郸市格耀商贸有限公司', storeCode: 'F0807952', confidence: '100%', aiNote: 'POS表数据完整，校验合规，AI未发现异常', dealer: '邯郸格耀商贸', salesTeam: '华北 Team', region: '华北区域', salesOffice: '石家庄营业所' },
    { storeName: '韩百（韩百商场）', storeCode: 'S1018566', confidence: '100%', aiNote: 'POS表数据完整，校验合规，AI未发现异常', dealer: '韩百商业集团', salesTeam: '东北 Team', region: '东北区域', salesOffice: '沈阳营业所' },
    { storeName: '家得乐（新民友谊商城）', storeCode: 'S0210780', confidence: '100%', aiNote: 'POS表数据完整，校验合规，AI未发现异常', dealer: '家得乐商贸', salesTeam: '东北 Team', region: '东北区域', salesOffice: '沈阳营业所' },
    { storeName: '家家乐超市（大市场）', storeCode: 'F0514986', confidence: '98.2%', aiNote: '缺失“销售数量”，依据零售价和销售数量计算，已回填', dealer: '家家乐连锁商业', salesTeam: '华东 Team', region: '华东区域', salesOffice: '南京营业所' },
    { storeName: '利好果蔬生活广场（鞍山腾鳌店）', storeCode: 'F0714211', confidence: '100%', aiNote: 'POS表数据完整，校验合规，AI未发现异常', dealer: '利好果蔬生活广场', salesTeam: '东北 Team', region: '东北区域', salesOffice: '沈阳营业所' },
    { storeName: '台安家得乐超市', storeCode: 'F0775134', confidence: '100%', aiNote: 'POS表数据完整，校验合规，AI未发现异常', dealer: '台安家得乐商贸', salesTeam: '东北 Team', region: '东北区域', salesOffice: '沈阳营业所' },
    { storeName: '利好生活广场（太和）', storeCode: 'F0872160', confidence: '80%', aiNote: '缺少“产品名称”，通过产品编码反检产品编码，已修改', dealer: '利好生活广场', salesTeam: '华北 Team', region: '华北区域', salesOffice: '北京营业所' },
    { storeName: '中心城大卖场（金鼎）', storeCode: 'F0888730', confidence: '100%', aiNote: 'POS表数据完整，校验合规，AI未发现异常', dealer: '中心城商业管理', salesTeam: '华北 Team', region: '华北区域', salesOffice: '北京营业所' },
    { storeName: '欧亚长青城（浑南中路）', storeCode: 'F0515524', confidence: '100%', aiNote: 'POS表数据完整，校验合规，AI未发现异常', dealer: '欧亚长青城商贸', salesTeam: '东北 Team', region: '东北区域', salesOffice: '沈阳营业所' },
    { storeName: '维多利（赤峰松山万达）', storeCode: 'F0528553', confidence: '97.1%', aiNote: '产品名称缺失，依据产品编码反检索且唯一性，已回填', dealer: '维多利商业', salesTeam: '华北 Team', region: '华北区域', salesOffice: '呼和浩特营业所' },
    { storeName: '煊超市邻里中心店（乐桃路）', storeCode: 'F0582802', confidence: '100%', aiNote: 'POS表数据完整，校验合规，AI未发现异常', dealer: '煊超市连锁', salesTeam: '华东 Team', region: '华东区域', salesOffice: '杭州营业所' },
    { storeName: '好乐福超市（177县道）', storeCode: 'F0696540', confidence: '100%', aiNote: 'POS表数据完整，校验合规，AI未发现异常', dealer: '好乐福商贸', salesTeam: '华中 Team', region: '华中区域', salesOffice: '武汉营业所' },
    { storeName: '家乐惠超市（宁县早胜店）', storeCode: 'F0779616', confidence: '100%', aiNote: 'POS表数据完整，校验合规，AI未发现异常', dealer: '家乐惠商业', salesTeam: '西北 Team', region: '西北区域', salesOffice: '西安营业所' },
    { storeName: '四海一家生活超市（南方花园）', storeCode: 'S0074170', confidence: '97.7%', aiNote: '缺失“销售数量”，依据零售价和销售数量计算，已回填', dealer: '四海一家生活超市', salesTeam: '华南 Team', region: '华南区域', salesOffice: '广州营业所' },
    { storeName: '新世纪商厦（崇信县）', storeCode: 'S0280536', confidence: '100%', aiNote: 'POS表数据完整，校验合规，AI未发现异常', dealer: '新世纪商厦', salesTeam: '西北 Team', region: '西北区域', salesOffice: '兰州营业所' },
    { storeName: '旺鲜生八佰伴店', storeCode: 'S0282108', confidence: '100%', aiNote: 'POS表数据完整，校验合规，AI未发现异常', dealer: '旺鲜生商业', salesTeam: '华东 Team', region: '华东区域', salesOffice: '上海营业所' },
    { storeName: '益尚客（太阳城）', storeCode: 'S0328228', confidence: '96.9%', aiNote: '缺少“产品名称”，通过产品编码反检产品编码，已修改', dealer: '益尚客商贸', salesTeam: '华北 Team', region: '华北区域', salesOffice: '天津营业所' },
    { storeName: '每日惠北塔', storeCode: 'S0489019', confidence: '100%', aiNote: 'POS表数据完整，校验合规，AI未发现异常', dealer: '每日惠商贸', salesTeam: '东北 Team', region: '东北区域', salesOffice: '沈阳营业所' }
  ],

  renderAction() {
    return '';
  },
  
  render() {
    this.loadColumnPreference();
    return `
      <div class="ledger-page-stack animate-[fadeIn_0.4s_ease-out]">
        <section class="ledger-filter-card">
          ${this.renderFilters()}
        </section>
        ${this.renderTableCard()}
      </div>
    `;
  },

  renderTableCard() {
    return `
      <section class="ledger-table-card" id="ledger-table-card">
        <div class="ledger-table-head">
          <div class="ledger-table-tools">
            <div class="ledger-tool-popover-wrap">
              <button id="ledger-column-btn" class="ledger-table-tool-button" type="button" aria-expanded="false">
                <i class="fa-solid fa-table-columns"></i>
                <span>表头</span>
              </button>
              <div id="ledger-column-panel" class="ledger-tool-panel hidden">
                <div class="ledger-tool-panel-title">选择显示字段</div>
                <div class="ledger-field-grid">
                  ${this.getTableColumns().map((column) => `
                    <label class="ledger-field-option">
                      <input type="checkbox" data-ledger-column="${column.key}" ${this.visibleColumnKeys.includes(column.key) ? 'checked' : ''}>
                      <span>${column.label}</span>
                    </label>
                  `).join('')}
                </div>
                <button id="ledger-column-reset" type="button" class="mt-3 text-xs font-medium text-brand hover:underline">恢复默认字段</button>
              </div>
            </div>
          </div>
          <div class="ledger-table-tools">
            <div class="ledger-tool-popover-wrap">
              <button id="ledger-group-btn" class="ledger-table-tool-button" type="button" aria-expanded="false">
                <i class="fa-solid fa-layer-group"></i>
                <span>分组</span>
              </button>
              <div id="ledger-group-panel" class="ledger-tool-panel ledger-group-panel hidden">
                <div class="ledger-tool-panel-title">选择分组方式</div>
                ${this.renderGroupOptions()}
              </div>
            </div>
            <button id="ledger-batch-edit-btn" class="ledger-table-tool-button ledger-batch-edit-button" type="button">
              <i class="fa-solid fa-pen-to-square"></i>
              <span>批量修改</span>
            </button>
            <button id="ledger-export-btn" class="ledger-table-tool-button" type="button">
              <i class="fa-solid fa-download"></i>
              <span>导出</span>
            </button>
          </div>
        </div>
        <div class="overflow-auto flex-1 relative px-2">
          <table class="w-full table-fixed text-left text-sm text-[#4e5969]" style="min-width:${Math.max(1360, this.getVisibleColumns().length * 132)}px" id="ledger-table">
            <thead class="bg-[#f7f8fa] text-[#1d2129] font-medium sticky top-0 z-10" id="ledger-thead">
              ${this.renderTableHeader()}
            </thead>
            <tbody id="ledger-tbody" class="divide-y divide-gray-100">
              ${this.getSkeletonRows()}
            </tbody>
          </table>
        </div>
        <div class="ledger-table-footer">
          <span class="ledger-record-count" id="ledger-record-count">当前 0 条单据</span>
        </div>
      </section>
    `;
  },

  renderGroupOptions() {
    const options = [
      { value: '', label: '不分组' },
      { value: 'region', label: '区域' },
      { value: 'salesOffice', label: '营业所' },
      { value: 'dealer', label: '经销商' },
      { value: 'acc', label: 'ACC' }
    ];
    return options.map((option) => `
      <label class="ledger-group-option">
        <input type="radio" name="ledger-group-by" value="${option.value}" ${this.groupBy === option.value ? 'checked' : ''}>
        <span>${option.label}</span>
      </label>
    `).join('');
  },

  getVisibleColumns() {
    return this.getTableColumns()
      .filter((column) => this.visibleColumnKeys.includes(column.key))
      .sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
  },

  getTableColumns() {
    return this.tableColumns;
  },

  getColumnPreferenceKey() {
    const account = typeof Store !== 'undefined' && Store.state?.account
      ? Store.state.account
      : 'default';
    return `pos_demo_ledger_columns_${account}`;
  },

  loadColumnPreference() {
    if (this.columnPreferenceLoaded) return;
    this.columnPreferenceLoaded = true;
    try {
      const saved = JSON.parse(localStorage.getItem(this.getColumnPreferenceKey()) || 'null');
      const validKeys = new Set(this.tableColumns.map((column) => column.key));
      if (Array.isArray(saved)) {
        const validSaved = saved.filter((key) => validKeys.has(key));
        if (validSaved.length) this.visibleColumnKeys = validSaved;
      }
    } catch (error) {
      this.visibleColumnKeys = [...LEDGER_DEFAULT_COLUMNS];
    }
  },

  saveColumnPreference() {
    localStorage.setItem(this.getColumnPreferenceKey(), JSON.stringify(this.visibleColumnKeys));
  },

  renderTableHeader() {
    const columns = this.getVisibleColumns();
    return `
      <tr>
        ${columns.map((column, index) => {
          const classes = ['px-4', 'py-3', column.width || 'w-28'];
          if (column.align === 'right') classes.push('text-right');
          if (index === 0) classes.push('rounded-tl-lg');
          return `<th class="${classes.join(' ')}">${column.label}</th>`;
        }).join('')}
        <th class="px-4 py-3 w-20 rounded-tr-lg">操作</th>
      </tr>
    `;
  },

  getCurrentMonthValue() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  },

  formatMonthChinese(value) {
    const [year, month] = value.split('-').map(Number);
    return `${year}年${month}月`;
  },

  getSelectedMonthCount() {
    const [startYear, startMonth] = this.selectedStartMonth.split('-').map(Number);
    const [endYear, endMonth] = this.selectedEndMonth.split('-').map(Number);
    return (endYear - startYear) * 12 + endMonth - startMonth + 1;
  },

  renderLedgerMonthPanel(year) {
    const names = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const currentMonth = this.getCurrentMonthValue();
    return `
      <section class="analytics-month-panel" aria-label="${year}年">
        <div class="analytics-month-grid">
          ${names.map((name, index) => {
            const value = `${year}-${String(index + 1).padStart(2, '0')}`;
            const selected = value === this.selectedStartMonth || value === this.selectedEndMonth;
            const inRange = value > this.selectedStartMonth && value < this.selectedEndMonth;
            return `<button type="button" class="analytics-month-option ${selected ? 'selected' : ''} ${inRange ? 'in-range' : ''}" data-ledger-month="${value}" ${value > currentMonth ? 'disabled' : ''} aria-label="${year}年${index + 1}月">${name}</button>`;
          }).join('')}
        </div>
      </section>
    `;
  },

  renderLedgerMonthPicker() {
    const currentYear = new Date().getFullYear();
    const leftYear = Math.min(Math.max(this.monthPickerViewYear, 2000), currentYear);
    this.monthPickerViewYear = leftYear;
    return `
      <div class="analytics-month-picker-header">
        <button type="button" class="analytics-month-nav" data-ledger-month-nav="-1" aria-label="上一年"><i class="fa-solid fa-angles-left"></i></button>
        <span>${leftYear}年</span>
        <span>${leftYear + 1}年</span>
        <button type="button" class="analytics-month-nav" data-ledger-month-nav="1" aria-label="下一年" ${leftYear >= currentYear ? 'disabled' : ''}><i class="fa-solid fa-angles-right"></i></button>
      </div>
      <div class="analytics-month-picker-panels">
        ${this.renderLedgerMonthPanel(leftYear)}
        ${this.renderLedgerMonthPanel(leftYear + 1)}
      </div>
    `;
  },

  renderFilters() {
    return `
      <div class="ledger-filter-panel" id="ledger-filter-panel">
        <div class="ledger-filter-line ledger-filter-main">
          <div class="ledger-filter-label">关键字</div>
          <div class="ledger-filter-content ledger-keyword-controls">
            <div id="ledger-search-combo-wrapper" class="ledger-search-combo">
              <button type="button" id="ledger-search-field-btn" class="ledger-search-field-button" title="${this.getKeywordFieldLabel()}">
                <span id="ledger-search-field-label">${this.getKeywordFieldLabel()}</span>
                <i class="fa-solid fa-chevron-down"></i>
              </button>
              <label class="ledger-search-input-wrap">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input id="ledger-filter-keyword" type="text" placeholder="${this.getKeywordPlaceholder()}">
              </label>
              <div id="ledger-search-field-dropdown" class="ledger-search-field-dropdown hidden"></div>
            </div>
            <div class="ledger-month-range-filter">
              <span class="ledger-main-filter-caption">时间范围</span>
              <div class="analytics-month-picker-wrap">
                <button id="ledger-month-range-button" class="analytics-month-range-button ledger-month-range-button ${this.monthRangeError ? 'invalid' : ''}" type="button" aria-expanded="false">
                  <i class="fa-regular fa-calendar"></i>
                  <span>${this.formatMonthChinese(this.selectedStartMonth)}</span>
                  <span class="analytics-range-to">至</span>
                  <span>${this.formatMonthChinese(this.selectedEndMonth)}</span>
                </button>
                <span id="ledger-month-range-error" class="analytics-month-range-error ${this.monthRangeError ? '' : 'hidden'}">${this.monthRangeError}</span>
                <div id="ledger-month-picker" class="analytics-month-picker hidden">${this.renderLedgerMonthPicker()}</div>
              </div>
            </div>
            <div class="ledger-compound-filter-wrap">
              <button id="ledger-compound-filter-btn" class="ledger-filter-secondary ledger-compound-filter-btn" type="button" aria-expanded="${this.compoundFiltersExpanded}">
                <i class="fa-solid fa-filter"></i>
                <span id="ledger-compound-filter-label">筛选（${this.appliedCompoundFilters.length}）</span>
              </button>
              ${this.renderCompoundFilterPanel()}
            </div>
            <button id="ledger-filter-submit" class="ledger-filter-primary" type="button">
              <i class="fa-solid fa-magnifying-glass"></i>
              <span>查询</span>
            </button>
            <button id="ledger-filter-expand" class="ledger-filter-expand" type="button" aria-expanded="${this.advancedFiltersExpanded}">
              <span>${this.advancedFiltersExpanded ? '收起筛选' : '展开筛选'}</span>
              <span id="ledger-filter-active-count" class="ledger-filter-count ${this.getAdvancedFilterCount() ? '' : 'hidden'}">${this.getAdvancedFilterCount()}</span>
              <i class="fa-solid fa-chevron-${this.advancedFiltersExpanded ? 'up' : 'down'}"></i>
            </button>
          </div>
        </div>
        <div id="ledger-advanced-filters" class="ledger-advanced-filters ${this.advancedFiltersExpanded ? '' : 'hidden'}">
          ${this.renderOrgSelector()}
          <div class="ledger-filter-actions">
            <button id="ledger-filter-reset" class="ledger-filter-secondary" type="button">
              <i class="fa-solid fa-rotate-right"></i>
              <span>重置筛选</span>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  createCompoundFilter(relation = 'AND') {
    return {
      id: `condition-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      relation,
      field: 'partnerErp',
      value: ''
    };
  },

  renderCompoundFilterPanel() {
    const conditions = this.compoundFilters.length
      ? this.compoundFilters
      : [this.createCompoundFilter()];
    if (!this.compoundFilters.length) this.compoundFilters = conditions;
    return `
      <div id="ledger-compound-filter-panel" class="ledger-compound-filter-panel ${this.compoundFiltersExpanded ? '' : 'hidden'}">
        <div class="ledger-compound-filter-head">
          <div>
            <strong>组合筛选</strong>
            <span>文本包含匹配，支持 AND / OR</span>
          </div>
          <div class="ledger-compound-head-actions">
            <button type="button" class="ledger-compound-close" data-compound-action="close" aria-label="关闭组合筛选">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
        <div class="ledger-compound-conditions">
          ${conditions.map((condition, index) => `
            <div class="ledger-compound-condition" data-condition-id="${this.escapeHtml(condition.id)}">
              ${index === 0 ? '<span class="ledger-compound-relation-placeholder">条件</span>' : `
                <select class="ledger-compound-relation" data-condition-property="relation" aria-label="条件关系">
                  <option value="AND" ${condition.relation === 'AND' ? 'selected' : ''}>AND</option>
                  <option value="OR" ${condition.relation === 'OR' ? 'selected' : ''}>OR</option>
                </select>
              `}
              <select class="ledger-compound-field" data-condition-property="field" aria-label="筛选字段">
                ${this.compoundFilterFieldOptions.map((option) => `
                  <option value="${option.value}" ${condition.field === option.value ? 'selected' : ''}>${option.label}</option>
                `).join('')}
              </select>
              <input class="ledger-compound-value" data-condition-property="value" type="text" value="${this.escapeHtml(condition.value)}" placeholder="请输入搜索内容" aria-label="搜索内容">
              <button type="button" class="ledger-compound-remove" data-compound-action="remove" title="删除条件" aria-label="删除条件" ${conditions.length === 1 ? 'disabled' : ''}>
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          `).join('')}
        </div>
        <button type="button" class="ledger-compound-add" data-compound-action="add" ${conditions.length >= 20 ? 'disabled' : ''}>
          <i class="fa-solid fa-plus"></i>
          <span>${conditions.length >= 20 ? '已达 20 条上限' : '添加条件'}</span>
        </button>
        <div class="ledger-compound-actions">
          <button type="button" class="ledger-filter-secondary" data-compound-action="clear">清空</button>
          <button type="button" class="ledger-filter-secondary" data-compound-action="close">取消</button>
          <button type="button" class="ledger-filter-primary" data-compound-action="apply">应用筛选</button>
        </div>
      </div>
    `;
  },

  renderCompoundFilterPanelIntoDom() {
    const current = document.getElementById('ledger-compound-filter-panel');
    if (current) {
      current.outerHTML = this.renderCompoundFilterPanel();
      this.mountCompoundFilterPortal();
      this.positionCompoundFilterPanel();
    }
  },

  mountCompoundFilterPortal() {
    const inlinePanel = document.querySelector('#ledger-filter-panel #ledger-compound-filter-panel');
    const portalPanel = document.querySelector('body > #ledger-compound-filter-panel');
    if (!inlinePanel) return;
    if (portalPanel && portalPanel !== inlinePanel) portalPanel.remove();
    document.body.appendChild(inlinePanel);
  },

  bindCompoundFilterPanelEvents() {
    if (this.compoundEventsBound) return;
    document.addEventListener('click', (event) => {
      const panel = event.target.closest('#ledger-compound-filter-panel');
      if (!panel) {
        if (this.compoundFiltersExpanded && !event.target.closest('#ledger-compound-filter-btn')) {
          this.compoundFiltersExpanded = false;
          this.renderCompoundFilterPanelIntoDom();
          this.updateCompoundFilterButton();
        }
        return;
      }
      const actionTarget = event.target.closest('[data-compound-action]');
      if (actionTarget) {
        this.handleCompoundFilterAction(actionTarget.dataset.compoundAction, actionTarget);
      }
    });
    document.addEventListener('input', (event) => {
      if (!event.target.closest('#ledger-compound-filter-panel')) return;
      if (event.target.matches('[data-condition-property]')) this.syncCompoundCondition(event.target);
    });
    document.addEventListener('change', (event) => {
      if (!event.target.closest('#ledger-compound-filter-panel')) return;
      if (event.target.matches('[data-condition-property]')) this.syncCompoundCondition(event.target);
    });
    window.addEventListener('hashchange', () => {
      if (window.location.hash !== '#ledger') {
        document.querySelector('body > #ledger-compound-filter-panel')?.remove();
        this.compoundFiltersExpanded = false;
      }
    });
    this.compoundEventsBound = true;
  },

  positionCompoundFilterPanel() {
    if (!this.compoundFiltersExpanded) return;
    const button = document.getElementById('ledger-compound-filter-btn');
    const panel = document.getElementById('ledger-compound-filter-panel');
    if (!button || !panel) return;

    const margin = 12;
    const gap = 8;
    const buttonRect = button.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const panelWidth = Math.min(720, viewportWidth - margin * 2);
    const availableBelow = viewportHeight - buttonRect.bottom - gap - margin;
    const availableAbove = buttonRect.top - gap - margin;
    const openBelow = availableBelow >= 320 || availableBelow >= availableAbove;
    const availableHeight = Math.max(260, openBelow ? availableBelow : availableAbove);
    const maxHeight = Math.min(560, availableHeight);
    const left = Math.min(
      Math.max(margin, buttonRect.left),
      Math.max(margin, viewportWidth - panelWidth - margin)
    );

    panel.style.width = `${panelWidth}px`;
    panel.style.maxHeight = `${maxHeight}px`;
    panel.style.left = `${left}px`;
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
    if (openBelow) {
      panel.style.top = `${buttonRect.bottom + gap}px`;
    } else {
      panel.style.top = `${Math.max(margin, buttonRect.top - gap - panel.getBoundingClientRect().height)}px`;
    }
    panel.dataset.placement = openBelow ? 'bottom' : 'top';
  },

  syncCompoundCondition(target) {
    const row = target.closest('[data-condition-id]');
    const condition = this.compoundFilters.find((item) => item.id === row?.dataset.conditionId);
    const property = target.dataset.conditionProperty;
    if (condition && property) condition[property] = target.value;
  },

  handleCompoundFilterAction(action, target) {
    if (action === 'close') {
      this.compoundFiltersExpanded = false;
    } else if (action === 'add') {
      if (this.compoundFilters.length >= 20) {
        Dialog.toast('最多添加 20 个筛选条件', 'warning');
        return;
      }
      this.compoundFilters.push(this.createCompoundFilter('AND'));
    } else if (action === 'remove') {
      const id = target.closest('[data-condition-id]')?.dataset.conditionId;
      this.compoundFilters = this.compoundFilters.filter((item) => item.id !== id);
      if (!this.compoundFilters.length) this.compoundFilters = [this.createCompoundFilter()];
    } else if (action === 'clear') {
      this.compoundFilters = [this.createCompoundFilter()];
      this.appliedCompoundFilters = [];
      this.refreshTable();
    } else if (action === 'apply') {
      this.appliedCompoundFilters = this.compoundFilters
        .map((item, index) => ({ ...item, relation: index === 0 ? 'AND' : item.relation, value: item.value.trim() }))
        .filter((item) => item.value);
      this.compoundFiltersExpanded = false;
      this.refreshTable();
      Dialog.toast(this.appliedCompoundFilters.length ? '组合筛选已应用' : '组合筛选已清空', 'success');
    }
    this.renderCompoundFilterPanelIntoDom();
    this.updateCompoundFilterButton();
  },

  updateCompoundFilterButton() {
    const button = document.getElementById('ledger-compound-filter-btn');
    const label = document.getElementById('ledger-compound-filter-label');
    if (button) button.setAttribute('aria-expanded', String(this.compoundFiltersExpanded));
    if (label) label.textContent = `筛选（${this.appliedCompoundFilters.length}）`;
  },

  getKeywordFieldLabel(value = this.filters.keywordField) {
    return this.keywordFieldOptions.find((option) => option.value === value)?.label || '全部';
  },

  getKeywordPlaceholder(value = this.filters.keywordField) {
    return '请输入关键字';
  },

  renderKeywordFieldDropdown() {
    const dropdown = document.getElementById('ledger-search-field-dropdown');
    if (!dropdown) return;
    dropdown.innerHTML = this.keywordFieldOptions.map((option) => `
      <button type="button" data-ledger-search-field="${option.value}" class="ledger-search-field-option ${this.filters.keywordField === option.value ? 'active' : ''}" title="${option.label}">
        ${option.label}
      </button>
    `).join('');
  },

  syncKeywordSearchControl() {
    const label = document.getElementById('ledger-search-field-label');
    const button = document.getElementById('ledger-search-field-btn');
    const input = document.getElementById('ledger-filter-keyword');
    const fieldLabel = this.getKeywordFieldLabel();
    if (label) label.textContent = fieldLabel;
    if (button) button.title = fieldLabel;
    if (input) {
      input.value = this.filters.keyword || '';
      input.placeholder = this.getKeywordPlaceholder();
    }
    this.renderKeywordFieldDropdown();
  },

  getAdvancedFilterCount() {
    let count = 0;
    if (this.orgNavigator.region) count += 1;
    if (this.orgNavigator.office) count += 1;
    if (this.orgNavigator.dealer) count += 1;
    return count;
  },

  updateAdvancedFilterCount() {
    const count = this.getAdvancedFilterCount();
    const badge = document.getElementById('ledger-filter-active-count');
    if (!badge) return;
    badge.textContent = String(count);
    badge.classList.toggle('hidden', count === 0);
  },

  toggleAdvancedFilters() {
    this.advancedFiltersExpanded = !this.advancedFiltersExpanded;
    const panel = document.getElementById('ledger-advanced-filters');
    const button = document.getElementById('ledger-filter-expand');
    if (!panel || !button) return;

    panel.classList.toggle('hidden', !this.advancedFiltersExpanded);
    button.setAttribute('aria-expanded', String(this.advancedFiltersExpanded));
    button.querySelector('span')?.replaceChildren(
      document.createTextNode(this.advancedFiltersExpanded ? '收起筛选' : '展开筛选')
    );
    const icon = button.querySelector('i');
    if (icon) icon.className = `fa-solid fa-chevron-${this.advancedFiltersExpanded ? 'up' : 'down'}`;
  },

  renderOrgSelector() {
    const { region, office, dealer } = this.orgNavigator;
    const regions = this.getOrgItems('region');
    const offices = region ? this.getOrgItems('office') : [];
    const dealers = office ? this.getOrgItems('dealer') : [];

    return `
      <div class="ledger-filter-line ledger-org-filter">
        <div class="ledger-filter-label">所属组织</div>
        <div class="ledger-filter-content">
          ${this.renderOrgOptionRow('营业Team', 'region', regions, region)}
          ${region ? this.renderOrgOptionRow('区域', 'office', offices, office) : ''}
          ${office ? this.renderOrgOptionRow('经销商', 'dealer', dealers, dealer) : ''}
        </div>
      </div>
    `;
  },

  renderOrgOptionRow(label, level, items, activeValue) {
    return `
      <div class="ledger-org-row">
        <span class="ledger-org-row-label">${label}</span>
        <div class="ledger-org-options">
          <button type="button" class="ledger-org-chip ${!activeValue ? 'active' : ''}" data-org-level="${level}" data-org-action="all">全部</button>
          ${items.map((item) => `
            <button type="button" class="ledger-org-chip ${activeValue === item ? 'active' : ''}" data-org-level="${level}" data-org-value="${this.escapeHtml(item)}">
              ${this.escapeHtml(item)}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  },

  getOrgItems(level) {
    const { region, office } = this.orgNavigator;
    if (level === 'region') {
      return [...new Set(this.standardData.map((row) => row.region))];
    }
    if (level === 'office') {
      return [...new Set(this.standardData
        .filter((row) => !region || row.region === region)
        .map((row) => row.salesOffice))];
    }
    return [...new Set(this.standardData
      .filter((row) => (!region || row.region === region) && (!office || row.salesOffice === office))
      .map((row) => row.dealer))];
  },
  
  getSkeletonRows() {
    const columnCount = this.getVisibleColumns().length + 1;
    return Array(5).fill(0).map(() => `
      <tr>
        ${Array.from({ length: columnCount }).map(() => '<td class="px-4 py-3"><div class="h-4 w-24 skeleton rounded"></div></td>').join('')}
      </tr>
    `).join('');
  },

  getStandardPreviewRows(row) {
    const productNames = [
      '好丽友大粒大力跳跳糖葡萄',
      '好丽友果滋果心黄金奇异果味软糖70g',
      '好丽友果滋果心-百香果味软糖70g',
      '好丽友高纤坚果棒酸奶味30g',
      '好丽友Q蒂榛子蛋糕6枚（28g*6）',
      '好丽友果滋果心黄桃味软糖70g',
      '好丽友高蛋白坚果棒太妃味30g',
      '好丽友Q蒂摩卡蛋糕2枚（28g*12）',
      '好丽友Q蒂红丝绒派6枚（28g*6）',
      '好丽友派巧克力味12枚',
      '好丽友薯愿蜂蜜黄油味104g',
      '好丽友好多鱼番茄味33g'
    ];
    const accNames = ['其它', '北京物美', '怀化佳惠', '南阳万德隆', '新玛特'];
    return Array.from({ length: 24 }, (_, index) => {
      const productName = productNames[index % productNames.length];
      const quantity = [3, 6, 4, 8, 5, 9, 7, 12][index % 8];
      const price = [1.8, 4.5, 3.9, 5.2, 6.8, 7.5, 6.2, 8.9][index % 8];
      const numericStoreCode = String(row.storeCode).replace(/\D/g, '').slice(-6).padStart(6, '0');
      const customerProductCode = `SKU-${String(380011 + index * 29).padStart(6, '0')}`;
      const orionBarcode = `69209${String(7871409 + index * 137).padStart(8, '0')}`;
      return {
        month: '2026年06月',
        transactionDate: `2026-06-${String((index % 28) + 1).padStart(2, '0')}`,
        partnerErp: row.dealer.replace(/商贸|商业|集团|有限公司/g, ''),
        acc: accNames[index % accNames.length],
        dealer: row.dealer,
        salesTeam: row.salesTeam,
        region: row.region.replace('区域', ''),
        fullRegion: row.region,
        salesOffice: row.salesOffice,
        customerStoreNo: `C${numericStoreCode}`,
        rawTransactionCode: `RAW-${row.storeCode}`,
        customerStoreName: row.storeName,
        storeCode: row.storeCode,
        storeName: row.storeName,
        customerProductCode,
        customerProductName: productName.replace(/^好丽友/, ''),
        customerBarcode: `69012${String(5300000 + index * 113).padStart(8, '0')}`,
        productCode: `A${String(6678011 + index * 137).padStart(7, '0')}`,
        productName,
        barcode: orionBarcode,
        quantity,
        amount: (quantity * price).toFixed(1),
        cost: (quantity * (price * 0.72)).toFixed(1),
        retailPrice: price.toFixed(1),
        aiNote: row.aiNote
      };
    });
  },

  getAllRows() {
    return this.standardData.flatMap((row) => this.getStandardPreviewRows(row)).map((item) => {
      const ledgerKey = this.getLedgerRowKey(item);
      return {
        ...item,
        ...(this.edits.get(ledgerKey) || {}),
        _ledgerKey: ledgerKey
      };
    });
  },

  hasLedgerPermission(action) {
    return typeof SettingsView !== 'undefined'
      && SettingsView.hasCurrentPermission('台账与汇总', '标准POS明细', action);
  },

  getFilteredRows() {
    const filters = this.filters;
    const normalize = (value) => String(value || '').trim().toLowerCase();
    const contains = (value, keyword) => !normalize(keyword) || normalize(value).includes(normalize(keyword));
    const searchableValues = (item) => ({
      acc: item.acc,
      customerStoreName: item.customerStoreName,
      customerStoreNo: item.customerStoreNo,
      orionStoreName: item.storeName,
      orionStoreCode: item.storeCode,
      dealer: item.dealer,
      customerProductName: item.customerProductName,
      customerProductCode: item.customerProductCode,
      orionProductName: item.productName,
      orionProductCode: item.productCode,
      orionBarcode: item.barcode
    });
    const matchesKeyword = (item) => {
      const keyword = filters.keyword;
      if (!normalize(keyword)) return true;
      const values = searchableValues(item);
      if (filters.keywordField && filters.keywordField !== 'all') {
        return contains(values[filters.keywordField], keyword);
      }
      return Object.values(values).some((value) => contains(value, keyword));
    };
    const matchesCompoundFilters = (item) => {
      if (!this.appliedCompoundFilters.length) return true;
      const values = {
        partnerErp: String(item.partnerErp || '').replace(/\s*ERP\s*$/i, ''),
        dealer: item.dealer,
        acc: item.acc,
        orionStoreCode: item.storeCode,
        orionStoreName: item.storeName,
        orionProductCode: item.productCode,
        orionBarcode: item.barcode,
        orionProductName: item.productName
      };
      const groups = [];
      this.appliedCompoundFilters.forEach((condition, index) => {
        if (index === 0 || condition.relation === 'OR') groups.push([]);
        groups[groups.length - 1].push(condition);
      });
      return groups.some((group) => group.every((condition) => contains(values[condition.field], condition.value)));
    };

    return this.getAllRows().filter((item) => {
      const itemMonth = String(item.transactionDate || '').slice(0, 7);
      const monthMatch = itemMonth >= filters.startMonth && itemMonth <= filters.endMonth;
      const regionMatch = !filters.org.region || item.fullRegion === filters.org.region;
      const officeMatch = !filters.org.office || item.salesOffice === filters.org.office;
      const orgDealerMatch = !filters.org.dealer || item.dealer === filters.org.dealer;
      const keywordMatch = matchesKeyword(item);
      const compoundMatch = matchesCompoundFilters(item);
      return monthMatch && regionMatch && officeMatch && orgDealerMatch && keywordMatch && compoundMatch;
    });
  },

  escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  },

  renderRows(rows) {
    if (!rows.length) {
      return `
        <tr>
          <td colspan="${this.getVisibleColumns().length + 1}" class="px-4 py-16 text-center">
            <div class="inline-flex flex-col items-center gap-3 text-[#86909c]">
              <span class="w-12 h-12 rounded-2xl bg-blue-50 text-brand flex items-center justify-center text-lg">
                <i class="fa-solid fa-filter-circle-xmark"></i>
              </span>
              <span class="font-semibold">暂无符合条件的明细数据</span>
            </div>
          </td>
        </tr>
      `;
    }

    if (this.groupBy) {
      return this.renderGroupedRows(rows);
    }

    return rows.map((item) => `
      <tr class="hover:bg-slate-50 transition-colors ${this.editingRowKey === this.getLedgerRowKey(item) ? 'ledger-row-editing' : ''}" data-ledger-editing="${this.editingRowKey === this.getLedgerRowKey(item)}">
        ${this.renderDataCells(item)}
      </tr>
    `).join('');
  },

  getLedgerRowKey(item) {
    if (item?._ledgerKey) return item._ledgerKey;
    return [
      item.month,
      item.storeCode,
      item.productCode || item.barcode,
      item.productName
    ].join('|');
  },

  renderDataCells(item) {
    const rowKey = this.getLedgerRowKey(item);
    const isEditing = this.editingRowKey === rowKey;
    const editableColumns = {
      partnerErp: { field: 'partnerErp', mono: false },
      orionStoreCode: { field: 'storeCode', mono: true },
      orionProductCode: { field: 'productCode', mono: true },
      quantity: { field: 'quantity', numeric: true },
      amount: { field: 'amount', numeric: true, money: true },
      cost: { field: 'cost', numeric: true, money: true },
      retailPrice: { field: 'retailPrice', numeric: true, money: true }
    };
    const cells = this.getVisibleColumns().map((column) => {
      const value = column.value(item);
      const classes = ['px-4', 'py-3'];
      if (column.align === 'right') classes.push('text-right');
      if (column.mono) classes.push('font-mono', 'text-xs', 'text-[#1d2129]');
      if (column.truncate) classes.push('truncate');
      if (['dealerName', 'customerStoreName', 'orionStoreName', 'customerProductName', 'orionProductName'].includes(column.key)) classes.push('max-w-[220px]');
      const editable = editableColumns[column.key];
      if (isEditing && editable) {
        const inputValue = editable.field === 'partnerErp'
          ? String(item[editable.field] || '').replace(/\s*ERP\s*$/i, '')
          : item[editable.field] || '';
        return `<td class="${classes.join(' ')}">
          <input
            type="text"
            ${editable.numeric ? 'inputmode="decimal"' : ''}
            class="ledger-inline-edit-input${editable.mono ? ' font-mono' : ''}"
            data-ledger-edit-field="${editable.field}"
            ${editable.numeric ? 'data-ledger-numeric="true"' : ''}
            ${editable.money ? 'data-ledger-money="true"' : ''}
            value="${this.escapeHtml(inputValue)}"
            aria-label="编辑${this.escapeHtml(column.label)}"
          >
        </td>`;
      }
      const title = column.truncate ? ` title="${this.escapeHtml(value)}"` : '';
      return `<td class="${classes.join(' ')}"${title}>${this.escapeHtml(value)}</td>`;
    }).join('');
    return `${cells}
      <td class="px-4 py-3">
        <div class="flex items-center gap-1">
        ${isEditing ? `
          <button type="button" class="ledger-save-btn ledger-inline-action is-save" data-ledger-key="${this.escapeHtml(rowKey)}" title="保存修改" aria-label="保存修改">
            <i class="fa-solid fa-check"></i>
          </button>
          <button type="button" class="ledger-cancel-btn ledger-inline-action is-cancel" data-ledger-key="${this.escapeHtml(rowKey)}" title="取消修改" aria-label="取消修改">
            <i class="fa-solid fa-xmark"></i>
          </button>
        ` : `
        ${this.hasLedgerPermission('单据详情') ? `<button type="button" class="ledger-detail-btn px-2 py-1 text-xs rounded text-brand hover:bg-blue-50 transition-colors" data-ledger-key="${this.escapeHtml(this.getLedgerRowKey(item))}" title="单据详情">
          <i class="fa-solid fa-list-check"></i>
        </button>` : '<span class="text-xs text-[#86909c]">—</span>'}
        ${this.hasLedgerPermission('编辑') ? `<button type="button" class="ledger-edit-btn px-2 py-1 text-xs rounded text-amber-500 hover:bg-amber-50 transition-colors" data-ledger-key="${this.escapeHtml(this.getLedgerRowKey(item))}" title="编辑">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>` : ''}
        `}
        </div>
      </td>
    `;
  },

  startInlineEdit(row) {
    if (!row || !this.hasLedgerPermission('编辑')) {
      Dialog.toast('当前账号无编辑权限', 'warning');
      return;
    }
    this.editingRowKey = this.getLedgerRowKey(row);
    this.refreshTable();
    requestAnimationFrame(() => {
      document.querySelector(`tr[data-ledger-editing="true"] input`)?.focus();
    });
  },

  saveInlineEdit(button) {
    const key = button?.getAttribute('data-ledger-key') || this.editingRowKey;
    const tableRow = button?.closest('tr');
    const inputs = Array.from(tableRow?.querySelectorAll('[data-ledger-edit-field]') || []);
    const values = {};
    for (const input of inputs) {
      const field = input.dataset.ledgerEditField;
      let value = input.value.trim();
      if (!value) {
        Dialog.toast('编辑字段不能为空', 'warning');
        return;
      }
      if (input.dataset.ledgerNumeric === 'true') {
        if (!/^\d+(?:\.\d{1,2})?$/.test(value) || Number(value) < 0) {
          Dialog.toast('数值字段必须大于等于 0，且最多保留两位小数', 'warning');
          return;
        }
        value = input.dataset.ledgerMoney === 'true'
          ? Number(value).toFixed(2)
          : String(Number(value));
      } else if (['storeCode', 'productCode'].includes(field)) {
        value = value.toUpperCase();
      }
      values[field] = value;
    }
    if (!Object.keys(values).length) {
      Dialog.toast('当前没有可编辑字段', 'warning');
      return;
    }
    const consistencyWarnings = [];
    if (['quantity', 'amount', 'retailPrice'].every((field) => values[field] !== undefined)
      && Math.abs(Number(values.amount) - Number(values.quantity) * Number(values.retailPrice)) > 0.01) {
      consistencyWarnings.push('销售金额与销售数量×零售单价不一致');
    }
    if (values.cost !== undefined && values.amount !== undefined && Number(values.cost) > Number(values.amount)) {
      consistencyWarnings.push('成本高于销售金额');
    }
    this.edits.set(key, {
      ...(this.edits.get(key) || {}),
      ...values
    });
    this.editingRowKey = '';
    this.refreshTable();
    Dialog.toast(
      consistencyWarnings.length ? `台账明细已更新；${consistencyWarnings.join('；')}` : '台账明细已更新',
      consistencyWarnings.length ? 'warning' : 'success'
    );
  },

  cancelInlineEdit() {
    this.editingRowKey = '';
    this.refreshTable();
  },

  getGroupLabel(item) {
    if (this.groupBy === 'region') return item.fullRegion;
    if (this.groupBy === 'salesOffice') return item.salesOffice;
    if (this.groupBy === 'dealer') return item.dealer;
    if (this.groupBy === 'acc') return item.acc;
    return '';
  },

  renderGroupedRows(rows) {
    const groups = rows.reduce((result, item) => {
      const label = this.getGroupLabel(item) || '未分组';
      if (!result.has(label)) result.set(label, []);
      result.get(label).push(item);
      return result;
    }, new Map());
    const columnCount = this.getVisibleColumns().length + 1;

    return [...groups.entries()].map(([label, items]) => {
      const collapsed = this.collapsedGroups.has(label);
      return `
        <tr class="ledger-group-row">
          <td colspan="${columnCount}" class="px-4 py-2">
            <button type="button" class="ledger-group-toggle" data-ledger-group="${this.escapeHtml(label)}">
              <i class="fa-solid fa-chevron-${collapsed ? 'right' : 'down'}"></i>
              <span>${this.escapeHtml(label)}</span>
              <em>${items.length} 条单据</em>
            </button>
          </td>
        </tr>
        ${collapsed ? '' : items.map((item) => `
          <tr class="hover:bg-slate-50 transition-colors ${this.editingRowKey === this.getLedgerRowKey(item) ? 'ledger-row-editing' : ''}" data-ledger-editing="${this.editingRowKey === this.getLedgerRowKey(item)}">
            ${this.renderDataCells(item)}
          </tr>
        `).join('')}
      `;
    }).join('');
  },
  
  loadDataMock() {
    const tbody = document.getElementById('ledger-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = this.getSkeletonRows();
    this.updateRecordCount(null);
    
    setTimeout(() => {
      const tb = document.getElementById('ledger-tbody');
      const rows = this.getFilteredRows();
      if (tb) tb.innerHTML = this.renderRows(rows);
      this.updateRecordCount(rows.length);
    }, 500);
  },

  updateRecordCount(count) {
    const countEl = document.getElementById('ledger-record-count');
    if (!countEl) return;
    countEl.textContent = count === null ? '单据统计中' : `当前 ${count} 条单据`;
  },

  refreshTable() {
    const table = document.getElementById('ledger-table');
    const thead = document.getElementById('ledger-thead');
    const tbody = document.getElementById('ledger-tbody');
    const rows = this.getFilteredRows();
    if (table) table.style.minWidth = `${Math.max(1360, this.getVisibleColumns().length * 132)}px`;
    if (thead) thead.innerHTML = this.renderTableHeader();
    if (tbody) tbody.innerHTML = this.renderRows(rows);
    this.updateRecordCount(rows.length);
  },

  syncFilterControls() {
    const setValue = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.value = value;
    };

    setValue('ledger-filter-keyword', this.filters.keyword);
    this.syncKeywordSearchControl();
  },

  readFilters() {
    const getValue = (id) => document.getElementById(id)?.value.trim() || '';
    this.filters = {
      year: getValue('ledger-filter-year') || '2026',
      month: getValue('ledger-filter-month') || '06',
      startMonth: this.selectedStartMonth,
      endMonth: this.selectedEndMonth,
      keyword: getValue('ledger-filter-keyword'),
      keywordField: this.filters.keywordField || 'all',
      org: {
        region: this.orgNavigator.region,
        office: this.orgNavigator.office,
        dealer: this.orgNavigator.dealer
      }
    };
    this.updateAdvancedFilterCount();
  },

  resetFilters() {
    this.filters = {
      year: '2026',
      month: '06',
      startMonth: `${this.getCurrentMonthValue().slice(0, 4)}-01`,
      endMonth: this.getCurrentMonthValue(),
      keyword: '',
      keywordField: 'all',
      org: {
        region: '',
        office: '',
        dealer: ''
      }
    };
    this.selectedStartMonth = this.filters.startMonth;
    this.selectedEndMonth = this.filters.endMonth;
    this.monthRangeError = '';
    this.orgNavigator = {
      region: '',
      office: '',
      dealer: ''
    };
    this.compoundFilters = [this.createCompoundFilter()];
    this.appliedCompoundFilters = [];
    this.compoundFiltersExpanded = false;
    this.syncFilterControls();
    this.renderCompoundFilterPanelIntoDom();
    this.updateCompoundFilterButton();
    this.renderOrgSelectorIntoDom();
    this.updateAdvancedFilterCount();
    this.loadDataMock();
  },

  renderOrgSelectorIntoDom() {
    const current = document.querySelector('.ledger-org-filter');
    if (current) current.outerHTML = this.renderOrgSelector();
  },

  handleOrgAction(target) {
    const action = target.dataset.orgAction;
    const level = target.dataset.orgLevel;
    const value = target.dataset.orgValue;

    if (action === 'all') {
      if (level === 'region') {
        this.orgNavigator = { region: '', office: '', dealer: '' };
      } else if (level === 'office') {
        this.orgNavigator.office = '';
        this.orgNavigator.dealer = '';
      } else if (level === 'dealer') {
        this.orgNavigator.dealer = '';
      }
      this.renderOrgSelectorIntoDom();
      this.updateAdvancedFilterCount();
      return;
    }

    if (!value) return;
    if (level === 'region') {
      this.orgNavigator.region = value;
      this.orgNavigator.office = '';
      this.orgNavigator.dealer = '';
    } else if (level === 'office') {
      this.orgNavigator.office = value;
      this.orgNavigator.dealer = '';
    } else if (level === 'dealer') {
      this.orgNavigator.dealer = value;
    }
    this.renderOrgSelectorIntoDom();
    this.updateAdvancedFilterCount();
  },

  toggleToolPanel(panelId, buttonId) {
    const panel = document.getElementById(panelId);
    const button = document.getElementById(buttonId);
    if (!panel || !button) return;

    const willOpen = panel.classList.contains('hidden');
    document.querySelectorAll('.ledger-tool-panel').forEach((item) => item.classList.add('hidden'));
    document.querySelectorAll('.ledger-table-tool-button').forEach((item) => item.setAttribute('aria-expanded', 'false'));
    panel.classList.toggle('hidden', !willOpen);
    button.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  },

  handleColumnToggle(input) {
    const key = input.dataset.ledgerColumn;
    if (!key) return;

    if (input.checked) {
      if (!this.visibleColumnKeys.includes(key)) this.visibleColumnKeys.push(key);
    } else if (this.visibleColumnKeys.length > 1) {
      this.visibleColumnKeys = this.visibleColumnKeys.filter((item) => item !== key);
    } else {
      input.checked = true;
      return;
    }
    this.saveColumnPreference();
    this.refreshTable();
  },

  resetColumnsToDefault() {
    this.visibleColumnKeys = [...LEDGER_DEFAULT_COLUMNS];
    this.saveColumnPreference();
    document.querySelectorAll('[data-ledger-column]').forEach((input) => {
      input.checked = this.visibleColumnKeys.includes(input.dataset.ledgerColumn);
    });
    this.refreshTable();
  },

  handleGroupChange(input) {
    this.groupBy = input.value;
    this.collapsedGroups = new Set();
    this.refreshTable();
  },

  handleGroupToggle(button) {
    const label = button.dataset.ledgerGroup;
    if (!label) return;
    if (this.collapsedGroups.has(label)) {
      this.collapsedGroups.delete(label);
    } else {
      this.collapsedGroups.add(label);
    }
    this.refreshTable();
  },

  getBatchFieldConfig(field) {
    return {
      storeCode: { label: '好丽友交易处编码', nameField: 'storeName' },
      productCode: { label: '好丽友产品编码', nameField: 'productName' },
      partnerErp: { label: '客户系统', nameField: '' }
    }[field] || { label: field, nameField: '' };
  },

  getBatchOptions(field, rows) {
    const options = new Map();
    rows.forEach((row) => {
      const value = String(row[field] || '').replace(field === 'partnerErp' ? /\s*ERP\s*$/i : /$^/, '').trim();
      if (!value) return;
      const current = options.get(value) || { value, label: value, count: 0 };
      current.count += 1;
      options.set(value, current);
    });
    return [...options.values()].sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, 'zh-CN'));
  },

  getBatchScopeItems(rows) {
    const items = [
      `时间范围：${this.formatMonthChinese(this.filters.startMonth)}—${this.formatMonthChinese(this.filters.endMonth)}`
    ];
    if (this.filters.keyword) {
      const label = this.keywordFieldOptions.find((item) => item.value === this.filters.keywordField)?.label || '全部字段';
      items.push(`关键字：${label}包含“${this.filters.keyword}”`);
    }
    if (this.filters.org.region) items.push(`区域：${this.filters.org.region}`);
    if (this.filters.org.office) items.push(`营业所：${this.filters.org.office}`);
    if (this.filters.org.dealer) items.push(`经销商：${this.filters.org.dealer}`);
    this.appliedCompoundFilters.forEach((condition, index) => {
      const label = this.compoundFilterFieldOptions.find((item) => item.value === condition.field)?.label || condition.field;
      items.push(`${index ? condition.relation : 'AND'} · ${label}包含“${condition.value}”`);
    });
    if (items.length === 1) items.push('其他条件：无');
    return { items, total: rows.length };
  },

  openBatchEditor(initialState = null) {
    const scopeRows = this.getFilteredRows();
    if (!scopeRows.length) {
      Dialog.toast('当前筛选范围内没有可修改的数据', 'warning');
      return;
    }
    const overlay = document.getElementById('overlay-container');
    const state = {
      field: initialState?.field || 'productCode',
      oldValue: initialState?.oldValue || '',
      newValue: initialState?.newValue || ''
    };
    const close = () => { overlay.innerHTML = ''; };
    const scope = this.getBatchScopeItems(scopeRows);
    overlay.innerHTML = `
        <div class="ledger-batch-backdrop">
          <section class="ledger-batch-drawer" role="dialog" aria-modal="true" aria-labelledby="ledger-batch-title">
            <header class="ledger-batch-head">
              <div>
                <span class="ledger-batch-eyebrow">范围锁定 · 智能替换</span>
                <h2 id="ledger-batch-title">批量修改</h2>
                <p>修改当前全部筛选结果，不受滚动位置或可见行限制。</p>
              </div>
              <button type="button" class="ledger-batch-close" aria-label="关闭"><i class="fa-solid fa-xmark"></i></button>
            </header>
            <div class="ledger-batch-body">
              <section class="ledger-batch-form-card">
                <label class="ledger-batch-field">
                  <span>修改字段</span>
                  <select id="ledger-batch-field">
                    <option value="productCode" ${state.field === 'productCode' ? 'selected' : ''}>好丽友产品编码</option>
                    <option value="storeCode" ${state.field === 'storeCode' ? 'selected' : ''}>好丽友交易处编码</option>
                    <option value="partnerErp" ${state.field === 'partnerErp' ? 'selected' : ''}>客户系统</option>
                  </select>
                </label>
                <div class="ledger-batch-replace-grid">
                  ${this.renderBatchSearchSelect('old', '原值', null, [], true)}
                  <span class="ledger-batch-arrow"><i class="fa-solid fa-arrow-right"></i></span>
                  ${this.renderBatchSearchSelect('new', '修改为', null, [], false)}
                </div>
              </section>
              <section class="ledger-batch-scope ledger-batch-scope-compact">
                <div class="ledger-batch-section-title">
                  <span><i class="fa-solid fa-filter"></i> 本次修改范围</span>
                  <strong>${scope.total} 条</strong>
                </div>
                <div class="ledger-batch-scope-chips">
                  ${scope.items.map((item) => `<span>${this.escapeHtml(item)}</span>`).join('')}
                </div>
                <p>实际影响条数将在下一步确认时展示。</p>
              </section>
            </div>
            <footer class="ledger-batch-actions">
              <button type="button" class="ledger-batch-cancel">取消</button>
              <button type="button" id="ledger-batch-next" disabled>确认</button>
            </footer>
          </section>
        </div>`;

    const getContext = () => {
      const oldOptions = this.getBatchOptions(state.field, scopeRows);
      const allNewOptions = this.getBatchOptions(state.field, this.getAllRows());
      if (!oldOptions.some((item) => item.value === state.oldValue)) state.oldValue = '';
      const newOptions = allNewOptions.filter((item) => item.value !== state.oldValue);
      if (!newOptions.some((item) => item.value === state.newValue)) state.newValue = '';
      const affectedRows = scopeRows.filter((row) => {
        const value = String(row[state.field] || '').replace(state.field === 'partnerErp' ? /\s*ERP\s*$/i : /$^/, '').trim();
        return value === state.oldValue;
      });
      return {
        oldOptions,
        newOptions,
        affectedRows,
        oldOption: oldOptions.find((item) => item.value === state.oldValue),
        newOption: newOptions.find((item) => item.value === state.newValue)
      };
    };

    const syncSearch = (kind, selected, options, showCount) => {
      const root = overlay.querySelector(`[data-batch-search="${kind}"]`);
      if (!root) return;
      const trigger = root.querySelector('.ledger-batch-search-trigger span');
      const optionList = root.querySelector('.ledger-batch-search-options');
      const input = root.querySelector('input');
      if (trigger) trigger.textContent = selected?.label || (kind === 'old' ? '请选择原值' : '请选择新值');
      if (input) input.value = '';
      if (optionList) {
        optionList.innerHTML = options.map((item) => `
          <button type="button" data-batch-value="${this.escapeHtml(item.value)}">
            <span>${this.escapeHtml(item.label)}</span>${showCount ? `<em>${item.count}条</em>` : ''}
          </button>`).join('');
        optionList.querySelectorAll('[data-batch-value]').forEach((button) => {
          button.addEventListener('click', () => {
            if (kind === 'old') {
              state.oldValue = button.dataset.batchValue;
              state.newValue = '';
            } else {
              state.newValue = button.dataset.batchValue;
            }
            root.querySelector('.ledger-batch-search-menu')?.classList.add('hidden');
            syncEditor();
          });
        });
      }
    };

    const syncEditor = () => {
      const context = getContext();
      syncSearch('old', context.oldOption, context.oldOptions, true);
      syncSearch('new', context.newOption, context.newOptions, false);
      const nextButton = overlay.querySelector('#ledger-batch-next');
      if (nextButton) nextButton.disabled = !state.oldValue || !state.newValue || !context.affectedRows.length;
    };

    overlay.querySelector('.ledger-batch-close')?.addEventListener('click', close);
    overlay.querySelector('.ledger-batch-cancel')?.addEventListener('click', close);
    overlay.querySelector('#ledger-batch-field')?.addEventListener('change', (event) => {
      state.field = event.target.value;
      state.oldValue = '';
      state.newValue = '';
      syncEditor();
    });
    ['old', 'new'].forEach((kind) => {
      const root = overlay.querySelector(`[data-batch-search="${kind}"]`);
      const menu = root?.querySelector('.ledger-batch-search-menu');
      root?.querySelector('.ledger-batch-search-trigger')?.addEventListener('click', () => menu?.classList.toggle('hidden'));
      root?.querySelector('input')?.addEventListener('input', (event) => {
        const keyword = event.target.value.trim().toLowerCase();
        root.querySelectorAll('[data-batch-value]').forEach((button) => {
          button.classList.toggle('hidden', !button.textContent.toLowerCase().includes(keyword));
        });
      });
    });
    overlay.querySelector('#ledger-batch-next')?.addEventListener('click', () => {
      const context = getContext();
      this.openBatchConfirmation({ ...state, scopeRows, ...context, scope });
    });
    syncEditor();
  },

  renderBatchSearchSelect(kind, label, selected, options, showCount) {
    return `
      <div class="ledger-batch-search" data-batch-search="${kind}">
        <label>${label}</label>
        <button type="button" class="ledger-batch-search-trigger" aria-expanded="false">
          <span>${this.escapeHtml(selected?.label || (kind === 'old' ? '请选择原值' : '请选择新值'))}</span><i class="fa-solid fa-chevron-down"></i>
        </button>
        <div class="ledger-batch-search-menu hidden">
          <div class="ledger-batch-search-input"><i class="fa-solid fa-magnifying-glass"></i><input type="search" placeholder="搜索编码或客户系统"></div>
          <div class="ledger-batch-search-options">
            ${options.map((item) => `<button type="button" data-batch-value="${this.escapeHtml(item.value)}"><span>${this.escapeHtml(item.label)}</span>${showCount ? `<em>${item.count}条</em>` : ''}</button>`).join('')}
          </div>
        </div>
      </div>`;
  },

  bindBatchSearchSelect(overlay, kind, options, onSelect) {
    const root = overlay.querySelector(`[data-batch-search="${kind}"]`);
    const menu = root?.querySelector('.ledger-batch-search-menu');
    root?.querySelector('.ledger-batch-search-trigger')?.addEventListener('click', () => menu?.classList.toggle('hidden'));
    root?.querySelector('input')?.addEventListener('input', (event) => {
      const keyword = event.target.value.trim().toLowerCase();
      root.querySelectorAll('[data-batch-value]').forEach((button) => {
        button.classList.toggle('hidden', !button.textContent.toLowerCase().includes(keyword));
      });
    });
    root?.querySelectorAll('[data-batch-value]').forEach((button) => {
      button.addEventListener('click', () => onSelect(button.dataset.batchValue));
    });
  },

  openBatchConfirmation(context) {
    const { field, oldValue, newValue, affectedRows, oldOption, newOption, scope } = context;
    const config = this.getBatchFieldConfig(field);
    const overlay = document.getElementById('overlay-container');
    overlay.innerHTML = `
      <div class="ledger-batch-backdrop">
        <section class="ledger-batch-confirm" role="alertdialog" aria-modal="true">
          <div class="ledger-batch-warning-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
          <h2>确认批量修改 ${affectedRows.length} 条数据？</h2>
          <p class="ledger-batch-confirm-lead">当前组合条件下共 <strong>${scope.total}</strong> 条数据，本次实际影响 <strong>${affectedRows.length}</strong> 条。</p>
          <div class="ledger-batch-confirm-scope">${scope.items.map((item) => `<span>${this.escapeHtml(item)}</span>`).join('')}</div>
          <div class="ledger-batch-diff">
            <small>${this.escapeHtml(config.label)}</small>
            <div><code>${this.escapeHtml(oldOption?.label || oldValue)}</code><i class="fa-solid fa-arrow-right"></i><code>${this.escapeHtml(newOption?.label || newValue)}</code></div>
          </div>
          <div class="ledger-batch-danger"><strong>此操作执行后不可回退</strong><span>修改范围包含所有符合上述时间及组合筛选条件的数据，不受当前可见范围限制。</span></div>
          <label class="ledger-batch-ack"><input id="ledger-batch-ack" type="checkbox"><span>我已核对筛选条件、影响数量和替换内容，并知晓修改后不可回退。</span></label>
          <footer><button type="button" id="ledger-batch-back">返回修改</button><button type="button" id="ledger-batch-confirm-action" disabled>确认修改 ${affectedRows.length} 条数据</button></footer>
        </section>
      </div>`;
    const checkbox = overlay.querySelector('#ledger-batch-ack');
    const confirm = overlay.querySelector('#ledger-batch-confirm-action');
    checkbox?.addEventListener('change', () => { confirm.disabled = !checkbox.checked; });
    overlay.querySelector('#ledger-batch-back')?.addEventListener('click', () => this.openBatchEditor({ field, oldValue, newValue }));
    confirm?.addEventListener('click', () => this.executeBatchEdit(context));
  },

  executeBatchEdit(context) {
    const { field, oldValue, newValue, affectedRows, scope } = context;
    affectedRows.forEach((row) => {
      const key = this.getLedgerRowKey(row);
      this.edits.set(key, { ...(this.edits.get(key) || {}), [field]: field === 'partnerErp' ? `${newValue} ERP` : newValue });
    });
    if (typeof SettingsView !== 'undefined' && Array.isArray(SettingsView.logs)) {
      const now = new Date();
      const pad = (value) => String(value).padStart(2, '0');
      SettingsView.logs.unshift({
        id: `log-batch-${Date.now()}`,
        time: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
        user: 'Aiden',
        account: 'aiden.pos',
        module: '台账与汇总',
        action: '批量修改',
        target: `${this.getBatchFieldConfig(field).label}（${affectedRows.length}条）`,
        detail: `${scope.items.join('；')}；${oldValue} → ${newValue}；影响${affectedRows.length}条；不可回退`,
        before: oldValue,
        after: newValue,
        ip: '127.0.0.1',
        device: 'Mac / Chrome',
        result: '成功'
      });
    }
    document.getElementById('overlay-container').innerHTML = '';
    this.refreshTable();
    Dialog.toast(`批量修改完成，已更新 ${affectedRows.length} 条数据，操作记录已写入系统日志`);
  },

  exportCurrentRows() {
    const rows = this.getFilteredRows();
    const columns = this.getVisibleColumns();
    const csvRows = [
      columns.map((column) => this.escapeCsv(column.label)),
      ...rows.map((item) => columns.map((column) => this.escapeCsv(column.value(item))))
    ];
    const csv = `\uFEFF${csvRows.map((row) => row.join(',')).join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `POS明细单据_${this.filters.startMonth}_${this.filters.endMonth}_${rows.length}条.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },

  escapeCsv(value) {
    const text = String(value ?? '');
    return `"${text.replaceAll('"', '""')}"`;
  },
  
  bindEvents() {
    this.syncFilterControls();
    this.loadDataMock();
    this.mountCompoundFilterPortal();

    document.getElementById('ledger-filter-panel')?.addEventListener('click', (event) => {
      const orgButton = event.target.closest('.ledger-org-chip');
      if (orgButton) this.handleOrgAction(orgButton);
    });
    this.bindCompoundFilterPanelEvents();

    document.getElementById('ledger-compound-filter-btn')?.addEventListener('click', (event) => {
      event.stopPropagation();
      this.compoundFiltersExpanded = !this.compoundFiltersExpanded;
      this.renderCompoundFilterPanelIntoDom();
      this.updateCompoundFilterButton();
    });

    const monthButton = document.getElementById('ledger-month-range-button');
    const monthPicker = document.getElementById('ledger-month-picker');
    if (monthPicker) monthPicker.onclick = (event) => {
      event.stopPropagation();
      const navButton = event.target.closest('[data-ledger-month-nav]');
      if (navButton && !navButton.disabled) {
        this.monthPickerViewYear += Number(navButton.dataset.ledgerMonthNav);
        monthPicker.innerHTML = this.renderLedgerMonthPicker();
        return;
      }
      const monthOption = event.target.closest('[data-ledger-month]');
      if (!monthOption || monthOption.disabled) return;
      const value = monthOption.dataset.ledgerMonth;
      if (!this.monthRangeSelectingEnd) {
        this.selectedStartMonth = value;
        this.selectedEndMonth = value;
        this.monthRangeError = '';
        this.monthRangeSelectingEnd = true;
        monthPicker.innerHTML = this.renderLedgerMonthPicker();
        return;
      }
      if (value < this.selectedStartMonth) {
        this.selectedStartMonth = value;
        this.selectedEndMonth = value;
        this.monthRangeError = '';
        monthPicker.innerHTML = this.renderLedgerMonthPicker();
        return;
      }
      this.selectedEndMonth = value;
      this.monthRangeSelectingEnd = false;
      this.monthRangeError = this.getSelectedMonthCount() > 24 ? '时间范围最多选择24个月' : '';
      const buttonLabel = monthButton?.querySelectorAll('span');
      if (buttonLabel?.[0]) buttonLabel[0].textContent = this.formatMonthChinese(this.selectedStartMonth);
      if (buttonLabel?.[2]) buttonLabel[2].textContent = this.formatMonthChinese(this.selectedEndMonth);
      monthButton?.classList.toggle('invalid', Boolean(this.monthRangeError));
      const errorEl = document.getElementById('ledger-month-range-error');
      if (errorEl) {
        errorEl.textContent = this.monthRangeError;
        errorEl.classList.toggle('hidden', !this.monthRangeError);
      }
      monthPicker.classList.add('hidden');
      monthButton?.setAttribute('aria-expanded', 'false');
    };

    if (monthButton) monthButton.onclick = (event) => {
      event.stopPropagation();
      const willOpen = monthPicker?.classList.contains('hidden');
      if (willOpen) {
        this.monthPickerViewYear = Number(this.selectedStartMonth.slice(0, 4));
        this.monthRangeSelectingEnd = false;
        monthPicker.innerHTML = this.renderLedgerMonthPicker();
      }
      monthPicker?.classList.toggle('hidden', !willOpen);
      monthButton.setAttribute('aria-expanded', String(willOpen));
    };
    if (this.monthPickerOutsideHandler) document.removeEventListener('click', this.monthPickerOutsideHandler);
    this.monthPickerOutsideHandler = (event) => {
      if (event.target.closest('.ledger-month-range-filter')) return;
      monthPicker?.classList.add('hidden');
      monthButton?.setAttribute('aria-expanded', 'false');
    };
    document.addEventListener('click', this.monthPickerOutsideHandler);

    if (!this.compoundPositionBound) {
      const repositionCompoundPanel = () => this.positionCompoundFilterPanel();
      window.addEventListener('resize', repositionCompoundPanel);
      window.addEventListener('scroll', repositionCompoundPanel, true);
      this.compoundPositionBound = true;
    }

    document.getElementById('ledger-search-field-btn')?.addEventListener('click', (event) => {
      event.stopPropagation();
      document.getElementById('ledger-search-field-dropdown')?.classList.toggle('hidden');
    });

    document.getElementById('ledger-search-field-dropdown')?.addEventListener('click', (event) => {
      const option = event.target.closest('[data-ledger-search-field]');
      if (!option) return;
      this.filters.keywordField = option.dataset.ledgerSearchField || 'all';
      this.syncKeywordSearchControl();
      document.getElementById('ledger-search-field-dropdown')?.classList.add('hidden');
    });

    const runLedgerSearch = () => {
      if (this.getSelectedMonthCount() > 24) {
        this.monthRangeError = '时间范围最多选择24个月，请重新选择';
        const errorEl = document.getElementById('ledger-month-range-error');
        if (errorEl) {
          errorEl.textContent = this.monthRangeError;
          errorEl.classList.remove('hidden');
        }
        monthButton?.classList.add('invalid');
        return;
      }
      this.readFilters();
      this.loadDataMock();
    };

    document.getElementById('ledger-filter-submit')?.addEventListener('click', runLedgerSearch);

    document.getElementById('ledger-filter-keyword')?.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      runLedgerSearch();
    });

    if (!this.searchDropdownCloseBound) {
      document.addEventListener('click', (event) => {
        const wrapper = document.getElementById('ledger-search-combo-wrapper');
        if (wrapper && !wrapper.contains(event.target)) {
          document.getElementById('ledger-search-field-dropdown')?.classList.add('hidden');
        }
      });
      this.searchDropdownCloseBound = true;
    }

    document.getElementById('ledger-filter-expand')?.addEventListener('click', () => {
      this.toggleAdvancedFilters();
    });

    document.getElementById('ledger-filter-reset')?.addEventListener('click', () => {
      this.resetFilters();
    });

    document.getElementById('ledger-table-card')?.addEventListener('click', (event) => {
      const columnButton = event.target.closest('#ledger-column-btn');
      const groupButton = event.target.closest('#ledger-group-btn');
      const groupToggle = event.target.closest('.ledger-group-toggle');
      const detailButton = event.target.closest('.ledger-detail-btn');
      const editButton = event.target.closest('.ledger-edit-btn');
      const saveButton = event.target.closest('.ledger-save-btn');
      const cancelButton = event.target.closest('.ledger-cancel-btn');
      if (event.target.closest('#ledger-column-reset')) {
        this.resetColumnsToDefault();
        return;
      }
      if (editButton) {
        const rowKey = editButton.getAttribute('data-ledger-key');
        const row = this.getFilteredRows().find(item => this.getLedgerRowKey(item) === rowKey);
        this.startInlineEdit(row);
        return;
      }
      if (saveButton) {
        this.saveInlineEdit(saveButton);
        return;
      }
      if (cancelButton) {
        this.cancelInlineEdit();
        return;
      }
      if (detailButton) {
        if (!this.hasLedgerPermission('查看') || !this.hasLedgerPermission('单据详情')) {
          Dialog.toast('当前账号无单据详情权限', 'warning');
          return;
        }
        const rowKey = detailButton.getAttribute('data-ledger-key');
        const row = this.getFilteredRows().find(item => this.getLedgerRowKey(item) === rowKey);
        if (row && typeof IngestionView !== 'undefined' && typeof IngestionView.openDocumentDetail === 'function') {
          IngestionView.openDocumentDetail({
            moduleName: '台账与汇总 - 标准POS门店列表',
            currentNode: '台账与汇总',
            title: row.storeName,
            nameLabel: '门店名称',
            statusText: '已入账',
            row,
            moduleFields: [
              { label: '时间', value: row.transactionDate || '-' },
              { label: '客户系统', value: String(row.partnerErp || '-').replace(/\s*ERP\s*$/i, '') || '-' },
              { label: '经销商', value: row.dealer || '-' },
              { label: '客户门店号', value: row.customerStoreNo || '-' },
              { label: '原始交易出码', value: row.rawTransactionCode || '-' },
              { label: '客户门店名称', value: row.customerStoreName || '-' },
              { label: 'TEAM', value: row.salesTeam || '-' },
              { label: '区域', value: row.fullRegion || '-' },
              { label: '营业所', value: row.salesOffice || '-' },
              { label: 'ACC', value: row.acc || '-' },
              { label: '好丽友交易处编码', value: row.storeCode || '-' },
              { label: '好丽友交易处名称', value: row.storeName || '-' },
              { label: '客户产品号', value: row.customerProductCode || '-' },
              { label: '客户产品名称', value: row.customerProductName || '-' },
              { label: '客户条形码', value: row.customerBarcode || '-' },
              { label: '好丽友产品编码', value: row.productCode || '-' },
              { label: '好丽友条形码', value: row.barcode || '-' },
              { label: '好丽友产品名称', value: row.productName || '-' },
              { label: '销售数量', value: String(row.quantity || '-') },
              { label: '销售金额', value: `￥${row.amount || '-'}` },
              { label: '成本', value: `￥${row.cost || '-'}` },
              { label: '零售单价', value: `￥${row.retailPrice || '-'}` }
            ]
          });
        }
        return;
      }
      if (columnButton) {
        this.toggleToolPanel('ledger-column-panel', 'ledger-column-btn');
        return;
      }
      if (groupButton) {
        this.toggleToolPanel('ledger-group-panel', 'ledger-group-btn');
        return;
      }
      if (event.target.closest('#ledger-export-btn')) {
        if (!this.hasLedgerPermission('导出')) {
          Dialog.toast('当前账号无导出权限', 'warning');
          return;
        }
        this.exportCurrentRows();
        return;
      }
      if (event.target.closest('#ledger-batch-edit-btn')) {
        this.openBatchEditor();
        return;
      }
      if (groupToggle) {
        this.handleGroupToggle(groupToggle);
      }
    });

    document.getElementById('ledger-table-card')?.addEventListener('change', (event) => {
      const columnInput = event.target.closest('[data-ledger-column]');
      const groupInput = event.target.closest('input[name="ledger-group-by"]');
      if (columnInput) {
        this.handleColumnToggle(columnInput);
      } else if (groupInput) {
        this.handleGroupChange(groupInput);
      }
    });

    if (!this.closePanelsBound) {
      document.addEventListener('click', (event) => {
        if (event.target.closest('.ledger-tool-popover-wrap')) return;
        document.querySelectorAll('.ledger-tool-panel').forEach((item) => item.classList.add('hidden'));
        document.querySelectorAll('.ledger-table-tool-button').forEach((item) => item.setAttribute('aria-expanded', 'false'));
      });
      this.closePanelsBound = true;
    }
  }
};

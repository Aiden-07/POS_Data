const LEDGER_DEFAULT_COLUMNS = [
  'transactionDate', 'dealerName', 'team', 'region', 'salesOffice', 'acc',
  'orionStoreCode', 'orionStoreName', 'orionProductCode', 'orionBarcode',
  'orionProductName', 'quantity', 'amount', 'cost', 'retailPrice'
];

const LedgerView = {
  edits: new Map(),
  filters: {
    year: '2026',
    month: '06',
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

  tableColumns: [
    { key: 'transactionDate', label: '时间', width: 'w-28', value: (item) => item.transactionDate },
    { key: 'partnerErp', label: '合作方ERP', width: 'w-32', value: (item) => item.partnerErp },
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
          <div class="ledger-filter-line">
            <div class="ledger-filter-label">选择时间</div>
            <div class="ledger-filter-content ledger-time-controls">
              <span class="ledger-filter-icon"><i class="fa-regular fa-calendar"></i></span>
              <select id="ledger-filter-year" class="ledger-inline-select">
                <option value="2026">2026年</option>
                <option value="2025">2025年</option>
                <option value="2024">2024年</option>
              </select>
              <select id="ledger-filter-month" class="ledger-inline-select">
                ${Array.from({ length: 12 }, (_, index) => {
                  const value = String(index + 1).padStart(2, '0');
                  return `<option value="${value}">${index + 1}月</option>`;
                }).join('')}
              </select>
            </div>
          </div>
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
    if (this.filters.year !== '2026' || this.filters.month !== '06') count += 1;
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
          ${this.renderOrgOptionRow('区域', 'region', regions, region)}
          ${region ? this.renderOrgOptionRow('营业所', 'office', offices, office) : ''}
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
        partnerErp: `${row.dealer.replace(/商贸|商业|集团|有限公司/g, '')}ERP`,
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
    return this.standardData.flatMap((row) => this.getStandardPreviewRows(row)).map((item) => ({
      ...item,
      ...(this.edits.get(this.getLedgerRowKey(item)) || {})
    }));
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

    return this.getAllRows().filter((item) => {
      const monthMatch = item.month === `${filters.year}年${filters.month}月`;
      const regionMatch = !filters.org.region || item.fullRegion === filters.org.region;
      const officeMatch = !filters.org.office || item.salesOffice === filters.org.office;
      const orgDealerMatch = !filters.org.dealer || item.dealer === filters.org.dealer;
      const keywordMatch = matchesKeyword(item);
      return monthMatch && regionMatch && officeMatch && orgDealerMatch && keywordMatch;
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
      <tr class="hover:bg-slate-50 transition-colors">
        ${this.renderDataCells(item)}
      </tr>
    `).join('');
  },

  getLedgerRowKey(item) {
    return [
      item.month,
      item.storeCode,
      item.productCode || item.barcode,
      item.productName
    ].join('|');
  },

  renderDataCells(item) {
    const cells = this.getVisibleColumns().map((column) => {
      const value = column.value(item);
      const classes = ['px-4', 'py-3'];
      if (column.align === 'right') classes.push('text-right');
      if (column.mono) classes.push('font-mono', 'text-xs', 'text-[#1d2129]');
      if (column.truncate) classes.push('truncate');
      if (['dealerName', 'customerStoreName', 'orionStoreName', 'customerProductName', 'orionProductName'].includes(column.key)) classes.push('max-w-[220px]');
      const title = column.truncate ? ` title="${this.escapeHtml(value)}"` : '';
      return `<td class="${classes.join(' ')}"${title}>${this.escapeHtml(value)}</td>`;
    }).join('');
    return `${cells}
      <td class="px-4 py-3">
        <div class="flex items-center gap-1">
        <button type="button" class="ledger-detail-btn px-2 py-1 text-xs rounded text-brand hover:bg-blue-50 transition-colors" data-ledger-key="${this.escapeHtml(this.getLedgerRowKey(item))}" title="单据详情">
          <i class="fa-solid fa-list-check"></i>
        </button>
        ${this.hasLedgerPermission('编辑') ? `<button type="button" class="ledger-edit-btn px-2 py-1 text-xs rounded text-amber-500 hover:bg-amber-50 transition-colors" data-ledger-key="${this.escapeHtml(this.getLedgerRowKey(item))}" title="编辑"><i class="fa-regular fa-pen-to-square"></i></button>` : ''}
        </div>
      </td>
    `;
  },

  openLedgerEditDialog(row) {
    if (!row || !this.hasLedgerPermission('编辑')) {
      Dialog.toast('当前账号无编辑权限', 'warning');
      return;
    }
    const key = this.getLedgerRowKey(row);
    Dialog.show({
      title: '编辑标准POS明细',
      content: `<div class="grid grid-cols-2 gap-3 text-left"><label class="text-sm">销售数量<input id="ledger-edit-quantity" type="number" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2" value="${this.escapeHtml(row.quantity)}"></label><label class="text-sm">销售金额<input id="ledger-edit-amount" type="number" step="0.1" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2" value="${this.escapeHtml(row.amount)}"></label><label class="text-sm">销售成本<input id="ledger-edit-cost" type="number" step="0.1" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2" value="${this.escapeHtml(row.cost)}"></label><label class="text-sm">零售价<input id="ledger-edit-price" type="number" step="0.1" class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2" value="${this.escapeHtml(row.retailPrice)}"></label></div>`,
      confirmText: '保存', cancelText: '取消',
      onConfirm: () => {
        this.edits.set(key, {
          quantity: document.getElementById('ledger-edit-quantity')?.value || row.quantity,
          amount: document.getElementById('ledger-edit-amount')?.value || row.amount,
          cost: document.getElementById('ledger-edit-cost')?.value || row.cost,
          retailPrice: document.getElementById('ledger-edit-price')?.value || row.retailPrice
        });
        this.refreshTable();
        Dialog.toast('标准POS明细已保存', 'success');
      }
    });
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
          <tr class="hover:bg-slate-50 transition-colors">
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

    setValue('ledger-filter-year', this.filters.year);
    setValue('ledger-filter-month', this.filters.month);
    setValue('ledger-filter-keyword', this.filters.keyword);
    this.syncKeywordSearchControl();
  },

  readFilters() {
    const getValue = (id) => document.getElementById(id)?.value.trim() || '';
    this.filters = {
      year: getValue('ledger-filter-year') || '2026',
      month: getValue('ledger-filter-month') || '06',
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
      keyword: '',
      keywordField: 'all',
      org: {
        region: '',
        office: '',
        dealer: ''
      }
    };
    this.orgNavigator = {
      region: '',
      office: '',
      dealer: ''
    };
    this.syncFilterControls();
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
    link.download = `POS明细单据_${this.filters.year}${this.filters.month}_${rows.length}条.csv`;
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

    document.getElementById('ledger-filter-panel')?.addEventListener('click', (event) => {
      const orgButton = event.target.closest('.ledger-org-chip');
      if (orgButton) this.handleOrgAction(orgButton);
    });

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

    document.getElementById('ledger-filter-submit')?.addEventListener('click', () => {
      this.readFilters();
      this.loadDataMock();
    });

    document.getElementById('ledger-filter-keyword')?.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      this.readFilters();
      this.loadDataMock();
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
      if (event.target.closest('#ledger-column-reset')) {
        this.resetColumnsToDefault();
        return;
      }
      if (editButton) {
        const rowKey = editButton.getAttribute('data-ledger-key');
        const row = this.getFilteredRows().find(item => this.getLedgerRowKey(item) === rowKey);
        this.openLedgerEditDialog(row);
        return;
      }
      if (detailButton) {
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
              { label: '合作方ERP', value: row.partnerErp || '-' },
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

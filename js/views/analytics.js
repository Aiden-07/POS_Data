const AnalyticsView = {
  activeTab: 'store-mapping',
  tabs: [
    ['store-mapping', '门店对照表'],
    ['monthly-store', '月度门店'],
    ['field-list', '字段列表'],
    ['store-submission-monitor', '门店提交监控']
  ],
  searchField: 'all',
  searchKeyword: '',
  mappingSearchField: 'all',
  mappingSearchKeyword: '',
  selectedMappingStatus: 'all',
  appliedMappingStatus: 'all',
  selectedMappingMonth: '',
  appliedMappingMonth: '',
  mappingMonthViewYear: 0,
  mappingHierarchyFilter: { teams: [], regions: [], offices: [] },
  appliedMappingHierarchyFilter: { teams: [], regions: [], offices: [] },
  mappingHierarchyHover: { team: '', region: '' },
  mappingTabStates: {},
  fieldListSearchField: 'all',
  fieldListSearchKeyword: '',
  appliedFieldListSearchField: 'all',
  appliedFieldListSearchKeyword: '',
  selectedFieldListMonth: '',
  appliedFieldListMonth: '',
  fieldListMonthViewYear: 0,
  selectedStartMonth: '',
  selectedEndMonth: '',
  appliedStartMonth: '',
  appliedEndMonth: '',
  selectedSubmissionStatus: 'all',
  appliedSubmissionStatus: 'all',
  monthPickerViewYear: 0,
  monthRangeSelectingEnd: false,
  monthRangeError: '',
  baseStores: [
    { name: '保定市聚昊商贸有限公司', code: 'S0091005', acc: '华北重点客户', submitted: [1, 2, 3, 5, 6, 8, 9, 11] },
    { name: '多客隆购物中心（会盟大街）', code: 'S0219489', acc: '华中商超渠道', submitted: [1, 2, 4, 5, 7, 8, 10, 12] },
    { name: '邯郸市格耀商贸有限公司', code: 'F0807952', acc: '华北经销渠道', submitted: [1, 3, 4, 5, 6, 9, 10, 11] },
    { name: '韩百（韩百商场）', code: 'S1018566', acc: '东北重点客户', submitted: [1, 2, 3, 4, 6, 7, 8, 12] },
    { name: '家得乐（新民友谊商城）', code: 'S0210780', acc: '东北商超渠道', submitted: [1, 2, 4, 5, 6, 8, 9, 10] },
    { name: '家家乐超市（大市场）', code: 'F0514986', acc: '华东经销渠道', submitted: [2, 3, 4, 5, 7, 9, 11, 12] },
    { name: '利好果蔬生活广场（鞍山腾鳌店）', code: 'F0714211', acc: '东北生鲜渠道', submitted: [1, 2, 3, 4, 5, 6, 7, 8] },
    { name: '台安家得乐超市', code: 'F0775134', acc: '东北商超渠道', submitted: [1, 3, 4, 6, 7, 9, 10, 12] },
    { name: '利好生活广场（太和）', code: 'F0872160', acc: '华北重点客户', submitted: [2, 3, 5, 6, 8, 9, 10, 11] },
    { name: '中心城大卖场（金鼎）', code: 'F0888730', acc: '华北商超渠道', submitted: [1, 2, 3, 4, 5, 6, 10, 12] },
    { name: '欧亚长青城（浑南中路）', code: 'F0515524', acc: '东北重点客户', submitted: [1, 2, 4, 5, 6, 7, 9, 11] },
    { name: '旺鲜生八佰伴店', code: 'S0282108', acc: '华东生鲜渠道', submitted: [1, 3, 4, 5, 6, 8, 10, 12] }
  ],

  getStores() {
    const regions = ['沈阳', '大连', '鞍山', '锦州', '长春', '哈尔滨', '北京', '天津', '石家庄', '济南', '青岛', '南京', '苏州', '杭州', '合肥', '武汉', '郑州', '长沙', '西安'];
    const storeTypes = ['万家购物中心', '优选生活广场', '城市精品超市', '惠民生鲜店', '悦享购物广场'];
    const accTypes = ['华北重点客户', '华中商超渠道', '华北经销渠道', '东北重点客户', '东北商超渠道', '华东经销渠道', '东北生鲜渠道', '华东生鲜渠道'];
    const generatedStores = Array.from({ length: 38 }, (_, index) => {
      const serial = index + 13;
      return {
        name: `${regions[index % regions.length]}${storeTypes[index % storeTypes.length]}${serial}店`,
        code: `${index % 3 === 0 ? 'F' : 'S'}${String(3100000 + serial * 1379).padStart(7, '0')}`,
        acc: accTypes[index % accTypes.length],
        submitted: Array.from({ length: 12 }, (_, monthIndex) => monthIndex + 1)
          .filter((month) => (month + serial) % 4 !== 0)
      };
    });
    return [...this.baseStores, ...generatedStores];
  },

  getStoreMappings() {
    const systems = ['河北聚昊', '沈阳欧亚', '上海煊超供应链', '武汉多客隆', '西安家乐惠', '广州利好'];
    const headquarters = ['华北 Team', '东北 Team', '华东 Team', '华中 Team', '西北 Team', '华南 Team'];
    const regions = ['华北区域', '东北区域', '华东区域', '华中区域', '西北区域', '华南区域'];
    const offices = ['石家庄营业所', '沈阳营业所', '上海营业所', '武汉营业所', '西安营业所', '广州营业所'];
    const monthValue = this.appliedMappingMonth || this.getCurrentMonthValue();
    const [snapshotYear, snapshotMonth] = monthValue.split('-').map(Number);
    const stores = this.getStores();
    return stores.map((store, index) => {
      const matched = (index + snapshotYear + snapshotMonth) % 4 !== 1;
      const missingCustomerIdentity = (index >= 8 && index <= 12) || (index >= 18 && index <= 21);
      const serial = String(index + 1).padStart(4, '0');
      const distributedIndex = (index * 17 + snapshotMonth * 7 + snapshotYear) % stores.length;
      return {
        customerSystem: missingCustomerIdentity ? '' : systems[(index * 5 + snapshotMonth) % systems.length],
        customerStoreCode: missingCustomerIdentity ? '' : `C${String(9001000 + distributedIndex + 1)}`,
        customerTransactionCode: `${index % 3 === 0 ? 'F' : 'S'}${String(7000000 + (index + 1) * 913)}`,
        customerTransactionName: store.name.replace(/有限公司/g, '').replace(/[（）]/g, ''),
        acc: matched ? store.acc : '',
        orionTransactionCode: matched ? store.code : '',
        orionTransactionName: matched ? store.name : '',
        headquarters: matched ? headquarters[index % headquarters.length] : '',
        region: matched ? regions[index % regions.length] : '',
        salesOffice: matched ? offices[index % offices.length] : '',
        status: matched ? 'matched' : 'unmatched',
        operationTime: matched ? `${snapshotYear}-${String(snapshotMonth).padStart(2, '0')}-${String((index % 25) + 1).padStart(2, '0')} ${String(8 + index % 10).padStart(2, '0')}:${String(index * 7 % 60).padStart(2, '0')}:${String(index * 13 % 60).padStart(2, '0')}` : '',
        serial
      };
    });
  },

  getDeduplicatedStoreMappings() {
    const uniqueRows = new Map();
    this.getStoreMappings().forEach((row) => {
      const key = [
        row.customerSystem,
        row.customerStoreCode,
        row.customerTransactionName
      ].map((value) => String(value || '').trim().toLowerCase()).join('||');
      const existing = uniqueRows.get(key);
      if (!existing) {
        uniqueRows.set(key, row);
        return;
      }
      const shouldReplace = (
        (existing.status !== 'matched' && row.status === 'matched')
        || (
          existing.status === row.status
          && String(row.operationTime || '') > String(existing.operationTime || '')
        )
      );
      if (shouldReplace) uniqueRows.set(key, row);
    });
    return [...uniqueRows.values()];
  },

  getMappingSearchOptions() {
    return [
      ['all', '全部'],
      ['customerSystem', '客户系统'],
      ['customerStoreCode', '客户门店号'],
      ['customerTransactionCode', '客户交易处编码'],
      ['customerTransactionName', '客户交易处名称'],
      ['acc', 'ACC'],
      ['orionTransactionCode', '好丽友交易处编码'],
      ['orionTransactionName', '好丽友交易处名称']
    ];
  },

  getFieldListSearchOptions() {
    return [
      ['all', '全部'],
      ['acc', 'ACC'],
      ['orionTransactionCode', '好丽友交易处编码'],
      ['orionTransactionName', '好丽友交易处名称']
    ];
  },

  getFieldListRows() {
    const monthValue = this.appliedFieldListMonth || this.getCurrentMonthValue();
    const [snapshotYear, snapshotMonth] = monthValue.split('-').map(Number);
    return this.getStores().map((store, index) => {
      const baseSeed = Number(String(store.code).replace(/\D/g, '')) || index + 1;
      const fieldSeed = baseSeed + snapshotYear + snapshotMonth;
      const initialDateDimension = index % 3 === 0 ? '月度' : '日度';
      const dateDimension = fieldSeed % 5 === 0
        ? (initialDateDimension === '日度' ? '月度' : '日度')
        : initialDateDimension;
      return {
        acc: store.acc,
        orionTransactionCode: store.code,
        orionTransactionName: store.name,
        initialDateDimension,
        dateDimension,
        initialSalesQuantity: baseSeed % 9 !== 0,
        customerStoreCode: fieldSeed % 5 !== 0,
        customerStoreName: fieldSeed % 7 !== 0,
        customerProductCode: fieldSeed % 4 !== 0,
        customerProductName: fieldSeed % 6 !== 0,
        customerBarcode: fieldSeed % 8 !== 0,
        salesQuantity: fieldSeed % 9 !== 0,
        salesAmount: fieldSeed % 10 !== 0,
        retailCost: fieldSeed % 11 !== 0
      };
    });
  },

  getFilteredFieldListRows() {
    const keyword = this.appliedFieldListSearchKeyword.trim().toLowerCase();
    return this.getFieldListRows().filter((row) => {
      if (!keyword) return true;
      const fields = this.appliedFieldListSearchField === 'all'
        ? ['acc', 'orionTransactionCode', 'orionTransactionName']
        : [this.appliedFieldListSearchField];
      return fields.some((field) => String(row[field] || '').toLowerCase().includes(keyword));
    });
  },

  renderFieldAvailability(value) {
    return value
      ? '<span class="analytics-field-present" title="字段有值">●</span>'
      : '<span class="analytics-field-missing" title="字段无值">×</span>';
  },

  getFieldListRemarkChanges(row) {
    const changes = [];
    if (row.initialDateDimension !== row.dateDimension) {
      changes.push({
        label: '日期维度',
        before: row.initialDateDimension,
        after: row.dateDimension
      });
    }
    if (row.initialSalesQuantity !== row.salesQuantity) {
      changes.push({
        label: '销售数量',
        before: row.initialSalesQuantity ? '有' : '无',
        after: row.salesQuantity ? '有' : '无'
      });
    }
    return changes;
  },

  renderFieldListRemark(row) {
    const changes = this.getFieldListRemarkChanges(row);
    if (!changes.length) return '<span class="analytics-field-remark-empty">—</span>';
    return `
      <div class="analytics-field-remark">
        ${changes.map((change) => `
          <div class="analytics-field-change">
            <span class="analytics-field-change-label">${change.label}：</span>
            <span class="analytics-field-change-before">${change.before}</span>
            <i class="fa-solid fa-arrow-right-long" aria-hidden="true"></i>
            <span class="analytics-field-change-after">${change.after}</span>
          </div>
        `).join('')}
      </div>`;
  },

  renderFieldListMonthPicker() {
    const currentMonth = this.getCurrentMonthValue();
    const currentYear = new Date().getFullYear();
    const selectedYear = Number(this.selectedFieldListMonth.slice(0, 4)) || currentYear;
    const year = Math.min(Math.max(this.fieldListMonthViewYear || selectedYear, 2000), currentYear);
    this.fieldListMonthViewYear = year;
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    return `
      <div class="mapping-month-picker-header">
        <button type="button" data-field-list-month-nav="-1" aria-label="上一年"><i class="fa-solid fa-angles-left"></i></button>
        <strong>${year}年</strong>
        <button type="button" data-field-list-month-nav="1" aria-label="下一年" ${year >= currentYear ? 'disabled' : ''}><i class="fa-solid fa-angles-right"></i></button>
      </div>
      <div class="analytics-month-grid">
        ${monthNames.map((name, index) => {
          const value = `${year}-${String(index + 1).padStart(2, '0')}`;
          return `<button type="button" class="analytics-month-option ${value === this.selectedFieldListMonth ? 'selected' : ''}" data-field-list-month="${value}" ${value > currentMonth ? 'disabled' : ''} aria-label="${year}年${index + 1}月">${name}</button>`;
        }).join('')}
      </div>`;
  },

  getMappingHierarchyOptions() {
    const rows = this.getStoreMappings().filter((row) => row.status === 'matched');
    const activeTeam = this.mappingHierarchyHover.team || this.mappingHierarchyFilter.teams[0] || '';
    const activeRegion = this.mappingHierarchyHover.region || this.mappingHierarchyFilter.regions[0] || '';
    const teamRows = activeTeam ? rows.filter((row) => row.headquarters === activeTeam) : [];
    const regionRows = activeRegion ? teamRows.filter((row) => row.region === activeRegion) : [];
    return {
      teams: [...new Set(rows.map((row) => row.headquarters).filter(Boolean))],
      regions: [...new Set(teamRows.map((row) => row.region).filter(Boolean))],
      offices: [...new Set(regionRows.map((row) => row.salesOffice).filter(Boolean))],
      activeTeam,
      activeRegion
    };
  },

  renderMappingHierarchyGroup(title, items, selected, className, emptyText, activeValue = '') {
    return `
      <div class="mapping-org-column">
        <div class="mapping-org-column-head"><strong>${title}</strong><span>${selected.length ? `已选 ${selected.length}` : '全部'}</span></div>
        <div class="mapping-org-options">
          ${items.length ? items.map((item) => `
            <label class="${activeValue === item ? 'active' : ''}" data-mapping-org-value="${item}">
              <input type="checkbox" class="${className}" value="${item}" ${selected.includes(item) ? 'checked' : ''}>
              <span>${item}</span>
            </label>`).join('') : `<div class="mapping-org-empty">${emptyText}</div>`}
        </div>
      </div>`;
  },

  renderMappingHierarchyDropdown() {
    const options = this.getMappingHierarchyOptions();
    const columns = 1 + (options.activeTeam ? 1 : 0) + (options.activeRegion ? 1 : 0);
    return `
      <div class="mapping-org-grid" style="grid-template-columns:repeat(${columns}, minmax(180px, 1fr))">
        ${this.renderMappingHierarchyGroup('一级：本部Team', options.teams, this.mappingHierarchyFilter.teams, 'mapping-team-checkbox', '暂无本部Team', options.activeTeam)}
        ${options.activeTeam ? this.renderMappingHierarchyGroup('二级：区域', options.regions, this.mappingHierarchyFilter.regions, 'mapping-region-checkbox', '暂无区域', options.activeRegion) : ''}
        ${options.activeRegion ? this.renderMappingHierarchyGroup('三级：营业所', options.offices, this.mappingHierarchyFilter.offices, 'mapping-office-checkbox', '暂无营业所') : ''}
      </div>`;
  },

  getMappingHierarchyLabel() {
    const filter = this.mappingHierarchyFilter;
    const count = filter.teams.length + filter.regions.length + filter.offices.length;
    if (filter.offices.length === 1) return filter.offices[0];
    if (filter.regions.length === 1 && !filter.offices.length) return filter.regions[0];
    if (filter.teams.length === 1 && !filter.regions.length && !filter.offices.length) return filter.teams[0];
    return count ? `已选 ${count} 项` : '全部 Team';
  },

  renderMappingMonthPicker() {
    const currentMonth = this.getCurrentMonthValue();
    const currentYear = new Date().getFullYear();
    const year = Math.min(Math.max(this.mappingMonthViewYear || Number(this.selectedMappingMonth.slice(0, 4)), 2000), currentYear);
    this.mappingMonthViewYear = year;
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    return `
      <div class="mapping-month-picker-header">
        <button type="button" data-mapping-month-nav="-1" aria-label="上一年"><i class="fa-solid fa-angles-left"></i></button>
        <strong>${year}年</strong>
        <button type="button" data-mapping-month-nav="1" aria-label="下一年" ${year >= currentYear ? 'disabled' : ''}><i class="fa-solid fa-angles-right"></i></button>
      </div>
      <div class="analytics-month-grid">
        ${monthNames.map((name, index) => {
          const value = `${year}-${String(index + 1).padStart(2, '0')}`;
          return `<button type="button" class="analytics-month-option ${value === this.selectedMappingMonth ? 'selected' : ''}" data-mapping-month="${value}" ${value > currentMonth ? 'disabled' : ''} aria-label="${year}年${index + 1}月">${name}</button>`;
        }).join('')}
      </div>
    `;
  },

  getFilteredStoreMappings() {
    const keyword = this.mappingSearchKeyword.trim().toLowerCase();
    const fields = ['customerSystem', 'customerStoreCode', 'customerTransactionCode', 'customerTransactionName', 'acc', 'orionTransactionCode', 'orionTransactionName'];
    return this.getDeduplicatedStoreMappings().filter((row) => {
      if (this.appliedMappingStatus !== 'all' && row.status !== this.appliedMappingStatus) return false;
      const org = this.appliedMappingHierarchyFilter;
      if (org.teams.length && !org.teams.includes(row.headquarters)) return false;
      if (org.regions.length && !org.regions.includes(row.region)) return false;
      if (org.offices.length && !org.offices.includes(row.salesOffice)) return false;
      const searchableFields = this.mappingSearchField === 'all' ? fields : [this.mappingSearchField];
      return !keyword || searchableFields.some((field) => String(row[field] || '').toLowerCase().includes(keyword));
    });
  },

  getCurrentMonthValue() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  },

  isMappingTab(tab = this.activeTab) {
    return tab === 'store-mapping' || tab === 'monthly-store';
  },

  saveMappingTabState(tab = this.activeTab) {
    if (!this.isMappingTab(tab)) return;
    this.mappingTabStates[tab] = {
      mappingSearchField: this.mappingSearchField,
      mappingSearchKeyword: this.mappingSearchKeyword,
      selectedMappingStatus: this.selectedMappingStatus,
      appliedMappingStatus: this.appliedMappingStatus,
      selectedMappingMonth: this.selectedMappingMonth,
      appliedMappingMonth: this.appliedMappingMonth,
      mappingMonthViewYear: this.mappingMonthViewYear,
      mappingHierarchyFilter: {
        teams: [...this.mappingHierarchyFilter.teams],
        regions: [...this.mappingHierarchyFilter.regions],
        offices: [...this.mappingHierarchyFilter.offices]
      },
      appliedMappingHierarchyFilter: {
        teams: [...this.appliedMappingHierarchyFilter.teams],
        regions: [...this.appliedMappingHierarchyFilter.regions],
        offices: [...this.appliedMappingHierarchyFilter.offices]
      },
      mappingHierarchyHover: { ...this.mappingHierarchyHover }
    };
  },

  loadMappingTabState(tab) {
    if (!this.isMappingTab(tab)) return;
    const currentMonth = this.getCurrentMonthValue();
    const state = this.mappingTabStates[tab] || {
      mappingSearchField: 'all',
      mappingSearchKeyword: '',
      selectedMappingStatus: 'all',
      appliedMappingStatus: 'all',
      selectedMappingMonth: currentMonth,
      appliedMappingMonth: currentMonth,
      mappingMonthViewYear: Number(currentMonth.slice(0, 4)),
      mappingHierarchyFilter: { teams: [], regions: [], offices: [] },
      appliedMappingHierarchyFilter: { teams: [], regions: [], offices: [] },
      mappingHierarchyHover: { team: '', region: '' }
    };
    this.mappingSearchField = state.mappingSearchField;
    this.mappingSearchKeyword = state.mappingSearchKeyword;
    this.selectedMappingStatus = state.selectedMappingStatus;
    this.appliedMappingStatus = state.appliedMappingStatus;
    this.selectedMappingMonth = state.selectedMappingMonth;
    this.appliedMappingMonth = state.appliedMappingMonth;
    this.mappingMonthViewYear = state.mappingMonthViewYear;
    this.mappingHierarchyFilter = {
      teams: [...state.mappingHierarchyFilter.teams],
      regions: [...state.mappingHierarchyFilter.regions],
      offices: [...state.mappingHierarchyFilter.offices]
    };
    this.appliedMappingHierarchyFilter = {
      teams: [...state.appliedMappingHierarchyFilter.teams],
      regions: [...state.appliedMappingHierarchyFilter.regions],
      offices: [...state.appliedMappingHierarchyFilter.offices]
    };
    this.mappingHierarchyHover = { ...state.mappingHierarchyHover };
  },

  getDefaultMonthRange() {
    const currentMonth = this.getCurrentMonthValue();
    return {
      start: `${currentMonth.slice(0, 4)}-01`,
      end: currentMonth
    };
  },

  getMonthRange(startValue, endValue) {
    const [startYear, startMonth] = startValue.split('-').map(Number);
    const [endYear, endMonth] = endValue.split('-').map(Number);
    const months = [];
    let year = startYear;
    let month = startMonth;
    while (year < endYear || (year === endYear && month <= endMonth)) {
      months.push({
        value: `${year}-${String(month).padStart(2, '0')}`,
        year,
        month,
        label: `${year}年${month}月`
      });
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }
    return months;
  },

  getAppliedMonths() {
    const defaults = this.getDefaultMonthRange();
    return this.getMonthRange(
      this.appliedStartMonth || defaults.start,
      this.appliedEndMonth || defaults.end
    );
  },

  getSelectedMonthCount() {
    if (!this.selectedStartMonth || !this.selectedEndMonth || this.selectedStartMonth > this.selectedEndMonth) return 0;
    return this.getMonthRange(this.selectedStartMonth, this.selectedEndMonth).length;
  },

  isStoreSubmitted(store, year, month) {
    const currentYear = new Date().getFullYear();
    if (year === currentYear) return store.submitted.includes(month);
    const codeNumber = Number(store.code.replace(/\D/g, '')) || 0;
    return (codeNumber + year * 7 + month * 11) % 4 !== 0;
  },

  formatMonthChinese(value) {
    const [year, month] = value.split('-').map(Number);
    return `${year}年${month}月`;
  },

  renderMonthPanel(year) {
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
    const currentMonth = this.getCurrentMonthValue();
    return `
      <section class="analytics-month-panel" aria-label="${year}年">
        <div class="analytics-month-grid">
          ${monthNames.map((name, index) => {
            const value = `${year}-${String(index + 1).padStart(2, '0')}`;
            const isDisabled = value < '2000-01' || value > currentMonth;
            const isStart = value === this.selectedStartMonth;
            const isEnd = value === this.selectedEndMonth;
            const isInRange = value > this.selectedStartMonth && value < this.selectedEndMonth;
            return `
              <button type="button"
                class="analytics-month-option ${isStart || isEnd ? 'selected' : ''} ${isInRange ? 'in-range' : ''}"
                data-analytics-month="${value}" ${isDisabled ? 'disabled' : ''}
                aria-label="${year}年${index + 1}月">${name}</button>
            `;
          }).join('')}
        </div>
      </section>
    `;
  },

  renderMonthPickerContent() {
    const currentYear = new Date().getFullYear();
    const leftYear = Math.min(Math.max(this.monthPickerViewYear || Number(this.selectedStartMonth.slice(0, 4)), 2000), currentYear);
    this.monthPickerViewYear = leftYear;
    return `
      <div class="analytics-month-picker-header">
        <button type="button" class="analytics-month-nav" data-month-picker-nav="-1" aria-label="上一年">
          <i class="fa-solid fa-angles-left"></i>
        </button>
        <span>${leftYear}年</span>
        <span>${leftYear + 1}年</span>
        <button type="button" class="analytics-month-nav" data-month-picker-nav="1" aria-label="下一年" ${leftYear >= currentYear ? 'disabled' : ''}>
          <i class="fa-solid fa-angles-right"></i>
        </button>
      </div>
      <div class="analytics-month-picker-panels">
        ${this.renderMonthPanel(leftYear)}
        ${this.renderMonthPanel(leftYear + 1)}
      </div>
    `;
  },

  getSearchOptions() {
    return [
      ['all', '全部'],
      ['name', '好丽友交易处名称'],
      ['code', '好丽友交易处编码'],
      ['acc', 'ACC名称']
    ];
  },

  getFilteredStores() {
    const keyword = this.searchKeyword.trim().toLowerCase();
    const stores = this.getStores();
    const keywordFilteredStores = keyword ? stores.filter((store) => {
      const values = this.searchField === 'all'
        ? [store.name, store.code, store.acc]
        : [store[this.searchField]];
      return values.some((value) => String(value || '').toLowerCase().includes(keyword));
    }) : stores;
    const months = this.getAppliedMonths();
    if (this.appliedSubmissionStatus === 'all' || months.length !== 1) return keywordFilteredStores;
    const [{ year, month }] = months;
    return keywordFilteredStores.filter((store) => {
      const submitted = this.isStoreSubmitted(store, year, month);
      return this.appliedSubmissionStatus === 'submitted' ? submitted : !submitted;
    });
  },

  render() {
    const defaults = this.getDefaultMonthRange();
    if (!this.selectedStartMonth) this.selectedStartMonth = defaults.start;
    if (!this.selectedEndMonth) this.selectedEndMonth = defaults.end;
    if (!this.appliedStartMonth) this.appliedStartMonth = defaults.start;
    if (!this.appliedEndMonth) this.appliedEndMonth = defaults.end;
    if (!this.selectedMappingMonth) this.selectedMappingMonth = this.getCurrentMonthValue();
    if (!this.appliedMappingMonth) this.appliedMappingMonth = this.getCurrentMonthValue();
    if (!this.selectedFieldListMonth) this.selectedFieldListMonth = this.getCurrentMonthValue();
    if (!this.appliedFieldListMonth) this.appliedFieldListMonth = this.getCurrentMonthValue();
    return `
      <section class="analytics-workspace">
        <div class="analytics-tabs" role="tablist" aria-label="数据分析">
          ${this.tabs.map(([key, label]) => `
            <button type="button"
              class="analytics-tab"
              role="tab" aria-selected="${key === this.activeTab}" data-analytics-tab="${key}">${label}</button>
          `).join('')}
        </div>
        <div id="analytics-tab-content" role="tabpanel">
          ${this.renderActiveTab()}
        </div>
      </section>
    `;
  },

  renderActiveTab() {
    if (this.isMappingTab()) return this.renderStoreMapping();
    if (this.activeTab === 'field-list') return this.renderFieldList();
    if (this.activeTab === 'store-submission-monitor') return this.renderSubmissionMonitor();
    return '';
  },

  renderFieldList() {
    const rows = this.getFilteredFieldListRows();
    const fieldLabel = this.getFieldListSearchOptions().find(([key]) => key === this.fieldListSearchField)?.[1] || '全部';
    const availabilityFields = [
      ['customerStoreCode', '客户门店编码'],
      ['customerStoreName', '客户门店名称'],
      ['customerProductCode', '客户产品编码'],
      ['customerProductName', '客户产品名称'],
      ['customerBarcode', '客户条形码'],
      ['salesQuantity', '销售数量'],
      ['salesAmount', '销售金额'],
      ['retailCost', '零售成本']
    ];
    return `
      <div class="analytics-monitor analytics-field-list animate-[fadeIn_0.25s_ease-out]">
        <div class="analytics-filter-toolbar">
          <div class="analytics-search-combobox">
            <div class="analytics-field-select">
              <button id="field-list-search-field-button" type="button" aria-expanded="false">
                <span>${fieldLabel}</span>
                <i class="fa-solid fa-chevron-down"></i>
              </button>
              <div id="field-list-search-field-dropdown" class="ledger-search-field-dropdown hidden">
                ${this.getFieldListSearchOptions().map(([key, label]) => `
                  <button type="button" class="ledger-search-field-option ${key === this.fieldListSearchField ? 'active' : ''}" data-field-list-search-field="${key}">${label}</button>
                `).join('')}
              </div>
            </div>
            <div class="analytics-keyword-input">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input id="field-list-search-input" type="search" value="${this.escapeHtml(this.fieldListSearchKeyword)}" placeholder="搜索">
            </div>
          </div>
          <div class="analytics-filter-item mapping-month-filter">
            <span>月度</span>
            <span class="mapping-month-picker-wrap">
              <button id="field-list-month-button" class="mapping-month-button" type="button" aria-expanded="false">
                <i class="fa-regular fa-calendar"></i>
                <span>${this.formatMonthChinese(this.selectedFieldListMonth)}</span>
                <i class="fa-solid fa-chevron-down"></i>
              </button>
              <div id="field-list-month-picker" class="mapping-month-picker hidden">
                ${this.renderFieldListMonthPicker()}
              </div>
            </span>
          </div>
          <button id="field-list-search-button" class="analytics-search-button" type="button">
            <i class="fa-solid fa-magnifying-glass"></i>
            <span>搜索</span>
          </button>
          <button id="field-list-reset-button" class="analytics-reset-button" type="button">
            <i class="fa-solid fa-arrow-rotate-left"></i>
            <span>重置筛选</span>
          </button>
          <button id="field-list-export-button" class="analytics-export-button" type="button">
            <i class="fa-solid fa-download"></i>
            <span>导出</span>
          </button>
        </div>
        <div class="analytics-table-scroll">
          <table class="analytics-field-list-table w-full whitespace-nowrap text-left text-sm text-[#4e5969]">
            <thead class="sticky top-0 z-10 bg-[#f5f7fa] font-medium text-[#1d2129]">
              <tr>
                <th>ACC</th>
                <th>好丽友交易处编码</th>
                <th>好丽友交易处名称</th>
                <th>日期维度</th>
                ${availabilityFields.map(([, label]) => `<th>${label}</th>`).join('')}
                <th>备注</th>
              </tr>
            </thead>
            <tbody>
              ${rows.length ? rows.map((row) => `
                <tr>
                  <td>${row.acc}</td>
                  <td class="font-mono text-xs">${row.orionTransactionCode}</td>
                  <td class="font-semibold text-[#1d2129]">${row.orionTransactionName}</td>
                  <td><span class="analytics-date-dimension">${row.dateDimension}</span></td>
                  ${availabilityFields.map(([key]) => `<td class="text-center">${this.renderFieldAvailability(row[key])}</td>`).join('')}
                  <td>${this.renderFieldListRemark(row)}</td>
                </tr>
              `).join('') : `<tr><td colspan="13" class="px-4 py-16 text-center text-[#86909c]">未找到字段数据</td></tr>`}
            </tbody>
          </table>
        </div>
        <div class="analytics-table-footer">
          <span class="text-xs"><span class="analytics-field-present">●</span> 有值　<span class="analytics-field-missing">×</span> 无值</span>
          <span class="analytics-record-count">共 ${rows.length} 条数据</span>
        </div>
      </div>`;
  },

  renderStoreMapping() {
    const rows = this.getFilteredStoreMappings();
    const fieldLabel = this.getMappingSearchOptions().find(([key]) => key === this.mappingSearchField)?.[1] || '全部';
    return `
      <div class="analytics-monitor analytics-mapping animate-[fadeIn_0.25s_ease-out]">
        <div class="analytics-filter-toolbar">
          <div class="analytics-search-combobox">
            <div class="analytics-field-select">
              <button id="mapping-search-field-button" type="button" aria-expanded="false">
                <span>${fieldLabel}</span>
                <i class="fa-solid fa-chevron-down"></i>
              </button>
              <div id="mapping-search-field-dropdown" class="ledger-search-field-dropdown hidden">
                ${this.getMappingSearchOptions().map(([key, label]) => `
                  <button type="button" class="ledger-search-field-option ${key === this.mappingSearchField ? 'active' : ''}" data-mapping-search-field="${key}">${label}</button>
                `).join('')}
              </div>
            </div>
            <div class="analytics-keyword-input">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input id="mapping-search-input" type="search" value="${this.escapeHtml(this.mappingSearchKeyword)}" placeholder="搜索">
            </div>
          </div>
          ${this.activeTab === 'monthly-store' ? `
            <div class="analytics-filter-item mapping-month-filter">
              <span>月度</span>
              <span class="mapping-month-picker-wrap">
                <button id="mapping-month-button" class="mapping-month-button" type="button" aria-expanded="false">
                  <i class="fa-regular fa-calendar"></i>
                  <span>${this.formatMonthChinese(this.selectedMappingMonth)}</span>
                  <i class="fa-solid fa-chevron-down"></i>
                </button>
                <div id="mapping-month-picker" class="mapping-month-picker hidden">
                  ${this.renderMappingMonthPicker()}
                </div>
              </span>
            </div>
          ` : ''}
          <div class="mapping-org-filter">
            <span class="mapping-org-filter-label">组织架构</span>
            <button id="mapping-org-button" class="mapping-org-button" type="button" aria-expanded="false">
              <span id="mapping-org-label">${this.getMappingHierarchyLabel()}</span>
              <i class="fa-solid fa-chevron-down"></i>
            </button>
            <div id="mapping-org-dropdown" class="mapping-org-dropdown hidden">
              ${this.renderMappingHierarchyDropdown()}
            </div>
          </div>
          <label class="analytics-filter-item analytics-status-filter">
            <span>匹配状态</span>
            <span class="analytics-select-wrap">
              <select id="mapping-status-filter" aria-label="匹配状态">
                <option value="all" ${this.selectedMappingStatus === 'all' ? 'selected' : ''}>全部</option>
                <option value="matched" ${this.selectedMappingStatus === 'matched' ? 'selected' : ''}>已匹配</option>
                <option value="unmatched" ${this.selectedMappingStatus === 'unmatched' ? 'selected' : ''}>未匹配</option>
              </select>
              <i class="fa-solid fa-chevron-down"></i>
            </span>
          </label>
          <button id="mapping-search-button" class="analytics-search-button" type="button">
            <i class="fa-solid fa-magnifying-glass"></i>
            <span>搜索</span>
          </button>
          <button id="mapping-reset-button" class="analytics-reset-button" type="button">
            <i class="fa-solid fa-arrow-rotate-left"></i>
            <span>重置筛选</span>
          </button>
          <button id="mapping-export-button" class="analytics-export-button" type="button">
            <i class="fa-solid fa-download"></i>
            <span>导出</span>
          </button>
        </div>
        <div class="analytics-table-scroll">
          <table class="analytics-mapping-table w-full whitespace-nowrap text-left text-sm text-[#4e5969]" id="analytics-mapping-table">
            <thead class="sticky top-0 z-10 bg-[#f5f7fa] font-medium text-[#1d2129]">
              <tr>
                <th>客户系统</th>
                <th>客户门店号</th>
                <th>客户交易处编码</th>
                <th>客户交易处名称</th>
                <th>ACC</th>
                <th>好丽友交易处编码</th>
                <th>好丽友交易处名称</th>
                <th>TEAM</th>
                <th>区域</th>
                <th>营业所</th>
                <th>状态</th>
                <th>操作时间</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              ${rows.length ? rows.map((row) => `
                <tr>
                  <td>${row.customerSystem || '-'}</td>
                  <td class="font-mono text-xs">${row.customerStoreCode || '-'}</td>
                  <td class="font-mono text-xs">${row.customerTransactionCode || '-'}</td>
                  <td class="font-semibold text-[#1d2129]">${row.customerTransactionName || '-'}</td>
                  <td>${row.acc || '-'}</td>
                  <td class="font-mono text-xs">${row.orionTransactionCode || '-'}</td>
                  <td>${row.orionTransactionName || '-'}</td>
                  <td>${row.headquarters || '-'}</td>
                  <td>${row.region || '-'}</td>
                  <td>${row.salesOffice || '-'}</td>
                  <td><span class="analytics-match-status ${row.status}">${row.status === 'matched' ? '已匹配' : '未匹配'}</span></td>
                  <td class="font-mono text-xs">${row.operationTime || '-'}</td>
                </tr>
              `).join('') : `
                <tr><td colspan="12" class="px-4 py-16 text-center text-[#86909c]">未找到匹配的门店数据</td></tr>
              `}
            </tbody>
          </table>
        </div>
        <div class="analytics-table-footer">
          <span class="text-xs text-[#86909c]"><span class="analytics-legend-dot matched"></span> 已匹配　<span class="analytics-legend-dot unmatched"></span> 未匹配</span>
          <span class="analytics-record-count">共 ${rows.length} 条数据</span>
        </div>
      </div>
    `;
  },

  renderSubmissionMonitor() {
    const months = this.getAppliedMonths();
    const rows = this.getFilteredStores();
    const fieldLabel = this.getSearchOptions().find(([key]) => key === this.searchField)?.[1] || '全部';
    const singleMonthSelected = this.selectedStartMonth === this.selectedEndMonth;
    const tableMinWidth = Math.max(900, 620 + months.length * 112);
    return `
      <div class="analytics-monitor animate-[fadeIn_0.25s_ease-out]">
        <div class="analytics-filter-toolbar">
          <div class="analytics-search-combobox">
            <div class="analytics-field-select">
              <button id="analytics-search-field-button" type="button" aria-expanded="false">
                  <span>${fieldLabel}</span>
                  <i class="fa-solid fa-chevron-down"></i>
              </button>
              <div id="analytics-search-field-dropdown" class="ledger-search-field-dropdown hidden">
                ${this.getSearchOptions().map(([key, label]) => `
                  <button type="button" class="ledger-search-field-option ${key === this.searchField ? 'active' : ''}" data-analytics-search-field="${key}">${label}</button>
                `).join('')}
              </div>
            </div>
            <div class="analytics-keyword-input">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input id="analytics-search-input" type="search" value="${this.escapeHtml(this.searchKeyword)}" placeholder="搜索">
            </div>
          </div>
          <div class="analytics-filter-item analytics-month-range">
            <span>时间范围</span>
            <span class="analytics-month-picker-wrap">
              <button id="analytics-month-range-button" class="analytics-month-range-button ${this.monthRangeError ? 'invalid' : ''}" type="button" aria-expanded="false">
                <i class="fa-regular fa-calendar"></i>
                <span>${this.formatMonthChinese(this.selectedStartMonth)}</span>
                <span class="analytics-range-to">至</span>
                <span>${this.formatMonthChinese(this.selectedEndMonth)}</span>
              </button>
              <span id="analytics-month-range-error" class="analytics-month-range-error ${this.monthRangeError ? '' : 'hidden'}">${this.monthRangeError}</span>
              <div id="analytics-month-picker" class="analytics-month-picker hidden">
                ${this.renderMonthPickerContent()}
              </div>
            </span>
          </div>
          <label class="analytics-filter-item analytics-status-filter">
            <span>提交状态</span>
            <span class="analytics-select-wrap" title="${singleMonthSelected ? '' : '仅选择单个月份时可筛选提交状态'}">
              <select id="analytics-submission-status-filter" aria-label="提交状态" ${singleMonthSelected ? '' : 'disabled'}>
                <option value="all" ${this.selectedSubmissionStatus === 'all' ? 'selected' : ''}>全部</option>
                <option value="submitted" ${this.selectedSubmissionStatus === 'submitted' ? 'selected' : ''}>已提交</option>
                <option value="unsubmitted" ${this.selectedSubmissionStatus === 'unsubmitted' ? 'selected' : ''}>未提交</option>
              </select>
              <i class="fa-solid fa-chevron-down"></i>
            </span>
          </label>
          <button id="analytics-search-button" class="analytics-search-button" type="button">
            <i class="fa-solid fa-magnifying-glass"></i>
            <span>搜索</span>
          </button>
          <button id="analytics-reset-button" class="analytics-reset-button" type="button">
            <i class="fa-solid fa-arrow-rotate-left"></i>
            <span>重置筛选</span>
          </button>
          <button id="analytics-export-button" class="analytics-export-button" type="button">
              <i class="fa-solid fa-download"></i>
              <span>导出</span>
          </button>
        </div>
        <div class="analytics-table-scroll">
            <table class="w-full whitespace-nowrap text-center text-sm text-[#4e5969]" style="min-width:${tableMinWidth}px" id="analytics-submission-table">
              <thead class="sticky top-0 z-10 bg-[#f5f7fa] font-medium text-[#1d2129]">
                <tr>
                  <th class="sticky left-0 z-20 w-64 bg-[#f5f7fa] px-5 py-4 text-left">好丽友交易处名称</th>
                  <th class="sticky left-64 z-20 w-44 bg-[#f5f7fa] px-5 py-4 text-left">好丽友交易处编码</th>
                  <th class="w-40 px-4 py-3 text-left">ACC</th>
                  ${months.map((item) => `<th class="w-28 px-3 py-3">${item.label}</th>`).join('')}
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                ${rows.length ? rows.map((store) => this.renderStoreRow(store, months)).join('') : `
                  <tr><td colspan="${3 + months.length}" class="px-4 py-16 text-center text-[#86909c]">未找到匹配的门店</td></tr>
                `}
              </tbody>
            </table>
        </div>
        <div class="analytics-table-footer">
            <span class="text-xs text-[#86909c]"><span class="text-green-600">●</span> 已提交　<span class="font-bold text-red-500">×</span> 未提交</span>
            <span class="analytics-record-count">共 ${rows.length} 条数据</span>
        </div>
      </div>
    `;
  },

  renderStoreRow(store, months) {
    return `
      <tr class="hover:bg-blue-50/30">
        <td class="sticky left-0 z-10 bg-white px-4 py-3 text-left font-semibold text-[#1d2129]">${store.name}</td>
        <td class="sticky left-64 z-10 bg-white px-4 py-3 text-left font-mono text-xs">${store.code}</td>
        <td class="px-4 py-3 text-left">${store.acc}</td>
        ${months.map(({ year, month }) => {
          if (this.isStoreSubmitted(store, year, month)) return '<td class="px-3 py-3 text-lg text-green-600" title="已提交">●</td>';
          return '<td class="px-3 py-3 text-lg font-bold text-red-500" title="未提交">×</td>';
        }).join('')}
      </tr>
    `;
  },

  refreshContent() {
    const content = document.getElementById('analytics-tab-content');
    if (!content) return;
    content.innerHTML = this.renderActiveTab();
    this.bindActiveTabEvents();
  },

  bindEvents() {
    document.querySelectorAll('.analytics-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        const previousTab = this.activeTab;
        if (this.isMappingTab(previousTab)) this.saveMappingTabState(previousTab);
        this.activeTab = tab.dataset.analyticsTab;
        if (this.isMappingTab(this.activeTab)) this.loadMappingTabState(this.activeTab);
        document.querySelectorAll('.analytics-tab').forEach((item) => {
          const active = item === tab;
          item.setAttribute('aria-selected', String(active));
          item.classList.toggle('border-brand', active);
          item.classList.toggle('text-brand', active);
          item.classList.toggle('border-transparent', !active);
          item.classList.toggle('text-[#86909c]', !active);
        });
        this.refreshContent();
      });
    });
    this.bindActiveTabEvents();
  },

  bindStoreMappingEvents() {
    const dropdown = document.getElementById('mapping-search-field-dropdown');
    const fieldButton = document.getElementById('mapping-search-field-button');
    const statusSelect = document.getElementById('mapping-status-filter');
    const monthButton = document.getElementById('mapping-month-button');
    const monthPicker = document.getElementById('mapping-month-picker');
    const orgButton = document.getElementById('mapping-org-button');
    const orgDropdown = document.getElementById('mapping-org-dropdown');
    const runSearch = () => {
      this.mappingSearchKeyword = document.getElementById('mapping-search-input')?.value || '';
      this.appliedMappingStatus = this.selectedMappingStatus;
      this.appliedMappingMonth = this.selectedMappingMonth;
      this.appliedMappingHierarchyFilter = {
        teams: [...this.mappingHierarchyFilter.teams],
        regions: [...this.mappingHierarchyFilter.regions],
        offices: [...this.mappingHierarchyFilter.offices]
      };
      this.refreshContent();
    };

    const bindMappingHierarchyEvents = () => {
      const refreshDropdown = () => {
        if (orgDropdown) orgDropdown.innerHTML = this.renderMappingHierarchyDropdown();
        const label = document.getElementById('mapping-org-label');
        if (label) label.textContent = this.getMappingHierarchyLabel();
        bindMappingHierarchyEvents();
      };
      document.querySelectorAll('.mapping-team-checkbox').forEach((checkbox) => {
        checkbox.closest('[data-mapping-org-value]')?.addEventListener('mouseenter', () => {
          this.mappingHierarchyHover.team = checkbox.value;
          this.mappingHierarchyHover.region = '';
          refreshDropdown();
        });
        checkbox.addEventListener('change', () => {
          this.mappingHierarchyFilter.teams = [...document.querySelectorAll('.mapping-team-checkbox:checked')].map((item) => item.value);
          this.mappingHierarchyFilter.regions = [];
          this.mappingHierarchyFilter.offices = [];
          this.mappingHierarchyHover.team = checkbox.value;
          this.mappingHierarchyHover.region = '';
          refreshDropdown();
        });
      });
      document.querySelectorAll('.mapping-region-checkbox').forEach((checkbox) => {
        checkbox.closest('[data-mapping-org-value]')?.addEventListener('mouseenter', () => {
          this.mappingHierarchyHover.region = checkbox.value;
          refreshDropdown();
        });
        checkbox.addEventListener('change', () => {
          this.mappingHierarchyFilter.regions = [...document.querySelectorAll('.mapping-region-checkbox:checked')].map((item) => item.value);
          this.mappingHierarchyFilter.offices = [];
          this.mappingHierarchyHover.region = checkbox.value;
          refreshDropdown();
        });
      });
      document.querySelectorAll('.mapping-office-checkbox').forEach((checkbox) => {
        checkbox.addEventListener('change', () => {
          this.mappingHierarchyFilter.offices = [...document.querySelectorAll('.mapping-office-checkbox:checked')].map((item) => item.value);
          refreshDropdown();
        });
      });
    };

    orgButton?.addEventListener('click', (event) => {
      event.stopPropagation();
      const willOpen = orgDropdown?.classList.contains('hidden');
      orgDropdown?.classList.toggle('hidden', !willOpen);
      orgButton.setAttribute('aria-expanded', String(willOpen));
    });
    bindMappingHierarchyEvents();
    if (this.mappingOrgOutsideHandler) document.removeEventListener('click', this.mappingOrgOutsideHandler);
    this.mappingOrgOutsideHandler = (event) => {
      if (event.target.closest('.mapping-org-filter')) return;
      orgDropdown?.classList.add('hidden');
      orgButton?.setAttribute('aria-expanded', 'false');
    };
    document.addEventListener('click', this.mappingOrgOutsideHandler);

    fieldButton?.addEventListener('click', (event) => {
      event.stopPropagation();
      const willOpen = dropdown?.classList.contains('hidden');
      dropdown?.classList.toggle('hidden', !willOpen);
      fieldButton.setAttribute('aria-expanded', String(willOpen));
    });
    dropdown?.addEventListener('click', (event) => {
      const option = event.target.closest('[data-mapping-search-field]');
      if (!option) return;
      this.mappingSearchField = option.dataset.mappingSearchField;
      this.refreshContent();
    });
    statusSelect?.addEventListener('change', (event) => {
      this.selectedMappingStatus = event.target.value;
    });

    const bindMappingMonthActions = () => {
      monthPicker?.querySelectorAll('[data-mapping-month-nav]').forEach((button) => {
        button.addEventListener('click', (event) => {
          event.stopPropagation();
          this.mappingMonthViewYear += Number(button.dataset.mappingMonthNav);
          monthPicker.innerHTML = this.renderMappingMonthPicker();
          bindMappingMonthActions();
        });
      });
      monthPicker?.querySelectorAll('[data-mapping-month]').forEach((button) => {
        button.addEventListener('click', (event) => {
          event.stopPropagation();
          this.selectedMappingMonth = button.dataset.mappingMonth;
          this.refreshContent();
        });
      });
    };

    monthButton?.addEventListener('click', (event) => {
      event.stopPropagation();
      const willOpen = monthPicker?.classList.contains('hidden');
      if (willOpen) {
        this.mappingMonthViewYear = Number(this.selectedMappingMonth.slice(0, 4));
        monthPicker.innerHTML = this.renderMappingMonthPicker();
        bindMappingMonthActions();
      }
      monthPicker?.classList.toggle('hidden', !willOpen);
      monthButton.setAttribute('aria-expanded', String(willOpen));
    });
    bindMappingMonthActions();
    if (this.mappingMonthOutsideHandler) document.removeEventListener('click', this.mappingMonthOutsideHandler);
    this.mappingMonthOutsideHandler = (event) => {
      if (event.target.closest('.mapping-month-picker-wrap')) return;
      monthPicker?.classList.add('hidden');
      monthButton?.setAttribute('aria-expanded', 'false');
    };
    document.addEventListener('click', this.mappingMonthOutsideHandler);

    document.getElementById('mapping-search-input')?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') runSearch();
    });
    document.getElementById('mapping-search-button')?.addEventListener('click', runSearch);
    document.getElementById('mapping-reset-button')?.addEventListener('click', () => {
      this.mappingSearchField = 'all';
      this.mappingSearchKeyword = '';
      this.selectedMappingStatus = 'all';
      this.appliedMappingStatus = 'all';
      this.selectedMappingMonth = this.getCurrentMonthValue();
      this.appliedMappingMonth = this.getCurrentMonthValue();
      this.mappingHierarchyFilter = { teams: [], regions: [], offices: [] };
      this.appliedMappingHierarchyFilter = { teams: [], regions: [], offices: [] };
      this.mappingHierarchyHover = { team: '', region: '' };
      this.refreshContent();
    });
    document.getElementById('mapping-export-button')?.addEventListener('click', () => this.exportStoreMappings());
  },

  bindActiveTabEvents() {
    if (this.isMappingTab()) {
      this.bindStoreMappingEvents();
      return;
    }
    if (this.activeTab === 'field-list') {
      this.bindFieldListEvents();
      return;
    }
    if (this.activeTab !== 'store-submission-monitor') return;
    const dropdown = document.getElementById('analytics-search-field-dropdown');
    const fieldButton = document.getElementById('analytics-search-field-button');

    fieldButton?.addEventListener('click', (event) => {
      event.stopPropagation();
      const willOpen = dropdown?.classList.contains('hidden');
      dropdown?.classList.toggle('hidden', !willOpen);
      fieldButton.setAttribute('aria-expanded', String(willOpen));
    });
    dropdown?.addEventListener('click', (event) => {
      const option = event.target.closest('[data-analytics-search-field]');
      if (!option) return;
      this.searchField = option.dataset.analyticsSearchField;
      this.refreshContent();
    });
    const monthRangeButton = document.getElementById('analytics-month-range-button');
    const monthPicker = document.getElementById('analytics-month-picker');
    const statusSelect = document.getElementById('analytics-submission-status-filter');

    const syncStatusAvailability = () => {
      const singleMonthSelected = this.selectedStartMonth === this.selectedEndMonth;
      if (statusSelect) {
        statusSelect.disabled = !singleMonthSelected;
        statusSelect.closest('.analytics-select-wrap')?.setAttribute(
          'title',
          singleMonthSelected ? '' : '仅选择单个月份时可筛选提交状态'
        );
        if (!singleMonthSelected) {
          this.selectedSubmissionStatus = 'all';
          statusSelect.value = 'all';
        }
      }
    };

    const bindMonthPickerActions = () => {
      monthPicker?.querySelectorAll('[data-month-picker-nav]').forEach((button) => {
        button.addEventListener('click', (event) => {
          event.stopPropagation();
          this.monthPickerViewYear += Number(button.dataset.monthPickerNav);
          monthPicker.innerHTML = this.renderMonthPickerContent();
          bindMonthPickerActions();
        });
      });
      monthPicker?.querySelectorAll('[data-analytics-month]').forEach((button) => {
        button.addEventListener('click', (event) => {
          event.stopPropagation();
          const value = button.dataset.analyticsMonth;
          if (!this.monthRangeSelectingEnd) {
            this.selectedStartMonth = value;
            this.selectedEndMonth = value;
            this.selectedSubmissionStatus = 'all';
            this.monthRangeError = '';
            this.monthRangeSelectingEnd = true;
            if (statusSelect) {
              statusSelect.value = 'all';
              statusSelect.disabled = true;
            }
            monthPicker.innerHTML = this.renderMonthPickerContent();
            bindMonthPickerActions();
            return;
          }
          if (value < this.selectedStartMonth) {
            this.selectedStartMonth = value;
            this.selectedEndMonth = value;
            this.monthRangeError = '';
            monthPicker.innerHTML = this.renderMonthPickerContent();
            bindMonthPickerActions();
            return;
          }
          this.selectedEndMonth = value;
          this.monthRangeSelectingEnd = false;
          this.monthRangeError = this.getSelectedMonthCount() > 24 ? '时间范围最多选择24个月' : '';
          this.refreshContent();
        });
      });
    };

    monthRangeButton?.addEventListener('click', (event) => {
      event.stopPropagation();
      const willOpen = monthPicker?.classList.contains('hidden');
      if (willOpen) {
        this.monthPickerViewYear = Number(this.selectedStartMonth.slice(0, 4));
        this.monthRangeSelectingEnd = false;
        monthPicker.innerHTML = this.renderMonthPickerContent();
        bindMonthPickerActions();
      }
      monthPicker?.classList.toggle('hidden', !willOpen);
      monthRangeButton.setAttribute('aria-expanded', String(willOpen));
    });

    bindMonthPickerActions();
    if (this.monthPickerOutsideHandler) document.removeEventListener('click', this.monthPickerOutsideHandler);
    this.monthPickerOutsideHandler = (event) => {
      if (event.target.closest('.analytics-month-picker-wrap')) return;
      monthPicker?.classList.add('hidden');
      monthRangeButton?.setAttribute('aria-expanded', 'false');
      if (this.monthRangeSelectingEnd) {
        this.monthRangeSelectingEnd = false;
        this.refreshContent();
      }
    };
    document.addEventListener('click', this.monthPickerOutsideHandler);
    if (this.monthPickerEscapeHandler) document.removeEventListener('keydown', this.monthPickerEscapeHandler);
    this.monthPickerEscapeHandler = (event) => {
      if (event.key !== 'Escape' || monthPicker?.classList.contains('hidden')) return;
      monthPicker.classList.add('hidden');
      monthRangeButton?.setAttribute('aria-expanded', 'false');
      this.monthRangeSelectingEnd = false;
      syncStatusAvailability();
    };
    document.addEventListener('keydown', this.monthPickerEscapeHandler);

    statusSelect?.addEventListener('change', (event) => {
      this.selectedSubmissionStatus = event.target.value;
    });

    const runSearch = () => {
      if (!this.selectedStartMonth || !this.selectedEndMonth) return;
      const selectedMonthCount = this.getSelectedMonthCount();
      if (selectedMonthCount > 24) {
        this.monthRangeError = '时间范围最多选择24个月，请重新选择';
        const errorElement = document.getElementById('analytics-month-range-error');
        errorElement?.classList.remove('hidden');
        if (errorElement) errorElement.textContent = this.monthRangeError;
        monthRangeButton?.classList.add('invalid');
        return;
      }
      this.monthRangeError = '';
      this.searchKeyword = document.getElementById('analytics-search-input')?.value || '';
      this.appliedStartMonth = this.selectedStartMonth;
      this.appliedEndMonth = this.selectedEndMonth;
      this.appliedSubmissionStatus = this.selectedStartMonth === this.selectedEndMonth
        ? this.selectedSubmissionStatus
        : 'all';
      this.refreshContent();
    };
    document.getElementById('analytics-search-input')?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') runSearch();
    });
    document.getElementById('analytics-search-button')?.addEventListener('click', runSearch);
    document.getElementById('analytics-reset-button')?.addEventListener('click', () => {
      const defaults = this.getDefaultMonthRange();
      this.searchField = 'all';
      this.searchKeyword = '';
      this.selectedStartMonth = defaults.start;
      this.selectedEndMonth = defaults.end;
      this.appliedStartMonth = defaults.start;
      this.appliedEndMonth = defaults.end;
      this.selectedSubmissionStatus = 'all';
      this.appliedSubmissionStatus = 'all';
      this.monthRangeError = '';
      this.refreshContent();
    });
    document.getElementById('analytics-export-button')?.addEventListener('click', () => this.exportRows());
  },

  bindFieldListEvents() {
    const fieldButton = document.getElementById('field-list-search-field-button');
    const dropdown = document.getElementById('field-list-search-field-dropdown');
    const input = document.getElementById('field-list-search-input');
    const monthButton = document.getElementById('field-list-month-button');
    const monthPicker = document.getElementById('field-list-month-picker');
    const runSearch = () => {
      this.fieldListSearchKeyword = document.getElementById('field-list-search-input')?.value || '';
      this.appliedFieldListSearchField = this.fieldListSearchField;
      this.appliedFieldListSearchKeyword = this.fieldListSearchKeyword;
      this.appliedFieldListMonth = this.selectedFieldListMonth;
      this.refreshContent();
    };
    fieldButton?.addEventListener('click', (event) => {
      event.stopPropagation();
      const willOpen = dropdown?.classList.contains('hidden');
      dropdown?.classList.toggle('hidden', !willOpen);
      fieldButton.setAttribute('aria-expanded', String(willOpen));
    });
    dropdown?.addEventListener('click', (event) => {
      const option = event.target.closest('[data-field-list-search-field]');
      if (!option) return;
      this.fieldListSearchField = option.dataset.fieldListSearchField;
      this.refreshContent();
    });
    input?.addEventListener('input', (event) => {
      this.fieldListSearchKeyword = event.target.value;
    });
    input?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') runSearch();
    });

    const bindMonthActions = () => {
      monthPicker?.querySelectorAll('[data-field-list-month-nav]').forEach((button) => {
        button.addEventListener('click', (event) => {
          event.stopPropagation();
          this.fieldListMonthViewYear += Number(button.dataset.fieldListMonthNav);
          monthPicker.innerHTML = this.renderFieldListMonthPicker();
          bindMonthActions();
        });
      });
      monthPicker?.querySelectorAll('[data-field-list-month]').forEach((button) => {
        button.addEventListener('click', (event) => {
          event.stopPropagation();
          this.selectedFieldListMonth = button.dataset.fieldListMonth;
          this.refreshContent();
        });
      });
    };
    monthButton?.addEventListener('click', (event) => {
      event.stopPropagation();
      const willOpen = monthPicker?.classList.contains('hidden');
      if (willOpen) {
        this.fieldListMonthViewYear = Number(this.selectedFieldListMonth.slice(0, 4));
        monthPicker.innerHTML = this.renderFieldListMonthPicker();
        bindMonthActions();
      }
      monthPicker?.classList.toggle('hidden', !willOpen);
      monthButton.setAttribute('aria-expanded', String(willOpen));
    });
    bindMonthActions();
    if (this.fieldListMonthOutsideHandler) document.removeEventListener('click', this.fieldListMonthOutsideHandler);
    this.fieldListMonthOutsideHandler = (event) => {
      if (event.target.closest('.mapping-month-picker-wrap')) return;
      monthPicker?.classList.add('hidden');
      monthButton?.setAttribute('aria-expanded', 'false');
    };
    document.addEventListener('click', this.fieldListMonthOutsideHandler);
    document.getElementById('field-list-search-button')?.addEventListener('click', runSearch);
    document.getElementById('field-list-reset-button')?.addEventListener('click', () => {
      const currentMonth = this.getCurrentMonthValue();
      this.fieldListSearchField = 'all';
      this.fieldListSearchKeyword = '';
      this.appliedFieldListSearchField = 'all';
      this.appliedFieldListSearchKeyword = '';
      this.selectedFieldListMonth = currentMonth;
      this.appliedFieldListMonth = currentMonth;
      this.fieldListMonthViewYear = Number(currentMonth.slice(0, 4));
      this.refreshContent();
    });
    document.getElementById('field-list-export-button')?.addEventListener('click', () => this.exportFieldList());
  },

  exportFieldList() {
    const headers = ['ACC', '好丽友交易处编码', '好丽友交易处名称', '日期维度', '客户门店编码', '客户门店名称', '客户产品编码', '客户产品名称', '客户条形码', '销售数量', '销售金额', '零售成本', '备注'];
    const availabilityFields = ['customerStoreCode', 'customerStoreName', 'customerProductCode', 'customerProductName', 'customerBarcode', 'salesQuantity', 'salesAmount', 'retailCost'];
    const rows = this.getFilteredFieldListRows().map((row) => [
      row.acc,
      row.orionTransactionCode,
      row.orionTransactionName,
      row.dateDimension,
      ...availabilityFields.map((field) => row[field] ? '有值' : '无值'),
      this.getFieldListRemarkChanges(row)
        .map((change) => `${change.label}：${change.before}→${change.after}`)
        .join('；')
    ]);
    const csv = `\uFEFF${[headers, ...rows].map((row) => row.map((value) => this.escapeCsv(value)).join(',')).join('\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `字段列表_${this.appliedFieldListMonth}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },

  exportStoreMappings() {
    const headers = ['客户系统', '客户门店号', '客户交易处编码', '客户交易处名称', 'ACC', '好丽友交易处编码', '好丽友交易处名称', 'TEAM', '区域', '营业所', '状态', '操作时间'];
    const rows = this.getFilteredStoreMappings().map((row) => [
      row.customerSystem || '-',
      row.customerStoreCode || '-',
      row.customerTransactionCode || '-',
      row.customerTransactionName || '-',
      row.acc || '-',
      row.orionTransactionCode || '-',
      row.orionTransactionName || '-',
      row.headquarters || '-',
      row.region || '-',
      row.salesOffice || '-',
      row.status === 'matched' ? '已匹配' : '未匹配',
      row.operationTime || '-'
    ]);
    const csv = `\uFEFF${[headers, ...rows].map((row) => row.map((value) => this.escapeCsv(value)).join(',')).join('\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    const exportName = this.activeTab === 'monthly-store' ? '月度门店' : '门店对照表';
    link.download = `${exportName}_${this.appliedMappingMonth.replace('-', '年')}月.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },

  exportRows() {
    const months = this.getAppliedMonths();
    const headers = ['好丽友交易处名称', '好丽友交易处编码', 'ACC', ...months.map((item) => item.label)];
    const rows = this.getFilteredStores().map((store) => [
      store.name,
      store.code,
      store.acc,
      ...months.map(({ year, month }) => this.isStoreSubmitted(store, year, month) ? '已提交' : '未提交')
    ]);
    const csv = `\uFEFF${[headers, ...rows].map((row) => row.map((value) => this.escapeCsv(value)).join(',')).join('\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `门店提交监控_${months[0].value}_${months[months.length - 1].value}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },

  escapeCsv(value) {
    return `"${String(value ?? '').replaceAll('"', '""')}"`;
  },

  escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }
};

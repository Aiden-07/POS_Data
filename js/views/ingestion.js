const IngestionView = {
  data: [],
  filteredData: [],
  activeDataMode: 'files',
  promotedStashKeys: new Set(),
  failedStashKeys: new Set(),
  rejectedStashKeys: new Set(),
  stashEdits: new Map(),
  approvedOriginalIds: new Set(),
  qualityOriginalStates: {},
  checkingMinDurationMs: 10000,
  stashCheckState: {
    active: false,
    count: 0
  },

  // 获取当前语言
  getCurrentLang() {
    return Store?.getState?.()?.lang || 'cn';
  },
  
  // 处理双语文本 - 中文模式只显示中文部分
  getLocalizedText(text) {
    if (!text) return '-';
    const lang = this.getCurrentLang();
    if (lang === 'cn') {
      // 中文模式：只显示 / 前面的中文部分
      return text.split(' / ')[0] || text;
    }
    // 韩文模式：显示完整文本
    return text;
  },

  isDuplicateAttachment(attachment) {
    if (attachment?.repeatMultiStoreFlow) return true;
    const reason = attachment?.rejectReason || '';
    return reason.includes('重复') || reason.includes('覆盖/忽略');
  },

  isPendingDuplicateAttachment(attachment) {
    return attachment?.status === '待处理' && this.isDuplicateAttachment(attachment);
  },

  formatDateTime(value) {
    const source = String(value || '').trim();
    const matched = source.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/);
    if (!matched) return source || '-';
    const [, year, month, day, hour = '00', minute = '00', second = '00'] = matched;
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  },

  formatNowDateTime(date = new Date()) {
    const pad = value => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  },

  getInboxStatusStyle(statusText) {
    if (statusText === '正常') {
      return 'bg-green-50 text-green-700 border-green-100';
    }
    if (statusText === '校验中') {
      return 'bg-blue-50 text-brand border-blue-100';
    }
    if (statusText === '待处理') {
      return 'bg-amber-50 text-amber-700 border-amber-100';
    }
    if (statusText === '驳回') {
      return 'bg-red-50 text-red-600 border-red-100';
    }
    return 'bg-slate-50 text-slate-600 border-slate-100';
  },

  getRoutedInboxAttachments(targetStatus) {
    return this.getInboxData().flatMap((inboxItem) => {
      const sourceRow = this.data.find(row => row.id === inboxItem.id) || {};
      return inboxItem.attachments
        .map((attachment, attachmentIndex) => ({
          attachment,
          attachmentIndex,
          inboxItem,
          sourceRow
        }))
        .filter(item => item.attachment.status === targetStatus);
    });
  },

  getDisplayMonth(row = {}) {
    return row.month || row.period || '2026年05月';
  },

  parseDisplayMonth(value) {
    const matched = String(value || '').match(/(\d{4})\D*(\d{1,2})/);
    return {
      year: matched?.[1] || '2026',
      month: String(matched?.[2] || '05').padStart(2, '0')
    };
  },

  renderPeriodEditor(value, className = 'row-period-input') {
    const selected = this.parseDisplayMonth(value);
    const years = [2024, 2025, 2026, 2027, 2028];
    return `
      <select class="${className} w-[76px] px-2 py-1 border border-gray-200 rounded text-sm bg-white focus:outline-none focus:border-brand" data-period-part="year">
        ${years.map(year => `<option value="${year}" ${String(year) === selected.year ? 'selected' : ''}>${year}年</option>`).join('')}
      </select>
      <select class="${className} w-[62px] px-2 py-1 border border-gray-200 rounded text-sm bg-white focus:outline-none focus:border-brand" data-period-part="month">
        ${Array.from({ length: 12 }, (_, index) => {
          const month = String(index + 1).padStart(2, '0');
          return `<option value="${month}" ${month === selected.month ? 'selected' : ''}>${index + 1}月</option>`;
        }).join('')}
      </select>
    `;
  },

  getCurrentDisplayMonth() {
    const state = Store?.getState?.() || {};
    const year = state.selectedYear || '2026';
    const month = state.selectedMonth || '05';
    return `${year}年${String(month).padStart(2, '0')}月`;
  },

  getRawStoreCode(row = {}, index = 0) {
    const sourceText = `${row.fileName || ''} ${row.id || ''}`;
    const matchedCode = sourceText.match(/\b[FS]\d{7}\b/i)?.[0];
    return matchedCode ? matchedCode.toUpperCase() : `R${String(5200000 + index).padStart(7, '0')}`;
  },

  getStashRawStoreCode(row = {}, index = 0) {
    if (row.rawStoreCode) return row.rawStoreCode;
    const sourceText = `${row.storeName || ''} ${row.fileName || ''}`;
    const matchedCode = sourceText.match(/\b[FS]\d{7}\b/i)?.[0];
    if (matchedCode) return matchedCode.toUpperCase();

    const numericIndex = Number.parseInt(String(index).replace(/\D/g, ''), 10) || 0;
    if (numericIndex % 2 === 1) return '-';
    const fallbackCodes = ['S1018566', 'F0210780', 'S0208536', 'F0778899', 'S0445566'];
    return fallbackCodes[numericIndex % fallbackCodes.length];
  },

  getStashAbnormalReason(row = {}) {
    return row.aiNote || '未校验到门店编码/所属关系，请检查门店主数据。';
  },

  getSalesOfficeMap() {
    return {
      '北部本部': ['石家庄营业所', '北京营业所', '天津营业所'],
      '东北本部': ['沈阳营业所', '长春营业所', '哈尔滨营业所'],
      '东部本部': ['上海营业所', '杭州营业所', '南京营业所'],
      '中部本部': ['武汉营业所', '长沙营业所', '郑州营业所'],
      '南部本部': ['广州营业所', '深圳营业所', '南宁营业所'],
      '西南本部': ['成都营业所', '重庆营业所', '昆明营业所'],
      '西北本部': ['西安营业所', '兰州营业所', '乌鲁木齐营业所']
    };
  },

  getHeadquartersOptions() {
    return Object.keys(this.getSalesOfficeMap());
  },

  getSalesOfficeOptions(headquarters) {
    return this.getSalesOfficeMap()[headquarters] || [];
  },

  renderSelectOptions(options = [], selectedValue = '', placeholder = '') {
    const placeholderHtml = placeholder ? `<option value="">${this.escapeHtml(placeholder)}</option>` : '';
    return `${placeholderHtml}${options.map(option => `<option value="${this.escapeHtml(option)}" ${option === selectedValue ? 'selected' : ''}>${this.escapeHtml(option)}</option>`).join('')}`;
  },

  getRejectTeamOptions() {
    return ['POS担当', '华北 Team', '东北 Team', '华东 Team', '华中 Team', '华南 Team', '西南 Team', '西北 Team'];
  },

  getAccNameOptions() {
    return ['其它', '北京物美', '怀化佳惠', '南阳万德隆', '新玛特'];
  },

  getAccName(value, index = 0) {
    const source = String(value || '').trim();
    const options = this.getAccNameOptions();
    if (!source || source === '-') return options[index % options.length];
    if (source === '其他') return '其它';
    const codeMatch = source.match(/^ACC-(\d+)$/i);
    if (codeMatch) {
      const numeric = Number.parseInt(codeMatch[1], 10);
      const mappedIndex = Number.isFinite(numeric) ? Math.max(0, numeric - 100) : index;
      return options[mappedIndex % options.length];
    }
    return source;
  },

  renderRejectTeamSelect(selectedValue = 'POS担当', id = 'reject-team-select') {
    const selected = selectedValue || 'POS担当';
    return `
      <div class="relative">
        <select id="${this.escapeHtml(id)}" class="w-full appearance-none rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 pr-10 text-sm font-semibold text-brand outline-none transition-colors focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/15">
          ${this.getRejectTeamOptions().map(team => `<option value="${this.escapeHtml(team)}" ${team === selected ? 'selected' : ''}>${this.escapeHtml(team)}</option>`).join('')}
        </select>
        <i class="fa-solid fa-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand"></i>
      </div>
    `;
  },

  enrichOriginalStoreRow(row = {}, index = 0) {
    const teams = ['华北 Team', '东北 Team', '华东 Team', '华中 Team', '华南 Team', '西南 Team', '西北 Team'];
    const headquarters = ['北部本部', '东北本部', '东部本部', '中部本部', '南部本部', '西南本部', '西北本部'];
    const offices = ['石家庄营业所', '沈阳营业所', '上海营业所', '武汉营业所', '广州营业所', '成都营业所', '西安营业所'];
    const dealers = ['河北聚昊商贸', '沈阳欧亚商贸', '上海煊超供应链', '武汉多客隆商贸', '广州利好商贸', '成都家得乐商贸', '西安家乐惠商贸'];
    const teamIndex = teams.findIndex(team => String(row.team || '').includes(team));
    const fallbackIndex = teamIndex >= 0 ? teamIndex : index % teams.length;

    return {
      ...row,
      rawStoreName: row.rawStoreName || row.fileName || '-',
      rawStoreCode: row.rawStoreCode || this.getRawStoreCode(row, index),
      storeCode: row.storeCode || `C${String(9001000 + index).padStart(7, '0')}`,
      dealer: row.dealer || dealers[fallbackIndex],
      acc: this.getAccName(row.acc, fallbackIndex),
      headquarters: row.headquarters || headquarters[fallbackIndex],
      salesOffice: row.salesOffice || offices[fallbackIndex],
      region: row.region || headquarters[fallbackIndex].replace('本部', '区域')
    };
  },

  recalcInboxItemStatus(inboxItem) {
    if (!inboxItem?.attachments?.length) return;

    const activeAttachments = inboxItem.attachments.filter(item => !item.isHistorical);
    if (!activeAttachments.length) return;
    const hasChecking = activeAttachments.some(item => item.status === '校验中' || item.status === '检验中');
    const allNormal = activeAttachments.every(item => item.status === '正常');
    const needsAttention = activeAttachments
      .filter(item => item.status !== '正常' && item.status !== '校验中' && item.status !== '检验中')
      .map(item => item.rejectReason)
      .filter(reason => reason && reason !== '-');

    if (hasChecking) {
      inboxItem.isNormal = false;
      inboxItem.statusText = '校验中';
      inboxItem.suggestion = '存在附件正在校验中，请等待校验完成';
      return;
    }

    if (activeAttachments.some(item => item.status === '驳回')) {
      inboxItem.isNormal = false;
      inboxItem.statusText = '驳回';
      inboxItem.suggestion = [...new Set(needsAttention)].join('；') || '当前版本存在驳回文件';
      return;
    }

    if (activeAttachments.some(item => item.status === '待处理')) {
      inboxItem.isNormal = false;
      inboxItem.statusText = '待处理';
      inboxItem.suggestion = [...new Set(needsAttention)].join('；') || '当前版本存在重复门店，等待覆盖或忽略';
      return;
    }

    inboxItem.isNormal = allNormal;
    if (allNormal) {
      inboxItem.statusText = '正常';
      inboxItem.suggestion = '-';
      return;
    }

    inboxItem.statusText = '已处理';
    inboxItem.suggestion = [...new Set(needsAttention)].join('；') || '-';
  },
  
  // 筛选状态
  filters: {
    fileName: '',
    searchField: 'all',
    headquarters: '',
    salesOffice: '',
    approvalStatus: 'all'
  },
  
  // 收件箱状态筛选
  inboxStatusFilter: [],
  uploadCheckState: {
    active: false,
    count: 0
  },
  
  // 分页状态
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0
  },
  
  // 统计指标
  stats: {
    total: 450,
    pending: 14,
    daily: 328,
    rate: 95.7
  },
  
  async loadData() {
    try {
      const res = await fetch('data/files_mock.json?v=20260710-exception-table-route');
      this.data = await res.json();
      this.migrateOriginalStatusToPending();
      this.loadApprovedOriginalIds();
      this.loadQualityOriginalStates();
      // 添加处理人字段，并保留内部驳回备注
      this.data = this.data.map((row, index) => ({
        ...this.enrichOriginalStoreRow(row, index),
        ...this.getQualityOriginalState(String(row.id), row.status),
        handler: row.status.includes('异常') ? row.team : 'POS担当',
        remark: row.remark || ''
      }));
      this.resumeQualityChecks();
      this.loadFiltersFromCache();
      this.applyFilters();
      this.renderInbox();
    } catch (e) {
      console.error('Failed to load mock data', e);
      this.showEmptyState();
    }
  },

  migrateOriginalStatusToPending() {
    const migrationKey = 'ingestion_original_status_pending_20260713_v2';
    if (localStorage.getItem(migrationKey) === 'done') return;
    localStorage.removeItem('ingestion_approved_original_ids');
    localStorage.removeItem('ingestion_quality_original_states');
    localStorage.setItem(migrationKey, 'done');
  },
  
  // 本地缓存
  saveFiltersToCache() {
    localStorage.setItem('ingestion_filters', JSON.stringify(this.filters));
    localStorage.setItem('ingestion_pagination', JSON.stringify({ page: this.pagination.page }));
  },
  
  loadFiltersFromCache() {
    const savedFilters = localStorage.getItem('ingestion_filters');
    const savedPagination = localStorage.getItem('ingestion_pagination');
    
    if (savedFilters) {
      const parsed = JSON.parse(savedFilters);
      this.filters = { ...this.filters, ...parsed };
      delete this.filters.teams;
      if (!this.getHeadquartersOptions().includes(this.filters.headquarters)) {
        this.filters.headquarters = '';
      }
      if (!this.getSalesOfficeOptions(this.filters.headquarters).includes(this.filters.salesOffice)) {
        this.filters.salesOffice = '';
      }
      if (!['all', 'pending', 'checking', 'synced', 'failed'].includes(this.filters.approvalStatus)) {
        this.filters.approvalStatus = 'all';
      }
      if (!this.filters.searchField) {
        this.filters.searchField = 'all';
      }
    }
    
    if (savedPagination) {
      const parsed = JSON.parse(savedPagination);
      this.pagination.page = parsed.page || 1;
    }
  },

  loadApprovedOriginalIds() {
    try {
      const savedIds = JSON.parse(localStorage.getItem('ingestion_approved_original_ids') || '[]');
      this.approvedOriginalIds = new Set(Array.isArray(savedIds) ? savedIds.map(String) : []);
    } catch (error) {
      this.approvedOriginalIds = new Set();
    }
  },

  saveApprovedOriginalIds() {
    localStorage.setItem('ingestion_approved_original_ids', JSON.stringify([...this.approvedOriginalIds]));
  },

  markOriginalRowsApproved(ids) {
    ids.map(String).forEach(id => this.approvedOriginalIds.add(id));
    this.saveApprovedOriginalIds();
  },

  loadQualityOriginalStates() {
    try {
      const saved = JSON.parse(localStorage.getItem('ingestion_quality_original_states') || '{}');
      this.qualityOriginalStates = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
      this.approvedOriginalIds.forEach((id) => {
        if (!this.qualityOriginalStates[id]) {
          this.qualityOriginalStates[id] = {
            status: '已同步',
            route: '标准POS',
            updatedAt: Date.now()
          };
        }
      });
      this.saveQualityOriginalStates();
    } catch (error) {
      this.qualityOriginalStates = {};
    }
  },

  saveQualityOriginalStates() {
    localStorage.setItem('ingestion_quality_original_states', JSON.stringify(this.qualityOriginalStates));
  },

  getQualityOriginalState(id, fallbackStatus = '') {
    const record = this.qualityOriginalStates[String(id)];
    if (!record) return { status: fallbackStatus };
    return {
      status: record.status || fallbackStatus,
      qualityRoute: record.route || '',
      qualityUpdatedAt: record.updatedAt || ''
    };
  },

  setQualityOriginalState(id, patch = {}) {
    const key = String(id);
    this.qualityOriginalStates[key] = {
      ...(this.qualityOriginalStates[key] || {}),
      ...patch,
      updatedAt: Date.now()
    };
    const row = this.data.find(item => String(item.id) === key);
    if (row) {
      row.status = this.qualityOriginalStates[key].status || row.status;
      row.qualityRoute = this.qualityOriginalStates[key].route || '';
      row.qualityUpdatedAt = this.qualityOriginalStates[key].updatedAt;
    }
  },

  getQualityRoute(row = {}) {
    const confidenceValue = Number.parseFloat(row.confidence || '0');
    return confidenceValue > 95 ? '标准POS' : '异常数据列表';
  },

  startOriginalQualityCheck(ids = []) {
    const targetIds = ids.map(String);
    targetIds.forEach((id) => {
      const row = this.data.find(item => String(item.id) === id);
      this.setQualityOriginalState(id, {
        status: '质量校验中',
        route: row ? this.getQualityRoute(row) : '标准POS'
      });
    });
    this.saveQualityOriginalStates();
    this.scheduleQualityCheckCompletion(targetIds);
  },

  scheduleQualityCheckCompletion(ids = [], delay = this.checkingMinDurationMs, options = {}) {
    const targetIds = ids.map(String);
    if (!targetIds.length) return;

    setTimeout(() => {
      const completedRows = [];
      targetIds.forEach((id) => {
        const row = this.data.find(item => String(item.id) === id);
        const record = this.qualityOriginalStates[id];
        if (!row || record?.status !== '质量校验中') return;
        const route = record.route || this.getQualityRoute(row);
        this.setQualityOriginalState(id, {
          status: '已同步',
          route
        });
        completedRows.push({ id, row, route });
        this.approvedOriginalIds.add(id);
      });
      this.saveQualityOriginalStates();
      this.saveApprovedOriginalIds();
      this.updateStats();
      this.applyFilters();
    }, delay);
  },

  showOriginalQualityCheckResult(completedRows = [], requestedCount = 0) {
    const total = completedRows.length || requestedCount;
    const standardCount = completedRows.filter(item => String(item.route || '').includes('标准')).length;
    const abnormalCount = Math.max(total - standardCount, 0);

    Dialog.show({
      title: '质检结果',
      content: `
        <div class="space-y-4">
          <div class="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div class="flex items-center gap-2 text-sm font-bold text-brand">
              <i class="fa-solid fa-clipboard-check"></i>
              本次质检数据
            </div>
            <div class="mt-3 text-2xl font-black text-[#1d2129]">${total}<span class="ml-1 text-sm font-medium text-[#4e5969]">条</span></div>
            <p class="mt-1 text-xs text-[#4e5969]">已完成所选单据的质量检查与同步处理。</p>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-xl border border-green-100 bg-green-50 p-4">
              <div class="flex items-center gap-2 text-sm font-bold text-green-700">
                <i class="fa-solid fa-circle-check"></i>
                正常数据
              </div>
              <div class="mt-3 text-xl font-black text-green-700">${standardCount}<span class="ml-1 text-sm font-medium">条</span></div>
              <p class="mt-2 text-xs leading-5 text-green-700">已同步至“质量检查 - 标准POS表”单据中。</p>
            </div>
            <div class="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <div class="flex items-center gap-2 text-sm font-bold text-amber-700">
                <i class="fa-solid fa-triangle-exclamation"></i>
                异常数据
              </div>
              <div class="mt-3 text-xl font-black text-amber-700">${abnormalCount}<span class="ml-1 text-sm font-medium">条</span></div>
              <p class="mt-2 text-xs leading-5 text-amber-700">已同步至“质量检查 - 异常数据”单据中。</p>
            </div>
          </div>
        </div>
      `,
      cancelText: '留在当前页面',
      confirmText: '跳转质量检查',
      onConfirm: () => {
        window.location.hash = '#qa';
      }
    });
  },

  resumeQualityChecks() {
    const now = Date.now();
    const runningIds = Object.entries(this.qualityOriginalStates)
      .filter(([, record]) => record?.status === '质量校验中')
      .map(([id]) => id);

    runningIds.forEach((id) => {
      const record = this.qualityOriginalStates[id];
      const elapsed = now - Number(record.updatedAt || now);
      this.scheduleQualityCheckCompletion([id], Math.max(500, this.checkingMinDurationMs - elapsed), { showResult: false });
    });
  },
  
  // 筛选逻辑
  applyFilters() {
    let result = [...this.data];

    if (this.activeDataMode === 'archive') {
      const archivedAttachmentRows = this.getRoutedInboxAttachments('已归档').map(({ attachment, attachmentIndex, inboxItem, sourceRow }) => ({
        ...sourceRow,
        id: `${inboxItem.id}-att-${attachmentIndex}`,
        sourceEmailId: inboxItem.id,
        sourceAttIdx: attachmentIndex,
        fileName: attachment.name,
        status: '已归档',
        handler: sourceRow.handler || sourceRow.team || 'POS担当',
        suggestion: '-'
      }));
      result = [
        ...archivedAttachmentRows,
        ...result.filter(row => row.status.includes('已归档'))
      ];
    } else {
      result = result.filter(row => !row.status.includes('已归档'));
    }
    
    // 搜索筛选
    if (this.filters.fileName) {
      const keyword = this.filters.fileName.toLowerCase();
      result = result.filter(row => this.matchesMatchedSearch(row, keyword));
    }
    
    if (this.filters.headquarters) {
      result = result.filter(row => row.headquarters === this.filters.headquarters);
    }

    if (this.filters.salesOffice) {
      result = result.filter(row => row.salesOffice === this.filters.salesOffice);
    }

    if (this.filters.approvalStatus === 'pending') {
      result = result.filter(row => !/(已通过|已同步|已驳回|质量校验中|校验失败)/.test(row.status));
    } else if (this.filters.approvalStatus === 'checking') {
      result = result.filter(row => row.status.includes('质量校验中'));
    } else if (this.filters.approvalStatus === 'synced') {
      result = result.filter(row => row.status.includes('已同步') || row.status.includes('已通过'));
    } else if (this.filters.approvalStatus === 'failed') {
      result = result.filter(row => row.status.includes('校验失败'));
    }
    
    this.filteredData = result;
    this.pagination.total = result.length;
    this.pagination.page = 1;
    this.saveFiltersToCache();
    if (this.activeDataMode === 'stash') {
      this.renderStashTable();
      return;
    }
    this.renderTable();
    this.updateBatchButtons();
  },
  
  // 防抖
  debounceTimer: null,
  debounce(fn, delay = 300) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(fn, delay);
  },
  
  // 重置筛选
  resetFilters() {
    this.filters = {
      fileName: '',
      searchField: 'all',
      headquarters: '',
      salesOffice: '',
      approvalStatus: 'all'
    };
    this.pagination.page = 1;
    this.saveFiltersToCache();
    this.applyFilters();
  },

  getSearchFieldOptions(mode = this.activeDataMode) {
    if (mode === 'stash') {
      return [
        { value: 'all', label: '全部' },
        { value: 'rawStoreName', label: '原始门店名称' },
        { value: 'rawStoreCode', label: '原始门店编码' }
      ];
    }
    if (mode === 'files') {
      return [
        { value: 'all', label: '全部' },
        { value: 'rawStoreName', label: '原始门店名称' },
        { value: 'rawStoreCode', label: '原始门店编码' },
        { value: 'storeName', label: '门店名称' },
        { value: 'storeCode', label: '门店编码' },
        { value: 'dealer', label: '经销商' },
        { value: 'acc', label: 'ACC名称' }
      ];
    }
    return [{ value: 'all', label: '全部' }];
  },

  getCurrentSearchField() {
    const options = this.getSearchFieldOptions(this.activeDataMode);
    const current = this.filters.searchField || 'all';
    return options.some(option => option.value === current) ? current : 'all';
  },

  getSearchFieldLabel(mode = this.activeDataMode, value = this.getCurrentSearchField()) {
    return this.getSearchFieldOptions(mode).find(option => option.value === value)?.label || '全部';
  },

  getMatchedSearchValue(row = {}, field) {
    const values = {
      rawStoreName: row.rawStoreName || row.fileName || '',
      rawStoreCode: row.rawStoreCode || this.getRawStoreCode(row) || '',
      storeName: row.storeName || '',
      storeCode: row.storeCode || '',
      dealer: row.dealer || '',
      acc: row.acc || ''
    };
    return values[field] || '';
  },

  matchesMatchedSearch(row = {}, keyword = '') {
    const field = this.getCurrentSearchField();
    const fields = field === 'all'
      ? ['rawStoreName', 'rawStoreCode', 'storeName', 'storeCode', 'dealer', 'acc']
      : [field];
    return fields.some(key => String(this.getMatchedSearchValue(row, key)).toLowerCase().includes(keyword));
  },

  getStashSearchValue(row = {}, index = 0, field) {
    const values = {
      rawStoreName: row.storeName || row.fileName || '',
      rawStoreCode: this.getStashRawStoreCode(row, index) || ''
    };
    return values[field] || '';
  },

  matchesStashSearch(row = {}, index = 0, keyword = '') {
    const field = this.getCurrentSearchField();
    const fields = field === 'all' ? ['rawStoreName', 'rawStoreCode'] : [field];
    return fields.some(key => String(this.getStashSearchValue(row, index, key)).toLowerCase().includes(keyword));
  },
  
  renderAction() {
    return '';
  },
  
  render() {
    this.loadData();
    const cn = this.getCurrentLang() === 'cn';
    return `
      <div class="bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white flex flex-col h-[calc(100vh-170px)] min-h-[620px] overflow-hidden animate-[fadeIn_0.4s_ease-out]">
        <!-- 标签切换 -->
        <div class="px-7 py-4 border-b border-gray-100 flex gap-2 bg-white shrink-0">
          <button type="button" id="tab-original" class="px-4 py-2 text-sm font-medium text-brand bg-blue-50 rounded-lg transition-all border border-blue-200">
            ${this.getCurrentLang() === 'cn' ? '文件箱' : '받은 편지함'}
          </button>
          <button type="button" id="tab-files" class="px-4 py-2 text-sm text-[#86909c] hover:text-[#1d2129] hover:bg-gray-50 rounded-lg transition-all border border-transparent">
            ${this.getCurrentLang() === 'cn' ? '单门店已匹配数据' : '원본 매장 데이터 목록'}
          </button>
          <button type="button" id="tab-stash" class="px-4 py-2 text-sm text-[#86909c] hover:text-[#1d2129] hover:bg-gray-50 rounded-lg transition-all border border-transparent">
            ${this.getCurrentLang() === 'cn' ? '单门店未匹配数据' : '임시 저장 데이터'}
          </button>
        </div>
        
        <!-- 筛选区 -->
        <div class="px-7 py-4 border-b border-gray-100 bg-white shrink-0">
          <div class="flex items-center gap-4 flex-wrap">
            <!-- 搜索 -->
            <div id="search-combo-wrapper" class="relative flex h-10 w-[420px] items-center rounded-lg border border-gray-200 bg-white transition-all focus-within:border-brand">
              <button type="button" id="search-field-btn"
                class="hidden h-full w-40 shrink-0 items-center justify-between gap-2 border-r border-gray-100 px-3 text-left text-sm text-[#4e5969] hover:bg-gray-50 rounded-l-lg"
                title="${this.getSearchFieldLabel()}">
                <span id="search-field-label" class="truncate">${this.getSearchFieldLabel()}</span>
                <i class="fa-solid fa-chevron-down text-[10px] text-[#86909c]"></i>
              </button>
              <div class="relative min-w-0 flex-1">
                <input type="text" id="filter-filename" placeholder="${this.getCurrentLang() === 'cn' ? '请输入文件名称模糊搜索' : '파일명 검색'}"
                  class="h-10 w-full border-0 bg-transparent pl-9 pr-10 text-sm text-[#4e5969] focus:outline-none"
                  value="${this.filters.fileName}">
                <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[#86909c]"></i>
              </div>
              <div id="search-field-dropdown" class="hidden absolute top-full left-0 mt-1 w-56 rounded-lg border border-gray-200 bg-white p-2 shadow-lg z-50"></div>
            </div>
            
            <!-- 收件箱状态多选 -->
            <div class="relative hidden" id="inbox-status-wrapper">
              <button type="button" id="inbox-status-btn" 
                class="px-4 py-2 w-36 border border-gray-200 rounded-lg text-sm text-[#4e5969] bg-white text-left flex items-center justify-between gap-2 focus:outline-none focus:border-brand transition-all">
                <span id="inbox-status-label">${this.getCurrentLang() === 'cn' ? '全部状态' : '전체 상태'}</span>
                <i class="fa-solid fa-chevron-down text-xs"></i>
              </button>
              <div id="inbox-status-dropdown" class="hidden absolute top-full left-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2">
                <label class="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer">
                  <input type="checkbox" id="inbox-status-select-all" class="rounded border-gray-300 text-brand">
                  <span class="text-sm text-[#4e5969]">${this.getCurrentLang() === 'cn' ? '全选' : '전체 선택'}</span>
                </label>
                <div class="border-t border-gray-100 my-1"></div>
                ${[['正常', '정상'], ['校验中', '검사 중'], ['驳回', '반려'], ['待处理', '처리 대기']].map(([val, label]) => `
                  <label class="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer">
                    <input type="checkbox" value="${val}" class="inbox-status-checkbox rounded border-gray-300 text-brand" ${this.inboxStatusFilter.includes(val) ? 'checked' : ''}>
                    <span class="text-sm text-[#4e5969]">${this.getCurrentLang() === 'cn' ? val : label}</span>
                  </label>
                `).join('')}
              </div>
            </div>
            
            <!-- 本部/营业所级联筛选 -->
            <div class="relative hidden" id="team-select-wrapper">
              <button type="button" id="team-select-btn" 
                class="px-4 py-2 w-48 border border-gray-200 rounded-lg text-sm text-[#4e5969] bg-white text-left flex items-center justify-between gap-2 focus:outline-none focus:border-brand transition-all">
                <span id="team-select-label" class="truncate">${this.filters.salesOffice || this.filters.headquarters || '全部本部/营业所'}</span>
                <i class="fa-solid fa-chevron-down text-xs"></i>
              </button>
              <div id="team-dropdown" class="hidden absolute top-full left-0 mt-1 w-[440px] bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                <button type="button" data-org-all class="w-full px-4 py-2.5 text-left text-sm text-brand hover:bg-blue-50 border-b border-gray-100">
                  全部本部/营业所
                </button>
                <div class="grid grid-cols-2 min-h-[250px]">
                  <div class="border-r border-gray-100 p-2">
                    <div class="px-2 py-1.5 text-xs font-semibold text-[#86909c]">本部</div>
                    ${this.getHeadquartersOptions().map(headquarters => `
                      <button type="button" data-headquarters="${this.escapeHtml(headquarters)}"
                        class="org-headquarters-option w-full flex items-center justify-between px-3 py-2 text-left text-sm rounded-md hover:bg-gray-50 ${this.filters.headquarters === headquarters ? 'bg-blue-50 text-brand font-medium' : 'text-[#4e5969]'}">
                        <span>${this.escapeHtml(headquarters)}</span>
                        <i class="fa-solid fa-chevron-right text-[10px] text-[#86909c]"></i>
                      </button>
                    `).join('')}
                  </div>
                  <div class="p-2">
                    <div class="px-2 py-1.5 text-xs font-semibold text-[#86909c]">营业所</div>
                    <div id="sales-office-options">
                      ${this.filters.headquarters
                        ? this.getSalesOfficeOptions(this.filters.headquarters).map(office => `
                          <button type="button" data-sales-office="${this.escapeHtml(office)}"
                            class="w-full px-3 py-2 text-left text-sm rounded-md hover:bg-gray-50 ${this.filters.salesOffice === office ? 'bg-blue-50 text-brand font-medium' : 'text-[#4e5969]'}">
                            ${this.escapeHtml(office)}
                          </button>
                        `).join('')
                        : '<div class="px-3 py-8 text-center text-xs text-[#86909c]">请先选择本部</div>'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 审批状态筛选 -->
            <div class="relative hidden" id="approval-status-wrapper">
              <select id="approval-status-select"
                class="w-40 appearance-none px-4 py-2 pr-9 border border-gray-200 rounded-lg text-sm text-[#4e5969] bg-white focus:outline-none focus:border-brand transition-all">
                <option value="all" ${this.filters.approvalStatus === 'all' ? 'selected' : ''}>全部状态</option>
                <option value="pending" ${this.filters.approvalStatus === 'pending' ? 'selected' : ''}>待通过</option>
                <option value="checking" ${this.filters.approvalStatus === 'checking' ? 'selected' : ''}>质量校验中</option>
                <option value="synced" ${this.filters.approvalStatus === 'synced' ? 'selected' : ''}>已同步</option>
                <option value="failed" ${this.filters.approvalStatus === 'failed' ? 'selected' : ''}>校验失败</option>
              </select>
              <i class="fa-solid fa-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#86909c]"></i>
            </div>
            
            <!-- 重置按钮 -->
            <button type="button" id="btn-reset-filter" 
              class="px-4 py-2 text-sm text-[#86909c] hover:text-[#1d2129] hover:bg-gray-50 rounded-lg transition-all">
              <i class="fa-solid fa-rotate-left mr-1"></i>${this.getCurrentLang() === 'cn' ? '重置筛选' : '筛选 초기화'}
            </button>
            
            <!-- 批量操作区 -->
            <div class="ml-auto flex items-center gap-2">
              <button type="button" id="quality-checking-hint"
                class="hidden px-3 py-2 rounded-lg border border-blue-100 bg-blue-50 text-brand text-sm font-medium hover:bg-blue-100 transition-all">
                <i class="fa-solid fa-spinner fa-spin mr-1"></i><span id="quality-checking-count">0</span> 条校验中
              </button>
              <button type="button" id="upload-checking-hint"
                class="hidden px-3 py-2 rounded-lg border border-blue-100 bg-blue-50 text-brand text-sm font-medium hover:bg-blue-100 transition-all">
                <i class="fa-solid fa-spinner fa-spin mr-1"></i><span id="upload-checking-count">0</span> 条校验中
              </button>
              <button type="button" id="stash-checking-hint"
                class="hidden px-3 py-2 rounded-lg border border-blue-100 bg-blue-50 text-brand text-sm font-medium hover:bg-blue-100 transition-all">
                <i class="fa-solid fa-spinner fa-spin mr-1"></i><span id="stash-checking-count">0</span> 条校验中
              </button>
              <button type="button" id="btn-upload-file"
                class="px-4 py-2 bg-brand hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm shadow-brand/20 hover:shadow-brand/30 hover:-translate-y-0.5">
                <i class="fa-solid fa-upload mr-1"></i>${this.getCurrentLang() === 'cn' ? '上传文件' : '파일 업로드'}
              </button>
              <button type="button" id="btn-batch-archive" disabled
                class="hidden px-4 py-2 border border-gray-200 text-[#86909c] rounded-lg bg-gray-50 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                data-action="archive" title="${this.getCurrentLang() === 'cn' ? '请先勾选至少一条数据' : '최소 1개 데이터를 선택하세요'}">
                <i class="fa-solid fa-folder-minus mr-1"></i>${this.getCurrentLang() === 'cn' ? '归档(非POS表)' : '보관'}
              </button>
              <button type="button" id="btn-batch-approve" disabled
                class="hidden px-4 py-2 bg-[#86909c] text-white rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                data-action="approve" title="${this.getCurrentLang() === 'cn' ? '请先勾选至少一条数据' : '최소 1개 데이터를 선택하세요'}">
                <i class="fa-solid fa-check mr-1"></i>${this.getCurrentLang() === 'cn' ? '质检' : '검사'}
              </button>
              <button type="button" id="btn-batch-reject" disabled
                class="hidden px-4 py-2 border border-gray-200 bg-gray-100 text-[#86909c] rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                data-action="reject" title="${this.getCurrentLang() === 'cn' ? '请先勾选至少一条数据' : '최소 1개 데이터를 선택하세요'}">
                <i class="fa-solid fa-xmark mr-1"></i>${this.getCurrentLang() === 'cn' ? '驳回' : '거부'}
              </button>
            </div>
          </div>
        </div>
        
        <!-- 收件箱视图 -->
        <div class="overflow-auto flex-1 relative px-2" id="original-attachment">
          <div id="inbox-loading" class="flex items-center justify-center py-16">
            <div class="flex flex-col items-center gap-3">
              <div class="w-10 h-10 border-4 border-blue-200 border-t-brand rounded-full animate-spin"></div>
              <span class="text-sm text-[#86909c]">${this.getCurrentLang() === 'cn' ? '加载中...' : '로딩 중...'}</span>
            </div>
          </div>
          <div id="inbox-table-container" class="hidden"></div>
          <div id="inbox-empty" class="hidden absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
            <div class="w-24 h-24 mb-4 text-[#d1d5db]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 11v4m0 0l-2-2m2 2l2-2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="text-[#86909c] text-base">${this.getCurrentLang() === 'cn' ? '暂无收件箱数据' : '받은 편지함 데이터가 없습니다'}</p>
          </div>
        </div>
        
        <!-- 表格区 -->
        <div class="overflow-auto flex-1 relative px-2 hidden" id="table-container">
          <div id="loading-state" class="hidden absolute inset-0 bg-white/80 flex items-center justify-center z-20">
            <div class="flex flex-col items-center gap-3">
              <div class="w-10 h-10 border-4 border-blue-200 border-t-brand rounded-full animate-spin"></div>
              <span class="text-sm text-[#86909c]">${this.getCurrentLang() === 'cn' ? '加载中...' : '로딩 중...'}</span>
            </div>
          </div>
          
          <table class="w-full text-left text-sm text-[#4e5969]" id="ingestion-table">
            <thead class="bg-[#f7f8fa] text-[#1d2129] font-medium sticky top-0 z-10">
              <tr id="ingestion-table-head-row"></tr>
            </thead>
            <tbody id="ingestion-tbody" class="divide-y divide-gray-100">
              <tr><td colspan="7" class="text-center py-12 text-[#86909c]">Loading...</td></tr>
            </tbody>
          </table>
          
          <!-- 空状态 -->
          <div id="empty-state" class="hidden absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
            <div class="w-24 h-24 mb-4 text-[#d1d5db]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 11v4m0 0l-2-2m2 2l2-2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="text-[#86909c] text-base mb-4">${this.getCurrentLang() === 'cn' ? '暂无符合条件的文件数据' : '조건에 맞는 데이터가 없습니다'}</p>
            <button type="button" id="btn-empty-reset" class="px-4 py-2 text-sm text-brand border border-brand rounded-lg hover:bg-blue-50 transition-all">
              ${this.getCurrentLang() === 'cn' ? '重置筛选' : '筛选 초기화'}
            </button>
          </div>
        </div>

        <div class="overflow-auto flex-1 relative px-2 hidden" id="ingestion-stash-container"></div>
        
        <!-- 分页 -->
        <div id="pagination-area" class="px-7 py-4 border-t border-gray-100 bg-white shrink-0 flex items-center justify-between">
          <div class="text-sm text-[#86909c]">
            ${this.getCurrentLang() === 'cn' ? '共' : '총'} <span id="total-count">0</span> ${this.getCurrentLang() === 'cn' ? '条数据' : '개 데이터'}
          </div>
          <div id="pagination-controls" class="flex items-center gap-2">
            <button type="button" id="btn-prev-page" class="px-3 py-1.5 text-xs rounded bg-gray-100 text-[#4e5969] hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all" disabled>
              <i class="fa-solid fa-chevron-left mr-1"></i>${this.getCurrentLang() === 'cn' ? '上一页' : '이전'}
            </button>
            <div id="page-numbers" class="flex items-center gap-1"></div>
            <button type="button" id="btn-next-page" class="px-3 py-1.5 text-xs rounded bg-gray-100 text-[#4e5969] hover:bg-gray-200 transition-all">
              ${this.getCurrentLang() === 'cn' ? '下一页' : '다음'}<i class="fa-solid fa-chevron-right ml-1"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  showLoading() {
    document.getElementById('loading-state')?.classList.remove('hidden');
  },
  
  hideLoading() {
    document.getElementById('loading-state')?.classList.add('hidden');
  },
  
  showEmptyState() {
    document.getElementById('empty-state')?.classList.remove('hidden');
    document.getElementById('ingestion-tbody')?.classList.add('hidden');
  },
  
  hideEmptyState() {
    document.getElementById('empty-state')?.classList.add('hidden');
    document.getElementById('ingestion-tbody')?.classList.remove('hidden');
  },
  
  // 生成收件箱数据（含每个邮件的附件明细）
  // 缓存：编辑后的附件名会存储在 inboxDataCache 中
  inboxDataCache: null,
  
  getInboxData() {
    if (this.inboxDataCache && this.inboxDataCache.length > 0) {
      return this.inboxDataCache;
    }
    
    // 驳回原因池
    const rejectionReasons = [
      '压缩包损坏',
      '压缩包无法打开',
      '文件无法打开',
      '文件格式错误',
      '数据不完整',
      '文件字段缺失',
      '日期格式错误',
      '销售额为空'
    ];

    // 驳回原因 → AI建议 对应关系
    const rejectionToSuggestion = {
      '压缩包损坏': '压缩包损坏，请核对源文件后重新上传，确保压缩包完整性',
      '压缩包无法打开': '压缩包无法打开，请检查压缩包是否加密或分卷后重新上传',
      '文件无法打开': '文件无法打开，请检查文件是否损坏，使用标准Excel格式重新上传',
      '文件格式错误': '文件格式不正确，请使用标准POS数据模板重新上传',
      '数据不完整': '数据不完整，请补充缺失的销售记录行后重新上传',
      '文件字段缺失': '文件字段缺失，请按照POS数据模板补充必要字段（条码、商品名称、数量、单价）后重新上传',
      '日期格式错误': '日期格式错误，请使用YYYY-MM-DD标准格式填写销售日期后重新上传',
      '销售额为空': '销售额数据为空，请核实销售金额并填写后重新上传',
      '文件损坏、打不开': '文件损坏且无法打开，请重新导出可打开的原始文件后上传',
      '文件加密，打不开': '文件加密且无法打开，请提供未加密的原始文件后重新上传',
      '门店名称或者门店编码缺失': '门店名称或门店编号缺失，请修改文件标题确保包含正确的门店信息后重新上传',
    };
    
    // 定义异常邮件索引及异常类型（只有3-4条异常数据）
    // type: 'all'=全部附件驳回, 'partial'=部分附件驳回
    const abnormalMap = {
      4: { type: 'all' },
      5: { type: 'all', reason: '门店名称或者门店编码缺失' },
      11: { type: 'partial' },
      18: { type: 'partial' }
    };
    
    const inboxItems = this.data.map((row, idx) => {
      const storeNameCN = row.storeName ? row.storeName.split(' / ')[0] : row.fileName;
      const isZip = /\.zip$/i.test(row.fileName);
      
      // 材料提供人
      const providers = [
        'zhangsan@orion.cn',
        'lisi@orion.cn',
        'wangwu@orion.cn',
        'zhaoliu@orion.cn',
        'chenqi@orion.cn',
        'liuba@orion.cn',
        'zhoujiu@orion.cn',
        'wushi@orion.cn',
        'zhengshiyi@orion.cn',
        'qianshier@orion.cn'
      ];
      const provider = providers[idx % providers.length];
      
      // 材料提供时间精确到时分秒
      const uploadTime = row.uploadTime || '';
      const provideTime = uploadTime
        ? this.formatDateTime(uploadTime)
        : `2026-0${1 + (idx % 6)}-${String(1 + (idx % 28)).padStart(2, '0')} 00:00:00`;
      
      // 生成模拟附件列表（2-4个附件）
      const attachmentCount = 2 + (idx % 3);
      const attachments = [];
      const sourceMethods = ['邮件上传', '系统上传', '邮件上传'];
      const abnormalCfg = abnormalMap[idx];
      
      for (let i = 0; i < attachmentCount; i++) {
        let status = '正常';
        let rejectReason = '-';
        
        if (abnormalCfg) {
          if (abnormalCfg.type === 'all') {
            // 所有附件都驳回，使用统一驳回原因
            status = '驳回';
            rejectReason = idx === 4
              ? '文件损坏、打不开'
              : abnormalCfg.reason || rejectionReasons[(idx + i) % rejectionReasons.length];
          } else if (abnormalCfg.type === 'partial') {
            // 一半正常一半驳回
            status = (i % 2 === 1) ? '驳回' : '正常';
            rejectReason = status === '驳回'
              ? (idx === 11 ? '文件加密，打不开' : rejectionReasons[(idx + i) % rejectionReasons.length])
              : '-';
          }
        }

        if ((idx === 2 && i === 0) || (idx === 3 && i === 1)) {
          status = '待处理';
          rejectReason = '该文件解析后发现“A门店、B门店”与原始门店数据列表中有重复';
        }
        if (idx === 0 && i === 0) {
          status = '校验中';
          rejectReason = '系统正在解析并校验该附件';
        }
        
        const isMultiStoreAttachment = (idx === 1 || idx === 2 || idx === 4) && i === 0;
        if (idx === 2 && i === 0) {
          status = '待处理';
          rejectReason = '无门店名称/门店编码';
        }
        if (idx === 4 && i === 0) {
          rejectReason = '无门店名称/门店编码';
        }
        attachments.push({
          name: (isZip && i === 0) || (idx === 2 && i === 0)
            ? `${storeNameCN}-销售明细包.zip`
            : `${storeNameCN}${i > 0 ? '-' + (i + 1) : ''}-销售明细.xlsx`,
          isMultiStore: isMultiStoreAttachment,
          splitStores: idx === 1 && i === 0
            ? [
                { storeName: '多客隆会盟大街', status: '已匹配' },
                { storeName: '多客隆沁河路', status: '已匹配' },
                { storeName: '多客隆黄河大道', status: '未匹配' }
              ]
            : idx === 2 && i === 0
              ? [
                  { storeName: '邯郸格耀人民路', status: '重复' },
                  { storeName: '邯郸格耀滏东店', status: '重复' },
                  { storeName: '邯郸格耀中华店', status: '已匹配' }
                ]
            : idx === 4 && i === 0
              ? [
                  { storeName: '新民友谊商城', status: '已匹配' },
                  { storeName: '新民友谊商城东店', status: '已匹配' },
                  { storeName: '', fileName: '待识别门店-销售明细.xlsx', status: '驳回', reason: '无门店名称/门店编码' }
                ]
              : [],
          initialSplitStores: idx === 2 && i === 0
            ? [
                { storeName: '邯郸格耀人民路', status: '已匹配' },
                { storeName: '邯郸格耀滏东店', status: '已匹配' },
                { storeName: '', fileName: '待识别门店-销售明细.xlsx', status: '驳回', reason: '无门店名称/门店编码' }
              ]
            : [],
          repeatMultiStoreFlow: idx === 2 && i === 0,
          status,
          rejectReason,
          sourceMethod: sourceMethods[(idx + i) % sourceMethods.length]
        });
      }
      
      const emailSubject = isZip
        ? `【POS数据】${storeNameCN} 数据压缩包`
        : `【POS数据】${storeNameCN} 12月门店数据`;
      
      const emailBody = isZip
        ? `请查收${storeNameCN}POS数据压缩包，解压后进行标准化处理。`
        : `请查收${storeNameCN}12月POS数据附件，烦请完成收取与质检。`;
      
      const inboxItem = {
        id: row.id,
        index: idx + 1,
        emailSubject,
        emailBody,
        month: row.month || '2026年06月',
        attachmentCount,
        isNormal: true,
        statusText: '正常',
        suggestion: '-',
        provider,
        provideTime,
        attachments
      };
      this.recalcInboxItemStatus(inboxItem);
      if (inboxItem.suggestion !== '-') {
        inboxItem.suggestion = inboxItem.suggestion
          .split('；')
          .map(reason => rejectionToSuggestion[reason] || reason)
          .join('；');
      }
      return inboxItem;
    });
    
    const deletionState = this.getInboxDeletionState();
    this.inboxDataCache = inboxItems
      .filter(item => !deletionState.parents.includes(String(item.id)))
      .map(item => {
        const deletedNames = deletionState.attachments[String(item.id)] || [];
        item.attachments = item.attachments.filter(attachment => !deletedNames.includes(attachment.name));
        item.attachmentCount = item.attachments.length;
        this.recalcInboxItemStatus(item);
        return item;
      })
      .filter(item => item.attachments.length > 0);
    return this.inboxDataCache;
  },
  
  renderInbox() {
    const loading = document.getElementById('inbox-loading');
    const tableContainer = document.getElementById('inbox-table-container');
    const empty = document.getElementById('inbox-empty');
    
    if (!tableContainer) return;
    this.renderUploadCheckStatus();
    
    const inboxData = this.getInboxData();
    
    // 按子级附件状态筛选
    let filteredInboxData = inboxData;
    if (this.inboxStatusFilter.length > 0) {
      filteredInboxData = inboxData.filter(item =>
        item.attachments.some(attachment => this.inboxStatusFilter.includes(attachment.status))
      );
    }
    filteredInboxData.forEach((item, index) => {
      item.index = index + 1;
    });
    
    if (filteredInboxData.length === 0) {
      if (loading) loading.classList.add('hidden');
      if (tableContainer) tableContainer.classList.add('hidden');
      if (empty) empty.classList.remove('hidden');
      return;
    }
    
    if (loading) loading.classList.add('hidden');
    if (empty) empty.classList.add('hidden');
    tableContainer.classList.remove('hidden');
    
    const cn = this.getCurrentLang() === 'cn';

    tableContainer.innerHTML = `
      <table class="w-full min-w-[1360px] text-left text-sm text-[#4e5969]" id="inbox-table">
        <thead class="bg-[#f7f8fa] text-[#1d2129] font-medium sticky top-0 z-10">
          <tr>
            <th class="px-3 py-3 w-12"></th>
            <th class="px-3 py-3 w-12">序号</th>
            <th class="px-4 py-3 min-w-[280px]">${cn ? '标题' : '제목'}</th>
            <th class="px-4 py-3 min-w-[200px]">${cn ? '内容' : '내용'}</th>
            <th class="px-4 py-3 w-24 text-center">${cn ? '状态' : '상태'}</th>
            <th class="px-4 py-3 w-24 text-center">${cn ? '附件数' : '첨부 수'}</th>
            <th class="px-4 py-3 w-44">${cn ? '材料提供人' : '제공자'}</th>
            <th class="px-4 py-3 w-32">${cn ? '材料提供时间' : '제공 시간'}</th>
            <th class="px-3 py-3 w-32 text-center">${cn ? '操作' : '조작'}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100" id="inbox-tbody">
          ${filteredInboxData.map(item => this.renderInboxRow(item)).join('')}
        </tbody>
      </table>
    `;
    
    this.bindInboxEvents();
  },

  renderUploadCheckStatus() {
    const statusEl = document.getElementById('upload-checking-hint');
    const countEl = document.getElementById('upload-checking-count');
    if (!statusEl || !countEl) return;

    const isActive = Boolean(this.uploadCheckState.active);
    statusEl.classList.toggle('hidden', !isActive || this.activeDataMode !== 'files');
    countEl.textContent = this.uploadCheckState.count || 0;
  },

  getInboxParentStatus(item = {}) {
    const attachments = (item.attachments || []).filter(attachment => !attachment.isHistorical);
    if (attachments.some(attachment => attachment.status === '校验中' || attachment.status === '检验中')) {
      return {
        text: '校验中',
        className: 'bg-blue-50 text-brand border-blue-100'
      };
    }
    if (attachments.some(attachment => attachment.status === '驳回')) {
      return {
        text: '驳回',
        className: 'bg-red-50 text-red-600 border-red-100'
      };
    }
    if (attachments.some(attachment => attachment.status === '待处理')) {
      return {
        text: '待处理',
        className: 'bg-amber-50 text-amber-700 border-amber-100'
      };
    }
    if (attachments.length > 0 && attachments.every(attachment => attachment.status === '正常')) {
      return {
        text: '正常',
        className: 'bg-green-50 text-green-700 border-green-100'
      };
    }
    return {
      text: item.statusText || '-',
      className: this.getInboxStatusStyle(item.statusText)
    };
  },
  
  renderInboxRow(item) {
    const hasRetryableAttachments = (item.attachments || []).some(att => att.status === '驳回' && !att.isHistorical);
    const parentStatus = this.getInboxParentStatus(item);
    return `
      <tr class="inbox-master-row hover:bg-slate-50 transition-colors cursor-pointer" data-id="${item.id}">
        <td class="px-3 py-3 text-center">
          <button type="button" class="inbox-expand-btn w-6 h-6 rounded flex items-center justify-center text-[#86909c] hover:text-brand hover:bg-blue-50 transition-all" data-id="${item.id}">
            <i class="fa-solid fa-chevron-right text-xs transition-transform duration-200"></i>
          </button>
        </td>
        <td class="px-3 py-3 font-medium text-[#1d2129]">${item.index}</td>
        <td class="px-4 py-3">
          <div class="max-w-[360px] truncate font-medium text-[#1d2129]" title="${this.escapeHtml(item.emailSubject)}">${this.escapeHtml(item.emailSubject)}</div>
        </td>
        <td class="px-4 py-3">
          <div class="hover-tip max-w-[280px] truncate text-[#4e5969]" data-tip="${this.escapeHtml(item.emailBody)}">${this.escapeHtml(item.emailBody)}</div>
        </td>
        <td class="px-4 py-3 text-center">
          <span class="inline-flex h-6 min-w-[56px] items-center justify-center whitespace-nowrap rounded-full border px-2 text-xs font-semibold leading-none ${parentStatus.className}">
            ${this.escapeHtml(parentStatus.text)}
          </span>
        </td>
        <td class="px-4 py-3 text-center">
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-[#4e5969]">${item.attachmentCount}</span>
        </td>
        <td class="px-4 py-3">
          <span class="block max-w-[168px] truncate text-sm text-[#1d2129]" title="${this.escapeHtml(item.provider)}">${this.escapeHtml(item.provider)}</span>
        </td>
        <td class="px-4 py-3">
          <span class="text-sm text-[#4e5969]">${item.provideTime}</span>
        </td>
        <td class="px-3 py-3 text-center">
          <div class="flex w-full items-center justify-center gap-1 whitespace-nowrap">
            <button type="button" class="inbox-parent-delete-btn inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors" data-email-id="${item.id}" title="${this.getCurrentLang() === 'cn' ? '删除单据' : '문서 삭제'}" aria-label="${this.getCurrentLang() === 'cn' ? '删除单据' : '문서 삭제'}">
              <i class="fa-solid fa-trash-can"></i>
            </button>
            ${hasRetryableAttachments ? `
              <button type="button" class="inbox-parent-retry-btn hidden h-8 w-8 items-center justify-center rounded-lg text-brand hover:bg-blue-50 transition-colors" data-email-id="${item.id}" title="${this.getCurrentLang() === 'cn' ? '批量重传驳回文件' : '반려 파일 일괄 재업로드'}" aria-label="${this.getCurrentLang() === 'cn' ? '批量重传驳回文件' : '반려 파일 일괄 재업로드'}">
                <i class="fa-solid fa-file-arrow-up"></i>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  },
  
  renderInboxDetailRow(item) {
    const cn = this.getCurrentLang() === 'cn';
    const orderedAttachments = [...(item.attachments || [])].sort((a, b) => Number(Boolean(a.isHistorical)) - Number(Boolean(b.isHistorical)));
    return `
      <tr class="inbox-detail-row hidden" data-parent-id="${item.id}">
        <td colspan="9" class="p-0 bg-[#f7faff]">
          <div class="px-0 py-4 border-t border-blue-100">
            <table class="w-full table-fixed text-left text-xs text-[#4e5969] border border-gray-100 rounded-lg overflow-hidden">
              <thead class="bg-[#eef2fb] text-[#1d2129] font-semibold">
                <tr>
                  <th class="px-4 py-2.5 w-[34%]">${cn ? '文件名称' : '파일명'}</th>
                  <th class="px-4 py-2.5 w-[120px] text-center">${cn ? '文件状态' : '파일 상태'}</th>
                  <th class="px-4 py-2.5 w-[28%]">${cn ? '异常说明' : '이상 설명'}</th>
                  <th class="px-4 py-2.5 w-[220px] text-left">${cn ? '操作' : '조작'}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 bg-white">
                ${orderedAttachments.map(att => this.renderAttachmentRow(item.id, att, item.attachments.indexOf(att))).join('')}
              </tbody>
            </table>
          </div>
        </td>
      </tr>
    `;
  },
  
  renderAttachmentRow(emailId, att, index) {
    const isHistorical = Boolean(att.isHistorical);
    const isRejected = att.status === '驳回' && !isHistorical;
    const isArchived = att.status === '已归档';
    const isPending = att.status === '待处理';
    const isCovered = att.status === '覆盖';
    const isStashed = att.status === '暂存';
    const canResolveDuplicate = this.isPendingDuplicateAttachment(att);
    const statusDescription = isHistorical ? (att.historicalReason || att.rejectReason) : att.rejectReason;
    const versionLabel = att.version ? ` V${att.version}` : '';
    return `
      <tr class="hover:bg-slate-50 transition-colors" data-email-id="${emailId}" data-att-idx="${index}">
        <td class="px-4 py-2.5 w-[34%] max-w-0">
          <span class="inbox-att-name-text cursor-pointer text-brand hover:text-blue-700 hover:underline transition-colors truncate block" data-email-id="${emailId}" data-att-idx="${index}" title="${this.getCurrentLang() === 'cn' ? '点击预览' : '클릭하여 미리보기'}">${this.escapeHtml(this.getAttachmentDisplayName(att))}<span class="ml-1 text-[11px] font-semibold ${isHistorical ? 'text-slate-400' : 'text-brand'}">${versionLabel}</span></span>
        </td>
        <td class="px-4 py-2.5 w-[120px] text-center">
          <span class="px-2 py-0.5 rounded-full text-xs font-semibold border ${isHistorical ? 'bg-slate-50 text-slate-500 border-slate-200' : isRejected ? 'bg-red-50 text-red-600 border-red-100' : isPending ? 'bg-amber-50 text-amber-700 border-amber-100' : isCovered ? 'bg-blue-50 text-brand border-blue-100' : isArchived ? 'bg-slate-50 text-slate-500 border-slate-100' : isStashed ? 'bg-blue-50 text-brand border-blue-100' : 'bg-green-50 text-green-700 border-green-100'}">
            ${isHistorical ? (this.getCurrentLang() === 'cn' ? '历史版本' : '이전 버전') : att.status}
          </span>
        </td>
        <td class="px-4 py-2.5 w-[28%] max-w-0 ${isRejected ? 'text-red-600' : isPending ? 'text-amber-700' : 'text-[#86909c]'}">
          <div class="truncate" title="${this.escapeHtml(statusDescription)}">${this.escapeHtml(statusDescription)}</div>
        </td>
        <td class="px-4 py-2.5 w-[220px]">
          <div class="flex items-center justify-start gap-1.5 whitespace-nowrap">
            <button type="button" class="inbox-att-detail-btn px-2 py-1 text-xs rounded text-brand hover:bg-blue-50 transition-all" data-email-id="${emailId}" data-att-idx="${index}" title="${this.getCurrentLang() === 'cn' ? '单据详情' : '문서 상세'}">
              <i class="fa-solid fa-list-check"></i>
            </button>
            ${isRejected ? `
              <button type="button" class="inbox-att-retry-btn hidden h-7 w-7 items-center justify-center rounded text-brand hover:bg-blue-50 transition-colors" data-email-id="${emailId}" data-att-idx="${index}" title="${this.getCurrentLang() === 'cn' ? '批量重传驳回文件' : '반려 파일 일괄 재업로드'}" aria-label="${this.getCurrentLang() === 'cn' ? '批量重传驳回文件' : '반려 파일 일괄 재업로드'}">
                <i class="fa-solid fa-file-arrow-up"></i>
              </button>
            ` : ''}
            <button type="button" class="inbox-att-delete-btn rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors" data-email-id="${emailId}" data-att-idx="${index}" title="${this.getCurrentLang() === 'cn' ? '删除附件' : '첨부 파일 삭제'}">
              <i class="fa-solid fa-trash-can"></i>
            </button>
            ${canResolveDuplicate ? `
              <button type="button" class="inbox-att-resolve-btn rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-medium text-brand hover:bg-blue-100 transition-colors" data-action="cover" data-email-id="${emailId}" data-att-idx="${index}">覆盖</button>
              <button type="button" class="inbox-att-resolve-btn rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-[#4e5969] hover:bg-slate-50 transition-colors" data-action="ignore" data-email-id="${emailId}" data-att-idx="${index}">忽略</button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  },

  resolveDuplicateAttachment(emailId, attachmentIndex, action) {
    const inboxItem = this.getInboxData().find(item => String(item.id) === String(emailId));
    const attachment = inboxItem?.attachments?.[attachmentIndex];
    if (!inboxItem || !attachment || !this.isPendingDuplicateAttachment(attachment)) return;

    const cn = this.getCurrentLang() === 'cn';
    const resolvedText = action === 'cover'
      ? (cn ? '已覆盖重复门店' : '중복 매장을 덮어썼습니다')
      : (cn ? '已忽略重复门店' : '중복 매장을 무시했습니다');

    attachment.splitStores = (attachment.splitStores || []).map(store => {
      if (store.status !== '重复') return store;
      return {
        ...store,
        status: action === 'cover' ? '已覆盖' : '已忽略',
        reason: resolvedText
      };
    });
    attachment.status = '正常';
    attachment.duplicateResolution = action;
    attachment.resolvedAt = this.formatNowDateTime(new Date());
    attachment.rejectReason = resolvedText;
    this.recalcInboxItemStatus(inboxItem);
    this.renderInbox();
    Dialog.toast(resolvedText, 'success');
  },

  getInboxDeletionState() {
    try {
      const saved = JSON.parse(localStorage.getItem('pos-inbox-deletions') || '{}');
      return {
        parents: Array.isArray(saved.parents) ? saved.parents : [],
        attachments: saved.attachments && typeof saved.attachments === 'object' ? saved.attachments : {}
      };
    } catch (error) {
      return { parents: [], attachments: {} };
    }
  },

  saveInboxDeletionState(state) {
    try {
      localStorage.setItem('pos-inbox-deletions', JSON.stringify(state));
    } catch (error) {
      // 本地存储不可用时，删除仍在当前会话内生效。
    }
  },

  rememberInboxDeletion(emailId, attachmentName = '') {
    const state = this.getInboxDeletionState();
    if (!attachmentName) {
      if (!state.parents.includes(String(emailId))) state.parents.push(String(emailId));
      delete state.attachments[String(emailId)];
    } else {
      const names = state.attachments[String(emailId)] || [];
      if (!names.includes(attachmentName)) names.push(attachmentName);
      state.attachments[String(emailId)] = names;
    }
    this.saveInboxDeletionState(state);
  },

  forgetInboxDeletion(emailId, attachmentName = '') {
    const state = this.getInboxDeletionState();
    if (!attachmentName) {
      state.parents = state.parents.filter(id => id !== String(emailId));
    } else {
      state.attachments[String(emailId)] = (state.attachments[String(emailId)] || []).filter(name => name !== attachmentName);
      if (!state.attachments[String(emailId)].length) delete state.attachments[String(emailId)];
    }
    this.saveInboxDeletionState(state);
  },

  showInboxDeleteUndo(message, onUndo) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-6 left-1/2 -translate-x-1/2 z-[10001] flex items-center gap-4 rounded-lg bg-slate-800 px-5 py-3 text-white shadow-xl';
    toast.innerHTML = `<span class="text-sm font-medium">${this.escapeHtml(message)}</span><button type="button" class="font-semibold text-blue-200 hover:text-white">撤销</button>`;
    document.body.appendChild(toast);
    let settled = false;
    const timer = setTimeout(() => {
      settled = true;
      toast.remove();
    }, 5000);
    toast.querySelector('button')?.addEventListener('click', () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      toast.remove();
      onUndo?.();
    });
  },

  removeInboxParent(emailId, allowUndo = true) {
    const items = this.getInboxData();
    const itemIndex = items.findIndex(item => String(item.id) === String(emailId));
    if (itemIndex < 0) return;
    const removedItem = items[itemIndex];
    const removedRows = this.data.filter(row => String(row.sourceEmailId || row.id) === String(emailId));
    items.splice(itemIndex, 1);
    this.data = this.data.filter(row => String(row.sourceEmailId || row.id) !== String(emailId));
    this.rememberInboxDeletion(emailId);
    this.renderInbox();
    this.updateStats?.();
    if (allowUndo) {
      this.showInboxDeleteUndo('父级单据及关联附件已删除', () => {
        items.splice(itemIndex, 0, removedItem);
        this.data.push(...removedRows);
        this.forgetInboxDeletion(emailId);
        this.renderInbox();
        this.updateStats?.();
      });
    }
  },

  removeInboxAttachment(emailId, attachmentIndex) {
    const item = this.getInboxData().find(row => String(row.id) === String(emailId));
    const attachment = item?.attachments?.[attachmentIndex];
    if (!item || !attachment) return;
    if (item.attachments.length === 1) {
      this.removeInboxParent(emailId, true);
      return;
    }
    const removedRows = this.data.filter(row => String(row.sourceEmailId) === String(emailId) && Number(row.sourceAttIdx) === attachmentIndex);
    item.attachments.splice(attachmentIndex, 1);
    item.attachmentCount = item.attachments.length;
    this.data = this.data.filter(row => !(String(row.sourceEmailId) === String(emailId) && Number(row.sourceAttIdx) === attachmentIndex));
    this.recalcInboxItemStatus(item);
    this.rememberInboxDeletion(emailId, attachment.name);
    this.renderInbox();
    this.updateStats?.();
    this.showInboxDeleteUndo('附件及关联数据已删除', () => {
      item.attachments.splice(attachmentIndex, 0, attachment);
      item.attachmentCount = item.attachments.length;
      this.data.push(...removedRows);
      this.recalcInboxItemStatus(item);
      this.forgetInboxDeletion(emailId, attachment.name);
      this.renderInbox();
      this.updateStats?.();
    });
  },

  confirmDeleteInboxParent(emailId) {
    const item = this.getInboxData().find(row => String(row.id) === String(emailId));
    if (!item) return;
    const linkedCount = this.data.filter(row => String(row.sourceEmailId || row.id) === String(emailId)).length;
    Dialog.show({
      title: '删除父级单据',
      content: `<div class="space-y-3"><p>确认删除“${this.escapeHtml(item.emailSubject)}”吗？</p><div class="rounded-lg border border-red-100 bg-red-50 p-3 text-red-700">将同时删除 ${item.attachments.length} 个附件及 ${linkedCount} 条关联数据。</div></div>`,
      confirmText: '确认删除',
      onConfirm: () => this.removeInboxParent(emailId, true)
    });
  },

  confirmDeleteInboxAttachment(emailId, attachmentIndex) {
    const item = this.getInboxData().find(row => String(row.id) === String(emailId));
    const attachment = item?.attachments?.[attachmentIndex];
    if (!item || !attachment) return;
    const lastAttachment = item.attachments.length === 1;
    Dialog.show({
      title: lastAttachment ? '删除最后一个附件' : '删除附件',
      content: `<div class="space-y-3"><p>确认删除“${this.escapeHtml(this.getAttachmentDisplayName(attachment))}”吗？</p>${lastAttachment ? '<div class="rounded-lg border border-red-100 bg-red-50 p-3 text-red-700">这是最后一个附件，父级单据也将一并删除。</div>' : '<p class="text-slate-500">该附件产生的关联数据也会删除。</p>'}</div>`,
      confirmText: '确认删除',
      onConfirm: () => this.removeInboxAttachment(emailId, attachmentIndex)
    });
  },

  openInboxAttachmentRejectConfirm(emailId, attachmentIndex) {
    const overlay = document.getElementById('overlay-container');
    const inboxItem = this.getInboxData().find(item => String(item.id) === String(emailId));
    const attachment = inboxItem?.attachments?.[attachmentIndex];
    if (!overlay || !inboxItem || !attachment || attachment.status === '驳回') return;

    const cn = this.getCurrentLang() === 'cn';
    const provider = inboxItem.provider || '-';
    const abnormalReason = attachment.rejectReason && attachment.rejectReason !== '-'
      ? attachment.rejectReason
      : (cn ? '暂未识别到具体异常原因' : '구체적인 이상 원인이 확인되지 않았습니다');

    overlay.innerHTML = `
      <div id="inbox-reject-overlay" class="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center px-6">
        <div class="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-[fadeIn_0.18s_ease-out]" role="dialog" aria-modal="true" aria-labelledby="inbox-reject-title">
          <div class="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
            <div class="min-w-0">
              <h3 id="inbox-reject-title" class="text-lg font-bold text-[#1d2129]">${cn ? '确认驳回附件' : '첨부 파일 반려 확인'}</h3>
              <p class="mt-1 text-sm text-[#86909c] truncate" title="${this.escapeHtml(attachment.name)} · ${this.escapeHtml(inboxItem.emailSubject)}">${this.escapeHtml(attachment.name)} · ${this.escapeHtml(inboxItem.emailSubject)}</p>
            </div>
            <button type="button" id="inbox-reject-close" class="w-8 h-8 shrink-0 rounded-lg text-[#86909c] hover:bg-gray-100 hover:text-[#1d2129] transition-colors" aria-label="${cn ? '关闭' : '닫기'}">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="px-6 py-5 space-y-4">
            <div class="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
              <div class="text-xs font-semibold text-red-500 mb-1">${cn ? '异常说明' : '이상 설명'}</div>
              <div class="text-sm leading-6 text-[#1d2129]">${this.escapeHtml(abnormalReason)}</div>
            </div>
            <div class="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 flex items-center justify-between gap-4">
              <span class="text-sm text-[#4e5969]">${cn ? '退回至材料提供人' : '자료 제공자에게 반려'}</span>
              <span class="text-sm font-bold text-brand truncate" title="${this.escapeHtml(provider)}">${this.escapeHtml(provider)}</span>
            </div>
            <div>
              <label for="inbox-reject-manual-note" class="block mb-2 text-xs font-semibold text-[#4e5969]">${cn ? '手动备注信息' : '수동 메모'}</label>
              <textarea id="inbox-reject-manual-note" rows="4" maxlength="500"
                class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm leading-6 text-[#1d2129] resize-none focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
                placeholder="${cn ? '请输入补充说明或处理建议' : '추가 설명 또는 처리 의견을 입력하세요'}"></textarea>
              <div class="mt-1 text-right text-xs text-[#86909c]"><span id="inbox-reject-note-count">0</span>/500</div>
            </div>
            <p class="text-xs text-[#86909c] leading-5"><span class="font-semibold text-[#4e5969]">${cn ? '说明：' : '안내: '}</span>${cn ? '本次操作仅驳回当前附件，不影响同一材料中的其他附件。' : '현재 첨부 파일만 반려하며 같은 자료의 다른 첨부 파일에는 영향을 주지 않습니다.'}</p>
          </div>
          <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button type="button" id="inbox-reject-cancel" class="px-4 py-2 rounded-lg text-sm text-[#4e5969] bg-gray-100 hover:bg-gray-200 transition-colors">${cn ? '取消' : '취소'}</button>
            <button type="button" id="inbox-reject-submit" class="px-4 py-2 rounded-lg text-sm text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm">${cn ? '确认驳回' : '반려 확인'}</button>
          </div>
        </div>
      </div>
    `;

    const close = () => {
      overlay.innerHTML = '';
    };
    const modalOverlay = overlay.querySelector('#inbox-reject-overlay');
    const noteInput = overlay.querySelector('#inbox-reject-manual-note');
    const noteCount = overlay.querySelector('#inbox-reject-note-count');

    overlay.querySelector('#inbox-reject-close')?.addEventListener('click', close);
    overlay.querySelector('#inbox-reject-cancel')?.addEventListener('click', close);
    modalOverlay?.addEventListener('click', event => {
      if (event.target === modalOverlay) close();
    });
    noteInput?.addEventListener('input', () => {
      if (noteCount) noteCount.textContent = String(noteInput.value.length);
    });
    overlay.querySelector('#inbox-reject-submit')?.addEventListener('click', () => {
      const manualNote = noteInput?.value?.trim() || '';
      attachment.status = '驳回';
      attachment.rejectReason = manualNote
        ? `${abnormalReason}；人工备注：${manualNote}`
        : abnormalReason;

      this.recalcInboxItemStatus(inboxItem);

      close();
      this.renderInbox();
      Dialog.toast(
        cn
          ? `附件“${attachment.name}”已驳回至 ${provider}`
          : `첨부 파일 “${attachment.name}”이(가) ${provider}에게 반려되었습니다`,
        'success'
      );
    });
  },

  openOriginalFileRejectConfirm(rowId) {
    const cn = this.getCurrentLang() === 'cn';
    const rowData = this.data.find(row => String(row.id) === String(rowId));
    if (!rowData) return;

    const inboxItem = this.getInboxData().find(item => String(item.id) === String(rowId));
    const sourceText = inboxItem?.emailSubject || rowData.fileName;
    const rejectTeam = this.getLocalizedText(rowData.team || rowData.handler || 'POS担当');
    const overlay = document.createElement('div');
    overlay.id = 'original-reject-overlay';
    overlay.className = 'fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center px-6';
    overlay.innerHTML = `
      <div class="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-[fadeIn_0.18s_ease-out]" role="dialog" aria-modal="true" aria-labelledby="original-reject-title">
        <div class="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100">
          <div class="min-w-0">
            <h3 id="original-reject-title" class="text-lg font-bold text-[#1d2129]">${cn ? '确认驳回单门店数据' : '단일 매장 데이터 반려 확인'}</h3>
            <p class="mt-1 text-sm text-[#86909c] truncate" title="${this.escapeHtml(rowData.fileName)} · ${this.escapeHtml(sourceText)}">${this.escapeHtml(rowData.storeName || rowData.fileName)} · ${this.escapeHtml(rowData.storeCode || '-')}</p>
          </div>
          <button type="button" id="original-reject-close" class="w-8 h-8 shrink-0 rounded-lg text-[#86909c] hover:bg-gray-100 hover:text-[#1d2129] transition-colors" aria-label="${cn ? '关闭' : '닫기'}">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="px-6 py-5 space-y-4">
          <div class="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
            <label for="original-reject-team-select" class="mb-2 block text-xs font-semibold text-[#4e5969]">${cn ? '驳回至营业 Team' : '영업 Team으로 반려'}</label>
            ${this.renderRejectTeamSelect(rejectTeam, 'original-reject-team-select')}
          </div>
          <label class="block">
            <span class="block mb-2 text-xs font-semibold text-[#4e5969]">${cn ? '手动备注信息' : '수동 메모'}</span>
            <textarea id="original-reject-manual-note" rows="4" maxlength="500"
              class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm leading-6 text-[#1d2129] resize-none focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
              placeholder="${cn ? '可补充本次驳回的具体说明' : '이번 반려에 대한 상세 설명을 입력하세요'}">${this.escapeHtml(rowData.remark || '')}</textarea>
            <div class="mt-1 text-right text-xs text-[#86909c]"><span id="original-reject-note-count">0</span>/500</div>
          </label>
          <p class="text-xs text-[#86909c] leading-5"><span class="font-semibold text-[#4e5969]">${cn ? '说明：' : '안내: '}</span>${cn ? '驳回操作需针对门店级的完整 POS 表执行，而非单条数据。确认驳回后，该门店对应状态将更新为「已驳回」。' : '반려 작업은 단일 데이터가 아닌 매장 단위 POS 표에 적용됩니다.'}</p>
        </div>
        <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button type="button" id="original-reject-cancel" class="px-4 py-2 rounded-lg text-sm text-[#4e5969] bg-gray-100 hover:bg-gray-200 transition-colors">${cn ? '取消' : '취소'}</button>
          <button type="button" id="original-reject-submit" class="px-4 py-2 rounded-lg text-sm text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm">${cn ? '确认驳回' : '반려 확인'}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const noteInput = overlay.querySelector('#original-reject-manual-note');
    const noteCount = overlay.querySelector('#original-reject-note-count');
    const close = () => overlay.remove();
    const syncCount = () => {
      if (noteCount && noteInput) noteCount.textContent = String(noteInput.value.length);
    };

    overlay.querySelector('#original-reject-close')?.addEventListener('click', close);
    overlay.querySelector('#original-reject-cancel')?.addEventListener('click', close);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) close();
    });
    noteInput?.addEventListener('input', syncCount);
    syncCount();

    overlay.querySelector('#original-reject-submit')?.addEventListener('click', () => {
      const manualNote = noteInput?.value.trim() || '';
      const remark = manualNote || '手动驳回';
      const selectedTeam = overlay.querySelector('#original-reject-team-select')?.value || rejectTeam;

      this.data = this.data.map(row => {
        if (String(row.id) === String(rowId)) {
          return {
            ...row,
            status: '已驳回',
            handler: selectedTeam,
            remark
          };
        }
        return row;
      });
      this.updateStats();
      this.applyFilters();
      close();
      Dialog.toast(cn ? `已驳回至 ${selectedTeam}` : '파일을 반려했습니다');
    });

    noteInput?.focus();
  },
  
  bindInboxEvents() {
    const self = this;
    const tbody = document.getElementById('inbox-tbody');
    if (!tbody) return;
    
    // 展开/收起按钮
    tbody.querySelectorAll('.inbox-expand-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const icon = btn.querySelector('i');
        const detailRow = tbody.querySelector(`.inbox-detail-row[data-parent-id="${id}"]`);
        
        if (detailRow) {
          // 已存在，切换显示/隐藏
          const isHidden = detailRow.classList.contains('hidden');
          detailRow.classList.toggle('hidden');
          if (isHidden) {
            icon.style.transform = 'rotate(90deg)';
          } else {
            icon.style.transform = 'rotate(0deg)';
          }
        } else {
          // 不存在，创建detail行
          icon.style.transform = 'rotate(90deg)';
          const item = self.getInboxData().find(d => d.id === id);
          if (!item) return;
          
          const detailHTML = self.renderInboxDetailRow(item);
          const temp = document.createElement('tbody');
          temp.innerHTML = detailHTML;
          const newDetailRow = temp.firstElementChild;
          
          const masterRow = btn.closest('tr');
          masterRow.after(newDetailRow);
          newDetailRow.classList.remove('hidden');
          
          // 为新创建的detail绑定编辑和驳回事件
          self.bindAttachmentEvents(newDetailRow);
        }
      });
    });
    
    // 行点击也可展开
    tbody.querySelectorAll('.inbox-master-row').forEach(row => {
      row.addEventListener('click', (e) => {
        // 不拦截已有的事件
        if (e.target.closest('.inbox-expand-btn, .inbox-parent-delete-btn, .inbox-parent-retry-btn')) return;
        const btn = row.querySelector('.inbox-expand-btn');
        if (btn) btn.click();
      });
    });

    tbody.querySelectorAll('.inbox-parent-delete-btn').forEach(btn => {
      btn.addEventListener('click', event => {
        event.stopPropagation();
        self.confirmDeleteInboxParent(btn.dataset.emailId);
      });
    });

    tbody.querySelectorAll('.inbox-parent-retry-btn').forEach(btn => {
      btn.addEventListener('click', event => {
        event.stopPropagation();
        self.showUploadModal({ mode: 'retry', emailId: btn.dataset.emailId });
      });
    });
    
    // 绑定现有detail中的附件事件
    tbody.querySelectorAll('.inbox-detail-row').forEach(row => {
      self.bindAttachmentEvents(row);
    });

    // 初始化悬浮提示（延迟0.5s，不受overflow裁剪）
    self.initHoverTips(tbody);
  },

  // 悬浮提示：mouseover 延迟 0.5s 后在 body 末尾插入气泡，避开 overflow 裁剪
  initHoverTips(tbody) {
    const self = this;
    let tipTimer = null;
    let tipEl = null;

    const showTip = (hoverEl) => {
      const tipText = hoverEl.getAttribute('data-tip');
      if (!tipText || tipText === '-') return;

      tipTimer = setTimeout(() => {
        if (tipEl) { tipEl.remove(); tipEl = null; }

        tipEl = document.createElement('div');
        tipEl.className = 'hover-tip-popup';
        tipEl.textContent = tipText;
        document.body.appendChild(tipEl);

        const rect = hoverEl.getBoundingClientRect();
        const tipWidth = tipEl.offsetWidth;
        const tipHeight = tipEl.offsetHeight;

        // 水平：居中，但贴近视口边缘时回退
        let left = rect.left + rect.width / 2;
        const viewW = window.innerWidth;
        if (left - tipWidth / 2 < 10) left = tipWidth / 2 + 10;
        else if (left + tipWidth / 2 > viewW - 10) left = viewW - tipWidth / 2 - 10;

        // 垂直：默认在元素上方，空间不足时改到下方
        let top = rect.top - 8;
        if (top - tipHeight < 10) {
          top = rect.bottom + 8;
          tipEl.style.transform = 'translate(-50%, 0)';
        }

        tipEl.style.left = left + 'px';
        tipEl.style.top = top + 'px';
      }, 500);
    };

    const hideTip = () => {
      clearTimeout(tipTimer);
      if (tipEl) {
        tipEl.remove();
        tipEl = null;
      }
    };

    tbody.addEventListener('mouseover', (e) => {
      const hoverEl = e.target.closest('.hover-tip');
      if (!hoverEl) return;
      showTip(hoverEl);
    });

    tbody.addEventListener('mouseout', (e) => {
      const hoverEl = e.target.closest('.hover-tip');
      if (!hoverEl) return;
      // 如果 mouseout 的目标还在同一个 hover-tip 内（比如移到子元素），不隐藏
      if (e.relatedTarget && hoverEl.contains(e.relatedTarget)) return;
      hideTip();
    });

    // 滚动时立即隐藏，防止气泡错位
    const scrollContainer = tbody.closest('.overflow-auto');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', hideTip, { passive: true });
    }
  },

  bindAttachmentEvents(detailRow) {
    const self = this;
    const previewAttachment = (emailId, attIdx) => {
      const inboxItem = self.getInboxData().find(d => d.id === emailId);
      const attachment = inboxItem?.attachments?.[attIdx];
      if (!inboxItem || !attachment) return;
      if (attachment.status === '驳回') {
        Dialog.toast('文件异常、无法预览', 'warning');
        return;
      }
      self.showInboxAttachmentPreview(inboxItem, attachment);
    };
    
    detailRow.querySelectorAll('.inbox-att-detail-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const emailId = btn.getAttribute('data-email-id');
        const attIdx = Number(btn.getAttribute('data-att-idx') || 0);
        const inboxItem = self.getInboxData().find(d => String(d.id) === String(emailId));
        const attachment = inboxItem?.attachments?.[attIdx];
        if (!inboxItem || !attachment) return;
        self.openDocumentDetail({
          moduleName: self.getCurrentLang() === 'cn' ? '文件收取 - 收件箱' : '파일 수집 - 받은 편지함',
          currentNode: self.getCurrentLang() === 'cn' ? '收件箱附件' : '받은 편지함 첨부',
          title: attachment.name,
          nameLabel: self.getCurrentLang() === 'cn' ? '文件名称' : '파일명',
          statusText: attachment.status || inboxItem.statusText || '-',
          row: {
            fileName: attachment.name,
            storeName: attachment.name,
            sourceEmailId: inboxItem.id,
            sourceAttIdx: attIdx,
            sourceMethod: attachment.sourceMethod,
            reason: attachment.rejectReason
          },
          inboxItem,
          attachment,
          attachmentIndex: attIdx,
          moduleFields: [
            { label: self.getCurrentLang() === 'cn' ? '来源方式' : '출처 방식', value: attachment.sourceMethod || '-' },
            { label: self.getCurrentLang() === 'cn' ? '异常说明' : '이상 설명', value: attachment.rejectReason || '-' }
          ]
        });
      });
    });

    detailRow.querySelectorAll('.inbox-att-resolve-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const emailId = btn.getAttribute('data-email-id');
        const attIdx = Number(btn.getAttribute('data-att-idx') || 0);
        const action = btn.getAttribute('data-action') || 'ignore';
        self.resolveDuplicateAttachment(emailId, attIdx, action);
      });
    });

    detailRow.querySelectorAll('.inbox-att-retry-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        self.showUploadModal({
          mode: 'retry',
          emailId: btn.getAttribute('data-email-id'),
          attachmentIndex: Number(btn.getAttribute('data-att-idx') || 0)
        });
      });
    });

    detailRow.querySelectorAll('.inbox-att-delete-btn').forEach(btn => {
      btn.addEventListener('click', event => {
        event.stopPropagation();
        const emailId = btn.getAttribute('data-email-id');
        const attIdx = Number(btn.getAttribute('data-att-idx') || 0);
        self.confirmDeleteInboxAttachment(emailId, attIdx);
      });
    });
    
    // 附件名称点击预览
    detailRow.querySelectorAll('.inbox-att-name-text').forEach(nameEl => {
      nameEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const emailId = nameEl.getAttribute('data-email-id');
        const attIdx = parseInt(nameEl.getAttribute('data-att-idx') || '0');
        previewAttachment(emailId, attIdx);
      });
    });
  },

  getZipAttachmentFiles(inboxItem, attachment) {
    const cn = this.getCurrentLang() === 'cn';
    if (attachment?.repeatMultiStoreFlow) {
      return [
        {
          name: cn ? '邯郸格耀人民路-销售明细.xlsx' : '한단 거야오 인민로-판매 상세.xlsx',
          type: 'XLSX',
          status: cn ? '重复' : '중복',
          note: cn ? '与原始门店数据重复' : '기존 매장 데이터와 중복'
        },
        {
          name: cn ? '邯郸格耀滏东店-销售明细.xlsx' : '한단 거야오 푸둥점-판매 상세.xlsx',
          type: 'XLSX',
          status: cn ? '重复' : '중복',
          note: cn ? '与原始门店数据重复' : '기존 매장 데이터와 중복'
        },
        {
          name: cn ? '邯郸格耀中华店-销售明细.xlsx' : '한단 거야오 중화점-판매 상세.xlsx',
          type: 'XLSX',
          status: cn ? '正常' : '정상',
          note: cn ? '已识别并匹配门店' : '매장 식별 및 매칭 완료'
        }
      ];
    }
    return [
      {
        name: cn ? '门店销售明细.xlsx' : '매장 판매 상세.xlsx',
        type: 'XLSX',
        status: cn ? '正常' : '정상',
        note: cn ? '已识别为 POS 明细数据' : 'POS 상세 데이터로 인식됨'
      },
      {
        name: cn ? '产品销售汇总.csv' : '제품 판매 요약.csv',
        type: 'CSV',
        status: cn ? '正常' : '정상',
        note: cn ? '已识别为汇总辅助文件' : '요약 보조 파일로 인식됨'
      },
      {
        name: cn ? '重复门店清单.xlsx' : '중복 매장 목록.xlsx',
        type: 'XLSX',
        status: cn ? '待处理' : '처리 대기',
        note: cn ? 'A门店、B门店 与原始门店数据列表重复' : 'A/B 매장이 원본 매장 데이터 목록과 중복'
      }
    ];
  },

  getAttachmentDisplayName(attachment = {}) {
    const name = String(attachment.name || '');
    if (!attachment.isMultiStore) return name;
    return `${name}${this.getCurrentLang() === 'cn' ? '（多门店）' : '（다중 매장）'}`;
  },

  getAttachmentStatusClass(status) {
    if (status === '正常' || status === '정상') return 'bg-green-50 text-green-700 border-green-100';
    if (status === '校验中' || status === '检验中') return 'bg-blue-50 text-brand border-blue-100';
    if (status === '待处理' || status === '처리 대기') return 'bg-amber-50 text-amber-700 border-amber-100';
    if (status === '驳回') return 'bg-red-50 text-red-600 border-red-100';
    if (status === '已归档') return 'bg-slate-50 text-slate-500 border-slate-100';
    if (status === '暂存') return 'bg-blue-50 text-brand border-blue-100';
    return 'bg-gray-50 text-[#4e5969] border-gray-100';
  },

  buildInboxDocumentLogs(inboxItem) {
    const cn = this.getCurrentLang() === 'cn';
    const logs = [
      {
        node: cn ? '收件箱' : '받은 편지함',
        action: cn ? '材料进入收件箱' : '자료가 받은 편지함에 들어옴',
        time: inboxItem.provideTime || '-',
        status: cn ? '完成' : '완료',
        tone: 'success'
      },
      {
        node: cn ? '数据处理' : '데이터 처리',
        action: cn ? `系统解析 ${inboxItem.attachmentCount || inboxItem.attachments?.length || 0} 个来源附件` : '시스템이 첨부 파일을 분석',
        time: inboxItem.provideTime || '-',
        status: cn ? '完成' : '완료',
        tone: 'success'
      }
    ];

    (inboxItem.attachments || []).forEach((attachment) => {
      let node = cn ? '门店匹配' : '매장 매칭';
      let action = cn ? '附件识别通过，等待生成门店匹配结果' : '첨부 파일 인식 완료';
      let tone = 'success';

      if (attachment.status === '已归档') {
        node = cn ? '归档（非POS表）' : '보관(비POS표)';
        action = cn ? '附件被归档为非 POS 数据' : '비 POS 데이터로 보관됨';
        tone = 'muted';
      } else if (attachment.status === '校验中' || attachment.status === '检验中') {
        node = cn ? '校验中' : '검사 중';
        action = attachment.rejectReason || (cn ? '附件正在解析并校验' : '첨부 파일 검사 중');
        tone = 'info';
      } else if (attachment.status === '暂存') {
        node = cn ? '暂存数据' : '임시 저장 데이터';
        action = cn ? '缺少门店编码或所属组织，等待补全后进入门店匹配' : '매장 코드 또는 조직 정보 보완 대기';
        tone = 'info';
      } else if (attachment.status === '待处理') {
        node = cn ? '待处理' : '처리 대기';
        action = attachment.rejectReason || (cn ? '存在待处理异常' : '처리 대기 이상 존재');
        tone = 'warning';
      } else if (attachment.status === '驳回') {
        node = cn ? '已处理' : '처리 완료';
        action = attachment.rejectReason || (cn ? '附件已驳回' : '첨부 파일 반려됨');
        tone = 'danger';
      }

      logs.push({
        node,
        action: `${attachment.name}：${action}`,
        time: inboxItem.provideTime || '-',
        status: attachment.status,
        tone
      });
    });

    if (inboxItem.statusText === '正常') {
      logs.push({
        node: cn ? '质量检查' : '품질 검사',
        action: cn ? '可进入质量检查，后续通过后流入标准 POS 表与台账汇总' : '품질 검사 진입 가능',
        time: '-',
        status: cn ? '待执行' : '실행 대기',
        tone: 'info'
      });
    }

    return logs;
  },

  renderInboxSourceAttachments(inboxItem, options = {}) {
    const cn = this.getCurrentLang() === 'cn';
    const sourceAttachments = inboxItem.attachments || [];
    const attachments = options.attachment
      ? [{ attachment: options.attachment, index: typeof options.attachmentIndex === 'number' ? options.attachmentIndex : sourceAttachments.indexOf(options.attachment) }]
      : sourceAttachments.map((attachment, index) => ({ attachment, index }));
    if (!attachments.length) {
      return `<div class="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-[#86909c]">${cn ? '暂无原始文件' : '원본 파일 없음'}</div>`;
    }

    return attachments.map(({ attachment, index }) => {
      const isZip = /\.zip$/i.test(attachment.name || '');
      const zipFiles = isZip ? this.getZipAttachmentFiles(inboxItem, attachment) : [];
      const typeText = isZip ? 'ZIP' : (String(attachment.name || '').match(/\.([^.]+)$/)?.[1] || 'FILE').toUpperCase();
      const iconClass = isZip ? 'fa-file-zipper text-amber-500' : 'fa-file-excel text-green-600';
      return `
        <div class="rounded-lg border border-gray-100 bg-white overflow-hidden">
          <button type="button" class="doc-source-attachment-trigger w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-blue-50/50 transition-colors" data-email-id="${inboxItem.id}" data-att-idx="${index}">
            <span class="h-9 w-9 shrink-0 rounded-lg bg-slate-50 flex items-center justify-center">
              <i class="fa-solid ${iconClass} text-base"></i>
            </span>
            <div class="min-w-0 flex-1">
              <div class="text-sm font-semibold text-brand truncate hover:underline" title="${this.escapeHtml(this.getAttachmentDisplayName(attachment))}">${this.escapeHtml(this.getAttachmentDisplayName(attachment))}</div>
              <div class="mt-0.5 text-xs font-medium text-[#86909c]">${typeText}</div>
            </div>
            <i class="fa-solid fa-eye shrink-0 text-xs text-[#b0b7c3]"></i>
          </button>
          ${isZip ? `
            <div class="border-t border-gray-100 bg-slate-50/70 px-4 py-3">
              <div class="space-y-1.5 pl-12">
                ${zipFiles.map((file, fileIndex) => `
                  <button type="button" class="doc-source-zip-file-trigger w-full rounded-md px-3 py-2 text-left hover:bg-white hover:shadow-sm transition-colors" data-email-id="${inboxItem.id}" data-att-idx="${index}" data-zip-index="${fileIndex}">
                    <div class="flex items-center gap-2">
                      <i class="fa-solid ${/\.csv$/i.test(file.name || '') ? 'fa-file-csv text-emerald-600' : 'fa-file-excel text-green-600'} text-xs"></i>
                      <span class="min-w-0 flex-1 truncate text-xs font-semibold text-[#1d2129]" title="${this.escapeHtml(file.name)}">${this.escapeHtml(file.name)}</span>
                      <span class="shrink-0 text-[11px] font-medium text-[#86909c]">${this.escapeHtml(file.type)}</span>
                    </div>
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  },

  renderFallbackSourceFile(fileName = '') {
    const displayName = String(fileName || '').trim();
    if (!displayName) return '';
    const extension = displayName.match(/\.([^.]+)$/)?.[1]?.toUpperCase() || 'FILE';
    return `
      <button type="button" class="doc-fallback-source-trigger w-full rounded-lg border border-gray-100 bg-white px-4 py-3 flex items-center gap-3 text-left hover:bg-blue-50/50 transition-colors">
        <span class="h-9 w-9 shrink-0 rounded-lg bg-slate-50 flex items-center justify-center">
          <i class="fa-solid fa-file-excel text-green-600"></i>
        </span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-sm font-semibold text-brand hover:underline" title="${this.escapeHtml(displayName)}">${this.escapeHtml(displayName)}</span>
          <span class="mt-0.5 block text-xs font-medium text-[#86909c]">${this.escapeHtml(extension)}</span>
        </span>
        <i class="fa-solid fa-eye shrink-0 text-xs text-[#b0b7c3]"></i>
      </button>
    `;
  },

  findDocumentSource(row = {}) {
    const inboxData = this.getInboxData();
    if (row.sourceEmailId) {
      const inboxItem = inboxData.find(item => String(item.id) === String(row.sourceEmailId));
      const attachmentIndex = typeof row.sourceAttIdx === 'number' ? row.sourceAttIdx : 0;
      return {
        inboxItem,
        attachment: inboxItem?.attachments?.[attachmentIndex],
        attachmentIndex
      };
    }

    const name = String(row.fileName || row.storeName || row.title || '').replace(/\.(xlsx|xls|csv|zip)$/i, '');
    const inboxItem = inboxData.find(item => {
      const subject = String(item.emailSubject || '');
      const body = String(item.emailBody || '');
      const attachments = item.attachments || [];
      return subject.includes(name) || body.includes(name) || attachments.some(att => String(att.name || '').includes(name));
    }) || inboxData[0];
    const attachmentIndex = Math.max(0, (inboxItem?.attachments || []).findIndex(att => String(att.name || '').includes(name)));
    return {
      inboxItem,
      attachment: inboxItem?.attachments?.[attachmentIndex >= 0 ? attachmentIndex : 0],
      attachmentIndex: attachmentIndex >= 0 ? attachmentIndex : 0
    };
  },

  getLifecycleLogTone(statusText = '') {
    const text = String(statusText || '');
    if (/驳回|失败|异常/.test(text)) return 'danger';
    if (/待处理|待通过|暂存|未匹配|未开始/.test(text)) return 'warning';
    if (/校验中|质检中|处理中/.test(text)) return 'info';
    return 'success';
  },

  createLifecycleLog(node, status, action, time = '-', tone = '') {
    return {
      node,
      status,
      action,
      time,
      tone: tone || this.getLifecycleLogTone(status)
    };
  },

  getSingleStoreExcelName(name = '', storeName = '') {
    const baseName = String(name || storeName || '单门店销售明细')
      .replace(/\.(zip|xlsx|xls|csv)$/i, '')
      .replace(/销售明细包$/i, '销售明细')
      .replace(/数据压缩包$/i, '销售明细');
    return /\.xlsx$/i.test(baseName) ? baseName : `${baseName}.xlsx`;
  },

  getMatchedRowSourceAttIndex(row = {}, inboxItem = {}) {
    if (typeof row.sourceAttIdx === 'number') return row.sourceAttIdx;
    const sourceAttachments = inboxItem.attachments || [];
    if (!sourceAttachments.length) return 0;
    const numericId = Number.parseInt(String(row.id || '').replace(/\D/g, ''), 10);
    return Number.isFinite(numericId) ? Math.max(0, (numericId - 1) % sourceAttachments.length) : 0;
  },

  buildAttachmentStoreSplitRows(context = {}) {
    const inboxItem = context.inboxItem;
    const attachment = context.attachment;
    const attachmentIndex = typeof context.attachmentIndex === 'number' ? context.attachmentIndex : 0;
    if (!inboxItem || !attachment) return [];

    const configuredSplitStores = context.splitStores || attachment.splitStores;
    if (Array.isArray(configuredSplitStores) && configuredSplitStores.length) {
      return configuredSplitStores.map((store, index) => {
        const split = typeof store === 'string' ? { storeName: store, status: '已匹配' } : store;
        const status = split.status || '已匹配';
        const splitStoreName = split.storeName || `待识别门店${index + 1}`;
        return {
          fileName: split.fileName || this.getSingleStoreExcelName(`${splitStoreName}-销售明细.xlsx`, splitStoreName),
          storeName: split.storeName || '—',
          storeCode: split.storeCode || split.rawStoreCode || '—',
          status,
          tone: status === '驳回' ? 'danger' : /未匹配|重复/.test(status) ? 'warning' : 'success',
          reason: split.reason || '',
          previewKind: 'source',
          emailId: inboxItem.id,
          attachmentIndex,
          zipIndex: 0,
          sort: index
        };
      });
    }

    const matchedRows = this.data
      .filter(row => String(row.sourceEmailId || row.id) === String(inboxItem.id))
      .filter(row => this.getMatchedRowSourceAttIndex(row, inboxItem) === attachmentIndex)
      .filter(row => !String(row.status || '').includes('已归档'))
      .slice(0, 4)
      .map((row, index) => {
        const storeName = this.getLocalizedText(row.storeName || row.rawStoreName || row.fileName || attachment.name);
        return {
          fileName: this.getSingleStoreExcelName(row.rawStoreName || row.fileName || attachment.name, storeName),
          storeName,
          storeCode: row.storeCode || row.rawStoreCode || '—',
          status: '已匹配',
          tone: 'success',
          previewKind: 'matched',
          rowId: row.id,
          sort: index
        };
      });

    const stashRows = this.getStashSourceRows()
      .filter(item => String(item.row?.sourceEmailId || '') === String(inboxItem.id))
      .filter(item => Number(item.row?.sourceAttIdx) === attachmentIndex)
      .slice(0, 4)
      .map((item, index) => {
        const storeName = item.row?.storeName || attachment.name;
        return {
          fileName: this.getSingleStoreExcelName(storeName, storeName),
          storeName,
          storeCode: item.row?.storeCode || item.row?.rawStoreCode || '—',
          status: '未匹配',
          tone: 'warning',
          previewKind: 'stash',
          stashKey: item.key,
          sort: matchedRows.length + index
        };
      });

    const rows = [...matchedRows, ...stashRows];
    if (rows.length) return rows;

    const fallbackStore = this.getLocalizedText(context.row?.storeName || attachment.name || inboxItem.emailSubject || '单门店数据');
    const isZip = /\.zip$/i.test(attachment.name || '');
    return [{
      fileName: isZip ? this.getZipAttachmentFiles(inboxItem, attachment)[0]?.name || '门店销售明细.xlsx' : this.getSingleStoreExcelName(attachment.name, fallbackStore),
      storeName: fallbackStore,
      storeCode: context.row?.storeCode || context.row?.rawStoreCode || '—',
      status: '已匹配',
      tone: 'success',
      previewKind: 'source',
      emailId: inboxItem.id,
      attachmentIndex,
      zipIndex: 0,
      sort: 0
    }];
  },

  renderStoreSplitRows(rows = []) {
    if (!rows.length) return '';
    return `
      <div class="mt-3 rounded-lg border border-blue-100 bg-white overflow-hidden">
        <div class="flex items-center justify-between bg-blue-50/70 px-3 py-2">
          <span class="text-xs font-bold text-[#1d2129]">拆分结果</span>
          <span class="text-[11px] font-medium text-[#86909c]">单门店单 Excel</span>
        </div>
        <div class="divide-y divide-gray-100">
          ${rows.map(row => {
            const statusClass = row.tone === 'danger'
              ? 'bg-red-50 text-red-600 border-red-100'
              : row.tone === 'warning'
                ? 'bg-amber-50 text-amber-700 border-amber-100'
                : 'bg-green-50 text-green-700 border-green-100';
            return `
              <div class="grid grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)_72px] items-center gap-3 px-3 py-2.5 text-xs">
                <button type="button"
                  class="store-split-preview-btn min-w-0 flex items-center gap-2 text-left text-brand hover:text-blue-700 hover:underline"
                  data-preview-kind="${this.escapeHtml(row.previewKind || '')}"
                  data-row-id="${this.escapeHtml(row.rowId || '')}"
                  data-stash-key="${this.escapeHtml(row.stashKey || '')}"
                  data-email-id="${this.escapeHtml(row.emailId || '')}"
                  data-att-idx="${typeof row.attachmentIndex === 'number' ? row.attachmentIndex : ''}"
                  data-zip-index="${typeof row.zipIndex === 'number' ? row.zipIndex : ''}"
                  title="${this.escapeHtml(row.fileName)}">
                  <i class="fa-solid fa-file-excel shrink-0 text-green-600"></i>
                  <span class="truncate">${this.escapeHtml(row.fileName)}</span>
                </button>
                <div class="truncate font-medium text-[#4e5969]" title="${this.escapeHtml(row.storeName)}">${this.escapeHtml(row.storeName)}</div>
                <span class="justify-self-end rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusClass}">${this.escapeHtml(row.status)}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  buildDocumentSplitGroups(context = {}) {
    const inboxItem = context.inboxItem;
    if (!inboxItem) return [];
    const attachments = inboxItem.attachments || [];
    const selectedAttachment = context.attachment;
    const selectedIndex = typeof context.attachmentIndex === 'number'
      ? context.attachmentIndex
      : attachments.indexOf(selectedAttachment);
    const selectedGroupId = selectedAttachment?.sourceGroupId || '';
    const selectedName = this.normalizeRetryFileName(selectedAttachment?.name || '');
    const candidates = attachments
      .map((attachment, attachmentIndex) => ({ attachment, attachmentIndex }))
      .filter(({ attachment }) => {
        if (!selectedAttachment) return true;
        if (selectedGroupId) return attachment.sourceGroupId === selectedGroupId;
        return this.normalizeRetryFileName(attachment.name) === selectedName;
      });
    const groupMap = new Map();

    candidates.forEach(({ attachment, attachmentIndex }) => {
      const groupKey = attachment.sourceGroupId || `${inboxItem.id}-${this.normalizeRetryFileName(attachment.name) || attachmentIndex}`;
      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, {
          key: groupKey,
          fileName: attachment.originalFileName || attachment.name || `附件${attachmentIndex + 1}`,
          versions: []
        });
      }
      const group = groupMap.get(groupKey);
      const makeVersion = (versionNumber, splitStores, options = {}) => {
        const hasConfiguredRows = Array.isArray(splitStores) && splitStores.length > 0;
        const cannotSplit = /驳回|校验中/.test(String(attachment.status || '')) && !hasConfiguredRows;
        const rows = cannotSplit
          ? []
          : this.buildAttachmentStoreSplitRows({
              ...context,
              inboxItem,
              attachment,
              attachmentIndex,
              splitStores: hasConfiguredRows ? splitStores : undefined
            });
        group.versions.push({
          number: Number(versionNumber || 1),
          label: Number(versionNumber || 1) === 1 ? '首次上传' : '驳回重传',
          state: options.state || (attachment.isHistorical ? '历史版本' : '当前版本'),
          uploadedAt: options.uploadedAt || attachment.uploadedAt || inboxItem.provideTime || '-',
          status: options.status || attachment.status || '-',
          rows,
          attachmentIndex
        });
      };

      if (attachment.repeatMultiStoreFlow && Array.isArray(attachment.initialSplitStores)) {
        makeVersion(1, attachment.initialSplitStores, {
          state: '历史版本',
          uploadedAt: inboxItem.provideTime,
          status: '部分异常'
        });
        makeVersion(Math.max(2, Number(attachment.version || 2)), attachment.splitStores, {
          state: '当前版本',
          uploadedAt: attachment.uploadedAt || inboxItem.provideTime,
          status: attachment.status || '待处理'
        });
      } else {
        makeVersion(attachment.version || 1, attachment.splitStores);
      }
    });

    return [...groupMap.values()].map(group => ({
      ...group,
      versions: group.versions.sort((a, b) => a.number - b.number)
    }));
  },

  renderDocumentSplitResultSection(groups = []) {
    const cn = this.getCurrentLang() === 'cn';
    const statusClass = (row = {}) => {
      if (row.tone === 'danger' || /驳回|失败/.test(row.status || '')) return 'bg-red-50 text-red-600 border-red-100';
      if (row.tone === 'warning' || /未匹配|重复|待处理/.test(row.status || '')) return 'bg-amber-50 text-amber-700 border-amber-100';
      return 'bg-green-50 text-green-700 border-green-100';
    };
    const reasonText = (row = {}) => row.reason || (
      row.status === '已匹配' ? '已匹配门店主数据'
        : row.status === '未匹配' ? '未匹配到门店主数据'
          : row.status === '重复' ? '历史版本中该门店数据已流转'
            : row.status === '驳回' ? '拆分数据不满足流转条件'
              : '-'
    );
    return `
      <section class="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
        <div class="flex items-center justify-between gap-3 mb-4">
          <div class="flex items-center gap-2">
            <span class="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <i class="fa-solid fa-code-branch text-xs"></i>
            </span>
            <h4 class="text-sm font-extrabold text-[#1d2129]">${cn ? '拆分结果' : '분할 결과'}</h4>
          </div>
          <span class="text-xs font-medium text-[#86909c]">${cn ? '单门店单 Excel' : '매장별 Excel'}</span>
        </div>
        ${groups.length ? `
          <div class="space-y-4">
            ${groups.map((group, groupIndex) => {
              const currentIndex = Math.max(0, group.versions.findIndex(version => version.state === '当前版本'));
              const activeIndex = currentIndex >= 0 ? currentIndex : group.versions.length - 1;
              return `
                <div class="overflow-hidden rounded-xl border border-gray-100 bg-slate-50/60">
                  <div class="border-b border-gray-100 bg-white px-4 py-3">
                    <div class="flex min-w-0 items-center gap-2">
                      <i class="fa-solid fa-file-excel shrink-0 text-green-600"></i>
                      <span class="truncate text-sm font-semibold text-[#1d2129]" title="${this.escapeHtml(group.fileName)}">${this.escapeHtml(group.fileName)}</span>
                    </div>
                    <div class="mt-3 flex flex-wrap gap-2">
                      ${group.versions.map((version, versionIndex) => `
                        <button type="button"
                          class="document-split-version-tab rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${versionIndex === activeIndex ? 'border-blue-200 bg-blue-50 text-brand' : 'border-gray-200 bg-white text-[#4e5969] hover:border-blue-100 hover:text-brand'}"
                          data-split-group="${groupIndex}"
                          data-split-version="${versionIndex}">
                          V${version.number} ${this.escapeHtml(version.label)}
                          <span class="ml-1 font-medium ${version.state === '历史版本' ? 'text-[#86909c]' : 'text-green-600'}">· ${this.escapeHtml(version.state)}</span>
                        </button>
                      `).join('')}
                    </div>
                  </div>
                  ${group.versions.map((version, versionIndex) => {
                    const counts = version.rows.reduce((result, row) => {
                      result[row.status] = (result[row.status] || 0) + 1;
                      return result;
                    }, {});
                    return `
                      <div class="document-split-version-panel ${versionIndex === activeIndex ? '' : 'hidden'}" data-split-group="${groupIndex}" data-split-version="${versionIndex}">
                        <div class="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-gray-100 px-4 py-3 text-xs text-[#86909c]">
                          <span>上传时间：${this.escapeHtml(version.uploadedAt)}</span>
                          <span>拆分数量：<strong class="text-[#1d2129]">${version.rows.length}</strong></span>
                          ${Object.entries(counts).map(([status, count]) => `<span>${this.escapeHtml(status)} <strong class="text-[#1d2129]">${count}</strong></span>`).join('')}
                        </div>
                        ${version.rows.length ? `
                          <div class="overflow-x-auto bg-white">
                            <div class="min-w-[620px]">
                              <div class="grid grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)_80px_minmax(0,1.1fr)] gap-3 bg-slate-50 px-4 py-2 text-[11px] font-semibold text-[#86909c]">
                                <span>单门店文件</span><span>识别门店</span><span>状态</span><span>说明</span>
                              </div>
                              <div class="divide-y divide-gray-100">
                                ${version.rows.map(row => `
                                  <div class="grid grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)_80px_minmax(0,1.1fr)] items-center gap-3 px-4 py-3 text-xs">
                                    <button type="button"
                                      class="store-split-preview-btn min-w-0 flex items-center gap-2 text-left text-brand hover:text-blue-700 hover:underline"
                                      data-preview-kind="${this.escapeHtml(row.previewKind || '')}"
                                      data-row-id="${this.escapeHtml(row.rowId || '')}"
                                      data-stash-key="${this.escapeHtml(row.stashKey || '')}"
                                      data-email-id="${this.escapeHtml(row.emailId || '')}"
                                      data-att-idx="${typeof row.attachmentIndex === 'number' ? row.attachmentIndex : version.attachmentIndex}"
                                      data-zip-index="${typeof row.zipIndex === 'number' ? row.zipIndex : 0}"
                                      title="${this.escapeHtml(row.fileName)}">
                                      <i class="fa-solid fa-file-excel shrink-0 text-green-600"></i>
                                      <span class="truncate">${this.escapeHtml(row.fileName)}</span>
                                    </button>
                                    <div class="min-w-0">
                                      <div class="truncate font-medium text-[#4e5969]" title="${this.escapeHtml(row.storeName)}">${this.escapeHtml(row.storeName)}</div>
                                      <div class="mt-0.5 truncate font-mono text-[11px] text-[#86909c]">${this.escapeHtml(row.storeCode || '—')}</div>
                                    </div>
                                    <span class="justify-self-start rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusClass(row)}">${this.escapeHtml(row.status)}</span>
                                    <span class="leading-5 text-[#4e5969]">${this.escapeHtml(reasonText(row))}</span>
                                  </div>
                                `).join('')}
                              </div>
                            </div>
                          </div>
                        ` : `
                          <div class="bg-white px-4 py-7 text-center text-sm text-[#86909c]">
                            ${/驳回|失败/.test(version.status || '') ? '文件校验未通过，未生成拆分结果' : '暂无拆分结果'}
                          </div>
                        `}
                      </div>
                    `;
                  }).join('')}
                </div>
              `;
            }).join('')}
          </div>
        ` : `<div class="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-7 text-center text-sm text-[#86909c]">${cn ? '暂无拆分结果' : '분할 결과 없음'}</div>`}
      </section>
    `;
  },

  getFileCheckLogStatus(statusText = '') {
    const text = String(statusText || '');
    if (/校验中|检验中/.test(text)) return '校验中';
    if (/驳回|失败/.test(text)) return '驳回';
    if (/待处理|暂存/.test(text)) return text;
    if (/归档/.test(text)) return '已归档';
    return '正常';
  },

  isDuplicatePendingLog(context = {}) {
    const row = context.row || {};
    const attachment = context.attachment || {};
    const statusText = context.statusText || row.status || attachment.status || '';
    const reason = [
      attachment.rejectReason,
      row.reason,
      row.aiNote,
      context.logAction
    ].filter(Boolean).join(' ');
    return String(statusText).includes('待处理') && /重复|覆盖|忽略|A门店|B门店/.test(reason);
  },

  buildDocumentDetailLogs(context = {}) {
    const cn = this.getCurrentLang() === 'cn';
    if (!cn) {
      return this.buildLegacyDocumentDetailLogs(context);
    }

    const logs = [];
    const inboxItem = context.inboxItem;
    const row = context.row || {};
    const attachment = context.attachment;
    const moduleName = context.moduleName || '';
    const currentNode = context.currentNode || '';
    const statusText = context.statusText || row.status || attachment?.status || '-';
    const provideTime = inboxItem?.provideTime || row.updatedAt || row.createdAt || '-';
    const updateTime = row.updatedAt || provideTime;
    const fileStatus = this.getFileCheckLogStatus(statusText);

    const addFileReceived = () => {
      logs.push(this.createLifecycleLog(
        '文件收取',
        '已接收',
        inboxItem ? '文件已进入文件箱，等待系统校验' : '文件已进入文件箱',
        provideTime,
        'info'
      ));
    };

    const addFileCheck = (status = fileStatus, action = '') => {
      const defaultAction = status === '校验中'
        ? '系统正在解析文件结构、格式与内容'
        : status === '驳回'
          ? (attachment?.rejectReason || row.reason || row.aiNote || '文件校验未通过')
          : status === '待处理'
            ? (attachment?.rejectReason || row.reason || '文件存在重复或待确认事项')
            : status === '暂存'
              ? '文件可读，但门店信息需要补全'
              : status === '已归档'
                ? '文件被识别为非POS数据，已归档'
                : '文件可读，格式与内容校验通过';
      logs.push(this.createLifecycleLog('文件校验', status, action || defaultAction, updateTime));
    };

    const addStoreMatch = (status, action = '') => {
      logs.push(this.createLifecycleLog(
        '门店匹配',
        status,
        action || (status === '已匹配'
          ? '原始门店已匹配到客户门店'
          : status === '未匹配'
            ? '原始门店未匹配到客户门店，等待补全'
            : '门店匹配信息待确认'),
        updateTime
      ));
    };

    const addQualityCheck = (status, action = '') => {
      logs.push(this.createLifecycleLog(
        '质检',
        status,
        action || (status === '已完成'
          ? (row.aiNote || '规则与AI校验完成')
          : status === '发现异常'
            ? (row.aiNote || '质检发现字段级、数据级或产品级异常')
            : status === '质检中'
              ? '系统正在执行质量校验'
              : '等待进入质量检查'),
        updateTime
      ));
    };

    if (/台账|汇总/.test(moduleName || currentNode)) {
      logs.push(this.createLifecycleLog('标准POS', '已通过', '标准POS单据已通过质量检查', updateTime));
      logs.push(this.createLifecycleLog('台账入库', '已入库', '已同步进入台账与汇总', updateTime));
      return logs;
    }

    if (/异常数据/.test(moduleName || currentNode)) {
      logs.push(this.createLifecycleLog('异常处理', statusText, context.logAction || '等待处理人确认并提交处理结果', updateTime));
      return logs;
    }

    if (/质量检查|标准POS/.test(moduleName || currentNode)) {
      logs.push(this.createLifecycleLog(
        '标准POS',
        '已生成',
        row.aiNote || 'POS表数据完整，校验合规，AI未发现异常',
        updateTime,
        'success'
      ));
      return logs;
    }

    if (/暂存|未匹配/.test(moduleName || currentNode)) {
      const rawStoreCode = row.rawStoreCode || row.storeCode || '-';
      const initialFailureReason = rawStoreCode === '-'
        ? '原始门店编码缺失，未找到对应客户门店'
        : '原始门店信息未匹配到客户门店主数据';
      const latestFailureReason = row.rejectNote
        || row.aiNote
        || row.reason
        || '门店组织关系仍不完整，缺少客户门店编码、本部或营业所信息';

      logs.push(this.createLifecycleLog(
        '门店匹配',
        '未匹配',
        '原始门店未匹配到客户门店',
        updateTime,
        'warning'
      ));
      logs.push(this.createLifecycleLog(
        '门店校验',
        '失败',
        initialFailureReason,
        updateTime,
        'danger'
      ));
      logs.push(this.createLifecycleLog(
        '门店校验',
        '失败',
        latestFailureReason,
        updateTime,
        'danger'
      ));
      return logs;
    }

    if (/文件收取|收件箱/.test(moduleName || currentNode) && attachment) {
      if (attachment.isHistorical) {
        const version = attachment.version || 1;
        logs.push(this.createLifecycleLog('文件收取', '已接收', `V${version} 原始Excel已进入文件箱`, provideTime, 'info'));
        logs.push(this.createLifecycleLog('文件处理', attachment.previousStatus || '驳回', attachment.rejectReason || '原版本存在异常Sheet，正常Sheet已继续流转', provideTime, 'danger'));
        logs.push(this.createLifecycleLog('版本切换', '历史版本', attachment.historicalReason || `V${version} 已由新版本接替，原文件及流转日志保留`, attachment.historicalAt || updateTime, 'info'));
        return logs;
      }

      if (attachment.retryBatchId) {
        const retryBatch = (inboxItem?.retryBatches || []).find(item => item.id === attachment.retryBatchId);
        const previousVersion = attachment.previousVersion || retryBatch?.previousVersion || Math.max(1, Number(attachment.version || 2) - 1);
        const currentVersion = attachment.version || retryBatch?.version || previousVersion + 1;
        if (attachment.isNewAttachment) {
          logs.push(this.createLifecycleLog('新增附件', '已接收', `父级内未找到同名文件，${attachment.name} 作为新增附件 V1`, retryBatch?.uploadedAt || updateTime, 'info'));
        } else {
          logs.push(this.createLifecycleLog('文件收取', '已接收', `V${previousVersion} 原始Excel已进入文件箱`, provideTime, 'info'));
          logs.push(this.createLifecycleLog('文件处理', '驳回', `V${previousVersion} 存在异常Sheet，正常Sheet已继续流转`, provideTime, 'danger'));
          logs.push(this.createLifecycleLog('驳回重传', '已接收', `检测到同名文件，已上传完整Excel V${currentVersion}`, retryBatch?.uploadedAt || updateTime, 'info'));
          logs.push(this.createLifecycleLog('版本切换', '历史版本', `同名V${previousVersion}转为历史版本，原文件及已流转日志保留；V${currentVersion}成为当前版本`, retryBatch?.uploadedAt || updateTime, 'info'));
        }
        addFileCheck(fileStatus, attachment.rejectReason || '批量修正文件正在重新校验');
        if (attachment.isMultiStore && attachment.splitStores?.length) {
          const duplicateCount = attachment.splitStores.filter(store => store.status === '重复').length;
          const matchedCount = attachment.splitStores.filter(store => store.status === '已匹配').length;
          const storeLog = this.createLifecycleLog(
            '门店拆分',
            duplicateCount ? '待处理' : '已完成',
            `V${currentVersion} 拆分出 ${attachment.splitStores.length} 个单门店Excel，${matchedCount} 个新增已匹配，${duplicateCount} 个重复`,
            updateTime,
            duplicateCount ? 'warning' : 'success'
          );
          storeLog.splitRows = this.buildAttachmentStoreSplitRows({ ...context, inboxItem, attachment });
          logs.push(storeLog);
          if (duplicateCount) logs.push(this.createLifecycleLog('重复处理', '待处理', '请选择覆盖历史数据或忽略本次重复数据', updateTime, 'warning'));
        }
        return logs;
      }

      if (attachment.repeatMultiStoreFlow) {
        addFileReceived();
        logs.push(this.createLifecycleLog(
          '文件校验',
          '驳回',
          '文件中存在无门店名称/门店编码的数据',
          provideTime,
          'danger'
        ));

        const initialMatchLog = this.createLifecycleLog(
          '门店匹配',
          '部分异常',
          '识别到 3 个门店，2 个已匹配、1 个驳回',
          provideTime,
          'warning'
        );
        initialMatchLog.splitRows = this.buildAttachmentStoreSplitRows({
          ...context,
          inboxItem,
          attachment,
          attachmentIndex: context.attachmentIndex,
          row,
          splitStores: attachment.initialSplitStores
        });
        logs.push(initialMatchLog);

        logs.push(this.createLifecycleLog(
          '文件收取',
          '已接收',
          '已收到修正后的门店数据文件',
          updateTime,
          'info'
        ));

        const repeatMatchLog = this.createLifecycleLog(
          '门店匹配',
          '重复',
          '修正后的门店可以识别，其中 2 个门店与原始门店数据重复，1 个门店已匹配',
          updateTime,
          'warning'
        );
        repeatMatchLog.splitRows = this.buildAttachmentStoreSplitRows({
          ...context,
          inboxItem,
          attachment,
          attachmentIndex: context.attachmentIndex,
          row,
          splitStores: attachment.splitStores
        });
        logs.push(repeatMatchLog);

        logs.push(this.createLifecycleLog(
          '重复处理',
          '待处理',
          '检测到 2 个重复门店，请确认覆盖或忽略',
          updateTime,
          'warning'
        ));
        return logs;
      }

      if (this.isDuplicatePendingLog(context)) {
        const reason = attachment.rejectReason || row.reason || row.aiNote || '重新校验发现门店数据与历史记录重复';
        addFileReceived();
        logs.push(this.createLifecycleLog('文件校验', '驳回', '首次校验未通过，需重新上传修正文件', provideTime));
        logs.push(this.createLifecycleLog('文件上传', '已上传', '已重新上传修正后的文件', updateTime, 'info'));
        logs.push(this.createLifecycleLog('文件校验', '重复', reason, updateTime, 'warning'));
        logs.push(this.createLifecycleLog('重复处理', '待处理', '请确认覆盖或忽略重复门店数据', updateTime, 'warning'));
        return logs;
      }

      if (attachment.isMultiStore && attachment.splitStores?.some(store => store.status === '驳回')) {
        addFileReceived();
        logs.push(this.createLifecycleLog(
          '文件校验',
          '部分异常',
          '识别到 3 个门店，其中 1 个门店无门店名称/门店编码',
          updateTime,
          'warning'
        ));
        const storeMatchLog = this.createLifecycleLog(
          '门店匹配',
          '部分完成',
          '文件已拆分为 3 个单门店 Excel，2 个已匹配、1 个驳回',
          updateTime,
          'warning'
        );
        storeMatchLog.splitRows = this.buildAttachmentStoreSplitRows({
          ...context,
          inboxItem,
          attachment,
          attachmentIndex: context.attachmentIndex,
          row
        });
        logs.push(storeMatchLog);
        return logs;
      }

      addFileReceived();
      addFileCheck(fileStatus);
      if (fileStatus === '正常') {
        const storeMatchLog = this.createLifecycleLog('门店匹配', '已处理', '文件匹配完成，已同步至已/未匹配列表中', updateTime, 'success');
        storeMatchLog.splitRows = this.buildAttachmentStoreSplitRows({
          ...context,
          inboxItem,
          attachment,
          attachmentIndex: context.attachmentIndex,
          row
        });
        logs.push(storeMatchLog);
      }
      return logs;
    }

    if (/文件收取|原始门店|已匹配|归档/.test(moduleName || currentNode)) {
      const isMatchedDataModule = /原始门店|已匹配/.test(moduleName || currentNode) && !/归档/.test(moduleName || currentNode);
      if (isMatchedDataModule) {
        const fromUnmatched = row.matchSource === 'from-unmatched' || String(row.id || '').startsWith('stash-promoted-');
        if (fromUnmatched) {
          logs.push(this.createLifecycleLog(
            '门店匹配',
            '未匹配',
            '原始门店未匹配到客户门店',
            updateTime,
            'warning'
          ));
          logs.push(this.createLifecycleLog(
            '门店校验',
            '通过',
            '门店信息已补全并通过校验',
            updateTime,
            'success'
          ));
        } else {
          logs.push(this.createLifecycleLog(
            '门店匹配',
            '已匹配',
            '原始门店已匹配到客户门店',
            updateTime,
            'success'
          ));
        }

        if (/质检中|质量校验中/.test(statusText)) {
          addQualityCheck('质检中');
        } else if (/已同步|已通过|正常/.test(statusText)) {
          addQualityCheck('已完成');
          const logRoute = row.logRoute || row.qualityRoute || this.getQualityRoute(row);
          logs.push(this.createLifecycleLog(
            logRoute,
            '已同步',
            logRoute === '异常表' ? '已同步至异常表中' : `已同步至${logRoute}`,
            updateTime,
            'success'
          ));
        } else {
          addQualityCheck('待质检', '等待进入质量检查');
        }
        return logs;
      }

      if (inboxItem) addFileReceived();
      addFileCheck(/归档/.test(moduleName || currentNode) ? '已归档' : '正常');
      if (!/归档/.test(moduleName || currentNode)) {
        addStoreMatch(/待|质检中|已同步|已通过|正常/.test(statusText) ? '已匹配' : '待处理');
        if (/质检中|质量校验中/.test(statusText)) {
          addQualityCheck('质检中');
        } else if (/已同步|已通过/.test(statusText)) {
          addQualityCheck('已完成');
          logs.push(this.createLifecycleLog(this.getQualityRoute(row), '已同步', `已同步至${this.getQualityRoute(row)}`, updateTime));
        } else {
          addQualityCheck('未开始');
        }
      }
      return logs;
    }

    if (inboxItem) addFileReceived();
    logs.push(this.createLifecycleLog(currentNode || moduleName || '当前模块', statusText, context.logAction || `单据状态为「${statusText}」`, updateTime));
    return logs;
  },

  buildLegacyDocumentDetailLogs(context = {}) {
    const cn = this.getCurrentLang() === 'cn';
    const logs = [];
    const inboxItem = context.inboxItem;
    const currentNode = context.currentNode || context.moduleName || (cn ? '当前模块' : '현재 모듈');
    if (inboxItem) {
      logs.push({
        node: cn ? '文件收取' : '파일 수집',
        action: cn ? '文件已进入文件箱，等待系统校验' : '파일이 수집함에 들어왔습니다',
        time: inboxItem.provideTime || '-',
        status: cn ? '已接收' : '수신됨',
        tone: 'info'
      });
    }

    const statusText = context.statusText || context.row?.status || context.attachment?.status || '-';
    logs.push({
      node: currentNode,
      action: context.logAction || (cn ? `单据进入${currentNode}，状态为「${statusText}」` : `${currentNode} 진입, 상태 ${statusText}`),
      time: context.row?.updatedAt || inboxItem?.provideTime || '-',
      status: statusText,
      tone: /异常|驳回|失败/.test(statusText) ? 'danger' : /待处理|暂存/.test(statusText) ? 'warning' : 'success'
    });

    if (/质量检查|标准POS/.test(context.moduleName || currentNode)) {
      logs.push({
        node: cn ? '质检' : '품질 검사',
        action: context.row?.aiNote || (cn ? '已完成标准 POS 字段校验和组织关系校验' : '표준 POS 필드 및 조직 관계 검사 완료'),
        time: '-',
        status: cn ? '已完成' : '검사 완료',
        tone: 'success'
      });
    }

    if (/台账|汇总/.test(context.moduleName || currentNode)) {
      logs.push({
        node: cn ? '台账入库' : '대장 반영',
        action: cn ? '人工审核通过后进入标准 POS 明细台账' : '검토 후 표준 POS 상세 대장 반영',
        time: '-',
        status: cn ? '已入库' : '반영됨',
        tone: 'success'
      });
    }

    return logs;
  },

  openDocumentDetail(context = {}) {
    if (typeof Drawer === 'undefined') return;
    const cn = this.getCurrentLang() === 'cn';
    const row = context.row || {};
    const source = context.inboxItem ? context : this.findDocumentSource(row);
    const inboxItem = source.inboxItem || context.inboxItem;
    const statusText = context.statusText || row.status || context.attachment?.status || '-';
    const sourceAttachment = context.attachment || source.attachment;
    const sourceAttachmentIndex = typeof context.attachmentIndex === 'number' ? context.attachmentIndex : source.attachmentIndex;
    const logToneClass = {
      success: 'bg-green-50 text-green-700 border-green-100',
      warning: 'bg-amber-50 text-amber-700 border-amber-100',
      danger: 'bg-red-50 text-red-600 border-red-100',
      info: 'bg-blue-50 text-brand border-blue-100',
      muted: 'bg-slate-50 text-slate-500 border-slate-100'
    };
    const logs = this.buildDocumentDetailLogs({ ...context, inboxItem });
    const splitGroups = this.buildDocumentSplitGroups({
      ...context,
      inboxItem,
      attachment: sourceAttachment,
      attachmentIndex: sourceAttachmentIndex,
      row
    });
    const content = `
      <div class="space-y-5">
        <section class="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <div class="flex items-center gap-2 mb-4">
            <span class="h-7 w-7 rounded-lg bg-blue-50 text-brand flex items-center justify-center">
              <i class="fa-solid fa-file-lines text-xs"></i>
            </span>
            <h4 class="text-sm font-extrabold text-[#1d2129]">${cn ? '原始文件' : '원본 파일'}</h4>
          </div>
          <div class="space-y-2.5">
            ${context.sourceFileName || row.sourceFileName
              ? this.renderFallbackSourceFile(context.sourceFileName || row.sourceFileName)
              : inboxItem
                ? this.renderInboxSourceAttachments(inboxItem, { attachment: sourceAttachment, attachmentIndex: sourceAttachmentIndex })
                : `<div class="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-[#86909c]">${cn ? '暂无原始文件' : '원본 파일 없음'}</div>`}
          </div>
        </section>

        ${this.renderDocumentSplitResultSection(splitGroups)}

        <section class="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <h4 class="text-sm font-extrabold text-[#1d2129] mb-4">${cn ? '状态日志流转' : '상태 로그 흐름'}</h4>
          <div class="space-y-3">
            ${logs.map((log, index) => `
              <div class="flex gap-3">
                <div class="flex flex-col items-center">
                  <span class="w-7 h-7 rounded-full bg-blue-50 text-brand flex items-center justify-center text-xs font-bold">${index + 1}</span>
                  ${index < logs.length - 1 ? '<span class="flex-1 w-px bg-gray-200 my-1"></span>' : ''}
                </div>
                <div class="flex-1 rounded-xl border border-gray-100 bg-slate-50 px-4 py-3">
                  <div class="flex items-center justify-between gap-3">
                    <div class="font-bold text-sm text-[#1d2129]">${this.escapeHtml(log.node)}</div>
                    <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold border ${logToneClass[log.tone] || logToneClass.muted}">${this.escapeHtml(log.status)}</span>
                  </div>
                  <div class="mt-1 text-sm leading-6 text-[#4e5969]">${this.escapeHtml(log.action)}</div>
                  <div class="mt-1 text-xs text-[#86909c]">${this.escapeHtml(log.time)}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      </div>
    `;

    const overlay = Drawer.show({
      title: cn ? '单据详情' : '문서 상세',
      content,
      width: '680px'
    });

    overlay.querySelectorAll('.doc-source-attachment-trigger, .doc-source-zip-file-trigger').forEach(btn => {
      btn.addEventListener('click', (event) => {
        event.stopPropagation();
        const emailId = btn.getAttribute('data-email-id');
        const attIdx = Number(btn.getAttribute('data-att-idx') || 0);
        const zipIndex = Number(btn.getAttribute('data-zip-index') || 0);
        const item = this.getInboxData().find(row => String(row.id) === String(emailId));
        const attachment = item?.attachments?.[attIdx];
        if (!item || !attachment) return;
        if (attachment.status === '驳回') {
          Dialog.toast(cn ? '文件异常、无法预览' : '파일 이상으로 미리볼 수 없습니다', 'warning');
          return;
        }
        this.showInboxAttachmentPreview(item, attachment, zipIndex);
      });
    });

    overlay.querySelector('.doc-fallback-source-trigger')?.addEventListener('click', event => {
      event.stopPropagation();
      if (row && Object.keys(row).length) this.showStoreDataPreviewModal(row);
    });

    overlay.querySelectorAll('.document-split-version-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const groupId = btn.dataset.splitGroup;
        const versionId = btn.dataset.splitVersion;
        overlay.querySelectorAll(`.document-split-version-tab[data-split-group="${groupId}"]`).forEach(tab => {
          const active = tab.dataset.splitVersion === versionId;
          tab.classList.toggle('border-blue-200', active);
          tab.classList.toggle('bg-blue-50', active);
          tab.classList.toggle('text-brand', active);
          tab.classList.toggle('border-gray-200', !active);
          tab.classList.toggle('bg-white', !active);
          tab.classList.toggle('text-[#4e5969]', !active);
        });
        overlay.querySelectorAll(`.document-split-version-panel[data-split-group="${groupId}"]`).forEach(panel => {
          panel.classList.toggle('hidden', panel.dataset.splitVersion !== versionId);
        });
      });
    });

    overlay.querySelectorAll('.store-split-preview-btn').forEach(btn => {
      btn.addEventListener('click', (event) => {
        event.stopPropagation();
        const previewKind = btn.dataset.previewKind;
        if (previewKind === 'matched') {
          const rowId = btn.dataset.rowId;
          const targetRow = this.data.find(item => String(item.id) === String(rowId));
          if (targetRow) this.showStoreDataPreviewModal(targetRow);
          return;
        }
        if (previewKind === 'stash') {
          const stashKey = btn.dataset.stashKey;
          const targetItem = this.getStashSourceRows().find(item => item.key === stashKey);
          if (targetItem) this.showStashStorePreview(targetItem);
          return;
        }
        const emailId = btn.dataset.emailId || inboxItem?.id;
        const attIdx = btn.dataset.attIdx !== '' ? Number(btn.dataset.attIdx) : sourceAttachmentIndex;
        const zipIndex = btn.dataset.zipIndex !== '' ? Number(btn.dataset.zipIndex) : 0;
        const item = this.getInboxData().find(row => String(row.id) === String(emailId));
        const attachment = item?.attachments?.[attIdx];
        if (item && attachment) this.showInboxAttachmentPreview(item, attachment, zipIndex);
      });
    });
  },

  openInboxDocumentDetail(inboxItem) {
    if (inboxItem) {
      this.openDocumentDetail({
        moduleName: this.getCurrentLang() === 'cn' ? '文件收取 - 收件箱' : '파일 수집 - 받은 편지함',
        currentNode: this.getCurrentLang() === 'cn' ? '收件箱' : '받은 편지함',
        title: inboxItem.emailSubject,
        nameLabel: this.getCurrentLang() === 'cn' ? '单据标题' : '문서 제목',
        statusText: inboxItem.statusText,
        row: { sourceEmailId: inboxItem.id },
        inboxItem
      });
      return;
    }
    if (!inboxItem || typeof Drawer === 'undefined') return;
    const cn = this.getCurrentLang() === 'cn';
    const statusClass = this.getInboxStatusStyle(inboxItem.statusText);
    const logs = this.buildInboxDocumentLogs(inboxItem);
    const logToneClass = {
      success: 'bg-green-50 text-green-700 border-green-100',
      warning: 'bg-amber-50 text-amber-700 border-amber-100',
      danger: 'bg-red-50 text-red-600 border-red-100',
      info: 'bg-blue-50 text-brand border-blue-100',
      muted: 'bg-slate-50 text-slate-500 border-slate-100'
    };
    const content = `
      <div class="space-y-5">
        <section class="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <div class="flex items-center gap-2 mb-4">
            <span class="h-7 w-7 rounded-lg bg-blue-50 text-brand flex items-center justify-center">
              <i class="fa-solid fa-file-lines text-xs"></i>
            </span>
            <h4 class="text-sm font-extrabold text-[#1d2129]">${cn ? '原始文件' : '원본 파일'}</h4>
          </div>
          <div class="space-y-2.5">
            ${this.renderInboxSourceAttachments(inboxItem)}
          </div>
        </section>

        <section class="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <h4 class="text-sm font-extrabold text-[#1d2129] mb-4">${cn ? '状态日志流转' : '상태 로그 흐름'}</h4>
          <div class="space-y-3">
            ${logs.map((log, index) => `
              <div class="flex gap-3">
                <div class="flex flex-col items-center">
                  <span class="w-7 h-7 rounded-full bg-blue-50 text-brand flex items-center justify-center text-xs font-bold">${index + 1}</span>
                  ${index < logs.length - 1 ? '<span class="flex-1 w-px bg-gray-200 my-1"></span>' : ''}
                </div>
                <div class="flex-1 rounded-xl border border-gray-100 bg-slate-50 px-4 py-3">
                  <div class="flex items-center justify-between gap-3">
                    <div class="font-bold text-sm text-[#1d2129]">${this.escapeHtml(log.node)}</div>
                    <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold border ${logToneClass[log.tone] || logToneClass.muted}">${this.escapeHtml(log.status)}</span>
                  </div>
                  <div class="mt-1 text-sm leading-6 text-[#4e5969]">${this.escapeHtml(log.action)}</div>
                  <div class="mt-1 text-xs text-[#86909c]">${this.escapeHtml(log.time)}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      </div>
    `;

    const overlay = Drawer.show({
      title: cn ? '单据详情' : '문서 상세',
      content,
      width: '640px'
    });

    const bindPreview = (selector) => {
      overlay.querySelectorAll(selector).forEach(btn => {
        btn.addEventListener('click', (event) => {
          event.stopPropagation();
          const attIdx = Number(btn.getAttribute('data-att-idx') || 0);
          const attachment = inboxItem.attachments?.[attIdx];
          if (!attachment) return;
          if (attachment.status === '驳回') {
            Dialog.toast(cn ? '文件异常、无法预览' : '파일 이상으로 미리볼 수 없습니다', 'warning');
            return;
          }
          const zipIndex = Number(btn.getAttribute('data-zip-index') || 0);
          this.showInboxAttachmentPreview(inboxItem, attachment, zipIndex);
        });
      });
    };

    bindPreview('.doc-source-attachment-trigger');
    bindPreview('.doc-source-zip-file-trigger');
  },

  archiveInboxAttachment(emailId, attIdx) {
    const inboxItem = this.getInboxData().find(d => d.id === emailId);
    const attachment = inboxItem?.attachments?.[attIdx];
    const rowData = this.data.find(r => r.id === emailId);
    if (!inboxItem || !attachment || !rowData) return;

    attachment.status = '已归档';
    attachment.rejectReason = '-';
    rowData.status = '已归档';
    rowData.handler = rowData.team;

    this.updateStats();
    this.updateArchivedAttachmentRow(emailId, attIdx);
    Dialog.toast(this.getCurrentLang() === 'cn' ? '已归档到归档（非POS表）' : '보관(비POS표)으로 이동했습니다');
  },

  updateArchivedAttachmentRow(emailId, attIdx) {
    const rows = Array.from(document.querySelectorAll('.inbox-detail-row tr[data-email-id]'));
    const row = rows.find(el =>
      el.getAttribute('data-email-id') === emailId
      && String(el.getAttribute('data-att-idx')) === String(attIdx)
    );
    if (!row) return;

    const statusCell = row.querySelector('td:nth-child(2)');
    const reasonCell = row.querySelector('td:nth-child(3)');
    if (statusCell) {
      statusCell.innerHTML = `
          <span class="px-2 py-0.5 rounded-full text-xs font-semibold border bg-slate-50 text-slate-500 border-slate-100">
            已归档
          </span>
        `;
    }
    if (reasonCell) {
      reasonCell.className = 'px-4 py-2.5 text-[#86909c]';
      reasonCell.textContent = '-';
    }
  },

  moveArchivedToInbox(id) {
    const rowData = this.data.find(r => r.id === id);
    const inboxItem = this.getInboxData().find(d => d.id === id);
    if (!rowData) return;

    rowData.status = '待通过';
    rowData.handler = 'POS担当';
    if (inboxItem) {
      inboxItem.attachments.forEach((attachment) => {
        if (attachment.status === '已归档') {
          attachment.status = '正常';
          attachment.rejectReason = '-';
        }
      });
      this.recalcInboxItemStatus(inboxItem);
    }

    this.updateStats();
    this.applyFilters();
    Dialog.toast(this.getCurrentLang() === 'cn' ? '已移动到收件箱' : '받은 편지함으로 이동했습니다');
  },

  getIngestionPreviewRows(row) {
    const productNames = [
      '好丽友大粒大力跳跳糖葡萄',
      '好丽友果滋果心黄金奇异果味软糖70g',
      '好丽友果滋果心-百香果味软糖70g',
      '好丽友高纤坚果棒酸奶味30g',
      '好丽友Q蒂榛子蛋糕6枚（28g*6）',
      '好丽友果滋果心黄桃味软糖70g',
      '好丽友高蛋白坚果棒太妃味30g',
      '好丽友Q蒂摩卡蛋糕2枚（28g*12）'
    ];
    return Array.from({ length: 24 }, (_, index) => {
      const quantity = [3, 6, 4, 8, 5, 9, 7, 12][index % 8];
      const price = [1.8, 4.5, 3.9, 5.2, 6.8, 7.5, 6.2, 8.9][index % 8];
      return {
        month: '2026年05月',
        acc: this.getAccName(row.acc, index),
        dealer: row.dealer || '-',
        storeCode: row.storeCode || '-',
        storeName: row.storeName || '-',
        productCode: `69209${String(7871409 + index * 137).padStart(8, '0')}`,
        productName: productNames[index % productNames.length],
        barcode: `69209${String(7871409 + index * 137).padStart(8, '0')}`,
        quantity,
        amount: (quantity * price).toFixed(1),
        cost: (quantity * (price * 0.72)).toFixed(1),
        retailPrice: price.toFixed(1),
        remark: ''
      };
    });
  },

  getStashPreviewRows(row = {}, index = 0) {
    const productNames = [
      '好丽友果滋果心黄金奇异果味软糖70g',
      '好丽友果滋果心-百香果味软糖70g',
      '好丽友高纤坚果棒酸奶味30g',
      '好丽友高蛋白坚果棒太妃味30g',
      '好丽友Q蒂榛子蛋糕6枚（28g*6）',
      '好丽友Q蒂摩卡蛋糕2枚（28g*12）',
      '好丽友Q立方葡萄/西柚/菠萝木糖醇90g',
      '好丽友蛋黄派2枚（23g*12）'
    ];
    const displayMonth = row.month || this.getCurrentDisplayMonth();
    const rawStoreCode = this.getStashRawStoreCode(row, index);
    const numericIndex = Number.parseInt(String(index).replace(/\D/g, ''), 10) || 0;
    return Array.from({ length: 18 }, (_, rowIndex) => {
      const quantity = [3, 6, 4, 8, 5, 9][rowIndex % 6];
      const price = [1.8, 4.5, 3.9, 5.2, 6.8, 7.5][rowIndex % 6];
      return {
        month: displayMonth,
        acc: '',
        dealer: '',
        storeCode: '',
        storeName: '',
        productCode: `P${String(860100 + numericIndex + rowIndex).padStart(7, '0')}`,
        productName: productNames[rowIndex % productNames.length],
        barcode: `69209${String(7871409 + rowIndex * 137).padStart(8, '0')}`,
        quantity,
        amount: (quantity * price).toFixed(1),
        cost: (quantity * (price * 0.72)).toFixed(1),
        retailPrice: price.toFixed(1),
        remark: rowIndex % 3 === 0 ? `原始门店：${row.storeName || '-'}` : (rawStoreCode === '-' ? '' : `原始编码：${rawStoreCode}`)
      };
    });
  },

  bindEditablePreviewControls(overlay, options = {}) {
    const cn = this.getCurrentLang() === 'cn';
    const editBtn = overlay.querySelector(options.editButtonSelector || '.store-preview-edit-btn');
    if (!editBtn) {
      return {
        requestClose: (closeModal) => closeModal()
      };
    }

    const editIcon = editBtn.querySelector('i');
    const titleText = overlay.querySelector(options.titleTextSelector || '.store-preview-title-text');
    const titleInput = overlay.querySelector(options.titleInputSelector || '.store-preview-title-input');
    const editableCells = Array.from(overlay.querySelectorAll('[data-preview-editable="true"]'));
    let isEditing = false;

    const getSnapshot = () => JSON.stringify({
      title: titleInput ? titleInput.value.trim() : (titleText?.textContent || '').trim(),
      cells: editableCells.map(cell => (cell.textContent || '').trim())
    });
    let savedSnapshot = getSnapshot();

    const setDirtyState = (dirty) => {
      overlay.dataset.previewDirty = dirty ? 'true' : 'false';
    };
    const syncDirtyState = () => setDirtyState(getSnapshot() !== savedSnapshot);

    const setEditing = (nextEditing) => {
      isEditing = nextEditing;
      editBtn.title = isEditing ? (cn ? '保存' : '저장') : (cn ? '编辑' : '편집');
      editBtn.classList.toggle('bg-blue-50', isEditing);
      if (editIcon) editIcon.className = isEditing ? 'fa-solid fa-check' : 'fa-solid fa-pen-to-square';

      if (titleText && titleInput) {
        titleText.classList.toggle('hidden', isEditing);
        titleInput.classList.toggle('hidden', !isEditing);
        titleInput.disabled = !isEditing;
      }

      editableCells.forEach((cell) => {
        cell.contentEditable = isEditing ? 'true' : 'false';
        cell.classList.toggle('preview-cell-editing', isEditing);
        cell.classList.toggle('focus:outline-none', isEditing);
        cell.classList.toggle('focus:ring-2', isEditing);
        cell.classList.toggle('focus:ring-brand/20', isEditing);
        cell.classList.toggle('focus:border-brand', isEditing);
      });

      if (isEditing) {
        (titleInput || editableCells[0])?.focus();
      }
    };

    const savePreview = () => {
      if (titleText && titleInput) {
        const newTitle = titleInput.value.trim() || titleText.textContent.trim();
        titleInput.value = newTitle;
        if (newTitle) titleText.textContent = newTitle;
      }
      setEditing(false);
      savedSnapshot = getSnapshot();
      setDirtyState(false);
      options.onSave?.({
        title: titleInput?.value.trim() || titleText?.textContent?.trim() || '',
        cells: editableCells.map(cell => ({
          row: cell.dataset.row,
          field: cell.dataset.field,
          value: (cell.textContent || '').trim()
        }))
      });
      if (typeof Dialog !== 'undefined') {
        Dialog.toast(cn ? '预览数据已保存' : '미리보기 데이터가 저장되었습니다');
      }
    };

    editBtn.addEventListener('click', () => {
      if (!isEditing) {
        setEditing(true);
        return;
      }
      savePreview();
    });

    titleInput?.addEventListener('input', syncDirtyState);
    titleInput?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        savePreview();
      }
    });
    editableCells.forEach((cell) => {
      cell.addEventListener('input', syncDirtyState);
      cell.addEventListener('blur', syncDirtyState);
    });

    const showUnsavedConfirm = (onDiscard) => {
      const existingConfirm = document.querySelector('.preview-unsaved-confirm');
      if (existingConfirm) existingConfirm.remove();

      const confirmOverlay = document.createElement('div');
      confirmOverlay.className = 'preview-unsaved-confirm fixed inset-0 z-[10002] flex items-center justify-center bg-slate-900/35 backdrop-blur-sm px-6';
      confirmOverlay.innerHTML = `
        <div class="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div class="px-6 py-4 border-b border-gray-100">
            <h3 class="text-base font-bold text-[#1d2129]">${cn ? '存在未保存修改' : '저장되지 않은 변경사항'}</h3>
          </div>
          <div class="px-6 py-5 text-sm leading-6 text-[#4e5969]">
            ${cn ? '当前预览数据已修改但尚未保存，是否放弃修改并关闭？' : '현재 미리보기 데이터가 수정되었지만 저장되지 않았습니다. 변경사항을 버리고 닫을까요?'}
          </div>
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <button type="button" class="preview-unsaved-keep px-4 py-2 rounded-lg text-sm text-[#4e5969] bg-white border border-gray-200 hover:bg-gray-50 transition-colors">${cn ? '继续编辑' : '계속 편집'}</button>
            <button type="button" class="preview-unsaved-discard px-4 py-2 rounded-lg text-sm text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm">${cn ? '放弃修改' : '변경사항 버리기'}</button>
          </div>
        </div>
      `;
      document.body.appendChild(confirmOverlay);
      confirmOverlay.querySelector('.preview-unsaved-keep')?.addEventListener('click', () => {
        confirmOverlay.remove();
      });
      confirmOverlay.querySelector('.preview-unsaved-discard')?.addEventListener('click', () => {
        confirmOverlay.remove();
        setDirtyState(false);
        onDiscard();
      });
    };

    return {
      requestClose: (closeModal) => {
        syncDirtyState();
        if (overlay.dataset.previewDirty === 'true') {
          showUnsavedConfirm(closeModal);
          return;
        }
        closeModal();
      }
    };
  },

  showStashStorePreview(item) {
    const cn = this.getCurrentLang() === 'cn';
    const row = item?.row || {};
    const index = item?.index || 0;
    const existing = document.querySelector('.inbox-preview-overlay');
    if (existing) existing.remove();

    const rawStoreCode = this.getStashRawStoreCode(row, index);
    const previewColumns = [
      { key: 'month', label: cn ? '年月' : '년월', className: 'min-w-24' },
      { key: 'acc', label: 'ACC名称', className: 'min-w-24' },
      { key: 'dealer', label: cn ? '经销商名称' : '대리점명', className: 'min-w-36' },
      { key: 'storeCode', label: cn ? '门店编码' : '매장 코드', className: 'min-w-28' },
      { key: 'storeName', label: cn ? '门店名称' : '매장명', className: 'min-w-44 text-left' },
      { key: 'productCode', label: cn ? '产品编码' : '제품 코드', className: 'min-w-32' },
      { key: 'productName', label: cn ? '产品名称' : '제품명', className: 'min-w-52 text-left' },
      { key: 'barcode', label: '69码', className: 'min-w-32' },
      { key: 'quantity', label: cn ? '销售数量' : '판매 수량', className: 'min-w-24 text-right' },
      { key: 'amount', label: cn ? '销售金额' : '판매 금액', className: 'min-w-24 text-right' },
      { key: 'cost', label: cn ? '销售成本' : '판매 원가', className: 'min-w-24 text-right' },
      { key: 'retailPrice', label: cn ? '零售价' : '소매가', className: 'min-w-20 text-right' },
      { key: 'remark', label: cn ? '备注' : '비고', className: 'min-w-40 text-left' }
    ];
    const rows = this.getStashPreviewRows(row, index);
    const renderCell = (value, column, rowIndex) => {
      const content = value === undefined || value === null ? '' : String(value);
      return `<td class="border-b border-r border-gray-200 p-2 ${column.className}" data-preview-editable="true" data-field="${column.key}" data-row="${rowIndex}">${this.escapeHtml(content)}</td>`;
    };
    const renderRows = (dataRows) => dataRows.map((dataRow, rowIndex) => `
      <tr class="hover:bg-blue-50/30 transition-colors">
        ${previewColumns.map(column => renderCell(dataRow[column.key], column, rowIndex)).join('')}
      </tr>
    `).join('');

    const overlay = document.createElement('div');
    overlay.className = 'inbox-preview-overlay';
    overlay.innerHTML = `
      <div class="inbox-preview-backdrop"></div>
      <div class="inbox-preview-modal" style="width: min(1500px, calc(100vw - 48px)); height: min(680px, calc(100vh - 64px)); min-width: 820px; min-height: 420px; max-width: calc(100vw - 32px); max-height: calc(100vh - 32px);">
        <div class="inbox-preview-header">
          <div class="flex items-center gap-3 min-w-0">
            <i class="fa-solid fa-store text-brand text-lg"></i>
            <div class="min-w-0">
              <h3 class="text-sm font-semibold text-slate-800 truncate">
                <span class="preview-title-text">${cn ? '原始门店数据预览' : '원본 매장 데이터 미리보기'}</span>
              </h3>
              <p class="text-xs text-[#86909c] truncate">${this.escapeHtml(row.storeName || '-')} · ${this.escapeHtml(rawStoreCode || '-')}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" class="store-preview-edit-btn" title="${cn ? '编辑' : '편집'}">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button type="button" class="inbox-preview-zoom-btn" title="${cn ? '全屏查看' : '전체 화면'}">
              <i class="fa-solid fa-expand"></i>
            </button>
            <button type="button" class="inbox-preview-close">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
        <div class="inbox-preview-body">
          <div class="flex flex-col h-full bg-white shadow-sm overflow-hidden">
            <div class="flex-1 overflow-auto p-0">
              <table class="w-full min-w-[1380px] text-xs text-center border-collapse preview-data-table">
                <thead class="bg-gray-100 text-slate-600 sticky top-0 border-b border-gray-200 shadow-sm">
                  <tr>
                    ${previewColumns.map(column => `
                      <th class="border-r border-gray-200 p-2 ${column.className}">
                        ${this.escapeHtml(column.label)}
                      </th>
                    `).join('')}
                  </tr>
                </thead>
                <tbody class="text-slate-700 font-mono">
                  ${renderRows(rows)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const zoomBtn = overlay.querySelector('.inbox-preview-zoom-btn');
    const zoomIcon = zoomBtn.querySelector('i');
    const modal = overlay.querySelector('.inbox-preview-modal');
    let isZoomed = false;
    let savedStyle = {};
    zoomBtn.addEventListener('click', () => {
      isZoomed = !isZoomed;
      if (isZoomed) {
        savedStyle = {
          width: modal.style.width || 'min(1500px, calc(100vw - 48px))',
          height: modal.style.height || 'min(680px, calc(100vh - 64px))',
          maxWidth: modal.style.maxWidth || 'calc(100vw - 32px)',
          maxHeight: modal.style.maxHeight || 'calc(100vh - 32px)',
          minWidth: modal.style.minWidth || '',
          minHeight: modal.style.minHeight || '',
          borderRadius: modal.style.borderRadius || '16px',
        };
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.maxWidth = '100vw';
        modal.style.minWidth = '100vw';
        modal.style.maxHeight = '100vh';
        modal.style.minHeight = '100vh';
        modal.style.borderRadius = '0';
        zoomIcon.className = 'fa-solid fa-compress';
        zoomBtn.title = cn ? '退出全屏' : '전체 화면 종료';
        zoomBtn.classList.add('bg-blue-50');
      } else {
        modal.style.width = savedStyle.width;
        modal.style.height = savedStyle.height;
        modal.style.maxWidth = savedStyle.maxWidth;
        modal.style.minWidth = savedStyle.minWidth;
        modal.style.maxHeight = savedStyle.maxHeight;
        modal.style.minHeight = savedStyle.minHeight;
        modal.style.borderRadius = savedStyle.borderRadius;
        zoomIcon.className = 'fa-solid fa-expand';
        zoomBtn.title = cn ? '全屏查看' : '전체 화면';
        zoomBtn.classList.remove('bg-blue-50');
      }
    });

    const previewEditor = this.bindEditablePreviewControls(overlay);
    const closeModal = () => {
      overlay.classList.add('inbox-preview-closing');
      setTimeout(() => overlay.remove(), 200);
    };
    const requestClose = () => previewEditor.requestClose(closeModal);
    overlay.querySelector('.inbox-preview-close')?.addEventListener('click', requestClose);
    overlay.querySelector('.inbox-preview-backdrop')?.addEventListener('click', requestClose);
    const escHandler = (event) => {
      if (event.key === 'Escape') {
        requestClose();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  },

  // 收件箱附件预览弹窗（屏幕居中）
  showInboxAttachmentPreview(inboxItem, att, initialZipIndex = 0) {
    const self = this;
    const cn = this.getCurrentLang() === 'cn';

    // 移除已有弹窗
    const existing = document.querySelector('.inbox-preview-overlay');
    if (existing) existing.remove();

    const qaRows = (typeof QAView !== 'undefined' && Array.isArray(QAView.standardData))
      ? QAView.standardData
      : [];
    const sourceRow = qaRows.find((row) => inboxItem.emailSubject.includes(row.storeName)) || qaRows[0] || {
      storeName: '保定市聚昊商贸有限公司',
      storeCode: 'S0091005',
      confidence: '100%',
      dealer: '河北聚昊商贸',
      salesTeam: '华北 Team',
      region: '华北区域',
      salesOffice: '石家庄营业所'
    };
    const initialRows = (typeof QAView !== 'undefined' && typeof QAView.getStandardPreviewRows === 'function')
      ? QAView.getStandardPreviewRows(sourceRow)
      : this.getIngestionPreviewRows(sourceRow);

    const previewColumns = [
      { key: 'month', label: cn ? '年月' : '년월', className: 'min-w-24' },
      { key: 'acc', label: 'ACC名称', className: 'min-w-24' },
      { key: 'dealer', label: cn ? '经销商名称' : '대리점명', className: 'min-w-36' },
      { key: 'storeCode', label: cn ? '门店编码' : '매장 코드', className: 'min-w-28' },
      { key: 'storeName', label: cn ? '门店名称' : '매장명', className: 'min-w-44 text-left' },
      { key: 'productCode', label: cn ? '产品编码' : '제품 코드', className: 'min-w-32' },
      { key: 'productName', label: cn ? '产品名称' : '제품명', className: 'min-w-52 text-left' },
      { key: 'barcode', label: '69码', className: 'min-w-32' },
      { key: 'quantity', label: cn ? '销售数量' : '판매 수량', className: 'min-w-24 text-right' },
      { key: 'amount', label: cn ? '销售金额' : '판매 금액', className: 'min-w-24 text-right' },
      { key: 'cost', label: cn ? '销售成本' : '판매 원가', className: 'min-w-24 text-right' },
      { key: 'retailPrice', label: cn ? '零售价' : '소매가', className: 'min-w-20 text-right' },
      { key: 'remark', label: cn ? '备注' : '비고', className: 'min-w-28' }
    ];

    const renderPreviewRows = (rows) => rows.map((row, i) => `
      <tr class="hover:bg-blue-50/30 transition-colors">
        ${previewColumns.map((column) => `
          <td class="border-b border-r border-gray-200 p-2 ${column.className}" data-field="${column.key}" data-row="${i}">
            ${this.escapeHtml(row[column.key] || '-')}
          </td>
        `).join('')}
      </tr>
    `).join('');
    
    const sortIcon = '<i class="fa-solid fa-sort opacity-30"></i>';
    const isZipPreview = /\.zip$/i.test(att.name);
    const zipFiles = isZipPreview ? [
      {
        name: cn ? '门店销售明细.xlsx' : '매장 판매 상세.xlsx',
        type: 'xlsx',
        status: cn ? '正常' : '정상',
        rows: initialRows
      },
      {
        name: cn ? '产品销售汇总.csv' : '제품 판매 요약.csv',
        type: 'csv',
        status: cn ? '正常' : '정상',
        rows: initialRows.slice(0, 12).map((row, index) => ({
          ...row,
          quantity: row.quantity + index,
          amount: (Number(row.amount) + index * 3.6).toFixed(1),
          remark: cn ? '汇总数据' : '요약 데이터'
        }))
      },
      {
        name: cn ? '重复门店清单.xlsx' : '중복 매장 목록.xlsx',
        type: 'xlsx',
        status: cn ? '待处理' : '처리 대기',
        rows: initialRows.slice(0, 6).map((row, index) => ({
          ...row,
          storeName: index % 2 === 0 ? 'A门店' : 'B门店',
          remark: cn ? '与原始门店数据列表重复' : '원본 매장 데이터 목록과 중복'
        }))
      }
    ] : [];
    const selectedZipIndex = isZipPreview
      ? Math.min(Math.max(Number(initialZipIndex) || 0, 0), zipFiles.length - 1)
      : 0;
    const renderZipFiles = () => zipFiles.map((file, index) => `
      <button type="button" class="zip-file-item w-full text-left px-3 py-3 border-b border-gray-100 hover:bg-blue-50 transition-colors ${index === selectedZipIndex ? 'bg-blue-50' : ''}" data-zip-index="${index}">
        <div class="flex items-center justify-between gap-2">
          <span class="font-semibold text-xs text-[#1d2129] truncate" title="${this.escapeHtml(file.name)}">${this.escapeHtml(file.name)}</span>
          <span class="px-2 py-0.5 rounded-full text-[11px] ${file.status === '待处理' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}">${this.escapeHtml(file.status)}</span>
        </div>
        <div class="mt-1 text-[11px] text-[#86909c]">${file.type.toUpperCase()}</div>
      </button>
    `).join('');
    
    const overlay = document.createElement('div');
    overlay.className = 'inbox-preview-overlay';
    overlay.innerHTML = `
      <div class="inbox-preview-backdrop"></div>
      <div class="inbox-preview-modal" style="width: min(1500px, calc(100vw - 48px)); height: min(680px, calc(100vh - 64px)); min-width: 820px; min-height: 420px; max-width: calc(100vw - 32px); max-height: calc(100vh - 32px);">
        <div class="inbox-preview-header">
          <div class="flex items-center gap-3">
            <i class="fa-solid fa-file-lines text-brand text-lg"></i>
            <div>
              <h3 class="text-sm font-semibold text-slate-800">
                <span class="preview-title-text">${this.escapeHtml(att.name)}</span>
              </h3>
              <p class="text-xs text-[#86909c]">${cn ? '来自' : '출처'}: ${this.escapeHtml(inboxItem.emailSubject)}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" class="inbox-preview-zoom-btn" title="${cn ? '全屏查看' : '전체 화면'}">
              <i class="fa-solid fa-expand"></i>
            </button>
            <button type="button" class="inbox-preview-close">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
        <div class="inbox-preview-body">
          <div class="${isZipPreview ? 'grid grid-cols-[200px_1fr]' : 'flex flex-col'} h-full bg-white shadow-sm overflow-hidden">
            ${isZipPreview ? `
              <aside class="border-r border-gray-100 bg-slate-50 overflow-auto">
                <div class="px-4 py-3 border-b border-gray-100 bg-white">
                  <div class="text-xs font-bold text-[#1d2129]">${cn ? '文件列表' : '파일 목록'}</div>
                  <div class="mt-1 text-[11px] text-[#86909c]">${zipFiles.length} ${cn ? '个文件' : '개 파일'}</div>
                </div>
                <div id="zip-file-list">${renderZipFiles()}</div>
              </aside>
            ` : ''}
            <div class="flex-1 overflow-auto p-0">
              ${isZipPreview ? `
                <div id="zip-file-alert" class="${zipFiles[selectedZipIndex]?.name.includes('重复门店') ? '' : 'hidden'} sticky top-0 z-20 border-b border-amber-100 bg-amber-50 px-4 py-2 text-xs text-amber-700">
                  ${cn ? 'A门店、B门店 与原始门店数据列表重复，请确认是否覆盖或忽略。' : 'A/B 매장이 원본 매장 데이터 목록과 중복됩니다.'}
                </div>
              ` : ''}
              <table class="w-full min-w-[1380px] text-xs text-center border-collapse preview-data-table">
                  <thead class="bg-gray-100 text-slate-600 sticky top-0 border-b border-gray-200 shadow-sm">
                    <tr>
                      ${previewColumns.map((column) => `
                        <th class="border-r border-gray-200 p-2 ${column.className} preview-sort-th cursor-pointer hover:bg-gray-200 select-none transition-colors" data-sort="${column.key}">
                          ${column.label} <span class="sort-icon ml-1 opacity-40">${sortIcon}</span>
                        </th>
                      `).join('')}
                    </tr>
                  </thead>
                  <tbody class="text-slate-700 font-mono" id="preview-data-tbody">
                    ${renderPreviewRows(isZipPreview ? zipFiles[selectedZipIndex].rows : initialRows)}
                  </tbody>
                </table>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // ---- 列排序（三态：无排序→正序→倒序→无排序）----
    const tbody = overlay.querySelector('#preview-data-tbody');
    let originalRows = isZipPreview ? [...zipFiles[selectedZipIndex].rows] : [...initialRows];
    let currentRows = [...originalRows];
    let sortField = null;
    let sortState = 0; // 0=none, 1=asc, 2=desc
    
    const updateSortIcons = () => {
      // 恢复所有默认图标
      overlay.querySelectorAll('.preview-sort-th .sort-icon').forEach(icon => {
        icon.innerHTML = '<i class="fa-solid fa-sort opacity-30"></i>';
      });
      // 高亮当前排序列
      if (sortField && sortState > 0) {
        const activeTh = overlay.querySelector(`.preview-sort-th[data-sort="${sortField}"] .sort-icon`);
        if (activeTh) {
          if (sortState === 1) {
            activeTh.innerHTML = '<i class="fa-solid fa-sort-up text-brand"></i>';
          } else {
            activeTh.innerHTML = '<i class="fa-solid fa-sort-down text-brand"></i>';
          }
        }
      }
    };
    
    const sortRows = () => {
      if (!sortField || sortState === 0) {
        // 恢复原始顺序
        currentRows = [...originalRows];
        tbody.innerHTML = renderPreviewRows(currentRows);
        return;
      }
      currentRows = [...originalRows];
      currentRows.sort((a, b) => {
        let va = a[sortField], vb = b[sortField];
        if (typeof va === 'string') {
          return sortState === 1 ? va.localeCompare(vb) : vb.localeCompare(va);
        }
        return sortState === 1 ? va - vb : vb - va;
      });
      tbody.innerHTML = renderPreviewRows(currentRows);
    };
    
    overlay.querySelectorAll('.preview-sort-th').forEach(th => {
      th.addEventListener('click', () => {
        const field = th.getAttribute('data-sort');
        if (sortField === field) {
          // 同一列：0→1→2→0 循环
          sortState = (sortState + 1) % 3;
        } else {
          sortField = field;
          sortState = 1; // 首次点击升序
          currentRows = [...initialRows]; // 重置顺序
        }
        updateSortIcons();
        sortRows();
      });
    });

    if (isZipPreview) {
      const alert = overlay.querySelector('#zip-file-alert');
      overlay.querySelectorAll('.zip-file-item').forEach(btn => {
        btn.addEventListener('click', () => {
          const index = Number(btn.getAttribute('data-zip-index') || 0);
          const file = zipFiles[index];
          originalRows = [...file.rows];
          currentRows = [...originalRows];
          sortField = null;
          sortState = 0;
          tbody.innerHTML = renderPreviewRows(currentRows);
          updateSortIcons();
          overlay.querySelectorAll('.zip-file-item').forEach(item => item.classList.remove('bg-blue-50'));
          btn.classList.add('bg-blue-50');
          if (alert) {
            alert.classList.toggle('hidden', !file.name.includes('重复门店'));
          }
        });
      });
    }
    
    // ---- 全屏按钮 ----
    const zoomBtn = overlay.querySelector('.inbox-preview-zoom-btn');
    const zoomIcon = zoomBtn.querySelector('i');
    const modal = overlay.querySelector('.inbox-preview-modal');
    let isZoomed = false;
    let savedStyle = {};
    
    zoomBtn.addEventListener('click', () => {
      isZoomed = !isZoomed;
      if (isZoomed) {
        savedStyle = {
          width: modal.style.width || 'min(1500px, calc(100vw - 48px))',
          height: modal.style.height || 'min(680px, calc(100vh - 64px))',
          maxWidth: modal.style.maxWidth || 'calc(100vw - 32px)',
          maxHeight: modal.style.maxHeight || 'calc(100vh - 32px)',
          minWidth: modal.style.minWidth || '',
          minHeight: modal.style.minHeight || '',
          borderRadius: modal.style.borderRadius || '16px',
        };
        modal.style.width = '100vw';
        modal.style.maxWidth = '100vw';
        modal.style.minWidth = '100vw';
        modal.style.maxHeight = '100vh';
        modal.style.minHeight = '100vh';
        modal.style.borderRadius = '0';
        zoomIcon.className = 'fa-solid fa-compress';
        zoomBtn.title = cn ? '退出全屏' : '전체 화면 종료';
        zoomBtn.classList.add('bg-blue-50');
      } else {
        modal.style.width = savedStyle.width;
        modal.style.height = savedStyle.height;
        modal.style.maxWidth = savedStyle.maxWidth;
        modal.style.minWidth = savedStyle.minWidth;
        modal.style.maxHeight = savedStyle.maxHeight;
        modal.style.minHeight = savedStyle.minHeight;
        modal.style.borderRadius = savedStyle.borderRadius;
        zoomIcon.className = 'fa-solid fa-expand';
        zoomBtn.title = cn ? '全屏查看' : '전체 화면';
        zoomBtn.classList.remove('bg-blue-50');
      }
    });
    
    // ---- 关闭事件 ----
    const closeBtn = overlay.querySelector('.inbox-preview-close');
    const backdrop = overlay.querySelector('.inbox-preview-backdrop');
    
    const closeModal = () => {
      overlay.classList.add('inbox-preview-closing');
      setTimeout(() => overlay.remove(), 200);
    };
    
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    
    const escHandler = (e) => {
      if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', escHandler); }
    };
    document.addEventListener('keydown', escHandler);
  },
  
  // 原始门店数据列表附件预览 - 居中弹窗
  showStoreDataPreviewModal(rowData) {
    const self = this;
    const cn = this.getCurrentLang() === 'cn';
    
    // 移除已有弹窗
    const existing = document.querySelector('.inbox-preview-overlay');
    if (existing) existing.remove();
    
    const dataRows = [
      { code: '6901234567890', name: '可口可乐 500ml', qty: 12, price: 3.50, total: 42.00 },
      { code: '6909876543210', name: '乐事薯片 330ml', qty: 5, price: 4.00, total: 20.00 },
      { code: '6905555555555', name: '未知商品', qty: 1, price: 15.00, total: 15.00, unknown: true },
      { code: '6901111222333', name: '康师傅红烧牛肉面', qty: 24, price: 4.50, total: 108.00 },
      { code: '6902222333444', name: '农夫山泉 550ml', qty: 36, price: 2.00, total: 72.00 },
    ];
    
    const renderTableRows = (rows) => rows.map((row, i) => `
      <tr class="${row.unknown ? 'bg-blue-50' : ''}">
        <td class="border-b border-r border-gray-200 p-2 text-center bg-gray-50 text-slate-400">${i + 1}</td>
        <td class="border-b border-r border-gray-200 p-2" data-preview-editable="true" data-row="${i}" data-field="code">${row.code}</td>
        <td class="border-b border-r border-gray-200 p-2 ${row.unknown ? 'text-brand' : ''}" data-preview-editable="true" data-row="${i}" data-field="name">${row.name}</td>
        <td class="border-b border-r border-gray-200 p-2 text-right" data-preview-editable="true" data-row="${i}" data-field="qty">${row.qty}</td>
        <td class="border-b border-r border-gray-200 p-2 text-right" data-preview-editable="true" data-row="${i}" data-field="price">${row.price.toFixed(2)}</td>
        <td class="border-b border-r border-gray-200 p-2 text-right" data-preview-editable="true" data-row="${i}" data-field="total">${row.total.toFixed(2)}</td>
      </tr>
    `).join('');
    
    const overlay = document.createElement('div');
    overlay.className = 'inbox-preview-overlay';
    overlay.innerHTML = `
      <div class="inbox-preview-backdrop"></div>
      <div class="inbox-preview-modal" style="width: min(1500px, calc(100vw - 48px)); height: min(680px, calc(100vh - 64px)); min-width: 820px; min-height: 420px; max-width: calc(100vw - 32px); max-height: calc(100vh - 32px);">
        <div class="inbox-preview-header">
          <div class="flex items-center gap-3">
            <i class="fa-solid fa-file-excel text-green-600 text-lg"></i>
            <div>
              <h3 class="text-sm font-semibold text-slate-800">
                <span class="store-preview-title-text">${this.escapeHtml(rowData.fileName)}</span>
                <input type="text" class="store-preview-title-input hidden w-72 px-2 py-1 border border-gray-200 rounded text-sm font-semibold text-slate-800 focus:outline-none focus:border-brand" value="${this.escapeHtml(rowData.fileName)}">
              </h3>
              <p class="text-xs text-[#86909c]">${cn ? '营业Team' : '영업 Team'}: ${this.getLocalizedText(rowData.team)}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" class="store-preview-edit-btn" title="${cn ? '编辑' : '편집'}">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button type="button" class="inbox-preview-zoom-btn" title="${cn ? '全屏查看' : '전체 화면'}">
              <i class="fa-solid fa-expand"></i>
            </button>
            <button type="button" class="inbox-preview-close">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
        <div class="inbox-preview-body">
          <div class="flex flex-col h-full bg-white shadow-sm overflow-hidden">
            <div class="flex-1 overflow-auto p-0">
              <table class="w-full text-xs text-left border-collapse preview-data-table">
                <thead class="bg-gray-100 text-slate-600 sticky top-0 border-b border-gray-200 shadow-sm">
                  <tr>
                    <th class="border-r border-gray-200 p-2 w-10 text-center bg-gray-200">#</th>
                    <th class="border-r border-gray-200 p-2 w-36">${cn ? '条码' : '바코드'}</th>
                    <th class="border-r border-gray-200 p-2">${cn ? '商品名称' : '상품명'}</th>
                    <th class="border-r border-gray-200 p-2 w-20 text-right">${cn ? '数量' : '수량'}</th>
                    <th class="border-r border-gray-200 p-2 w-24 text-right">${cn ? '单价' : '단가'}</th>
                    <th class="border-r border-gray-200 p-2 w-24 text-right">${cn ? '总计' : '합계'}</th>
                  </tr>
                </thead>
                <tbody class="text-slate-700 font-mono">
                  ${renderTableRows(dataRows)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    const previewEditor = this.bindEditablePreviewControls(overlay, {
      onSave: ({ title }) => {
        if (!title) return;
        self.data = self.data.map(r => {
          if (r.id === rowData.id) { r.fileName = title; }
          return r;
        });
      }
    });
    
    // ---- 全屏按钮 ----
    const zoomBtn = overlay.querySelector('.inbox-preview-zoom-btn');
    const zoomIcon = zoomBtn.querySelector('i');
    const modal = overlay.querySelector('.inbox-preview-modal');
    let isZoomed = false;
    let savedStyle = {};
    
    zoomBtn.addEventListener('click', () => {
      isZoomed = !isZoomed;
      if (isZoomed) {
        savedStyle = {
          width: modal.style.width || 'min(1500px, calc(100vw - 48px))',
          height: modal.style.height || 'min(680px, calc(100vh - 64px))',
          maxWidth: modal.style.maxWidth || 'calc(100vw - 32px)',
          maxHeight: modal.style.maxHeight || 'calc(100vh - 32px)',
          minWidth: modal.style.minWidth || '',
          minHeight: modal.style.minHeight || '',
          borderRadius: modal.style.borderRadius || '16px',
        };
        modal.style.width = '100vw';
        modal.style.maxWidth = '100vw';
        modal.style.minWidth = '100vw';
        modal.style.maxHeight = '100vh';
        modal.style.minHeight = '100vh';
        modal.style.borderRadius = '0';
        zoomIcon.className = 'fa-solid fa-compress';
        zoomBtn.title = cn ? '退出全屏' : '전체 화면 종료';
        zoomBtn.classList.add('bg-blue-50');
      } else {
        modal.style.width = savedStyle.width;
        modal.style.height = savedStyle.height;
        modal.style.maxWidth = savedStyle.maxWidth;
        modal.style.minWidth = savedStyle.minWidth;
        modal.style.maxHeight = savedStyle.maxHeight;
        modal.style.minHeight = savedStyle.minHeight;
        modal.style.borderRadius = savedStyle.borderRadius;
        zoomIcon.className = 'fa-solid fa-expand';
        zoomBtn.title = cn ? '全屏查看' : '전체 화면';
        zoomBtn.classList.remove('bg-blue-50');
      }
    });
    
    // ---- 关闭事件 ----
    const closeBtn = overlay.querySelector('.inbox-preview-close');
    const backdrop = overlay.querySelector('.inbox-preview-backdrop');
    
    const closeModal = () => {
      overlay.classList.add('inbox-preview-closing');
      setTimeout(() => overlay.remove(), 200);
    };
    
    const requestClose = () => previewEditor.requestClose(closeModal);
    closeBtn.addEventListener('click', requestClose);
    backdrop.addEventListener('click', requestClose);
    
    const escHandler = (e) => {
      if (e.key === 'Escape') { requestClose(); document.removeEventListener('keydown', escHandler); }
    };
    document.addEventListener('keydown', escHandler);
  },

  formatVersion(version) {
    if (!version) return '-';
    const match = version.match(/v?(\d+)\.(\d+)/i);
    if (match) {
      const [, major, minor] = match;
      return `V0.0.${major.padStart(2, '0')}.${minor.padStart(2, '0')}`;
    }
    return version;
  },

  renderTableHeader() {
    const headerRow = document.getElementById('ingestion-table-head-row');
    if (!headerRow) return;
    const cn = this.getCurrentLang() === 'cn';
    const isOriginalStoreList = this.activeDataMode === 'files';
    const commonStart = `
      <th class="px-5 py-4 w-[60px] min-w-[60px] rounded-tl-lg sticky left-0 z-30 bg-[#f7f8fa]">
        <input type="checkbox" id="selectAll" class="rounded border-gray-300 text-brand focus:ring-brand">
      </th>
      <th class="px-4 py-4 w-[176px] min-w-[176px] sticky left-[60px] z-30 bg-[#f7f8fa]">${cn ? '年月' : '년월'}</th>
      <th class="px-3 py-4 w-56 min-w-56 sticky left-[236px] z-30 bg-[#f7f8fa] shadow-[6px_0_10px_-10px_rgba(15,23,42,0.45)]">${cn ? '原始门店名称' : '원본 매장명'}</th>
    `;
    headerRow.innerHTML = isOriginalStoreList
      ? `
        ${commonStart}
        <th class="px-5 py-4 min-w-36">${cn ? '原始门店编码' : '원본 매장 코드'}</th>
        <th class="px-5 py-4 min-w-48">${cn ? '门店名称' : '매장명'}</th>
        <th class="px-5 py-4 min-w-40">${cn ? '门店编码' : '매장 코드'}</th>
        <th class="px-5 py-4 min-w-36">${cn ? '经销商' : '대리점'}</th>
        <th class="px-5 py-4 min-w-28">ACC名称</th>
        <th class="px-5 py-4 min-w-32">${cn ? '本部' : '본부'}</th>
        <th class="px-5 py-4 min-w-36">${cn ? '营业所' : '영업소'}</th>
        <th class="px-5 py-4 min-w-32">
          <div class="flex items-center gap-1">
            ${cn ? '处理人' : '처리자'}
            <i class="fa-solid fa-circle-info text-xs text-[#86909c] cursor-help" title="${cn ? '处理人信息' : '처리자 정보'}"></i>
          </div>
        </th>
        <th class="px-5 py-4 w-28 min-w-28 sticky right-[96px] z-20 bg-blue-50 shadow-[-6px_0_10px_-10px_rgba(15,23,42,0.45)]">${cn ? '状态' : '상태'}</th>
        <th class="px-5 py-4 w-24 min-w-24 rounded-tr-lg sticky right-0 z-20 bg-blue-50">
          <div class="flex items-center gap-1">
            ${cn ? '操作' : '조작'}
            <i class="fa-solid fa-circle-info text-xs text-[#86909c] cursor-help" title="${cn ? '操作按钮' : '조작 버튼'}"></i>
          </div>
        </th>
      `
      : `
        ${commonStart}
        <th class="px-5 py-4 min-w-36">${cn ? '原始门店编码' : '원본 매장 코드'}</th>
        <th class="px-5 py-4 min-w-48">${cn ? '门店名称' : '매장명'}</th>
        <th class="px-5 py-4 min-w-40">${cn ? '门店编码' : '매장 코드'}</th>
        <th class="px-5 py-4 min-w-36">${cn ? '经销商' : '대리점'}</th>
        <th class="px-5 py-4 min-w-28">ACC名称</th>
        <th class="px-5 py-4 min-w-32">${cn ? '本部' : '본부'}</th>
        <th class="px-5 py-4 min-w-36">${cn ? '营业所' : '영업소'}</th>
        <th class="px-5 py-4 min-w-56">${cn ? '异常原因' : '이상 사유'}</th>
      <th class="px-5 py-4">
        <div class="flex items-center gap-1">
          ${cn ? '处理人' : '처리자'}
          <i class="fa-solid fa-circle-info text-xs text-[#86909c] cursor-help" title="${cn ? '处理人信息' : '처리자 정보'}"></i>
        </div>
      </th>
        <th class="px-5 py-4 w-24 min-w-24 rounded-tr-lg sticky right-0 z-20 bg-blue-50 shadow-[-6px_0_10px_-10px_rgba(15,23,42,0.45)]">
          <div class="flex items-center gap-1">
            ${cn ? '操作' : '조작'}
            <i class="fa-solid fa-circle-info text-xs text-[#86909c] cursor-help" title="${cn ? '操作按钮' : '조작 버튼'}"></i>
          </div>
        </th>
      `;
  },
  
  renderTable() {
    const tbody = document.getElementById('ingestion-tbody');
    if (!tbody) return;
    
    this.hideLoading();
    this.renderTableHeader();
    
    const isOriginalStoreList = this.activeDataMode === 'files';
    // 原始门店数据列表采用连续滚动，不再分页。
    const start = isOriginalStoreList ? 0 : (this.pagination.page - 1) * this.pagination.pageSize;
    const end = isOriginalStoreList ? this.filteredData.length : start + this.pagination.pageSize;
    const pageData = this.filteredData.slice(start, end);
    
    // 更新总数
    document.getElementById('total-count').textContent = this.pagination.total;
    this.renderQualityCheckingHint();
    
    if (pageData.length === 0) {
      tbody.innerHTML = '';
      this.showEmptyState();
      this.renderPagination();
      return;
    }
    
    this.hideEmptyState();
    
    tbody.innerHTML = pageData.map((row, index) => {
      const confidenceValue = Number.parseFloat(row.confidence || '0');
      const isConfidenceNormal = confidenceValue > 95;
      const isPending = row.status.includes('待处理');
      const isArchived = row.status.includes('已归档');
      const isApproved = row.status.includes('已通过');
      const isSynced = row.status.includes('已同步');
      const isChecking = row.status.includes('质量校验中');
      const isCheckFailed = row.status.includes('校验失败');
      const isRejected = row.status.includes('已驳回');
      const isActionLocked = isApproved || isSynced || isChecking || isRejected;
      
      let statusClass, statusText;
      if (isArchived) {
        statusClass = 'bg-gray-100 text-gray-600 border-gray-200';
        statusText = '已归档';
      } else if (isChecking) {
        statusClass = 'bg-blue-50 text-brand border-blue-100';
        statusText = '质检中';
      } else if (isSynced || isApproved) {
        statusClass = 'bg-green-50 text-green-700 border-green-100';
        statusText = '已同步';
      } else if (isCheckFailed) {
        statusClass = 'bg-red-50 text-red-600 border-red-100';
        statusText = '校验失败';
      } else if (isRejected) {
        statusClass = 'bg-red-50 text-red-600 border-red-100';
        statusText = '已驳回';
      } else {
        statusClass = 'bg-amber-50 text-amber-700 border-amber-100';
        statusText = '待通过';
      }

      if (isPending && !row.confidence) {
        statusClass = 'bg-amber-50 text-amber-700 border-amber-100';
        statusText = '待处理';
      }

      const confidenceClass = confidenceValue > 95 ? 'text-green-700 bg-green-50 border-green-100' : 'text-brand bg-blue-50 border-blue-100';
      const qualityRoute = row.qualityRoute || this.getQualityRoute(row);
      const suggestionText = row.suggestion || (confidenceValue > 95 ? '-' : '请复核原始文件字段完整性与门店匹配关系。');
      const rawStoreCode = row.rawStoreCode || this.getRawStoreCode(row);
      const customerStoreName = this.getLocalizedText(row.storeName) || '-';
      const customerStoreCode = row.storeCode || '-';
      const dealer = row.dealer || '-';
      const acc = this.getAccName(row.acc, index);
      const headquarters = row.headquarters || row.region || '-';
      const salesOffice = row.salesOffice || '-';
      
      // 从收件箱数据中获取来源邮件和来源附件信息
      const inboxData = this.getInboxData();
      const sourceEmailId = row.sourceEmailId || row.id;
      const inboxItem = inboxData.find(item => item.id === sourceEmailId);
      const sourceEmail = inboxItem ? inboxItem.emailSubject : (row.fileName + ' 邮件');
      const sourceAttachments = inboxItem ? inboxItem.attachments : [];
      
      // 来源附件：每个文件只对应收件箱中的一个附件（一对一映射）
      const sourceAttIdx = typeof row.sourceAttIdx === 'number'
        ? row.sourceAttIdx
        : sourceAttachments.length > 0
          ? (parseInt(row.id.replace('F', '')) - 1) % sourceAttachments.length
          : 0;
      const mappedAtt = sourceAttachments.length > 0 ? sourceAttachments[sourceAttIdx] : null;
      
      const sourceAttHtml = mappedAtt
        ? `<span class="inbox-source-att-link inline-block px-1.5 py-0.5 rounded text-xs cursor-pointer text-brand bg-blue-50 hover:bg-blue-100 transition-all" 
                data-email-id="${sourceEmailId}" data-att-idx="${sourceAttIdx}" title="${this.escapeHtml(mappedAtt.name)}">
            ${this.escapeHtml(mappedAtt.name.length > 14 ? mappedAtt.name.substring(0, 14) + '...' : mappedAtt.name)}
          </span>`
        : '<span class="text-[#86909c] text-xs">-</span>';
      
      return `
        <tr class="hover:bg-slate-50 transition-colors group" data-id="${row.id}">
          <td class="px-4 py-3 w-[60px] min-w-[60px] sticky left-0 z-10 bg-white group-hover:bg-slate-50">
            <input type="checkbox" class="row-cb rounded border-gray-300 text-brand focus:ring-brand disabled:cursor-not-allowed disabled:opacity-40" value="${row.id}" ${isActionLocked ? 'disabled' : ''}>
          </td>
          <td class="px-4 py-3 w-[176px] min-w-[176px] text-[#4e5969] sticky left-[60px] z-10 bg-white group-hover:bg-slate-50">
            <span>${this.escapeHtml(this.getDisplayMonth(row))}</span>
          </td>
          <td class="px-3 py-3 w-56 min-w-56 sticky left-[236px] z-10 bg-white group-hover:bg-slate-50 shadow-[6px_0_10px_-10px_rgba(15,23,42,0.45)]">
            <div class="font-medium flex items-center gap-2" title="${this.escapeHtml(row.fileName)}">
              <i class="fa-solid fa-file-excel text-green-600 flex-shrink-0"></i>
              <button type="button" class="ingestion-row-preview-trigger row-edit-display row-filename-text truncate max-w-[220px] text-brand hover:text-blue-700 hover:underline transition-colors text-left" data-id="${row.id}" title="${this.getCurrentLang() === 'cn' ? '点击预览' : '미리보기'} ${this.escapeHtml(row.fileName)}">${this.escapeHtml(row.rawStoreName || row.fileName)}</button>
              <input type="text" class="row-edit-input hidden w-full max-w-[220px] px-2 py-1 border border-gray-200 rounded text-sm font-medium text-slate-800 focus:outline-none focus:border-brand" data-edit-field="rawStoreName" value="${this.escapeHtml(row.rawStoreName || row.fileName)}">
            </div>
          </td>
          <td class="px-5 py-3">
            <span class="row-edit-display inline-flex items-center px-2 py-1 rounded-md bg-slate-50 text-slate-700 font-mono text-xs border border-slate-100">${this.escapeHtml(rawStoreCode)}</span>
            <input type="text" class="row-edit-input hidden w-28 px-2 py-1 border border-gray-200 rounded text-sm font-mono text-slate-800 focus:outline-none focus:border-brand" data-edit-field="rawStoreCode" value="${this.escapeHtml(rawStoreCode)}">
          </td>
          <td class="px-5 py-3 font-medium text-[#1d2129]" title="${this.escapeHtml(customerStoreName)}">
            <span class="row-edit-display">${this.escapeHtml(customerStoreName)}</span>
            <input type="text" class="row-edit-input hidden w-40 px-2 py-1 border border-gray-200 rounded text-sm font-medium text-slate-800 focus:outline-none focus:border-brand" data-edit-field="storeName" value="${this.escapeHtml(customerStoreName)}">
          </td>
          <td class="px-5 py-3">
            <span class="row-edit-display inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-brand font-mono text-xs border border-blue-100">${this.escapeHtml(customerStoreCode)}</span>
            <input type="text" class="row-edit-input hidden w-28 px-2 py-1 border border-gray-200 rounded text-sm font-mono text-slate-800 focus:outline-none focus:border-brand" data-edit-field="storeCode" value="${this.escapeHtml(customerStoreCode)}">
          </td>
          <td class="px-5 py-3 text-[#4e5969]" title="${this.escapeHtml(dealer)}">
            <span class="row-edit-display">${this.escapeHtml(dealer)}</span>
            <input type="text" class="row-edit-input hidden w-36 px-2 py-1 border border-gray-200 rounded text-sm text-slate-800 focus:outline-none focus:border-brand" data-edit-field="dealer" value="${this.escapeHtml(dealer)}">
          </td>
          <td class="px-5 py-3 text-[#4e5969] font-medium">
            <span>${this.escapeHtml(acc)}</span>
          </td>
          <td class="px-5 py-3 text-[#4e5969]">
            <span>${this.escapeHtml(headquarters)}</span>
          </td>
          <td class="px-5 py-3 text-[#4e5969]">
            <span>${this.escapeHtml(salesOffice)}</span>
          </td>
          <td class="px-5 py-3">
            <span class="${row.handler ? '' : 'text-[#d1d5db]'}" title="${this.getLocalizedText(row.handler) || '-'}">
              ${this.getLocalizedText(row.handler) || '-'}
            </span>
          </td>
          ${isOriginalStoreList ? `
            <td class="px-5 py-3 sticky right-[96px] z-10 bg-white group-hover:bg-slate-50 shadow-[-6px_0_10px_-10px_rgba(15,23,42,0.45)]">
              <span class="inline-flex h-6 min-w-[64px] items-center justify-center gap-1 whitespace-nowrap px-2 rounded-full border text-xs font-semibold leading-none ${isRejected || isCheckFailed ? 'bg-red-50 text-red-600 border-red-100' : isChecking ? 'bg-blue-50 text-brand border-blue-100' : (isSynced || isApproved) ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'}"
                title="${isSynced || isApproved ? `已同步至${this.escapeHtml(qualityRoute)}` : isChecking ? `正在质量校验，完成后同步至${this.escapeHtml(qualityRoute)}` : ''}">
                ${isChecking ? '<i class="fa-solid fa-spinner fa-spin text-[10px]"></i>' : ''}
                ${isRejected ? (this.getCurrentLang() === 'cn' ? '已驳回' : '반려됨') : isCheckFailed ? (this.getCurrentLang() === 'cn' ? '校验失败' : '검사 실패') : isChecking ? (this.getCurrentLang() === 'cn' ? '质检中' : '검사 중') : (isSynced || isApproved) ? (this.getCurrentLang() === 'cn' ? '已同步' : '동기화됨') : (this.getCurrentLang() === 'cn' ? '待通过' : '승인 대기')}
              </span>
            </td>
          ` : ''}
          <td class="px-5 py-3 sticky right-0 z-10 bg-white group-hover:bg-slate-50">
            <div class="flex items-center gap-1">
              <button class="px-2 py-1 text-xs rounded text-brand hover:bg-blue-50 action-btn" data-action="detail" data-id="${row.id}" title="${this.getCurrentLang() === 'cn' ? '单据详情' : '문서 상세'}">
                <i class="fa-solid fa-list-check"></i>
              </button>
              ${this.activeDataMode === 'archive' ? `
              <button class="px-2 py-1 text-xs rounded text-brand hover:bg-blue-50 action-btn" data-action="move-inbox" data-id="${row.id}" title="${this.getCurrentLang() === 'cn' ? '移动到收件箱' : '받은 편지함으로 이동'}">
                <i class="fa-solid fa-inbox"></i>
              </button>
              <button class="px-2 py-1 text-xs rounded text-amber-500 hover:bg-amber-50 action-btn row-edit-btn" data-action="edit" data-id="${row.id}" title="${this.getCurrentLang() === 'cn' ? '编辑' : '편집'}">
                <i class="fa-solid fa-pen-to-square row-edit-icon"></i>
              </button>
              ` : `
              <button class="px-2 py-1 text-xs rounded action-btn ${isActionLocked ? 'text-gray-300 cursor-not-allowed' : 'text-green-600 hover:bg-green-50'}" data-action="approve" data-id="${row.id}" title="${isSynced || isApproved ? (this.getCurrentLang() === 'cn' ? '已同步' : '동기화됨') : isChecking ? (this.getCurrentLang() === 'cn' ? '质量校验中' : '검사 중') : isRejected ? (this.getCurrentLang() === 'cn' ? '已驳回' : '반려됨') : (this.getCurrentLang() === 'cn' ? '通过并进入质量校验' : '승인 후 검사')}" ${isActionLocked ? 'disabled' : ''}>
                <i class="fa-solid fa-check"></i>
              </button>
              <button class="px-2 py-1 text-xs rounded action-btn ${isActionLocked ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}" data-action="reject" data-id="${row.id}" title="${isRejected ? (this.getCurrentLang() === 'cn' ? '已驳回' : '반려됨') : isChecking ? (this.getCurrentLang() === 'cn' ? '质量校验中不可驳回' : '검사 중 반려 불가') : (this.getCurrentLang() === 'cn' ? '驳回' : '거부')}" ${isActionLocked ? 'disabled' : ''}>
                <i class="fa-solid fa-reply"></i>
              </button>
              <button class="px-2 py-1 text-xs rounded action-btn row-edit-btn ${isActionLocked ? 'text-gray-300 cursor-not-allowed' : 'text-amber-500 hover:bg-amber-50'}" data-action="edit" data-id="${row.id}" title="${isActionLocked ? (this.getCurrentLang() === 'cn' ? '当前状态不可编辑' : '현재 상태 편집 불가') : (this.getCurrentLang() === 'cn' ? '编辑' : '편집')}" ${isActionLocked ? 'disabled' : ''}>
                <i class="fa-solid fa-pen-to-square row-edit-icon"></i>
              </button>
              `}
            </div>
          </td>
        </tr>
      `;
    }).join('');
    
    this.renderPagination();
    this.bindTableEvents();
    this.bindSourceLinks();
  },

  getStashSourceRows() {
    const rows = (typeof QAView !== 'undefined' && Array.isArray(QAView.standardData))
      ? QAView.standardData
      : [];
    const stashedAttachmentRows = this.getRoutedInboxAttachments('暂存').map(({ attachment, attachmentIndex, inboxItem, sourceRow }, index) => {
      const salesTeam = this.getLocalizedText(sourceRow.team || '华北 Team');
      return {
        row: {
          month: this.getDisplayMonth(sourceRow),
          storeName: attachment.name,
          storeCode: '-',
          aiNote: '附件已暂存，待补充门店字段后进入质量检查。',
          salesTeam,
          region: sourceRow.region || '华北区域',
          salesOffice: sourceRow.salesOffice || '石家庄营业所',
          dealer: sourceRow.dealer || this.getLocalizedText(sourceRow.storeName) || '-',
          sourceEmailId: inboxItem.id,
          sourceAttIdx: attachmentIndex
        },
        index: `stash-${inboxItem.id}-${attachmentIndex}-${index}`
      };
    });
    return [
      ...stashedAttachmentRows,
      ...rows.map((row, index) => ({ row, index })).slice(0, 5)
    ].map((item) => {
      const key = this.getStashRowKey(item.row, item.index);
      const failed = this.failedStashKeys.has(key);
      const savedEdits = this.stashEdits.get(key) || {};
      return {
        ...item,
        key,
        row: {
          ...(failed
          ? {
              ...item.row,
              aiNote: '未校验到门店编码/所属关系，请检查门店主数据。'
            }
          : item.row),
          ...savedEdits
        }
      };
    }).filter(item => !this.promotedStashKeys.has(item.key));
  },

  getStashRowKey(row, index) {
    if (row?.sourceEmailId && typeof row.sourceAttIdx === 'number') {
      return `attachment-${row.sourceEmailId}-${row.sourceAttIdx}`;
    }
    if (row?.id) return `standard-${row.id}`;
    const name = row?.storeName || row?.fileName || 'row';
    return `standard-${index}-${name}`;
  },

  getFilteredStashRows() {
    const keyword = this.filters.fileName.trim().toLowerCase();
    return this.getStashSourceRows().filter(({ row, index }) => {
      if (keyword) {
        return this.matchesStashSearch(row, index, keyword);
      }
      return true;
    });
  },

  renderStashTable() {
    const container = document.getElementById('ingestion-stash-container');
    if (!container) return;

    const rows = this.getFilteredStashRows();
    const totalCount = document.getElementById('total-count');
    if (totalCount) totalCount.textContent = String(rows.length);
    const tableRows = rows.map(({ row, index, key }) => {
      const handler = row.handler || 'POS担当';
      const displayMonth = row.month || this.getCurrentDisplayMonth();
      const rawStoreCode = this.getStashRawStoreCode(row, index);
      const abnormalReason = this.getStashAbnormalReason(row);
      const customerStoreName = row.customerStoreName || '-';
      const customerStoreCode = row.customerStoreCode || '-';
      const dealer = row.customerDealer || '-';
      const acc = row.customerAcc || '-';
      const headquarters = row.customerHeadquarters || '-';
      const salesOffice = row.customerSalesOffice || '-';
      const isRejected = this.rejectedStashKeys.has(key);
      return `
      <tr class="group bg-white hover:bg-slate-50 transition-colors ${isRejected ? 'bg-red-50/30' : ''}" data-stash-key="${this.escapeHtml(key)}">
        <td class="px-4 py-3 w-[60px] sticky left-0 z-10 bg-white group-hover:bg-slate-50"><input type="checkbox" class="row-cb-ingestion-stash rounded border-gray-300 text-brand focus:ring-brand" data-stash-key="${this.escapeHtml(key)}"></td>
        <td class="px-4 py-3 w-[176px] text-[#4e5969] sticky left-[60px] z-10 bg-white group-hover:bg-slate-50">
          <span>${this.escapeHtml(displayMonth)}</span>
        </td>
        <td class="px-3 py-3 w-56 sticky left-[236px] z-10 bg-white group-hover:bg-slate-50 shadow-[6px_0_10px_-10px_rgba(15,23,42,0.45)]">
          <button type="button" class="stash-edit-display ingestion-stash-preview-trigger font-medium text-brand flex items-center gap-2 hover:text-blue-700 hover:underline transition-colors" data-index="${index}" data-email-id="${row.sourceEmailId || ''}" data-att-idx="${typeof row.sourceAttIdx === 'number' ? row.sourceAttIdx : ''}" title="预览 ${this.escapeHtml(row.storeName)}">
            <i class="fa-solid fa-store text-brand"></i>
            <span class="truncate max-w-[176px]">${this.escapeHtml(row.storeName)}</span>
          </button>
          <input type="text" class="stash-edit-input hidden w-full px-2 py-1 border border-gray-200 rounded text-sm bg-white focus:outline-none focus:border-brand" data-edit-field="storeName" value="${this.escapeHtml(row.storeName)}">
        </td>
        <td class="px-5 py-3 font-mono ${rawStoreCode === '-' ? 'text-[#86909c]' : 'text-[#1d2129]'}"><span class="stash-edit-display">${this.escapeHtml(rawStoreCode)}</span><input type="text" class="stash-edit-input hidden w-28 px-2 py-1 border border-gray-200 rounded text-sm bg-white focus:outline-none focus:border-brand" data-edit-field="rawStoreCode" value="${this.escapeHtml(rawStoreCode)}"></td>
        <td class="px-5 py-3"><span class="stash-edit-display ${customerStoreName === '-' ? 'text-[#86909c]' : ''}">${this.escapeHtml(customerStoreName)}</span><input type="text" class="stash-edit-input hidden w-40 px-2 py-1 border border-gray-200 rounded text-sm bg-white focus:outline-none focus:border-brand" data-edit-field="customerStoreName" value="${customerStoreName === '-' ? '' : this.escapeHtml(customerStoreName)}"></td>
        <td class="px-5 py-3"><span class="stash-edit-display ${customerStoreCode === '-' ? 'text-[#86909c]' : ''}">${this.escapeHtml(customerStoreCode)}</span><input type="text" class="stash-edit-input hidden w-32 px-2 py-1 border border-gray-200 rounded text-sm bg-white focus:outline-none focus:border-brand" data-edit-field="customerStoreCode" value="${customerStoreCode === '-' ? '' : this.escapeHtml(customerStoreCode)}"></td>
        <td class="px-5 py-3"><span class="stash-edit-display ${dealer === '-' ? 'text-[#86909c]' : ''}">${this.escapeHtml(dealer)}</span><input type="text" class="stash-edit-input hidden w-32 px-2 py-1 border border-gray-200 rounded text-sm bg-white focus:outline-none focus:border-brand" data-edit-field="customerDealer" value="${dealer === '-' ? '' : this.escapeHtml(dealer)}"></td>
        <td class="px-5 py-3"><span class="${acc === '-' ? 'text-[#86909c]' : ''}">${this.escapeHtml(acc)}</span></td>
        <td class="px-5 py-3"><span class="${headquarters === '-' ? 'text-[#86909c]' : ''}">${this.escapeHtml(headquarters)}</span></td>
        <td class="px-5 py-3"><span class="${salesOffice === '-' ? 'text-[#86909c]' : ''}">${this.escapeHtml(salesOffice)}</span></td>
        <td class="px-5 py-3 text-amber-700">
          <div class="truncate max-w-[220px]" title="${this.escapeHtml(abnormalReason)}">${this.escapeHtml(abnormalReason)}</div>
        </td>
        <td class="px-5 py-3 text-[#4e5969]"><span title="${this.escapeHtml(handler)}">${this.escapeHtml(handler)}</span></td>
        <td class="px-5 py-3 sticky right-0 z-10 bg-white group-hover:bg-slate-50 shadow-[-6px_0_10px_-10px_rgba(15,23,42,0.45)]">
          <div class="flex items-center gap-1">
            <button type="button" class="ingestion-stash-detail-btn px-2 py-1 text-xs rounded text-brand hover:bg-blue-50 transition-colors" data-stash-key="${this.escapeHtml(key)}" title="单据详情">
              <i class="fa-solid fa-list-check"></i>
            </button>
            <button type="button" class="ingestion-stash-reject-btn px-2 py-1 text-xs rounded ${isRejected ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'} transition-colors" data-stash-key="${this.escapeHtml(key)}" title="${isRejected ? '已驳回' : '驳回'}" ${isRejected ? 'disabled' : ''}>
              <i class="fa-solid fa-reply"></i>
            </button>
            <button type="button" class="ingestion-stash-edit-btn px-2 py-1 text-xs rounded text-amber-500 hover:bg-amber-50 transition-colors" data-stash-key="${this.escapeHtml(key)}" title="编辑">
              <i class="fa-solid fa-pen-to-square stash-edit-icon"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
    }).join('');

    container.innerHTML = `
      <div class="ingestion-stash-table-shell animate-[fadeIn_0.22s_ease-out] min-h-full bg-white">
        <table class="ingestion-stash-wide-table w-full table-fixed min-w-[1900px] text-left text-sm text-[#4e5969]">
          <thead class="bg-[#f7f8fa] text-[#1d2129] font-medium sticky top-0 z-10">
            <tr>
              <th class="px-4 py-4 w-[60px] rounded-tl-lg sticky left-0 z-30 bg-[#f7f8fa]"><input type="checkbox" id="ingestion-stash-select-all" class="rounded border-gray-300 text-brand focus:ring-brand"></th>
              <th class="px-4 py-4 w-[176px] sticky left-[60px] z-30 bg-[#f7f8fa]">年月</th>
              <th class="px-3 py-4 w-56 sticky left-[236px] z-30 bg-[#f7f8fa] shadow-[6px_0_10px_-10px_rgba(15,23,42,0.45)]">原始门店名称</th>
              <th class="px-5 py-4 w-36">原始门店编码</th>
              <th class="px-5 py-4 w-48">门店名称</th>
              <th class="px-5 py-4 w-40">门店编码</th>
              <th class="px-5 py-4 w-36">经销商</th>
              <th class="px-5 py-4 w-28">ACC</th>
              <th class="px-5 py-4 w-32">本部</th>
              <th class="px-5 py-4 w-36">营业所</th>
              <th class="px-5 py-4 w-56">异常原因</th>
              <th class="px-5 py-4 w-32">处理人</th>
              <th class="px-5 py-4 w-28 rounded-tr-lg sticky right-0 z-30 bg-[#f7f8fa] shadow-[-6px_0_10px_-10px_rgba(15,23,42,0.45)]">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            ${rows.length === 0 ? `
              <tr>
                <td colspan="13" class="px-4 py-16 text-center text-[#86909c]">
                  <i class="fa-regular fa-folder-open text-3xl mb-3 block text-gray-300"></i>
                  暂无暂存数据
                </td>
              </tr>
            ` : tableRows}
          </tbody>
        </table>
      </div>
    `;

    this.renderPagination();
    this.bindStashEvents();
  },

  updateStashBatchButton() {
    const container = document.getElementById('ingestion-stash-container');
    const rowCheckboxes = Array.from(container?.querySelectorAll('.row-cb-ingestion-stash') || []);
    const selected = rowCheckboxes.filter((checkbox) => checkbox.checked).length;
    const approveBtn = document.getElementById('btn-batch-approve');
    const checkingHint = document.getElementById('stash-checking-hint');
    const checkingCount = document.getElementById('stash-checking-count');
    const selectAll = container?.querySelector('#ingestion-stash-select-all');

    if (checkingHint) {
      const shouldShow = this.activeDataMode === 'stash' && this.stashCheckState.active;
      checkingHint.classList.toggle('hidden', !shouldShow);
      if (checkingCount) checkingCount.textContent = this.stashCheckState.count || selected || 0;
    }

    if (approveBtn) {
      if (this.stashCheckState.active) {
        approveBtn.disabled = true;
        approveBtn.className = 'px-4 py-2 bg-[#86909c] text-white rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed';
        approveBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles mr-1"></i>门店名称/编码校验';
      } else {
        approveBtn.disabled = selected === 0;
        approveBtn.className = selected > 0
        ? 'px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium transition-all shadow-sm shadow-brand/20 hover:bg-blue-700 hover:shadow-brand/30 hover:-translate-y-0.5'
        : 'px-4 py-2 bg-[#86909c] text-white rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed';
        approveBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles mr-1"></i>门店名称/编码校验';
      }
    }

    if (selectAll) {
      selectAll.checked = selected > 0 && selected === rowCheckboxes.length;
      selectAll.indeterminate = selected > 0 && selected < rowCheckboxes.length;
    }
  },

  bindStashEvents() {
    const container = document.getElementById('ingestion-stash-container');
    const selectAll = container?.querySelector('#ingestion-stash-select-all');
    const rowCheckboxes = Array.from(container?.querySelectorAll('.row-cb-ingestion-stash') || []);

    selectAll?.addEventListener('change', (event) => {
      rowCheckboxes.forEach((checkbox) => {
        checkbox.checked = event.target.checked;
      });
      this.updateStashBatchButton();
    });

    rowCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', () => this.updateStashBatchButton());
    });

    container?.querySelectorAll('.ingestion-stash-preview-trigger').forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        event.stopPropagation();
        const emailId = trigger.dataset.emailId;
        const attIdx = trigger.dataset.attIdx;
        if (emailId && attIdx !== '') {
          const inboxItem = this.getInboxData().find(item => String(item.id) === String(emailId));
          const attachment = inboxItem?.attachments?.[Number(attIdx)];
          if (inboxItem && attachment) {
            this.showInboxAttachmentPreview(inboxItem, attachment);
          }
          return;
        }
        const index = Number(trigger.dataset.index);
        const key = trigger.closest('tr')?.dataset.stashKey;
        const item = this.getFilteredStashRows().find(stashItem => stashItem.key === key)
          || this.getFilteredStashRows().find(stashItem => Number(stashItem.index) === index);
        if (item) this.showStashStorePreview(item);
      });
    });

    container?.querySelectorAll('.ingestion-stash-detail-btn').forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        event.stopPropagation();
        const key = trigger.dataset.stashKey;
        const item = this.getFilteredStashRows().find(row => row.key === key);
        if (!item) return;
        const row = item.row || {};
        const displayMonth = row.month || this.getCurrentDisplayMonth();
        const rawStoreCode = this.getStashRawStoreCode(row, item.index);
        this.openDocumentDetail({
          moduleName: '文件收取 - 暂存数据',
          currentNode: '暂存数据',
          title: row.storeName || '暂存单据',
          nameLabel: '原始门店名称',
          statusText: '暂存',
          row,
          moduleFields: [
            { label: '年月', value: displayMonth },
            { label: '原始门店名称', value: row.storeName || '-' },
            { label: '原始门店编码', value: rawStoreCode },
            { label: '门店名称', value: row.customerStoreName || '-' },
            { label: '门店编码', value: row.customerStoreCode || '-' },
            { label: '经销商', value: row.customerDealer || '-' },
            { label: 'ACC', value: row.customerAcc || '-' },
            { label: '本部', value: row.customerHeadquarters || '-' },
            { label: '营业所', value: row.customerSalesOffice || '-' },
            { label: '异常原因', value: this.getStashAbnormalReason(row) },
            { label: '处理人', value: row.handler || 'POS担当' },
            { label: 'AI判断', value: row.aiNote || '-' }
          ]
        });
      });
    });

    container?.querySelectorAll('.ingestion-stash-reject-btn').forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        event.stopPropagation();
        const key = trigger.dataset.stashKey;
        const item = this.getFilteredStashRows().find(row => row.key === key);
        if (!item || this.rejectedStashKeys.has(key)) return;
        this.openStashRejectConfirm(item);
      });
    });

    container?.querySelectorAll('.stash-headquarters-select').forEach(select => {
      select.addEventListener('change', () => {
        const row = select.closest('tr');
        const salesOfficeSelect = row?.querySelector('.stash-sales-office-select');
        if (!salesOfficeSelect) return;
        salesOfficeSelect.innerHTML = this.renderSelectOptions(this.getSalesOfficeOptions(select.value), '', '请选择营业所');
        salesOfficeSelect.value = '';
        salesOfficeSelect.classList.remove('border-red-300', 'ring-2', 'ring-red-100');
      });
    });

    container?.querySelectorAll('.ingestion-stash-edit-btn').forEach(trigger => {
      trigger.addEventListener('click', event => {
        event.stopPropagation();
        const rowElement = trigger.closest('tr');
        const key = trigger.dataset.stashKey;
        if (!rowElement || !key) return;

        const icon = trigger.querySelector('.stash-edit-icon');
        const isEditing = icon?.classList.contains('fa-check');
        const displays = rowElement.querySelectorAll('.stash-edit-display');
        const inputs = rowElement.querySelectorAll('.stash-edit-input');

        if (!isEditing) {
          icon.className = 'fa-solid fa-check stash-edit-icon';
          trigger.title = '保存';
          trigger.classList.add('bg-amber-100');
          displays.forEach(item => item.classList.add('hidden'));
          inputs.forEach(input => input.classList.remove('hidden'));
          rowElement.querySelector('.stash-edit-input')?.focus();
          return;
        }

        const storeNameInput = rowElement.querySelector('[data-edit-field="storeName"]');
        if (!storeNameInput?.value.trim()) {
          storeNameInput?.classList.add('border-red-300', 'ring-2', 'ring-red-100');
          storeNameInput?.focus();
          Dialog.toast('请输入原始门店名称', 'warning');
          return;
        }
        const edits = {};
        inputs.forEach(input => {
          if (input.dataset.editField && input.dataset.editField !== 'handler') edits[input.dataset.editField] = input.value.trim();
        });
        this.stashEdits.set(key, edits);
        this.renderStashTable();
        Dialog.toast('已保存', 'success');
      });
    });

    this.updateStashBatchButton();
  },

  openStashRejectConfirm(item) {
    const overlay = document.getElementById('overlay-container');
    if (!overlay) return;
    const row = item.row || {};
    const key = item.key;
    const handler = row.handler || 'POS担当';
    const abnormalReason = this.getStashAbnormalReason(row);

    overlay.innerHTML = `
      <div id="stash-reject-overlay" class="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center px-6">
        <div class="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-[fadeIn_0.18s_ease-out]" role="dialog" aria-modal="true" aria-labelledby="stash-reject-title">
          <div class="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
            <div class="min-w-0">
              <h3 id="stash-reject-title" class="text-lg font-bold text-[#1d2129]">确认驳回未匹配数据</h3>
              <p class="mt-1 text-sm text-[#86909c] truncate" title="${this.escapeHtml(row.storeName || '-')}">${this.escapeHtml(row.storeName || '-')}</p>
            </div>
            <button type="button" id="stash-reject-close" class="w-8 h-8 shrink-0 rounded-lg text-[#86909c] hover:bg-gray-100 hover:text-[#1d2129] transition-colors" aria-label="关闭">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="px-6 py-5 space-y-4">
            <div class="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
              <div class="text-xs font-semibold text-red-500 mb-1">驳回原因（AI判断）</div>
              <div class="text-sm leading-6 text-[#1d2129]">${this.escapeHtml(abnormalReason)}</div>
            </div>
            <div class="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
              <label for="stash-reject-team-select" class="mb-2 block text-xs font-semibold text-[#4e5969]">驳回至营业 Team</label>
              ${this.renderRejectTeamSelect(handler, 'stash-reject-team-select')}
            </div>
            <div>
              <label for="stash-reject-manual-note" class="block mb-2 text-xs font-semibold text-[#4e5969]">手动备注信息</label>
              <textarea id="stash-reject-manual-note" rows="4" maxlength="500"
                class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm leading-6 text-[#1d2129] resize-none focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
                placeholder="请输入补充说明或处理建议"></textarea>
              <div class="mt-1 text-right text-xs text-[#86909c]"><span id="stash-reject-note-count">0</span>/500</div>
            </div>
            <p class="text-xs text-[#86909c] leading-5"><span class="font-semibold text-[#4e5969]">说明：</span>驳回操作需针对门店级的完整 POS 表执行，而非单条数据。确认驳回后，该单据将标记为已驳回。</p>
          </div>
          <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button type="button" id="stash-reject-cancel" class="px-4 py-2 rounded-lg text-sm text-[#4e5969] bg-gray-100 hover:bg-gray-200 transition-colors">取消</button>
            <button type="button" id="stash-reject-submit" class="px-4 py-2 rounded-lg text-sm text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm">确认驳回</button>
          </div>
        </div>
      </div>
    `;

    const close = () => { overlay.innerHTML = ''; };
    const modalOverlay = overlay.querySelector('#stash-reject-overlay');
    const noteInput = overlay.querySelector('#stash-reject-manual-note');
    const noteCount = overlay.querySelector('#stash-reject-note-count');
    overlay.querySelector('#stash-reject-close')?.addEventListener('click', close);
    overlay.querySelector('#stash-reject-cancel')?.addEventListener('click', close);
    modalOverlay?.addEventListener('click', event => {
      if (event.target === modalOverlay) close();
    });
    noteInput?.addEventListener('input', () => {
      if (noteCount) noteCount.textContent = String(noteInput.value.length);
    });
    overlay.querySelector('#stash-reject-submit')?.addEventListener('click', () => {
      const selectedTeam = overlay.querySelector('#stash-reject-team-select')?.value || handler;
      row.rejectNote = noteInput?.value.trim() || '';
      row.handler = selectedTeam;
      this.stashEdits.set(key, {
        ...(this.stashEdits.get(key) || {}),
        handler: selectedTeam,
        rejectNote: row.rejectNote
      });
      this.rejectedStashKeys.add(key);
      close();
      this.renderStashTable();
      Dialog.toast(`${row.storeName || '未匹配数据'} 已驳回至 ${selectedTeam}`, 'success');
    });
    noteInput?.focus();
  },

  getSelectedStashRows() {
    const container = document.getElementById('ingestion-stash-container');
    const selectedKeys = new Set(
      Array.from(container?.querySelectorAll('.row-cb-ingestion-stash:checked') || [])
        .map(checkbox => checkbox.dataset.stashKey)
        .filter(Boolean)
    );

    if (selectedKeys.size === 0) return [];
    return this.getFilteredStashRows().filter(item => selectedKeys.has(item.key));
  },

  buildPromotedStashRow(item, index) {
    const row = item.row || {};
    const fileName = row.storeName || `暂存数据-${index + 1}.xlsx`;
    const storeName = fileName.replace(/\.(xlsx|xls|csv|zip)$/i, '');
    return {
      id: `stash-promoted-${String(item.key).replace(/[^a-zA-Z0-9_-]/g, '-')}`,
      month: this.getDisplayMonth(row),
      fileName,
      storeName,
      storeCode: row.storeCode && row.storeCode !== '-' ? row.storeCode : `S${String(9100 + index).padStart(7, '0')}`,
      team: row.salesTeam || '华北 Team / 화북 Team',
      status: '待通过',
      confidence: '98%',
      suggestion: 'AI校验通过，已从暂存数据流入原始门店数据列表。',
      handler: 'POS担当',
      region: row.region || '华北区域',
      salesOffice: row.salesOffice || '石家庄营业所',
      dealer: row.dealer || '河北聚昊商贸',
      matchSource: 'from-unmatched',
      sourceEmailId: row.sourceEmailId,
      sourceAttIdx: row.sourceAttIdx,
      remark: ''
    };
  },

  promoteStashRows(successRows) {
    successRows.forEach((item, index) => {
      const promoted = this.buildPromotedStashRow(item, index);
      this.promotedStashKeys.add(item.key);

      if (!this.data.some(row => row.id === promoted.id)) {
        this.data.unshift(promoted);
      }

      if (item.row?.sourceEmailId && typeof item.row.sourceAttIdx === 'number') {
        const inboxItem = this.getInboxData().find(row => String(row.id) === String(item.row.sourceEmailId));
        const attachment = inboxItem?.attachments?.[item.row.sourceAttIdx];
        if (attachment) {
          attachment.status = '正常';
          attachment.rejectReason = '-';
        }
        if (inboxItem) this.recalcInboxItemStatus(inboxItem);
      }
    });
  },

  showStashAiCheckResult(successRows, failedRows) {
    const successList = successRows.length
      ? successRows.map(item => `<li class="truncate">${this.escapeHtml(item.row.storeName || '-')}</li>`).join('')
      : '<li class="text-[#86909c]">暂无</li>';
    const failedList = failedRows.length
      ? failedRows.map(item => `<li class="truncate">${this.escapeHtml(item.row.storeName || '-')}</li>`).join('')
      : '<li class="text-[#86909c]">暂无</li>';

    Dialog.show({
      title: 'AI校验结果',
      content: `
        <div class="space-y-4">
          <div class="rounded-lg border border-green-100 bg-green-50 p-3">
            <div class="flex items-center gap-2 text-sm font-bold text-green-700">
              <i class="fa-solid fa-circle-check"></i>
              校验成功 ${successRows.length} 条
            </div>
            <p class="mt-2 text-xs leading-5 text-green-700">以下数据已流入「已匹配数据」，请在已匹配数据中进入质检。</p>
            <ul class="mt-2 space-y-1 text-xs text-green-800">${successList}</ul>
          </div>
          <div class="rounded-lg border border-amber-100 bg-amber-50 p-3">
            <div class="flex items-center gap-2 text-sm font-bold text-amber-700">
              <i class="fa-solid fa-triangle-exclamation"></i>
              校验失败 ${failedRows.length} 条
            </div>
            <p class="mt-2 text-xs leading-5 text-amber-700">未校验到门店编码/所属关系，请检查门店主数据。</p>
            <ul class="mt-2 space-y-1 text-xs text-amber-800">${failedList}</ul>
          </div>
        </div>
      `,
      confirmText: successRows.length ? '跳转已匹配数据' : '知道了',
      cancelText: '留在未匹配数据',
      onConfirm: () => {
        if (successRows.length) {
          setTimeout(() => document.getElementById('tab-files')?.click(), 0);
        }
      }
    });
  },

  handleStashAiCheck() {
    if (this.stashCheckState.active) return;

    const selectedRows = this.getSelectedStashRows();
    if (selectedRows.length === 0) {
      Dialog.toast('请先选择需要校验的暂存数据', 'error');
      return;
    }

    const selectedCount = selectedRows.length;
    Dialog.show({
      title: '确认门店校验',
      content: `
        <div class="space-y-3 text-left">
          <div class="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
            <span class="text-sm text-gray-600">本次校验数据</span>
            <span class="text-base font-semibold text-blue-600">${selectedCount} 条</span>
          </div>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div class="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <div class="mb-1 text-sm font-medium text-emerald-700">校验成功</div>
              <div class="text-xs leading-5 text-emerald-700/80">流向“单门店已匹配数据”</div>
            </div>
            <div class="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
              <div class="mb-1 text-sm font-medium text-amber-700">校验失败</div>
              <div class="text-xs leading-5 text-amber-700/80">继续保留在“单门店未匹配数据”</div>
            </div>
          </div>
          <div class="rounded-lg bg-gray-50 px-4 py-3 text-xs leading-5 text-gray-500">
            校验将根据门店名称和门店编码匹配门店主数据。
          </div>
        </div>
      `,
      confirmText: '继续校验',
      cancelText: '取消',
      onConfirm: () => {
        this.stashCheckState = {
          active: true,
          count: selectedCount
        };
        this.updateStashBatchButton();

        setTimeout(() => {
          const successRows = selectedRows.slice(0, 1);
          const failedRows = selectedRows.slice(1);

          this.promoteStashRows(successRows);
          failedRows.forEach(item => this.failedStashKeys.add(item.key));
          this.stashCheckState = {
            active: false,
            count: 0
          };
          this.updateStats();
          this.renderStashTable();
        }, this.checkingMinDurationMs);
      }
    });
  },
  
  // 跳转到收件箱并高亮指定邮件/附件
  navigateToInbox(emailId, attIdx = null) {
    const self = this;
    
    // 切换到收件箱Tab
    const tabOriginal = document.getElementById('tab-original');
    if (tabOriginal) tabOriginal.click();
    
    // 等待DOM重建完成后操作
    setTimeout(() => {
      const masterRow = document.querySelector(`#inbox-tbody .inbox-master-row[data-id="${emailId}"]`);
      if (!masterRow) return;
      
      // 先清除旧高亮
      self._clearInboxHighlights();
      
      // 如果需要定位到具体附件，先展开detail
      if (attIdx !== null) {
        const expandBtn = masterRow.querySelector('.inbox-expand-btn');
        const detailRow = document.querySelector(`#inbox-tbody .inbox-detail-row[data-parent-id="${emailId}"]`);
        
        if (!detailRow || detailRow.classList.contains('hidden')) {
          if (expandBtn) expandBtn.click();
        }
        
        // 等待detail展开
        setTimeout(() => {
          self._doHighlight(masterRow, emailId, attIdx);
        }, 200);
      } else {
        self._doHighlight(masterRow, emailId, null);
      }
    }, 250);
  },
  
  _doHighlight(masterRow, emailId, attIdx) {
    const self = this;
    
    // 滚动到目标行（instant，不用smooth保证即时定位）
    masterRow.scrollIntoView({ behavior: 'instant', block: 'center' });
    
    // 用内联样式设置高亮背景色（优先级最高，不会被hover覆盖）
    masterRow.style.transition = 'background-color 0.4s ease-out';
    masterRow.style.backgroundColor = '#bfd6f6';
    
    // 1.8秒后逐渐恢复（原0.8秒+额外1秒）
    setTimeout(() => {
      masterRow.style.backgroundColor = '';
      // transition结束后清除
      setTimeout(() => {
        masterRow.style.transition = '';
      }, 500);
    }, 1800);
    
    // 高亮附件行
    if (attIdx !== null) {
      const detailRow = document.querySelector(`#inbox-tbody .inbox-detail-row[data-parent-id="${emailId}"]`);
      if (detailRow) {
        const attRow = detailRow.querySelector(`tr[data-email-id="${emailId}"][data-att-idx="${attIdx}"]`);
        if (attRow) {
          attRow.scrollIntoView({ behavior: 'instant', block: 'center' });
          attRow.style.transition = 'background-color 0.4s ease-out';
          attRow.style.backgroundColor = '#fce4a8';
          
          setTimeout(() => {
            attRow.style.backgroundColor = '';
            setTimeout(() => {
              attRow.style.transition = '';
            }, 500);
          }, 1800);
        }
      }
    }
  },
  
  _clearInboxHighlights() {
    document.querySelectorAll('#inbox-tbody tr').forEach(el => {
      el.style.backgroundColor = '';
      el.style.transition = '';
    });
  },
  
  bindSourceLinks() {
    const self = this;
    const tbody = document.getElementById('ingestion-tbody');
    if (!tbody) return;
    
    // 来源邮件链接点击
    tbody.querySelectorAll('.inbox-source-email-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.stopPropagation();
        const emailId = link.getAttribute('data-email-id');
        self.navigateToInbox(emailId);
      });
    });
    
    // 来源附件链接点击
    tbody.querySelectorAll('.inbox-source-att-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.stopPropagation();
        const emailId = link.getAttribute('data-email-id');
        const attIdx = parseInt(link.getAttribute('data-att-idx') || '0');
        self.navigateToInbox(emailId, attIdx);
      });
    });
  },
  
  renderPagination() {
    const paginationArea = document.getElementById('pagination-area');
    const pagerControls = document.getElementById('pagination-controls');
    if (this.activeDataMode === 'files' || this.activeDataMode === 'stash') {
      paginationArea?.classList.remove('justify-between');
      paginationArea?.classList.add('justify-end');
      pagerControls?.classList.add('hidden');
      return;
    }

    paginationArea?.classList.add('justify-between');
    paginationArea?.classList.remove('justify-end');
    pagerControls?.classList.remove('hidden');

    const container = document.getElementById('page-numbers');
    if (!container) return;
    
    const totalPages = Math.ceil(this.pagination.total / this.pagination.pageSize) || 1;
    let html = '';
    
    for (let i = 1; i <= totalPages; i++) {
      const isActive = i === this.pagination.page;
      html += `
        <button type="button" class="page-btn w-7 h-7 rounded text-xs font-medium transition-all ${isActive ? 'bg-brand text-white' : 'text-[#4e5969] hover:bg-gray-100'}">
          ${i}
        </button>
      `;
    }
    
    container.innerHTML = html;
    
    // 更新上一页/下一页状态
    document.getElementById('btn-prev-page').disabled = this.pagination.page <= 1;
    document.getElementById('btn-next-page').disabled = this.pagination.page >= totalPages;
  },

  renderQualityCheckingHint() {
    const hint = document.getElementById('quality-checking-hint');
    const countEl = document.getElementById('quality-checking-count');
    if (!hint || !countEl) return;

    const count = this.data.filter(row => row.status.includes('质量校验中')).length;
    countEl.textContent = count;
    hint.classList.toggle('hidden', this.activeDataMode !== 'files' || count === 0);
  },
  
  updateBatchButtons() {
    const selected = document.querySelectorAll('.row-cb:checked:not(:disabled)').length;
    const buttons = {
      'btn-batch-archive': { active: 'border-gray-200 text-[#4e5969] bg-white', inactive: 'border-gray-200 text-[#86909c] bg-gray-50' },
      'btn-batch-approve': { active: 'bg-brand text-white shadow-brand/20', inactive: 'bg-[#86909c] text-white' },
      'btn-batch-reject': { active: 'border-blue-100 bg-blue-50 text-[#165dff]', inactive: 'border-gray-200 bg-gray-100 text-[#86909c]' }
    };
    
    Object.keys(buttons).forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        const isDisabled = selected === 0;
        btn.disabled = isDisabled;
        
        if (isDisabled) {
          btn.className = `px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${buttons[id].inactive}`;
        } else {
          btn.className = `px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:-translate-y-0.5 ${buttons[id].active}`;
        }

        if (['btn-batch-archive', 'btn-batch-approve', 'btn-batch-reject'].includes(id) && document.getElementById('tab-original')?.classList.contains('font-medium')) {
          btn.classList.add('hidden');
        }
        if (id === 'btn-batch-archive' && (this.activeDataMode === 'files' || this.activeDataMode === 'archive')) {
          btn.classList.add('hidden');
        }
        if (id === 'btn-batch-approve' && this.activeDataMode === 'archive') {
          btn.classList.add('hidden');
        }
        if (id === 'btn-batch-reject' && this.activeDataMode === 'files') {
          btn.classList.add('hidden');
        }
      }
    });
  },
  
  bindTableEvents() {
    // 全选
    const selectAll = document.getElementById('selectAll');
    if (selectAll) {
      selectAll.addEventListener('change', (e) => {
        document.querySelectorAll('.row-cb:not(:disabled)').forEach(cb => cb.checked = e.target.checked);
        this.updateBatchButtons();
      });
    }
    
    // 行选择
    document.querySelectorAll('.row-cb').forEach(cb => {
      cb.addEventListener('change', () => {
        const allCbs = document.querySelectorAll('.row-cb');
        const checkedCbs = document.querySelectorAll('.row-cb:checked');
        selectAll.checked = allCbs.length === checkedCbs.length;
        selectAll.indeterminate = checkedCbs.length > 0 && checkedCbs.length < allCbs.length;
        this.updateBatchButtons();
      });
    });

    document.querySelectorAll('.row-headquarters-select').forEach(select => {
      select.addEventListener('change', () => {
        const row = select.closest('tr');
        const salesOfficeSelect = row?.querySelector('.row-sales-office-select');
        if (!salesOfficeSelect) return;
        salesOfficeSelect.innerHTML = this.renderSelectOptions(this.getSalesOfficeOptions(select.value), '', '请选择营业所');
        salesOfficeSelect.value = '';
        salesOfficeSelect.classList.remove('border-red-300', 'ring-2', 'ring-red-100');
      });
    });

    document.querySelectorAll('.row-sales-office-select').forEach(select => {
      select.addEventListener('change', () => {
        select.classList.remove('border-red-300', 'ring-2', 'ring-red-100');
      });
    });
    
    // 操作按钮事件
    document.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.getAttribute('data-action');
        const id = e.currentTarget.getAttribute('data-id');
        const rowData = this.filteredData.find(r => String(r.id) === String(id)) || this.data.find(r => String(r.id) === String(id));
        if (action === 'detail') {
          if (!rowData) return;
          const isArchive = this.activeDataMode === 'archive';
          this.openDocumentDetail({
            moduleName: isArchive ? '文件收取 - 归档（非POS表）' : '文件收取 - 原始门店数据列表',
            currentNode: isArchive ? '归档（非POS表）' : '原始门店数据列表',
            title: rowData.storeName || rowData.fileName,
            nameLabel: '门店名称',
            statusText: isArchive ? '已归档' : (rowData.status || '正常'),
            row: rowData,
            moduleFields: [
              { label: '年月', value: this.getDisplayMonth(rowData) },
              { label: '门店编码', value: rowData.storeCode || '-' },
              { label: '营业Team', value: this.getLocalizedText(rowData.team) || '-' },
              { label: '处理人', value: this.getLocalizedText(rowData.handler) || '-' },
              { label: '所属区域', value: rowData.region || '-' },
              { label: '所属营业所', value: rowData.salesOffice || '-' },
              { label: '所属经销商', value: rowData.dealer || '-' }
            ]
          });
          return;
        }
        
        if (action === 'move-inbox') {
          this.moveArchivedToInbox(id);
        } else if (action === 'preview') {
          // 居中弹窗预览
          this.showStoreDataPreviewModal(rowData);
        } else if (action === 'edit') {
          // 行内编辑：切换编辑态/只读态
          const btn = e.currentTarget;
          const row = btn.closest('tr');
          if (!row) return;
          
          const icon = btn.querySelector('.row-edit-icon');
          const isEditing = icon.classList.contains('fa-check');
          
          const editableDisplays = row.querySelectorAll('.row-edit-display');
          const editableInputs = row.querySelectorAll('.row-edit-input');
          
          if (!isEditing) {
            // 进入编辑态
            icon.className = 'fa-solid fa-check row-edit-icon';
            btn.title = this.getCurrentLang() === 'cn' ? '保存' : '저장';
            btn.classList.add('bg-amber-100');
            
            editableDisplays.forEach(item => item.classList.add('hidden'));
            editableInputs.forEach(input => input.classList.remove('hidden'));
            const firstInput = row.querySelector('.row-edit-input');
            firstInput?.focus();
            firstInput?.select();
          } else {
            const edits = {};
            editableInputs.forEach(input => {
              const field = input.dataset.editField;
              const value = input.value.trim();
              if (field && value) edits[field] = value;
            });
            
            // 更新数据
            this.data = this.data.map(r => {
              if (r.id === id) {
                Object.assign(r, edits);
                if (edits.rawStoreName) r.fileName = edits.rawStoreName;
              }
              return r;
            });
            this.filteredData = this.filteredData.map(r => {
              if (r.id === id) {
                Object.assign(r, edits);
                if (edits.rawStoreName) r.fileName = edits.rawStoreName;
              }
              return r;
            });
            
            // 保存并回到只读态
            icon.className = 'fa-solid fa-pen-to-square row-edit-icon';
            btn.title = this.getCurrentLang() === 'cn' ? '编辑' : '편집';
            btn.classList.remove('bg-amber-100');
            this.renderTable();
            Dialog.toast(this.getCurrentLang() === 'cn' ? '已保存' : '저장되었습니다');
          }
        } else if (action === 'reject') {
          this.openOriginalFileRejectConfirm(id);
        } else {
          // 通过、归档操作
          const actionNames = this.getCurrentLang() === 'cn' 
            ? { approve: '通过并质量校验', archive: '归档' }
            : { approve: '승인', archive: '보관' };
          const toastMsgs = this.getCurrentLang() === 'cn'
            ? { approve: '已进入质量校验', archive: '归档成功' }
            : { approve: '승인 성공', archive: '보관 성공' };
          const confirmText = this.getCurrentLang() === 'cn' ? '确认' : '확인';
          const confirmContentText = this.getCurrentLang() === 'cn' ? '确认对文件「' : '파일「';
          const actionText = this.getCurrentLang() === 'cn' ? '」执行' : '」에 대해';
          const operationText = this.getCurrentLang() === 'cn' ? '操作？' : '조작하시겠습니까?';
          
          Dialog.show({
            title: action === 'approve' ? '确认质量校验' : `${confirmText}【${actionNames[action]}】`,
            content: action === 'approve'
              ? `
                <div class="space-y-3 text-left">
                  <div class="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                    <span class="text-sm text-gray-600">本次校验数据</span>
                    <span class="text-base font-semibold text-blue-600">1 条</span>
                  </div>
                  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div class="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                      <div class="mb-1 text-sm font-medium text-emerald-700">正常数据</div>
                      <div class="text-xs leading-5 text-emerald-700/80">流向“质量检查 - 标准POS表”</div>
                    </div>
                    <div class="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                      <div class="mb-1 text-sm font-medium text-amber-700">异常数据</div>
                      <div class="text-xs leading-5 text-amber-700/80">流向“质量检查 - 异常数据”</div>
                    </div>
                  </div>
                  <div class="rounded-lg bg-gray-50 px-4 py-3 text-xs leading-5 text-gray-500">
                    校验提交后将在后台执行，可通过数据状态查看处理进度。
                  </div>
                </div>
              `
              : `${confirmContentText}${rowData.fileName}${actionText}${actionNames[action]}${operationText}`,
            ...(action === 'approve' ? { confirmText: '继续校验', cancelText: '取消' } : {}),
            onConfirm: () => {
              if (action === 'approve' && this.activeDataMode === 'files') {
                this.startOriginalQualityCheck([id]);
              } else {
                this.data = this.data.map(row => {
                  if (row.id === id) {
                    row.status = '已归档';
                    row.handler = row.team;
                  }
                  return row;
                });
              }
              this.updateStats();
              // 延迟执行，等 Dialog.closeDialog 先清理掉弹窗 DOM
              setTimeout(() => {
                this.applyFilters();
                Dialog.toast(toastMsgs[action]);
              }, 100);
            }
          });
        }
      });
    });

    document.querySelectorAll('.ingestion-row-preview-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = e.currentTarget.getAttribute('data-id');
        const rowData = this.filteredData.find(r => r.id === id) || this.data.find(r => r.id === id);
        if (!rowData) return;

        if (this.activeDataMode === 'archive' && rowData.sourceEmailId && typeof rowData.sourceAttIdx === 'number') {
          const inboxItem = this.getInboxData().find(item => item.id === rowData.sourceEmailId);
          const attachment = inboxItem?.attachments?.[rowData.sourceAttIdx];
          if (inboxItem && attachment) {
            this.showInboxAttachmentPreview(inboxItem, attachment);
            return;
          }
        }

        this.showStoreDataPreviewModal(rowData);
      });
    });
  },
  
  renderSearchFieldDropdown() {
    const dropdown = document.getElementById('search-field-dropdown');
    if (!dropdown) return;
    const current = this.getCurrentSearchField();
    dropdown.innerHTML = this.getSearchFieldOptions(this.activeDataMode).map(option => `
      <button type="button" data-search-field="${option.value}"
        class="search-field-option w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${current === option.value ? 'bg-blue-50 text-brand font-medium' : 'text-[#4e5969] hover:bg-gray-50'}"
        title="${this.escapeHtml(option.label)}">
        ${this.escapeHtml(option.label)}
      </button>
    `).join('');
  },

  syncSearchControlUI() {
    const wrapper = document.getElementById('search-combo-wrapper');
    const fieldBtn = document.getElementById('search-field-btn');
    const fieldLabel = document.getElementById('search-field-label');
    const fieldInput = document.getElementById('filter-filename');
    const dropdown = document.getElementById('search-field-dropdown');
    const isInboxVisible = !document.getElementById('original-attachment')?.classList.contains('hidden');
    const showFieldSelector = !isInboxVisible && (this.activeDataMode === 'files' || this.activeDataMode === 'stash');
    if (wrapper) wrapper.classList.toggle('w-[420px]', showFieldSelector);
    if (wrapper) wrapper.classList.toggle('w-56', !showFieldSelector);
    if (fieldBtn) fieldBtn.classList.toggle('hidden', !showFieldSelector);
    if (fieldBtn) fieldBtn.classList.toggle('flex', showFieldSelector);
    if (!showFieldSelector) {
      dropdown?.classList.add('hidden');
      dropdown?.classList.remove('dropdown-open');
      if (fieldInput) {
        fieldInput.placeholder = this.getCurrentLang() === 'cn' ? '请输入文件名称模糊搜索' : '파일명 검색';
      }
      return;
    }
    this.filters.searchField = this.getCurrentSearchField();
    const label = this.getSearchFieldLabel(this.activeDataMode, this.filters.searchField);
    if (fieldLabel) fieldLabel.textContent = label;
    if (fieldBtn) fieldBtn.title = label;
    if (fieldInput) {
      fieldInput.placeholder = this.getCurrentLang() === 'cn' ? '搜索' : '검색';
    }
    this.renderSearchFieldDropdown();
  },

  bindFilterEvents() {
    // 文件名称搜索
    const filenameInput = document.getElementById('filter-filename');
    if (filenameInput) {
      filenameInput.addEventListener('input', (e) => {
        this.debounce(() => {
          this.filters.fileName = e.target.value;
          if (!document.getElementById('original-attachment')?.classList.contains('hidden')) {
            this.saveFiltersToCache();
            this.renderInbox();
            return;
          }
          this.applyFilters();
        }, 300);
      });
    }

    const searchFieldBtn = document.getElementById('search-field-btn');
    const searchFieldDropdown = document.getElementById('search-field-dropdown');
    searchFieldBtn?.addEventListener('click', (event) => {
      event.stopPropagation();
      if (!searchFieldDropdown || searchFieldBtn.classList.contains('hidden')) return;
      document.querySelectorAll('.dropdown-open').forEach(el => {
        if (el !== searchFieldDropdown) el.classList.add('hidden');
      });
      searchFieldDropdown.classList.toggle('hidden');
      searchFieldDropdown.classList.toggle('dropdown-open');
    });

    searchFieldDropdown?.addEventListener('click', (event) => {
      event.stopPropagation();
      const option = event.target.closest('[data-search-field]');
      if (!option) return;
      this.filters.searchField = option.dataset.searchField || 'all';
      this.pagination.page = 1;
      this.syncSearchControlUI();
      searchFieldDropdown.classList.add('hidden');
      searchFieldDropdown.classList.remove('dropdown-open');
      this.applyFilters();
    });
    
    // 本部/营业所级联筛选
    const teamBtn = document.getElementById('team-select-btn');
    const teamDropdown = document.getElementById('team-dropdown');
    
    if (teamBtn && teamDropdown) {
      teamBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.dropdown-open').forEach(el => {
          if (el !== teamDropdown) el.classList.add('hidden');
        });
        teamDropdown.classList.toggle('hidden');
        teamDropdown.classList.toggle('dropdown-open');
      });

      teamDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
        const allOption = e.target.closest('[data-org-all]');
        const headquartersOption = e.target.closest('[data-headquarters]');
        const salesOfficeOption = e.target.closest('[data-sales-office]');

        if (allOption) {
          this.filters.headquarters = '';
          this.filters.salesOffice = '';
          this.syncOrgFilterUI();
          teamDropdown.classList.add('hidden');
          teamDropdown.classList.remove('dropdown-open');
          this.applyFilters();
          return;
        }

        if (headquartersOption) {
          this.filters.headquarters = headquartersOption.dataset.headquarters || '';
          this.filters.salesOffice = '';
          this.syncOrgFilterUI();
          this.applyFilters();
          return;
        }

        if (salesOfficeOption) {
          this.filters.salesOffice = salesOfficeOption.dataset.salesOffice || '';
          this.syncOrgFilterUI();
          teamDropdown.classList.add('hidden');
          teamDropdown.classList.remove('dropdown-open');
          this.applyFilters();
        }
      });
    }

    document.getElementById('approval-status-select')?.addEventListener('change', (e) => {
      this.filters.approvalStatus = e.target.value || 'all';
      this.applyFilters();
    });

    document.getElementById('quality-checking-hint')?.addEventListener('click', () => {
      this.filters.approvalStatus = 'checking';
      const approvalStatusSelect = document.getElementById('approval-status-select');
      if (approvalStatusSelect) approvalStatusSelect.value = 'checking';
      this.applyFilters();
    });

    document.getElementById('upload-checking-hint')?.addEventListener('click', () => {
      Dialog.toast(this.getCurrentLang() === 'cn'
        ? '上传文件正在校验，完成后将同步到下方单据'
        : '업로드 파일 검사 중입니다');
    });
    
    // 收件箱状态多选下拉
    const inboxStatusBtn = document.getElementById('inbox-status-btn');
    const inboxStatusDropdown = document.getElementById('inbox-status-dropdown');
    const inboxStatusCheckboxes = document.querySelectorAll('.inbox-status-checkbox');
    const inboxStatusSelectAll = document.getElementById('inbox-status-select-all');
    
    if (inboxStatusBtn && inboxStatusDropdown) {
      inboxStatusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.dropdown-open').forEach(el => {
          if (el !== inboxStatusDropdown) el.classList.add('hidden');
        });
        inboxStatusDropdown.classList.toggle('hidden');
        inboxStatusDropdown.classList.toggle('dropdown-open');
      });
      
      const updateInboxStatusLabel = () => {
        const checked = Array.from(document.querySelectorAll('.inbox-status-checkbox:checked')).map(cb => cb.value);
        this.inboxStatusFilter = checked;
        
        const label = document.getElementById('inbox-status-label');
        if (label) {
          if (checked.length === 0) {
            label.textContent = this.getCurrentLang() === 'cn' ? '全部状态' : '전체 상태';
          } else if (checked.length === 1) {
            label.textContent = checked[0];
          } else {
            label.textContent = this.getCurrentLang() === 'cn' ? `已选 ${checked.length} 个` : `${checked.length}개 선택`;
          }
        }
        
        this.renderInbox();
      };
      
      inboxStatusSelectAll?.addEventListener('change', (e) => {
        inboxStatusCheckboxes.forEach(cb => cb.checked = e.target.checked);
        updateInboxStatusLabel();
      });
      
      inboxStatusCheckboxes.forEach(cb => {
        cb.addEventListener('change', updateInboxStatusLabel);
      });
      
      inboxStatusDropdown.addEventListener('click', (e) => e.stopPropagation());
    }
    
    // 重置筛选
    const resetBtn = document.getElementById('btn-reset-filter');
    const emptyResetBtn = document.getElementById('btn-empty-reset');
    
    [resetBtn, emptyResetBtn].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          this.resetFilters();
          // 更新UI
          if (filenameInput) filenameInput.value = '';
          this.syncSearchControlUI();
          this.syncOrgFilterUI();
          const approvalStatusSelect = document.getElementById('approval-status-select');
          if (approvalStatusSelect) approvalStatusSelect.value = 'all';
        });
      }
    });

    document.getElementById('btn-upload-file')?.addEventListener('click', () => {
      this.showUploadModal();
    });
    
    // 点击其他地方关闭下拉
    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown-open').forEach(el => el.classList.add('hidden'));
    });
  },

  escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  showUploadModal(options = {}) {
    return this.showEnhancedUploadModal(options);
  },

  // 保留旧弹窗实现用于演示数据兼容；页面入口统一调用 showUploadModal。
  showLegacyUploadModal() {
    const cn = this.getCurrentLang() === 'cn';
    const currentDate = new Date();
    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const defaultPeriod = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, '0')}`;
    const defaultYear = previousMonth.getFullYear();
    const defaultMonth = previousMonth.getMonth() + 1;
    const yearOptions = [2024, 2025, 2026].map(year => `<option value="${year}" ${year === defaultYear ? 'selected' : ''}>${year} 年</option>`).join('');
    const monthOptions = Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      return `<option value="${String(month).padStart(2, '0')}" ${month === defaultMonth ? 'selected' : ''}>${month} 月</option>`;
    }).join('');
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/35 p-4';
    overlay.innerHTML = `
      <div class="w-full max-w-xl overflow-hidden rounded-lg bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="upload-modal-title">
        <div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 id="upload-modal-title" class="text-base font-bold text-[#1d2129]">${cn ? '上传文件' : '파일 업로드'}</h3>
            <p class="mt-1 text-xs text-[#86909c]">${cn ? '填写材料信息并上传本地文件' : '자료 정보를 입력하고 로컬 파일을 업로드하세요'}</p>
          </div>
          <button type="button" class="upload-modal-close flex h-8 w-8 items-center justify-center rounded-md text-[#86909c] hover:bg-gray-100" aria-label="${cn ? '关闭' : '닫기'}">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <form id="upload-material-form" class="space-y-5 px-6 py-5">
          <label class="block">
            <span class="mb-2 block text-sm font-medium text-[#1d2129]">${cn ? '标题' : '제목'} <span class="text-red-500">*</span></span>
            <input id="upload-material-title" type="text" maxlength="100" required
              class="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand"
              placeholder="${cn ? '请输入标题' : '제목을 입력하세요'}">
          </label>
          <label class="block">
            <span class="mb-2 block text-sm font-medium text-[#1d2129]">${cn ? '内容' : '내용'}</span>
            <textarea id="upload-material-content" rows="4" maxlength="500"
              class="w-full resize-none rounded-md border border-gray-200 px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand"
              placeholder="${cn ? '请输入内容' : '내용을 입력하세요'}"></textarea>
          </label>
          <label class="block">
            <span class="mb-2 block text-sm font-medium text-[#1d2129]">${cn ? '年月' : '연월'} <span class="text-red-500">*</span></span>
            <input id="upload-material-period" type="hidden" value="${defaultPeriod}" required>
            <div class="flex items-center gap-3">
              <div class="relative w-28">
                <select id="upload-material-year" class="w-full appearance-none rounded-xl border border-blue-100 bg-white px-4 py-3 pr-9 text-sm font-semibold text-[#1d2129] shadow-sm outline-none transition-colors focus:border-brand">
                  ${yearOptions}
                </select>
                <i class="fa-solid fa-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#86909c]"></i>
              </div>
              <div class="relative w-28">
                <select id="upload-material-month" class="w-full appearance-none rounded-xl border border-blue-100 bg-white px-4 py-3 pr-9 text-sm font-semibold text-[#1d2129] shadow-sm outline-none transition-colors focus:border-brand">
                  ${monthOptions}
                </select>
                <i class="fa-solid fa-chevron-down pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#86909c]"></i>
              </div>
            </div>
          </label>
          <div>
            <span class="mb-2 block text-sm font-medium text-[#1d2129]">${cn ? '本地文件' : '로컬 파일'} <span class="text-red-500">*</span></span>
            <input id="upload-material-files" type="file" multiple class="hidden" accept=".xlsx,.xls,.csv,.zip">
            <button type="button" id="upload-file-picker"
              class="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-blue-300 bg-blue-50/50 px-4 py-5 text-sm font-medium text-brand hover:bg-blue-50">
              <i class="fa-solid fa-cloud-arrow-up"></i>
              <span>${cn ? '选择本地文件' : '로컬 파일 선택'}</span>
            </button>
            <p class="mt-2 flex items-center gap-1.5 text-xs text-[#86909c]">
              <i class="fa-solid fa-circle-info text-[11px]"></i>
              <span>${cn ? '支持 .zip、.xls、.xlsx、.csv 文件上传' : '.zip, .xls, .xlsx, .csv 파일 업로드 지원'}</span>
            </p>
            <div id="upload-file-list" class="mt-3 hidden space-y-2"></div>
            <p id="upload-file-error" class="mt-2 hidden text-xs text-red-500">${cn ? '请至少选择一个文件' : '파일을 하나 이상 선택하세요'}</p>
          </div>
        </form>
        <div class="flex justify-end gap-2 border-t border-gray-100 bg-gray-50/60 px-6 py-4">
          <button type="button" class="upload-modal-close rounded-md border border-gray-200 bg-white px-4 py-2 text-sm text-[#4e5969] hover:bg-gray-50">${cn ? '取消' : '취소'}</button>
          <button type="submit" form="upload-material-form" class="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <i class="fa-solid fa-upload mr-1"></i>${cn ? '确认上传' : '업로드'}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    const fileInput = overlay.querySelector('#upload-material-files');
    const fileList = overlay.querySelector('#upload-file-list');
    const fileError = overlay.querySelector('#upload-file-error');
    const periodInput = overlay.querySelector('#upload-material-period');
    const yearSelect = overlay.querySelector('#upload-material-year');
    const monthSelect = overlay.querySelector('#upload-material-month');
    let selectedFiles = [];
    const syncPeriod = () => {
      periodInput.value = `${yearSelect.value}-${monthSelect.value}`;
    };

    const close = () => overlay.remove();
    const renderFiles = () => {
      fileList.classList.toggle('hidden', selectedFiles.length === 0);
      fileList.innerHTML = selectedFiles.map((file, index) => `
        <div class="flex items-center gap-3 rounded-md border border-gray-100 bg-gray-50 px-3 py-2">
          <i class="fa-regular fa-file-excel text-emerald-600"></i>
          <span class="min-w-0 flex-1 truncate text-sm text-[#4e5969]" title="${this.escapeHtml(file.name)}">${this.escapeHtml(file.name)}</span>
          <span class="text-xs text-[#86909c]">${(file.size / 1024).toFixed(1)} KB</span>
          <button type="button" class="upload-file-remove flex h-7 w-7 items-center justify-center rounded text-[#86909c] hover:bg-red-50 hover:text-red-500" data-index="${index}" title="${cn ? '移除' : '삭제'}">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      `).join('');
      fileList.querySelectorAll('.upload-file-remove').forEach(button => {
        button.addEventListener('click', () => {
          selectedFiles.splice(Number(button.dataset.index), 1);
          renderFiles();
        });
      });
    };

    overlay.querySelectorAll('.upload-modal-close').forEach(button => button.addEventListener('click', close));
    overlay.addEventListener('click', event => {
      if (event.target === overlay) close();
    });
    overlay.querySelector('#upload-file-picker').addEventListener('click', () => fileInput.click());
    yearSelect.addEventListener('change', syncPeriod);
    monthSelect.addEventListener('change', syncPeriod);
    fileInput.addEventListener('change', () => {
      selectedFiles = Array.from(fileInput.files || []);
      fileError.classList.add('hidden');
      renderFiles();
    });
    overlay.querySelector('#upload-material-title').focus();

    overlay.querySelector('#upload-material-form').addEventListener('submit', event => {
      event.preventDefault();
      const titleInput = overlay.querySelector('#upload-material-title');
      const title = titleInput.value.trim();
      const content = overlay.querySelector('#upload-material-content').value.trim();
      const period = overlay.querySelector('#upload-material-period').value;
      if (!title) {
        titleInput.focus();
        return;
      }
      if (selectedFiles.length === 0) {
        fileError.classList.remove('hidden');
        return;
      }

      this.startUploadAutoCheck({
        title,
        content,
        period,
        files: selectedFiles.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type
        }))
      });
      close();
      Dialog.toast(cn ? '文件已上传，正在自动校验' : '파일 업로드 후 자동 검사 중입니다', 'success');
    });
  },

  getRejectedUploadDocuments() {
    return this.getInboxData()
      .map(item => ({
        ...item,
        rejectedAttachments: (item.attachments || [])
          .map((attachment, index) => ({ attachment, index }))
          .filter(entry => entry.attachment.status === '驳回' && !entry.attachment.isHistorical)
      }))
      .filter(item => item.rejectedAttachments.length > 0);
  },

  showEnhancedUploadModal(options = {}) {
    const cn = this.getCurrentLang() === 'cn';
    const rejectedDocuments = this.getRejectedUploadDocuments();
    const initialMode = options.mode === 'retry' ? 'retry' : 'new';
    const initialDocument = options.emailId
      ? rejectedDocuments.find(item => String(item.id) === String(options.emailId))
      : null;
    const currentDate = new Date();
    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const defaultPeriod = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, '0')}`;
    const yearOptions = [2024, 2025, 2026].map(year => `<option value="${year}" ${year === previousMonth.getFullYear() ? 'selected' : ''}>${year} 年</option>`).join('');
    const monthOptions = Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      return `<option value="${String(month).padStart(2, '0')}" ${month === previousMonth.getMonth() + 1 ? 'selected' : ''}>${month} 月</option>`;
    }).join('');

    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/35 p-4';
    overlay.innerHTML = `
      <div class="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl" role="dialog" aria-modal="true">
        <div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 class="text-base font-bold text-[#1d2129]">${cn ? '上传文件' : '파일 업로드'}</h3>
            <p id="enhanced-upload-subtitle" class="mt-1 text-xs text-[#86909c]"></p>
          </div>
          <button type="button" class="enhanced-upload-close flex h-8 w-8 items-center justify-center rounded-md text-[#86909c] hover:bg-gray-100"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <form id="enhanced-upload-form" class="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div>
            <div class="mb-2 text-sm font-medium text-[#1d2129]">${cn ? '上传方式' : '업로드 방식'}</div>
            <div class="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-1.5">
              <button type="button" class="upload-mode-btn rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors" data-mode="new">${cn ? '新建上传' : '새 업로드'}</button>
              <button type="button" class="upload-mode-btn rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors" data-mode="retry">${cn ? '驳回重传' : '반려 재업로드'}</button>
            </div>
          </div>

          <section id="upload-new-section" class="space-y-5">
            <label class="block">
              <span class="mb-2 block text-sm font-medium text-[#1d2129]">${cn ? '标题' : '제목'} <span class="text-red-500">*</span></span>
              <input id="enhanced-upload-title" type="text" maxlength="100" class="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand" placeholder="${cn ? '请输入标题' : '제목을 입력하세요'}">
            </label>
            <label class="block">
              <span class="mb-2 block text-sm font-medium text-[#1d2129]">${cn ? '内容' : '내용'}</span>
              <textarea id="enhanced-upload-content" rows="3" maxlength="500" class="w-full resize-none rounded-md border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand" placeholder="${cn ? '请输入内容' : '내용을 입력하세요'}"></textarea>
            </label>
            <div>
              <span class="mb-2 block text-sm font-medium text-[#1d2129]">${cn ? '年月' : '연월'} <span class="text-red-500">*</span></span>
              <input id="enhanced-upload-period" type="hidden" value="${defaultPeriod}">
              <div class="flex gap-3">
                <select id="enhanced-upload-year" class="w-32 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand">${yearOptions}</select>
                <select id="enhanced-upload-month" class="w-28 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand">${monthOptions}</select>
              </div>
            </div>
          </section>

          <section id="upload-retry-section" class="hidden space-y-4">
            <div>
              <label class="mb-2 block text-sm font-medium text-[#1d2129]">${cn ? '历史驳回单据' : '이전 반려 문서'} <span class="text-red-500">*</span></label>
              <div class="relative">
                <div class="flex items-center rounded-lg border border-gray-200 bg-white px-3 focus-within:border-brand">
                  <i class="fa-solid fa-magnifying-glass text-xs text-[#86909c]"></i>
                  <input id="retry-document-search" type="text" autocomplete="off" class="min-w-0 flex-1 px-3 py-2.5 text-sm outline-none" placeholder="${cn ? '搜索单据编号、标题、文件名、年月或上传人' : '문서번호, 제목, 파일명 검색'}">
                  <i class="fa-solid fa-chevron-down text-xs text-[#86909c]"></i>
                </div>
                <div id="retry-document-dropdown" class="absolute z-20 mt-1 hidden max-h-64 w-full overflow-auto rounded-lg border border-gray-200 bg-white p-1 shadow-xl"></div>
              </div>
              <p id="retry-document-error" class="mt-2 hidden text-xs text-red-500">${cn ? '请选择历史驳回单据' : '이전 반려 문서를 선택하세요'}</p>
            </div>
            <div id="retry-document-summary" class="hidden rounded-xl border border-blue-100 bg-blue-50/50 p-4"></div>
          </section>

          <div>
            <span id="enhanced-file-label" class="mb-2 block text-sm font-medium text-[#1d2129]"></span>
            <input id="enhanced-upload-files" type="file" multiple class="hidden" accept=".xlsx,.xls,.csv,.zip">
            <button type="button" id="enhanced-file-picker" class="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-blue-300 bg-blue-50/50 px-4 py-5 text-sm font-medium text-brand hover:bg-blue-50">
              <i class="fa-solid fa-cloud-arrow-up"></i><span>${cn ? '选择本地文件' : '로컬 파일 선택'}</span>
            </button>
            <p id="enhanced-file-help" class="mt-2 text-xs text-[#86909c]"></p>
            <div id="enhanced-file-list" class="mt-3 hidden space-y-2"></div>
            <p id="enhanced-file-error" class="mt-2 hidden text-xs text-red-500">${cn ? '请至少选择一个文件' : '파일을 하나 이상 선택하세요'}</p>
          </div>
        </form>
        <div class="flex justify-end gap-2 border-t border-gray-100 bg-gray-50/60 px-6 py-4">
          <button type="button" class="enhanced-upload-close rounded-md border border-gray-200 bg-white px-4 py-2 text-sm text-[#4e5969] hover:bg-gray-50">${cn ? '取消' : '취소'}</button>
          <button type="submit" form="enhanced-upload-form" class="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"><i class="fa-solid fa-upload mr-1"></i><span id="enhanced-submit-label"></span></button>
        </div>
      </div>`;

    document.body.appendChild(overlay);
    let mode = initialMode;
    let selectedDocument = initialDocument || null;
    let selectedFiles = [];
    const fileInput = overlay.querySelector('#enhanced-upload-files');
    const fileList = overlay.querySelector('#enhanced-file-list');
    const searchInput = overlay.querySelector('#retry-document-search');
    const dropdown = overlay.querySelector('#retry-document-dropdown');

    let handleOutsideClick = null;
    const close = () => {
      if (handleOutsideClick) document.removeEventListener('click', handleOutsideClick);
      overlay.remove();
    };
    const documentSearchText = item => [item.id, item.emailSubject, item.emailBody, item.month, item.provider, ...(item.attachments || []).map(att => att.name)].join(' ').toLowerCase();
    const renderDocumentOptions = (keyword = '') => {
      const normalized = keyword.trim().toLowerCase();
      const rows = rejectedDocuments.filter(item => !normalized || documentSearchText(item).includes(normalized));
      dropdown.innerHTML = rows.length ? rows.map(item => `
        <button type="button" class="retry-document-option w-full rounded-md px-3 py-2.5 text-left hover:bg-blue-50" data-document-id="${this.escapeHtml(item.id)}">
          <div class="flex items-center justify-between gap-3"><span class="truncate text-sm font-semibold text-[#1d2129]">${this.escapeHtml(item.emailSubject)}</span><span class="shrink-0 text-xs text-brand">${item.rejectedAttachments.length} 个驳回附件</span></div>
          <div class="mt-1 truncate text-xs text-[#86909c]">${this.escapeHtml(item.id)} · ${this.escapeHtml(item.month || '-')} · ${this.escapeHtml(item.provider || '-')}</div>
        </button>`).join('') : `<div class="px-3 py-8 text-center text-sm text-[#86909c]">${cn ? '未找到符合条件的驳回单据' : '조건에 맞는 문서가 없습니다'}</div>`;
      dropdown.classList.remove('hidden');
    };
    const renderSelectedDocument = () => {
      const summary = overlay.querySelector('#retry-document-summary');
      if (!selectedDocument) {
        summary.classList.add('hidden');
        return;
      }
      searchInput.value = `${selectedDocument.emailSubject}（${selectedDocument.id}）`;
      const rejectedRows = selectedDocument.rejectedAttachments.map(entry => `
        <div class="flex items-start gap-2 rounded-lg border border-red-100 bg-white px-3 py-2">
          <i class="fa-regular fa-file-excel mt-0.5 text-emerald-600"></i>
          <div class="min-w-0 flex-1"><div class="truncate text-xs font-medium text-[#1d2129]">${this.escapeHtml(entry.attachment.name)}</div><div class="mt-0.5 truncate text-[11px] text-red-500">${this.escapeHtml(entry.attachment.rejectReason || '文件校验未通过')}</div></div>
        </div>`).join('');
      summary.innerHTML = `<div class="grid grid-cols-2 gap-x-5 gap-y-2 text-xs"><div class="col-span-2"><span class="text-[#86909c]">年月：</span>${this.escapeHtml(selectedDocument.month || '2026年06月')}</div><div class="col-span-2"><span class="text-[#86909c]">标题：</span>${this.escapeHtml(selectedDocument.emailSubject)}</div><div class="col-span-2"><span class="text-[#86909c]">内容：</span>${this.escapeHtml(selectedDocument.emailBody || '-')}</div></div><div class="mt-3 border-t border-blue-100 pt-3"><div class="mb-2 flex items-center justify-between text-xs"><span class="font-medium text-[#4e5969]">驳回单据列表</span><span class="text-red-500">${selectedDocument.rejectedAttachments.length} 个</span></div><div class="space-y-2">${rejectedRows}</div></div>`;
      summary.classList.remove('hidden');
    };
    const renderFiles = () => {
      fileList.classList.toggle('hidden', selectedFiles.length === 0);
      const currentFiles = (selectedDocument?.attachments || []).filter(attachment => !attachment.isHistorical);
      fileList.innerHTML = selectedFiles.map((file, index) => {
        const sameNameFile = mode === 'retry'
          ? currentFiles.find(attachment => this.normalizeRetryFileName(attachment.name) === this.normalizeRetryFileName(file.name))
          : null;
        const compareResult = mode !== 'retry'
          ? ''
          : sameNameFile
            ? `<div class="mt-1 text-[11px] font-medium text-blue-600">找到同名文件 V${sameNameFile.version || 1}，将创建 V${Number(sameNameFile.version || 1) + 1}，原文件转为历史版本</div>`
            : '<div class="mt-1 text-[11px] font-medium text-emerald-600">父级内无同名文件，将作为新增附件 V1</div>';
        return `<div class="flex items-start gap-3 rounded-md border border-gray-100 bg-gray-50 px-3 py-2"><i class="fa-regular fa-file-excel mt-0.5 text-emerald-600"></i><span class="min-w-0 flex-1"><span class="block truncate text-sm text-[#4e5969]">${this.escapeHtml(file.name)}</span>${compareResult}</span><span class="shrink-0 text-xs text-[#86909c]">${(file.size / 1024).toFixed(1)} KB</span><button type="button" class="enhanced-file-remove shrink-0 text-slate-400 hover:text-red-500" data-index="${index}"><i class="fa-solid fa-xmark"></i></button></div>`;
      }).join('');
      fileList.querySelectorAll('.enhanced-file-remove').forEach(btn => btn.addEventListener('click', () => { selectedFiles.splice(Number(btn.dataset.index), 1); renderFiles(); }));
    };
    const renderMode = () => {
      overlay.querySelector('#upload-new-section').classList.toggle('hidden', mode !== 'new');
      overlay.querySelector('#upload-retry-section').classList.toggle('hidden', mode !== 'retry');
      overlay.querySelectorAll('.upload-mode-btn').forEach(btn => {
        const active = btn.dataset.mode === mode;
        btn.className = `upload-mode-btn rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${active ? 'bg-white text-brand shadow-sm' : 'text-[#86909c] hover:text-[#1d2129]'}`;
      });
      overlay.querySelector('#enhanced-upload-subtitle').textContent = mode === 'new' ? '创建新的上传单据并进行文件校验' : '上传完整Excel新版本，保留历史原文件与已流转日志';
      overlay.querySelector('#enhanced-file-label').innerHTML = `本地文件 <span class="text-red-500">*</span>`;
      overlay.querySelector('#enhanced-file-help').textContent = '支持 .zip、.xls、.xlsx、.csv 文件上传';
      overlay.querySelector('#enhanced-submit-label').textContent = mode === 'new' ? '确认上传' : '上传新版本';
      fileInput.multiple = true;
      renderSelectedDocument();
      renderFiles();
    };

    overlay.querySelectorAll('.enhanced-upload-close').forEach(btn => btn.addEventListener('click', close));
    overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
    overlay.querySelectorAll('.upload-mode-btn').forEach(btn => btn.addEventListener('click', () => { mode = btn.dataset.mode; selectedFiles = []; fileInput.value = ''; renderMode(); if (mode === 'retry' && !selectedDocument) renderDocumentOptions(''); }));
    overlay.querySelector('#enhanced-file-picker').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => { selectedFiles = Array.from(fileInput.files || []); overlay.querySelector('#enhanced-file-error').classList.add('hidden'); renderFiles(); });
    const syncPeriod = () => { overlay.querySelector('#enhanced-upload-period').value = `${overlay.querySelector('#enhanced-upload-year').value}-${overlay.querySelector('#enhanced-upload-month').value}`; };
    overlay.querySelector('#enhanced-upload-year').addEventListener('change', syncPeriod);
    overlay.querySelector('#enhanced-upload-month').addEventListener('change', syncPeriod);
    searchInput.addEventListener('focus', () => renderDocumentOptions(selectedDocument ? '' : searchInput.value));
    searchInput.addEventListener('input', () => { selectedDocument = null; renderSelectedDocument(); renderDocumentOptions(searchInput.value); });
    dropdown.addEventListener('click', event => {
      const option = event.target.closest('.retry-document-option');
      if (!option) return;
      selectedDocument = rejectedDocuments.find(item => String(item.id) === String(option.dataset.documentId)) || null;
      dropdown.classList.add('hidden');
      overlay.querySelector('#retry-document-error').classList.add('hidden');
      renderSelectedDocument();
      renderFiles();
    });
    handleOutsideClick = event => {
      if (!event.target.closest('#retry-document-search') && !event.target.closest('#retry-document-dropdown')) dropdown.classList.add('hidden');
    };
    document.addEventListener('click', handleOutsideClick);

    overlay.querySelector('#enhanced-upload-form').addEventListener('submit', event => {
      event.preventDefault();
      if (selectedFiles.length === 0) { overlay.querySelector('#enhanced-file-error').classList.remove('hidden'); return; }
      const files = selectedFiles.map(file => ({ name: file.name, size: file.size, type: file.type }));
      if (mode === 'retry') {
        if (!selectedDocument) { overlay.querySelector('#retry-document-error').classList.remove('hidden'); searchInput.focus(); return; }
        const duplicateUploadNames = files
          .map(file => this.normalizeRetryFileName(file.name))
          .filter((name, index, names) => names.indexOf(name) !== index);
        if (duplicateUploadNames.length) {
          const fileError = overlay.querySelector('#enhanced-file-error');
          fileError.textContent = '本次选择中存在重复文件名，请移除重复文件后再上传';
          fileError.classList.remove('hidden');
          return;
        }
        this.startRejectedBatchRetry({ documentId: selectedDocument.id, files });
        close();
        return;
      }
      const titleInput = overlay.querySelector('#enhanced-upload-title');
      const title = titleInput.value.trim();
      if (!title) { titleInput.focus(); return; }
      this.startUploadAutoCheck({ title, content: overlay.querySelector('#enhanced-upload-content').value.trim(), period: overlay.querySelector('#enhanced-upload-period').value, files });
      close();
      Dialog.toast(cn ? '文件已上传，正在自动校验' : '파일 업로드 후 자동 검사 중입니다', 'success');
    });

    renderMode();
    if (initialMode === 'retry' && initialDocument) renderSelectedDocument();
  },

  normalizeRetryFileName(name = '') {
    return String(name || '').trim().toLowerCase();
  },

  buildRetrySplitStores(sourceAttachment = {}, file = {}) {
    sourceAttachment = sourceAttachment || {};
    const sourceStores = Array.isArray(sourceAttachment.splitStores) ? sourceAttachment.splitStores : [];
    if (!sourceAttachment.isMultiStore && !/多门店|multi/i.test(file.name || '')) return [];

    if (sourceStores.length) {
      return sourceStores.map((store, index) => {
        const wasInvalid = store.status === '驳回' || !store.storeName;
        if (wasInvalid) {
          return {
            ...store,
            storeName: store.storeName || `修正识别门店${index + 1}`,
            fileName: store.fileName || `修正识别门店${index + 1}-销售明细.xlsx`,
            status: '已匹配',
            reason: 'V2已补充门店名称/门店编码，匹配主数据成功'
          };
        }
        return {
          ...store,
          status: '重复',
          reason: '该年月、经销商和门店数据已由历史版本流转'
        };
      });
    }

    const baseName = String(file.name || '多门店数据').replace(/\.(xlsx|xls|csv|zip)$/i, '');
    return [
      { storeName: `${baseName}-门店A`, status: '重复', reason: '历史版本已流转' },
      { storeName: `${baseName}-门店B`, status: '重复', reason: '历史版本已流转' },
      { storeName: `${baseName}-新增门店`, status: '已匹配', reason: '本次首次识别成功' }
    ];
  },

  startRejectedBatchRetry(payload = {}) {
    const cn = this.getCurrentLang() === 'cn';
    const inboxItem = this.getInboxData().find(item => String(item.id) === String(payload.documentId));
    const files = Array.isArray(payload.files) ? payload.files : [];
    const currentAttachments = (inboxItem?.attachments || []).filter(attachment => !attachment.isHistorical);
    if (!inboxItem || !files.length || !currentAttachments.length) return;

    const nowText = this.formatNowDateTime(new Date());
    const remainingSources = [...currentAttachments];
    const retryBatchId = `${inboxItem.id}-RETRY-${Date.now()}`;
    const correctionAttachments = files.map((file, fileIndex) => {
      const normalizedFileName = this.normalizeRetryFileName(file.name);
      const sourceIndex = remainingSources.findIndex(source => this.normalizeRetryFileName(source.name) === normalizedFileName);
      const sourceAttachment = sourceIndex >= 0 ? remainingSources.splice(sourceIndex, 1)[0] : null;
      const previousVersion = sourceAttachment ? Number(sourceAttachment.version || 1) : 0;
      const nextVersion = sourceAttachment ? previousVersion + 1 : 1;
      const sourceGroupId = sourceAttachment?.sourceGroupId || `${inboxItem.id}-SOURCE-NEW-${Date.now()}-${fileIndex + 1}`;

      if (sourceAttachment) {
        sourceAttachment.sourceGroupId = sourceGroupId;
        sourceAttachment.version = previousVersion;
        sourceAttachment.previousStatus = sourceAttachment.status;
        sourceAttachment.status = '历史版本';
        sourceAttachment.isHistorical = true;
        sourceAttachment.isCurrentVersion = false;
        sourceAttachment.historicalAt = nowText;
        sourceAttachment.historicalReason = `V${previousVersion} 已由 V${nextVersion} 完整Excel接替，原文件及流转日志保留`;
      }

      return {
        name: file.name,
        status: '校验中',
        rejectReason: `V${nextVersion} 完整Excel正在进行可读性校验`,
        sourceMethod: '驳回重传',
        sourceGroupId,
        sourceVersionId: `${sourceGroupId}-V${nextVersion}`,
        version: nextVersion,
        previousVersion,
        isCurrentVersion: true,
        retryBatchId,
        uploadedAt: nowText,
        retrySourceAttachment: sourceAttachment,
        isMultiStore: Boolean(sourceAttachment?.isMultiStore || /多门店|multi/i.test(file.name || '')),
        originalFileName: sourceAttachment?.name || file.name,
        uploadFileIndex: fileIndex,
        isNewAttachment: !sourceAttachment,
        versionMatchType: sourceAttachment ? 'same-name' : 'new-file'
      };
    });
    inboxItem.attachments.push(...correctionAttachments);
    inboxItem.attachmentCount = inboxItem.attachments.filter(item => !item.isHistorical).length;
    inboxItem.currentVersion = Math.max(...correctionAttachments.map(item => item.version), Number(inboxItem.currentVersion || 1));
    inboxItem.retryBatches = Array.isArray(inboxItem.retryBatches) ? inboxItem.retryBatches : [];
    inboxItem.retryBatches.push({
      id: retryBatchId,
      version: inboxItem.currentVersion,
      previousVersion: Math.max(1, inboxItem.currentVersion - 1),
      uploadedAt: nowText,
      fileCount: files.length,
      historicalRejectedCount: correctionAttachments.filter(item => !item.isNewAttachment).length,
      newAttachmentCount: correctionAttachments.filter(item => item.isNewAttachment).length,
      status: '校验中'
    });
    this.recalcInboxItemStatus(inboxItem);
    this.uploadCheckState = { active: true, count: files.length };
    this.renderUploadCheckStatus();
    this.renderInbox();
    Dialog.toast(cn ? `已绑定历史单据 ${inboxItem.id}，${files.length} 个修正文件正在重新校验` : '이전 문서에 연결하여 일괄 재검사합니다', 'success');
    setTimeout(() => {
      correctionAttachments.forEach((attachment, index) => {
        const checkResult = this.getUploadAttachmentCheckResult(files[index]);
        Object.assign(attachment, checkResult);
        if (checkResult.status !== '正常') return;

        const splitStores = this.buildRetrySplitStores(attachment.retrySourceAttachment, files[index]);
        attachment.splitStores = splitStores;
        attachment.isMultiStore = splitStores.length > 1 || attachment.isMultiStore;
        attachment.retrySourceAttachment = undefined;
        const duplicateCount = splitStores.filter(store => store.status === '重复').length;
        const matchedCount = splitStores.filter(store => store.status === '已匹配').length;
        if (duplicateCount > 0) {
          attachment.status = '待处理';
          attachment.rejectReason = `V${attachment.version} 已拆分 ${splitStores.length} 个门店，${matchedCount} 个新增已匹配，${duplicateCount} 个与历史流转数据重复，请覆盖或忽略`;
          attachment.pendingDuplicateCount = duplicateCount;
        } else {
          attachment.status = '正常';
          attachment.rejectReason = `V${attachment.version} 完整Excel校验通过，门店拆分与匹配完成`;
        }
      });
      const batch = inboxItem.retryBatches.find(item => item.id === retryBatchId);
      if (batch) {
        batch.status = correctionAttachments.some(item => item.status === '驳回')
          ? '驳回'
          : correctionAttachments.some(item => item.status === '待处理')
            ? '待处理'
            : '正常';
        batch.completedAt = this.formatNowDateTime(new Date());
      }
      this.recalcInboxItemStatus(inboxItem);
      this.uploadCheckState = { active: false, count: 0 };
      this.renderInbox();
      Dialog.toast(cn ? '批量修正文件重新校验完成' : '일괄 수정 파일 재검사가 완료되었습니다', 'success');
    }, this.checkingMinDurationMs);
  },

  getUploadAttachmentCheckResult(file = {}) {
    const name = file.name || '';
    const lowerName = name.toLowerCase();
    const supported = /\.(xlsx|xls|csv|zip)$/i.test(name);

    if (!supported) {
      return {
        status: '驳回',
        rejectReason: '文件类型不支持，仅支持 xlsx、xls、csv、zip'
      };
    }

    if (!file.size) {
      return {
        status: '驳回',
        rejectReason: '空表或空文件，无法解析'
      };
    }

    if (/损坏|打不开|corrupt|broken/.test(lowerName)) {
      return {
        status: '驳回',
        rejectReason: '文件损坏，打不开'
      };
    }

    if (/\.zip$/i.test(name)) {
      return {
        status: '待处理',
        rejectReason: 'ZIP文件已识别，待确认压缩包结构'
      };
    }

    if (/重复|duplicate|dup/.test(lowerName)) {
      return {
        status: '待处理',
        rejectReason: '该文件解析后发现原始门店数据列表中有重复'
      };
    }

    return {
      status: '正常',
      rejectReason: '-'
    };
  },

  startUploadAutoCheck(uploadPayload) {
    const files = uploadPayload.files || [];
    const now = new Date();
    const uploadedId = `local-${Date.now()}`;
    const checkingAttachments = files.map(file => ({
      name: file.name,
      status: '校验中',
      rejectReason: '系统正在解析并校验该附件',
      sourceMethod: '本地上传'
    }));
    const uploadedItem = {
      id: uploadedId,
      index: 1,
      emailSubject: uploadPayload.title,
      emailBody: uploadPayload.content || '-',
      month: uploadPayload.period ? `${uploadPayload.period.slice(0, 4)}年${uploadPayload.period.slice(5, 7)}月` : '',
      attachmentCount: files.length,
      isNormal: false,
      statusText: '校验中',
      suggestion: '存在附件正在校验中，请等待校验完成',
      provider: Store?.getState?.()?.user?.name || '当前用户',
      provideTime: this.formatNowDateTime(now),
      attachments: checkingAttachments
    };
    this.inboxDataCache = [uploadedItem, ...this.getInboxData()]
      .map((item, index) => ({ ...item, index: index + 1 }));
    this.uploadCheckState = {
      active: true,
      count: files.length
    };
    this.renderUploadCheckStatus();
    this.renderInbox();

    setTimeout(() => {
      const attachments = files.map(file => ({
        name: file.name,
        ...this.getUploadAttachmentCheckResult(file),
        sourceMethod: '本地上传'
      }));
      const targetItem = this.getInboxData().find(item => item.id === uploadedId) || uploadedItem;
      targetItem.attachments = attachments;
      targetItem.attachmentCount = attachments.length;
      targetItem.isNormal = attachments.every(item => item.status === '正常');
      targetItem.statusText = '正常';
      targetItem.suggestion = '-';
      this.recalcInboxItemStatus(targetItem);
      this.inboxDataCache = this.getInboxData()
        .map(item => item.id === uploadedId ? targetItem : item)
        .map((item, index) => ({ ...item, index: index + 1 }));
      this.uploadCheckState = {
        active: false,
        count: 0
      };
      this.renderInbox();
      Dialog.toast(this.getCurrentLang() === 'cn' ? '上传文件校验完成' : '업로드 파일 검사가 완료되었습니다', 'success');
    }, this.checkingMinDurationMs);
  },

  buildExcelPreviewFiles(fileName) {
    const normalizedName = fileName.replace(/\.zip$/i, '');
    if (/\.zip$/i.test(fileName)) {
      return [
        `${normalizedName}-销售明细.xlsx`,
        `${normalizedName}-门店汇总.xlsx`,
        `${normalizedName}-异常清单.xlsx`
      ];
    }

    if (/\.(xlsx|xls)$/i.test(fileName)) {
      return [fileName];
    }

    return [`${normalizedName}.xlsx`];
  },

  renderExcelPreviewTable(fileName, index = 0) {
    const productNames = [
      '好丽友果滋果心黄金奇异果味软糖70g',
      '好丽友果滋果心-百香果味软糖70g',
      '好丽友高纤坚果棒酸奶味30g',
      '好丽友高蛋白坚果棒太妃味30g',
      '好丽友蛋黄派2枚（23g*12）',
      '好丽友Q立方葡萄/西柚/菠萝木糖醇90g',
      '好丽友Q立方草莓/香瓜/青梅木糖醇90g',
      '好丽友Q蒂榛子蛋糕6枚（28g*6）',
      '好丽友Q蒂榛子蛋糕2枚（28g*12）',
      '好丽友Q蒂巧克力莓果味6枚蛋糕',
      '好丽友Q蒂摩卡蛋糕6枚（28g*6）',
      '好丽友Q蒂摩卡蛋糕2枚（28g*12）',
      '好丽友Q蒂红丝绒派6枚（28g*6）'
    ];
    const getProductName = (offset) => productNames[(index * 5 + offset) % productNames.length];
    const rows = [
      ['2026-01-01', '6901028075763', getProductName(0), 42 + index * 3, '¥3.50', `¥${(147 + index * 10.5).toFixed(2)}`],
      ['2026-01-01', '6902083881085', getProductName(1), 68 + index * 2, '¥2.00', `¥${(136 + index * 4).toFixed(2)}`],
      ['2026-01-02', '6921168509256', getProductName(2), 26 + index, '¥6.90', `¥${(179.4 + index * 6.9).toFixed(2)}`],
      ['2026-01-02', '6934024510888', getProductName(3), 54 + index * 4, '¥3.20', `¥${(172.8 + index * 12.8).toFixed(2)}`],
      ['2026-01-03', '6954767413372', getProductName(4), 37 + index * 2, '¥4.00', `¥${(148 + index * 8).toFixed(2)}`]
    ];

    return `
      <div class="flex items-center justify-between mb-4">
        <div>
          <div class="text-sm font-bold text-[#1d2129]">${this.escapeHtml(fileName)}</div>
          <div class="text-xs text-[#86909c] mt-1">工作表：POS_DATA_${index + 1}，共 5 条预览记录</div>
        </div>
        <button type="button" class="px-3 py-1.5 rounded-lg bg-blue-50 text-brand text-xs font-semibold">
          <i class="fa-solid fa-table mr-1"></i>在线预览
        </button>
      </div>
      <div class="overflow-auto border border-gray-100 rounded-xl">
        <table class="w-full min-w-[720px] text-left text-xs">
          <thead class="bg-[#f7f8fa] text-[#1d2129] font-semibold">
            <tr>
              <th class="px-3 py-3">销售日期</th>
              <th class="px-3 py-3">商品条码</th>
              <th class="px-3 py-3">商品名称</th>
              <th class="px-3 py-3">销量</th>
              <th class="px-3 py-3">单价</th>
              <th class="px-3 py-3">销售额</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-[#4e5969]">
            ${rows.map(row => `
              <tr class="hover:bg-blue-50/40">
                ${row.map(cell => `<td class="px-3 py-3 whitespace-nowrap">${this.escapeHtml(cell)}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  showOriginalExcelPreview(rowEl) {
    const fileName = rowEl?.querySelector('td:nth-child(2) span')?.textContent?.trim() || '门店POS数据.xlsx';
    const files = this.buildExcelPreviewFiles(fileName);
    const overlay = document.getElementById('overlay-container');

    overlay.innerHTML = `
      <div class="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[82vh] overflow-hidden flex flex-col">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
            <div>
              <h3 class="font-bold text-[#1d2129]">附件预览</h3>
              <p class="text-xs text-[#86909c] mt-1">${this.escapeHtml(fileName)}</p>
            </div>
            <button type="button" id="original-preview-close" class="w-8 h-8 rounded-lg text-[#86909c] hover:bg-gray-100 hover:text-[#1d2129] transition-colors">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="grid grid-cols-[260px_1fr] min-h-0 flex-1">
            <aside class="border-r border-gray-100 bg-[#f7f8fa] p-4 overflow-auto">
              <div class="text-xs font-semibold text-[#86909c] mb-3">Excel 列表</div>
              <div class="flex flex-col gap-2" id="original-preview-file-list">
                ${files.map((file, index) => `
                  <button type="button" data-index="${index}" class="preview-file-item text-left px-3 py-3 rounded-xl border transition-all ${index === 0 ? 'bg-white border-blue-200 text-brand shadow-sm' : 'bg-transparent border-transparent text-[#4e5969] hover:bg-white'}">
                    <div class="flex items-center gap-2">
                      <i class="fa-solid fa-file-excel text-green-600"></i>
                      <span class="text-xs font-semibold truncate">${this.escapeHtml(file)}</span>
                    </div>
                    <div class="text-[11px] text-[#86909c] mt-1">${index === 0 ? '默认预览' : '可切换预览'}</div>
                  </button>
                `).join('')}
              </div>
            </aside>
            <main class="p-5 overflow-auto">
              <div id="original-preview-content">
                ${this.renderExcelPreviewTable(files[0], 0)}
              </div>
            </main>
          </div>
        </div>
      </div>
    `;

    overlay.querySelector('#original-preview-close')?.addEventListener('click', () => {
      overlay.innerHTML = '';
    });

    overlay.querySelectorAll('.preview-file-item').forEach((button) => {
      button.addEventListener('click', () => {
        const index = Number(button.getAttribute('data-index') || 0);
        overlay.querySelectorAll('.preview-file-item').forEach((item) => {
          item.className = 'preview-file-item text-left px-3 py-3 rounded-xl border transition-all bg-transparent border-transparent text-[#4e5969] hover:bg-white';
        });
        button.className = 'preview-file-item text-left px-3 py-3 rounded-xl border transition-all bg-white border-blue-200 text-brand shadow-sm';
        const content = overlay.querySelector('#original-preview-content');
        if (content) {
          content.innerHTML = this.renderExcelPreviewTable(files[index], index);
        }
      });
    });
  },

  bindOriginalPreviewEvents() {
    document.querySelectorAll('.original-preview-btn').forEach((button) => {
      button.addEventListener('click', (e) => {
        const rowEl = e.currentTarget.closest('tr');
        this.showOriginalExcelPreview(rowEl);
      });
    });
  },

  hydrateOriginalAttachmentAuditColumns() {
    const table = document.querySelector('#original-attachment table');
    if (!table || table.dataset.auditColumnsReady === 'true') return;

    const headerRow = table.querySelector('thead tr');
    const filenameHeader = headerRow?.children?.[1];
    if (!headerRow || !filenameHeader) return;

    const statusHeader = document.createElement('th');
    statusHeader.className = 'px-4 py-3 w-24';
    statusHeader.textContent = '状态';

    const rejectReasonHeader = document.createElement('th');
    rejectReasonHeader.className = 'px-4 py-3 min-w-36';
    rejectReasonHeader.textContent = '异常说明';

    filenameHeader.after(statusHeader, rejectReasonHeader);

    table.querySelectorAll('tbody tr').forEach((row, index) => {
      const fileName = row.querySelector('td:nth-child(2) span')?.textContent?.trim() || '';
      const isZipReject = /\.zip$/i.test(fileName);
      const isOpenReject = [10, 17].includes(index);
      const isRejected = isZipReject || isOpenReject;
      const reason = isZipReject ? '压缩包不能解压' : (isOpenReject ? '文件无法打开' : '-');

      const statusCell = document.createElement('td');
      statusCell.className = 'px-4 py-3';
      statusCell.innerHTML = `
        <span class="px-2.5 py-1 rounded-full text-xs font-semibold border ${isRejected ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}">
          ${isRejected ? '驳回' : '正常'}
        </span>
      `;

      const reasonCell = document.createElement('td');
      reasonCell.className = `px-4 py-3 ${isRejected ? 'text-red-600' : 'text-[#86909c]'}`;
      reasonCell.textContent = reason;

      row.children[1]?.after(statusCell, reasonCell);
    });

    table.dataset.auditColumnsReady = 'true';
  },
  
  syncOrgFilterUI() {
    const label = document.getElementById('team-select-label');
    if (label) {
      label.textContent = this.filters.salesOffice || this.filters.headquarters || '全部本部/营业所';
    }

    document.querySelectorAll('.org-headquarters-option').forEach(option => {
      const active = option.dataset.headquarters === this.filters.headquarters;
      option.classList.toggle('bg-blue-50', active);
      option.classList.toggle('text-brand', active);
      option.classList.toggle('font-medium', active);
      option.classList.toggle('text-[#4e5969]', !active);
    });

    const officeContainer = document.getElementById('sales-office-options');
    if (officeContainer) {
      officeContainer.innerHTML = this.filters.headquarters
        ? this.getSalesOfficeOptions(this.filters.headquarters).map(office => `
          <button type="button" data-sales-office="${this.escapeHtml(office)}"
            class="w-full px-3 py-2 text-left text-sm rounded-md hover:bg-gray-50 ${this.filters.salesOffice === office ? 'bg-blue-50 text-brand font-medium' : 'text-[#4e5969]'}">
            ${this.escapeHtml(office)}
          </button>
        `).join('')
        : '<div class="px-3 py-8 text-center text-xs text-[#86909c]">请先选择本部</div>';
    }
  },
  
  bindBatchEvents() {
    const handleBatchAction = (action) => {
      if (this.activeDataMode === 'stash') {
        if (action !== 'approve') return;
        this.handleStashAiCheck();
        return;
      }

      const selected = Array.from(document.querySelectorAll('.row-cb:checked:not(:disabled)')).map(cb => cb.value);
      if (selected.length === 0) return;

      if (this.activeDataMode === 'files' && action === 'archive') {
        return;
      }

      if (this.activeDataMode === 'archive' && action === 'reject') {
        const cn = this.getCurrentLang() === 'cn';
        Dialog.show({
          title: cn ? '确认批量【移动到收件箱】' : '일괄 확인【받은 편지함으로 이동】',
          content: cn
            ? `当前将对【${selected.length}】条归档数据执行移动到收件箱操作，确认后状态将恢复为正常，是否继续？`
            : `현재 ${selected.length}개 보관 데이터를 받은 편지함으로 이동하고 상태를 정상으로 복원합니다. 계속하시겠습니까?`,
          onConfirm: () => {
            selected.forEach((id) => {
              const rowData = this.data.find(row => row.id === id);
              const inboxItem = this.getInboxData().find(item => item.id === id);
              if (rowData) {
                rowData.status = '正常';
                rowData.handler = 'POS担当';
              }
              if (inboxItem) {
                inboxItem.attachments.forEach((attachment) => {
                  if (attachment.status === '已归档') {
                    attachment.status = '正常';
                    attachment.rejectReason = '-';
                  }
                });
                this.recalcInboxItemStatus(inboxItem);
              }
            });
            this.updateStats();
            this.applyFilters();
            document.getElementById('selectAll').checked = false;
            this.updateBatchButtons();
            Dialog.toast(cn ? `已移动 ${selected.length} 条数据到收件箱` : `${selected.length}개 데이터를 받은 편지함으로 이동했습니다`);
          }
        });
        return;
      }
      
      const actionNames = this.getCurrentLang() === 'cn' 
        ? { archive: '归档', approve: '通过并质量校验', reject: '驳回' }
        : { archive: '보관', approve: '승인', reject: '거부' };
      const statusMap = { archive: '已归档', reject: '已驳回' };
      const batchTitle = this.getCurrentLang() === 'cn' ? '确认批量' : '일괄 확인';
      const batchContent = this.getCurrentLang() === 'cn' ? '当前将对' : '현재';
      const batchMiddle = this.getCurrentLang() === 'cn' ? '】条数据执行' : '】개 데이터에 대해';
      const batchEnd = this.getCurrentLang() === 'cn' ? '操作，确认后不可撤销，是否继续？' : '조작을 실행하시겠습니까? 되돌릴 수 없습니다.';
      const successText = this.getCurrentLang() === 'cn' ? '已成功对' : '성공적으로';
      const successMiddle = this.getCurrentLang() === 'cn' ? '条数据执行' : '개 데이터에 대해';
      const successAction = this.getCurrentLang() === 'cn' ? '操作' : '조작';
      
      Dialog.show({
        title: action === 'approve' ? '确认质量校验' : `${batchTitle}【${actionNames[action]}】`,
        content: action === 'approve'
          ? `
            <div class="space-y-3 text-left">
              <div class="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                <span class="text-sm text-gray-600">本次校验数据</span>
                <span class="text-base font-semibold text-blue-600">${selected.length} 条</span>
              </div>
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div class="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                  <div class="mb-1 text-sm font-medium text-emerald-700">正常数据</div>
                  <div class="text-xs leading-5 text-emerald-700/80">流向“质量检查 - 标准POS表”</div>
                </div>
                <div class="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                  <div class="mb-1 text-sm font-medium text-amber-700">异常数据</div>
                  <div class="text-xs leading-5 text-amber-700/80">流向“质量检查 - 异常数据”</div>
                </div>
              </div>
              <div class="rounded-lg bg-gray-50 px-4 py-3 text-xs leading-5 text-gray-500">
                校验提交后将在后台执行，可通过数据状态查看处理进度。
              </div>
            </div>
          `
          : `${batchContent}【${selected.length}${batchMiddle}${actionNames[action]}${batchEnd}`,
        ...(action === 'approve' ? { confirmText: '继续校验', cancelText: '取消' } : {}),
        onConfirm: async () => {
          // 显示loading
          this.showLoading();
          
          // 模拟接口调用
          await new Promise(resolve => setTimeout(resolve, 800));

          if (action === 'approve' && this.activeDataMode === 'files') {
            this.startOriginalQualityCheck(selected);
          } else {
            // 更新数据状态
            this.data = this.data.map(row => {
              if (selected.includes(row.id)) {
                row.status = statusMap[action];
                row.handler = row.team;
              }
              return row;
            });
          }
          
          // 更新统计
          this.updateStats();
          
          // 重新筛选和渲染
          this.hideLoading();
          this.applyFilters();
          
          // 清空选择
          document.getElementById('selectAll').checked = false;
          this.updateBatchButtons();
          
          Dialog.toast(action === 'approve'
            ? `已将 ${selected.length} 条数据送入质量校验`
            : `${successText}${selected.length}${successMiddle}${actionNames[action]}${successAction}`);
        }
      });
    };
    
    document.getElementById('btn-batch-archive')?.addEventListener('click', () => handleBatchAction('archive'));
    document.getElementById('btn-batch-approve')?.addEventListener('click', () => handleBatchAction('approve'));
    document.getElementById('btn-batch-reject')?.addEventListener('click', () => handleBatchAction('reject'));
  },
  
  bindPaginationEvents() {
    document.getElementById('btn-prev-page')?.addEventListener('click', () => {
      if (this.pagination.page > 1) {
        this.pagination.page--;
        this.saveFiltersToCache();
        this.renderTable();
      }
    });
    
    document.getElementById('btn-next-page')?.addEventListener('click', () => {
      const totalPages = Math.ceil(this.pagination.total / this.pagination.pageSize);
      if (this.pagination.page < totalPages) {
        this.pagination.page++;
        this.saveFiltersToCache();
        this.renderTable();
      }
    });
    
    document.getElementById('page-numbers')?.addEventListener('click', (e) => {
      if (e.target.classList.contains('page-btn')) {
        const page = parseInt(e.target.textContent);
        if (page !== this.pagination.page) {
          this.pagination.page = page;
          this.saveFiltersToCache();
          this.renderTable();
        }
      }
    });
  },
  
  updateStats() {
    const total = this.data.length;
    const pending = this.data.filter(r => r.status.includes('待处理')).length;
    const completed = this.data.filter(r => r.status.includes('已通过') || r.status.includes('已同步')).length;
    const rate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;
    
    const elTotal = document.getElementById('stat-total');
    const elPending = document.getElementById('stat-pending');
    const elRate = document.getElementById('stat-rate');
    if (elTotal) elTotal.textContent = total;
    if (elPending) elPending.textContent = pending;
    if (elRate) elRate.textContent = rate + '%';
    
    this.stats = { total, pending, daily: this.stats.daily, rate: parseFloat(rate) };
  },
  
  bindTabEvents() {
    const tabOriginal = document.getElementById('tab-original');
    const tabFiles = document.getElementById('tab-files');
    const tabStash = document.getElementById('tab-stash');
    const activeClass = 'px-4 py-2 text-sm font-medium text-brand bg-blue-50 rounded-lg transition-all border border-blue-200';
    const inactiveClass = 'px-4 py-2 text-sm text-[#86909c] hover:text-[#1d2129] hover:bg-gray-50 rounded-lg transition-all border border-transparent';
    
    const setActiveTab = (activeTab) => {
      if (tabOriginal) tabOriginal.className = activeTab === 'original' ? activeClass : inactiveClass;
      if (tabFiles) tabFiles.className = activeTab === 'files' ? activeClass : inactiveClass;
      if (tabStash) tabStash.className = activeTab === 'stash' ? activeClass : inactiveClass;
      
      const showOriginal = activeTab === 'original';
      const showStash = activeTab === 'stash';
      const showTable = !showOriginal && !showStash;
      document.getElementById('original-attachment')?.classList.toggle('hidden', !showOriginal);
      document.getElementById('table-container')?.classList.toggle('hidden', !showTable);
      document.getElementById('ingestion-stash-container')?.classList.toggle('hidden', !showStash);
      document.getElementById('pagination-area')?.classList.toggle('hidden', showOriginal);
      document.getElementById('btn-upload-file')?.classList.toggle('hidden', !showOriginal);
      document.getElementById('btn-batch-archive')?.classList.toggle('hidden', showOriginal || showStash || activeTab === 'archive' || activeTab === 'files');
      document.getElementById('btn-batch-approve')?.classList.toggle('hidden', showOriginal || activeTab === 'archive');
      document.getElementById('btn-batch-reject')?.classList.toggle('hidden', showOriginal || showStash || activeTab === 'files');
      document.getElementById('team-select-wrapper')?.classList.toggle('hidden', showOriginal || showStash);
      document.getElementById('approval-status-wrapper')?.classList.toggle('hidden', showOriginal || showStash);
      document.getElementById('inbox-status-wrapper')?.classList.toggle('hidden', !showOriginal);
      document.getElementById('quality-checking-hint')?.classList.toggle('hidden', showOriginal || showStash);
      document.getElementById('upload-checking-hint')?.classList.toggle('hidden', !showOriginal || !this.uploadCheckState.active);
      document.getElementById('stash-checking-hint')?.classList.toggle('hidden', !showStash || !this.stashCheckState.active);
      const approveBtn = document.getElementById('btn-batch-approve');
      if (approveBtn) {
        approveBtn.innerHTML = showStash
          ? '<i class="fa-solid fa-wand-magic-sparkles mr-1"></i>门店名称/编码校验'
          : `<i class="fa-solid fa-check mr-1"></i>${this.getCurrentLang() === 'cn' ? '质检' : '검사'}`;
      }
      const rejectBtn = document.getElementById('btn-batch-reject');
      if (rejectBtn) {
        rejectBtn.innerHTML = activeTab === 'archive'
          ? `<i class="fa-solid fa-inbox mr-1"></i>${this.getCurrentLang() === 'cn' ? '移动到收件箱' : '받은 편지함으로 이동'}`
          : `<i class="fa-solid fa-xmark mr-1"></i>${this.getCurrentLang() === 'cn' ? '驳回' : '거부'}`;
      }
      
      if (showOriginal) {
        this.activeDataMode = 'files';
        this.filters.searchField = 'all';
        this.syncSearchControlUI();
        this.renderInbox();
      } else if (showStash) {
        this.activeDataMode = 'stash';
        this.filters.searchField = 'all';
        this.syncSearchControlUI();
        this.renderStashTable();
      } else {
        this.activeDataMode = activeTab;
        this.filters.searchField = 'all';
        this.syncSearchControlUI();
        this.applyFilters();
      }
    };
    
    tabOriginal?.addEventListener('click', () => {
      setActiveTab('original');
    });
    
    tabFiles?.addEventListener('click', () => {
      setActiveTab('files');
    });

    tabStash?.addEventListener('click', () => {
      setActiveTab('stash');
    });
    
    // 初始加载时设置默认tab状态（收件箱），确保 inbox-status-wrapper 等元素正确显示
    setActiveTab('original');
  },
  
  bindEvents() {
    this.bindFilterEvents();
    this.renderInbox();
    this.bindBatchEvents();
    this.bindPaginationEvents();
    this.bindTabEvents();
  }
};

const IngestionView = {
  data: [],
  filteredData: [],
  activeDataMode: 'files',
  promotedStashKeys: new Set(),
  failedStashKeys: new Set(),
  approvedOriginalIds: new Set(),
  
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
    const reason = attachment?.rejectReason || '';
    return reason.includes('重复') || reason.includes('覆盖/忽略');
  },

  getInboxStatusStyle(statusText) {
    if (statusText === '正常') {
      return 'bg-green-50 text-green-700 border-green-100';
    }
    if (statusText === '待处理') {
      return 'bg-amber-50 text-amber-700 border-amber-100';
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

  recalcInboxItemStatus(inboxItem) {
    if (!inboxItem?.attachments?.length) return;

    const allNormal = inboxItem.attachments.every(item => item.status === '正常');
    const needsAttention = inboxItem.attachments
      .filter(item => item.status !== '正常')
      .map(item => item.rejectReason)
      .filter(reason => reason && reason !== '-');

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
    teams: []
  },
  
  // 收件箱状态筛选
  inboxStatusFilter: [],
  
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
      const res = await fetch('data/files_mock.json?v=20260610-attachment-audit-columns');
      this.data = await res.json();
      this.loadApprovedOriginalIds();
      // 添加处理人字段，并保留内部驳回备注
      this.data = this.data.map(row => ({
        ...row,
        status: this.approvedOriginalIds.has(String(row.id)) ? '已通过' : row.status,
        handler: row.status.includes('异常') ? row.team : 'POS担当',
        remark: row.remark || ''
      }));
      this.loadFiltersFromCache();
      this.applyFilters();
      this.renderInbox();
    } catch (e) {
      console.error('Failed to load mock data', e);
      this.showEmptyState();
    }
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
    
    // 文件名称筛选
    if (this.filters.fileName) {
      const keyword = this.filters.fileName.toLowerCase();
      result = result.filter(row => 
        row.fileName.toLowerCase().includes(keyword)
      );
    }
    
    // Team筛选：row.team 是中韩双语格式（如 "华北 Team / 화북 Team"），
    // checkbox value 是纯中文（如 "华北 Team"），用 includes 做包含匹配
    if (this.filters.teams.length > 0) {
      result = result.filter(row =>
        this.filters.teams.some(team => row.team.includes(team))
      );
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
      teams: []
    };
    this.pagination.page = 1;
    this.saveFiltersToCache();
    this.applyFilters();
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
            <!-- 文件名称搜索 -->
            <div class="relative">
              <input type="text" id="filter-filename" placeholder="${this.getCurrentLang() === 'cn' ? '请输入文件名称模糊搜索' : '파일명 검색'}" 
                class="pl-10 pr-4 py-2 w-56 border border-gray-200 rounded-lg text-sm text-[#4e5969] focus:outline-none focus:border-brand transition-all"
                value="${this.filters.fileName}">
              <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[#86909c]"></i>
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
                ${[['正常', '정상'], ['驳回', '반려'], ['覆盖', '덮어쓰기']].map(([val, label]) => `
                  <label class="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer">
                    <input type="checkbox" value="${val}" class="inbox-status-checkbox rounded border-gray-300 text-brand" ${this.inboxStatusFilter.includes(val) ? 'checked' : ''}>
                    <span class="text-sm text-[#4e5969]">${this.getCurrentLang() === 'cn' ? val : label}</span>
                  </label>
                `).join('')}
              </div>
            </div>
            
            <!-- 营业Team多选 -->
            <div class="relative hidden" id="team-select-wrapper">
              <button type="button" id="team-select-btn" 
                class="px-4 py-2 w-40 border border-gray-200 rounded-lg text-sm text-[#4e5969] bg-white text-left flex items-center justify-between gap-2 focus:outline-none focus:border-brand transition-all">
                <span id="team-select-label">全部 Team</span>
                <i class="fa-solid fa-chevron-down text-xs"></i>
              </button>
              <div id="team-dropdown" class="hidden absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2">
                <label class="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer">
                  <input type="checkbox" id="team-select-all" class="rounded border-gray-300 text-brand">
                  <span class="text-sm text-[#4e5969]">${this.getCurrentLang() === 'cn' ? '全选' : '전체 선택'}</span>
                </label>
                <div class="border-t border-gray-100 my-1"></div>
                ${['华北 Team', '东北 Team', '华东 Team', '华中 Team', '华南 Team', '西南 Team', '西北 Team'].map(team => `
                  <label class="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer">
                    <input type="checkbox" value="${team}" class="team-checkbox rounded border-gray-300 text-brand" ${this.filters.teams.includes(team) ? 'checked' : ''}>
                    <span class="text-sm text-[#4e5969]">${this.getLocalizedText(team)}</span>
                  </label>
                `).join('')}
              </div>
            </div>
            
            <!-- 重置按钮 -->
            <button type="button" id="btn-reset-filter" 
              class="px-4 py-2 text-sm text-[#86909c] hover:text-[#1d2129] hover:bg-gray-50 rounded-lg transition-all">
              <i class="fa-solid fa-rotate-left mr-1"></i>${this.getCurrentLang() === 'cn' ? '重置筛选' : '筛选 초기화'}
            </button>
            
            <!-- 批量操作区 -->
            <div class="ml-auto flex items-center gap-2">
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
                <i class="fa-solid fa-check mr-1"></i>${this.getCurrentLang() === 'cn' ? '通过' : '승인'}
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
      
      // 材料提供时间（从uploadTime提取日期部分）
      const uploadTime = row.uploadTime || '';
      const dateMatch = uploadTime.match(/(\d{4})-(\d{2})-(\d{2})/);
      const provideTime = dateMatch
        ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`
        : `2026-0${1 + (idx % 6)}-${String(1 + (idx % 28)).padStart(2, '0')}`;
      
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
          status = '重复';
          rejectReason = '该文件解析后发现“A门店、B门店”与原始门店数据列表中有重复';
        }
        
        attachments.push({
          name: (isZip && i === 0) || (idx === 2 && i === 0)
            ? `${storeNameCN}-销售明细包.zip`
            : `${storeNameCN}${i > 0 ? '-' + (i + 1) : ''}-销售明细.xlsx`,
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
    
    this.inboxDataCache = inboxItems;
    return inboxItems;
  },
  
  renderInbox() {
    const loading = document.getElementById('inbox-loading');
    const tableContainer = document.getElementById('inbox-table-container');
    const empty = document.getElementById('inbox-empty');
    
    if (!tableContainer) return;
    
    const inboxData = this.getInboxData();
    
    // 按子级附件状态筛选
    let filteredInboxData = inboxData;
    if (this.inboxStatusFilter.length > 0) {
      filteredInboxData = inboxData.filter(item =>
        item.attachments.some(attachment => this.inboxStatusFilter.includes(attachment.status))
      );
    }
    
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
      <table class="w-full min-w-[1280px] text-left text-sm text-[#4e5969]" id="inbox-table">
        <thead class="bg-[#f7f8fa] text-[#1d2129] font-medium sticky top-0 z-10">
          <tr>
            <th class="px-3 py-3 w-12"></th>
            <th class="px-3 py-3 w-12">序号</th>
            <th class="px-4 py-3 min-w-[280px]">${cn ? '标题' : '제목'}</th>
            <th class="px-4 py-3 min-w-[200px]">${cn ? '内容' : '내용'}</th>
            <th class="px-4 py-3 w-24 text-center">${cn ? '附件数' : '첨부 수'}</th>
            <th class="px-4 py-3 w-44">${cn ? '材料提供人' : '제공자'}</th>
            <th class="px-4 py-3 w-32">${cn ? '材料提供时间' : '제공 시간'}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100" id="inbox-tbody">
          ${filteredInboxData.map(item => this.renderInboxRow(item)).join('')}
        </tbody>
      </table>
    `;
    
    this.bindInboxEvents();
  },
  
  renderInboxRow(item) {
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
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-[#4e5969]">${item.attachmentCount}</span>
        </td>
        <td class="px-4 py-3">
          <span class="block max-w-[168px] truncate text-sm text-[#1d2129]" title="${this.escapeHtml(item.provider)}">${this.escapeHtml(item.provider)}</span>
        </td>
        <td class="px-4 py-3">
          <span class="text-sm text-[#4e5969]">${item.provideTime}</span>
        </td>
      </tr>
    `;
  },
  
  renderInboxDetailRow(item) {
    const cn = this.getCurrentLang() === 'cn';
    return `
      <tr class="inbox-detail-row hidden" data-parent-id="${item.id}">
        <td colspan="7" class="p-0 bg-[#f7faff]">
          <div class="px-8 py-4 border-t border-blue-100">
            <table class="w-full table-fixed text-left text-xs text-[#4e5969] border border-gray-100 rounded-lg overflow-hidden">
              <thead class="bg-[#eef2fb] text-[#1d2129] font-semibold">
                <tr>
                  <th class="px-4 py-2.5 w-[34%]">${cn ? '附件名称' : '첨부 파일명'}</th>
                  <th class="px-4 py-2.5 w-[120px] text-center">${cn ? '附件状态' : '첨부 상태'}</th>
                  <th class="px-4 py-2.5 w-[28%]">${cn ? '异常说明' : '이상 설명'}</th>
                  <th class="px-4 py-2.5 w-[220px] text-left">${cn ? '操作' : '조작'}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 bg-white">
                ${item.attachments.map((att, i) => this.renderAttachmentRow(item.id, att, i)).join('')}
              </tbody>
            </table>
          </div>
        </td>
      </tr>
    `;
  },
  
  renderAttachmentRow(emailId, att, index) {
    const isRejected = att.status === '驳回';
    const isArchived = att.status === '已归档';
    const isDuplicate = att.status === '重复';
    const isCovered = att.status === '覆盖';
    const isStashed = att.status === '暂存';
    return `
      <tr class="hover:bg-slate-50 transition-colors" data-email-id="${emailId}" data-att-idx="${index}">
        <td class="px-4 py-2.5 w-[34%] max-w-0">
          <span class="inbox-att-name-text cursor-pointer text-brand hover:text-blue-700 hover:underline transition-colors truncate block" data-email-id="${emailId}" data-att-idx="${index}" title="${this.getCurrentLang() === 'cn' ? '点击预览' : '클릭하여 미리보기'}">${this.escapeHtml(att.name)}</span>
        </td>
        <td class="px-4 py-2.5 w-[120px] text-center">
          <span class="px-2 py-0.5 rounded-full text-xs font-semibold border ${isRejected ? 'bg-red-50 text-red-600 border-red-100' : isDuplicate ? 'bg-amber-50 text-amber-700 border-amber-100' : isCovered ? 'bg-blue-50 text-brand border-blue-100' : isArchived ? 'bg-slate-50 text-slate-500 border-slate-100' : isStashed ? 'bg-blue-50 text-brand border-blue-100' : 'bg-green-50 text-green-700 border-green-100'}">
            ${att.status}
          </span>
        </td>
        <td class="px-4 py-2.5 w-[28%] max-w-0 ${isRejected ? 'text-red-600' : isDuplicate ? 'text-amber-700' : 'text-[#86909c]'}">
          <div class="truncate" title="${this.escapeHtml(att.rejectReason)}">${this.escapeHtml(att.rejectReason)}</div>
        </td>
        <td class="px-4 py-2.5 w-[220px]">
          <div class="flex items-center justify-start gap-1.5 whitespace-nowrap">
            <button type="button" class="inbox-att-detail-btn px-2 py-1 text-xs rounded text-brand hover:bg-blue-50 transition-all" data-email-id="${emailId}" data-att-idx="${index}" title="${this.getCurrentLang() === 'cn' ? '单据详情' : '문서 상세'}">
              <i class="fa-solid fa-list-check"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  },

  resolveDuplicateAttachment(emailId, attachmentIndex, action) {
    const inboxItem = this.getInboxData().find(item => String(item.id) === String(emailId));
    const attachment = inboxItem?.attachments?.[attachmentIndex];
    if (!inboxItem || !attachment || !this.isDuplicateAttachment(attachment)) return;

    const cn = this.getCurrentLang() === 'cn';
    const resolvedText = action === 'cover'
      ? (cn ? '已覆盖重复门店' : '중복 매장을 덮어썼습니다')
      : (cn ? '已忽略重复门店' : '중복 매장을 무시했습니다');

    attachment.status = '正常';
    attachment.rejectReason = resolvedText;
    this.recalcInboxItemStatus(inboxItem);
    this.renderInbox();
    Dialog.toast(resolvedText, 'success');
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
    const overlay = document.createElement('div');
    overlay.id = 'original-reject-overlay';
    overlay.className = 'fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center px-6';
    overlay.innerHTML = `
      <div class="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-[fadeIn_0.18s_ease-out]" role="dialog" aria-modal="true" aria-labelledby="original-reject-title">
        <div class="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100">
          <div class="min-w-0">
            <h3 id="original-reject-title" class="text-lg font-bold text-[#1d2129]">${cn ? '确认驳回文件' : '파일 반려 확인'}</h3>
            <p class="mt-1 text-sm text-[#86909c] truncate" title="${this.escapeHtml(rowData.fileName)} · ${this.escapeHtml(sourceText)}">${this.escapeHtml(rowData.fileName)} · ${this.escapeHtml(sourceText)}</p>
          </div>
          <button type="button" id="original-reject-close" class="w-8 h-8 shrink-0 rounded-lg text-[#86909c] hover:bg-gray-100 hover:text-[#1d2129] transition-colors" aria-label="${cn ? '关闭' : '닫기'}">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="px-6 py-5 space-y-4">
          <label class="block">
            <span class="block mb-2 text-xs font-semibold text-[#4e5969]">${cn ? '手动备注信息' : '수동 메모'}</span>
            <textarea id="original-reject-manual-note" rows="4" maxlength="500"
              class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm leading-6 text-[#1d2129] resize-none focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
              placeholder="${cn ? '可补充本次驳回的具体说明' : '이번 반려에 대한 상세 설명을 입력하세요'}">${this.escapeHtml(rowData.remark || '')}</textarea>
            <div class="mt-1 text-right text-xs text-[#86909c]"><span id="original-reject-note-count">0</span>/500</div>
          </label>
          <p class="text-xs text-[#86909c] leading-5"><span class="font-semibold text-[#4e5969]">${cn ? '说明：' : '안내: '}</span>${cn ? '本次操作将驳回当前原始门店数据文件，并记录原因与备注。' : '현재 원본 매장 데이터 파일을 반려하고 사유와 메모를 기록합니다.'}</p>
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

      this.data = this.data.map(row => {
        if (String(row.id) === String(rowId)) {
          return {
            ...row,
            status: '已驳回',
            handler: row.team,
            remark
          };
        }
        return row;
      });
      this.updateStats();
      this.applyFilters();
      close();
      Dialog.toast(cn ? '已驳回该文件' : '파일을 반려했습니다');
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
        if (e.target.closest('.inbox-expand-btn')) return;
        const btn = row.querySelector('.inbox-expand-btn');
        if (btn) btn.click();
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
          nameLabel: self.getCurrentLang() === 'cn' ? '附件名称' : '첨부 파일명',
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

  getAttachmentStatusClass(status) {
    if (status === '正常' || status === '정상') return 'bg-green-50 text-green-700 border-green-100';
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
      let node = cn ? '原始门店数据列表' : '원본 매장 데이터 목록';
      let action = cn ? '附件识别通过，等待进入质量检查' : '첨부 파일 인식 완료';
      let tone = 'success';

      if (attachment.status === '已归档') {
        node = cn ? '归档（非POS表）' : '보관(비POS표)';
        action = cn ? '附件被归档为非 POS 数据' : '비 POS 데이터로 보관됨';
        tone = 'muted';
      } else if (attachment.status === '暂存') {
        node = cn ? '暂存数据' : '임시 저장 데이터';
        action = cn ? '缺少门店编码或所属组织，等待补全后流入原始门店数据列表' : '매장 코드 또는 조직 정보 보완 대기';
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

  renderInboxSourceAttachments(inboxItem) {
    const cn = this.getCurrentLang() === 'cn';
    const attachments = inboxItem.attachments || [];
    if (!attachments.length) {
      return `<div class="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-[#86909c]">${cn ? '暂无来源附件' : '첨부 파일 없음'}</div>`;
    }

    return attachments.map((attachment, index) => {
      const isZip = /\.zip$/i.test(attachment.name || '');
      const zipFiles = isZip ? this.getZipAttachmentFiles(inboxItem, attachment) : [];
      const statusClass = this.getAttachmentStatusClass(attachment.status);
      return `
        <div class="rounded-xl border border-gray-100 bg-white overflow-hidden">
          <button type="button" class="doc-source-attachment-trigger w-full px-4 py-3 flex items-start justify-between gap-3 text-left hover:bg-blue-50/40 transition-colors" data-email-id="${inboxItem.id}" data-att-idx="${index}">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <i class="fa-solid ${isZip ? 'fa-file-zipper text-amber-500' : 'fa-file-excel text-green-600'}"></i>
                <span class="text-sm font-semibold text-brand truncate hover:underline">${this.escapeHtml(attachment.name)}</span>
              </div>
              <div class="mt-1 text-xs text-[#86909c]">${cn ? '来源方式' : '출처 방식'}：${this.escapeHtml(attachment.sourceMethod || '-')}</div>
            </div>
            <span class="shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold border ${statusClass}">${this.escapeHtml(attachment.status || '-')}</span>
          </button>
          ${isZip ? `
            <div class="border-t border-gray-100 bg-slate-50 px-4 py-3">
              <div class="mb-2 text-xs font-semibold text-[#4e5969]">${cn ? '文件列表' : '파일 목록'} · ${zipFiles.length}</div>
              <div class="space-y-2">
                ${zipFiles.map((file, fileIndex) => `
                  <button type="button" class="doc-source-zip-file-trigger w-full rounded-lg bg-white border border-gray-100 px-3 py-2 text-left hover:border-blue-200 hover:bg-blue-50/50 transition-colors" data-email-id="${inboxItem.id}" data-att-idx="${index}" data-zip-index="${fileIndex}">
                    <div class="flex items-center justify-between gap-2">
                      <span class="min-w-0 truncate text-xs font-semibold text-[#1d2129]">${this.escapeHtml(file.name)}</span>
                      <span class="px-2 py-0.5 rounded-full text-[11px] border ${this.getAttachmentStatusClass(file.status)}">${this.escapeHtml(file.status)}</span>
                    </div>
                    <div class="mt-1 flex items-center justify-between gap-2 text-[11px] text-[#86909c]">
                      <span>${this.escapeHtml(file.type)}</span>
                      <span class="truncate">${this.escapeHtml(file.note)}</span>
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

  buildDocumentDetailLogs(context = {}) {
    const cn = this.getCurrentLang() === 'cn';
    const logs = [];
    const inboxItem = context.inboxItem;
    const currentNode = context.currentNode || context.moduleName || (cn ? '当前模块' : '현재 모듈');
    if (inboxItem) {
      logs.push({
        node: cn ? '收件箱' : '받은 편지함',
        action: cn ? `接收来源邮件：${inboxItem.emailSubject || '-'}` : `원본 메일 수신：${inboxItem.emailSubject || '-'}`,
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
        node: cn ? 'AI质检' : 'AI 검사',
        action: context.row?.aiNote || (cn ? '已完成标准 POS 字段校验和组织关系校验' : '표준 POS 필드 및 조직 관계 검사 완료'),
        time: '-',
        status: cn ? '已质检' : '검사 완료',
        tone: 'success'
      });
    }

    if (/台账|汇总/.test(context.moduleName || currentNode)) {
      logs.push({
        node: cn ? '台账与汇总' : '대장 및 집계',
        action: cn ? '人工审核通过后进入标准 POS 明细台账' : '검토 후 표준 POS 상세 대장 반영',
        time: '-',
        status: cn ? '已入账' : '반영됨',
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
    const title = context.title || row.storeName || row.fileName || context.attachment?.name || (cn ? '单据详情' : '문서 상세');
    const nameLabel = context.nameLabel || (cn ? '单据名称' : '문서명');
    const statusText = context.statusText || row.status || context.attachment?.status || '-';
    const statusClass = this.getInboxStatusStyle(statusText);
    const logToneClass = {
      success: 'bg-green-50 text-green-700 border-green-100',
      warning: 'bg-amber-50 text-amber-700 border-amber-100',
      danger: 'bg-red-50 text-red-600 border-red-100',
      info: 'bg-blue-50 text-brand border-blue-100',
      muted: 'bg-slate-50 text-slate-500 border-slate-100'
    };
    const logs = this.buildDocumentDetailLogs({ ...context, inboxItem });
    const content = `
      <div class="space-y-5">
        <section class="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="text-xs font-semibold text-[#86909c]">${this.escapeHtml(nameLabel)}</div>
              <h4 class="mt-1 text-base font-extrabold text-[#1d2129] truncate" title="${this.escapeHtml(title)}">${this.escapeHtml(title)}</h4>
              <p class="mt-1 text-sm text-[#4e5969]">${this.escapeHtml(context.moduleName || '-')}</p>
            </div>
            <span class="shrink-0 px-3 py-1 rounded-full text-xs font-semibold border ${statusClass}">${this.escapeHtml(statusText)}</span>
          </div>
        </section>

        <section class="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <h4 class="text-sm font-extrabold text-[#1d2129] mb-4">${cn ? '来源邮件' : '원본 메일'}</h4>
          ${inboxItem ? `
            <div class="rounded-xl bg-slate-50 px-4 py-3 text-sm">
              <div class="font-bold text-[#1d2129] truncate" title="${this.escapeHtml(inboxItem.emailSubject || '-')}">${this.escapeHtml(inboxItem.emailSubject || '-')}</div>
              <div class="mt-1 text-[#4e5969] truncate" title="${this.escapeHtml(inboxItem.emailBody || '-')}">${this.escapeHtml(inboxItem.emailBody || '-')}</div>
              <div class="mt-2 grid grid-cols-2 gap-3 text-xs text-[#86909c]">
                <span>${cn ? '材料提供人' : '제공자'}：${this.escapeHtml(inboxItem.provider || '-')}</span>
                <span>${cn ? '材料提供时间' : '제공 시간'}：${this.escapeHtml(inboxItem.provideTime || '-')}</span>
              </div>
            </div>
          ` : `<div class="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-[#86909c]">${cn ? '暂无来源邮件' : '원본 메일 없음'}</div>`}
        </section>

        <section class="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <div class="flex items-center justify-between gap-3 mb-4">
            <h4 class="text-sm font-extrabold text-[#1d2129]">${cn ? '来源附件' : '원본 첨부 파일'}</h4>
            <span class="text-xs text-[#86909c]">${cn ? '保留原始附件结构，压缩包可查看内部文件' : '원본 첨부 구조 유지'}</span>
          </div>
          <div class="space-y-3">
            ${inboxItem ? this.renderInboxSourceAttachments(inboxItem) : `<div class="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-[#86909c]">${cn ? '暂无来源附件' : '첨부 파일 없음'}</div>`}
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
        <section class="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="text-xs font-semibold text-[#86909c]">${cn ? '单据标题' : '문서 제목'}</div>
              <h4 class="mt-1 text-base font-extrabold text-[#1d2129] truncate" title="${this.escapeHtml(inboxItem.emailSubject)}">${this.escapeHtml(inboxItem.emailSubject)}</h4>
              <p class="mt-1 text-sm text-[#4e5969] truncate" title="${this.escapeHtml(inboxItem.emailBody)}">${this.escapeHtml(inboxItem.emailBody)}</p>
            </div>
            <span class="shrink-0 px-3 py-1 rounded-full text-xs font-semibold border ${statusClass}">${this.escapeHtml(inboxItem.statusText)}</span>
          </div>
        </section>

        <section class="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
          <div class="flex items-center justify-between gap-3 mb-4">
            <h4 class="text-sm font-extrabold text-[#1d2129]">${cn ? '来源附件' : '원본 첨부 파일'}</h4>
            <span class="text-xs text-[#86909c]">${cn ? '保留原始附件结构，压缩包可查看内部文件' : '원본 첨부 구조 유지'}</span>
          </div>
          <div class="space-y-3">
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

    rowData.status = '正常';
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
        acc: index === 0 ? '其他' : String(row.region || '华北区域').replace('区域', ''),
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
      { key: 'acc', label: 'ACC', className: 'min-w-20' },
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
        <td class="border-b border-r border-gray-200 p-2">${row.code}</td>
        <td class="border-b border-r border-gray-200 p-2 ${row.unknown ? 'text-brand' : ''}">${row.name}</td>
        <td class="border-b border-r border-gray-200 p-2 text-right">${row.qty}</td>
        <td class="border-b border-r border-gray-200 p-2 text-right">${row.price.toFixed(2)}</td>
        <td class="border-b border-r border-gray-200 p-2 text-right">${row.total.toFixed(2)}</td>
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
    
    // ---- 编辑按钮（仅文件名）----
    const editBtn = overlay.querySelector('.store-preview-edit-btn');
    const editIcon = editBtn.querySelector('i');
    const titleText = overlay.querySelector('.store-preview-title-text');
    const titleInput = overlay.querySelector('.store-preview-title-input');
    let isEditing = false;
    
    editBtn.addEventListener('click', () => {
      isEditing = !isEditing;
      if (isEditing) {
        editIcon.className = 'fa-solid fa-check';
        editBtn.title = cn ? '保存' : '저장';
        editBtn.classList.add('bg-blue-50');
        titleText.classList.add('hidden');
        titleInput.classList.remove('hidden');
        titleInput.focus();
      } else {
        editIcon.className = 'fa-solid fa-pen-to-square';
        editBtn.title = cn ? '编辑' : '편집';
        editBtn.classList.remove('bg-blue-50');
        const newTitle = titleInput.value.trim();
        if (newTitle) {
          titleText.textContent = newTitle;
          // 同步更新数据
          self.data = self.data.map(r => {
            if (r.id === rowData.id) { r.fileName = newTitle; }
            return r;
          });
        }
        titleText.classList.remove('hidden');
        titleInput.classList.add('hidden');
        Dialog.toast(cn ? '已保存' : '저장되었습니다');
      }
    });
    
    // 标题输入回车保存
    titleInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') editBtn.click();
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
    
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    
    const escHandler = (e) => {
      if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', escHandler); }
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
      <th class="px-5 py-4 w-12 rounded-tl-lg">
        <input type="checkbox" id="selectAll" class="rounded border-gray-300 text-brand focus:ring-brand">
      </th>
      <th class="px-4 py-4 w-28">${cn ? '年月' : '년월'}</th>
      <th class="px-3 py-4 max-w-44">${cn ? '门店名称' : '매장명'}</th>
    `;
    const commonEnd = `
      <th class="px-5 py-4">${cn ? '营业Team' : '영업 Team'}</th>
      <th class="px-5 py-4">
        <div class="flex items-center gap-1">
          ${cn ? '处理人' : '처리자'}
          <i class="fa-solid fa-circle-info text-xs text-[#86909c] cursor-help" title="${cn ? '处理人信息' : '처리자 정보'}"></i>
        </div>
      </th>
    `;
    headerRow.innerHTML = isOriginalStoreList
      ? `
        ${commonStart}
        ${commonEnd}
        <th class="px-5 py-4 w-28">${cn ? '状态' : '상태'}</th>
        <th class="px-5 py-4 w-32 rounded-tr-lg">
          <div class="flex items-center gap-1">
            ${cn ? '操作' : '조작'}
            <i class="fa-solid fa-circle-info text-xs text-[#86909c] cursor-help" title="${cn ? '操作按钮' : '조작 버튼'}"></i>
          </div>
        </th>
      `
      : `
        ${commonStart}
        ${commonEnd}
        <th class="px-5 py-4 w-32 rounded-tr-lg">
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
    
    if (pageData.length === 0) {
      tbody.innerHTML = '';
      this.showEmptyState();
      this.renderPagination();
      return;
    }
    
    this.hideEmptyState();
    
    tbody.innerHTML = pageData.map(row => {
      const confidenceValue = Number.parseFloat(row.confidence || '0');
      const isConfidenceNormal = confidenceValue > 95;
      const isPending = row.status.includes('待处理');
      const isArchived = row.status.includes('已归档');
      const isApproved = row.status.includes('已通过');
      const isRejected = row.status.includes('已驳回');
      
      let statusClass, statusText;
      if (isArchived) {
        statusClass = 'bg-gray-100 text-gray-600 border-gray-200';
        statusText = '已归档';
      } else if (isApproved) {
        statusClass = 'bg-green-50 text-green-700 border-green-100';
        statusText = '已通过';
      } else if (isRejected) {
        statusClass = 'bg-red-50 text-red-600 border-red-100';
        statusText = '已驳回';
      } else if (isConfidenceNormal) {
        statusClass = 'bg-green-50 text-green-700 border-green-100';
        statusText = '正常';
      } else {
        statusClass = 'bg-blue-50 text-brand border-blue-100';
        statusText = '异常';
      }

      if (isPending && !row.confidence) {
        statusClass = 'bg-amber-50 text-amber-700 border-amber-100';
        statusText = '待处理';
      }

      const confidenceClass = confidenceValue > 95 ? 'text-green-700 bg-green-50 border-green-100' : 'text-brand bg-blue-50 border-blue-100';
      const suggestionText = row.suggestion || (confidenceValue > 95 ? '-' : '请复核原始文件字段完整性与门店匹配关系。');
      
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
        <tr class="hover:bg-slate-50 transition-colors" data-id="${row.id}">
          <td class="px-4 py-3">
            <input type="checkbox" class="row-cb rounded border-gray-300 text-brand focus:ring-brand" value="${row.id}">
          </td>
          <td class="px-4 py-3 text-[#4e5969]">${this.escapeHtml(this.getDisplayMonth(row))}</td>
          <td class="px-3 py-3">
            <div class="font-medium flex items-center gap-2" title="${row.fileName}">
              <i class="fa-solid fa-file-excel text-green-600 flex-shrink-0"></i>
              <button type="button" class="ingestion-row-preview-trigger row-filename-text truncate max-w-[180px] text-brand hover:text-blue-700 hover:underline transition-colors text-left" data-id="${row.id}" title="${this.getCurrentLang() === 'cn' ? '点击预览' : '미리보기'} ${this.escapeHtml(row.fileName)}">${row.fileName}</button>
              <input type="text" class="row-filename-input hidden w-full max-w-[180px] px-1 py-0.5 border border-gray-200 rounded text-sm font-medium text-slate-800 focus:outline-none focus:border-brand" value="${this.escapeHtml(row.fileName)}">
            </div>
          </td>
          <td class="px-5 py-3">
            <span class="row-team-text">${this.getLocalizedText(row.team)}</span>
            <select class="row-team-select hidden px-2 py-0.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-brand">
              ${['华北 Team', '东北 Team', '华东 Team', '华中 Team', '华南 Team', '西南 Team', '西北 Team'].map(t => `<option value="${t}" ${row.team.includes(t) ? 'selected' : ''}>${this.getLocalizedText(t)}</option>`).join('')}
            </select>
          </td>
          <td class="px-5 py-3">
            <span class="${row.handler ? '' : 'text-[#d1d5db]'}" title="${this.getLocalizedText(row.handler) || '-'}">
              ${this.getLocalizedText(row.handler) || '-'}
            </span>
          </td>
          ${isOriginalStoreList ? `
            <td class="px-5 py-3">
              <span class="inline-flex px-2.5 py-1 rounded-full border text-xs font-semibold ${isApproved ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'}">
                ${isApproved ? (this.getCurrentLang() === 'cn' ? '已通过' : '승인됨') : (this.getCurrentLang() === 'cn' ? '待通过' : '승인 대기')}
              </span>
            </td>
          ` : ''}
          <td class="px-5 py-3">
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
              <button class="px-2 py-1 text-xs rounded action-btn ${isApproved ? 'text-gray-300 cursor-not-allowed' : 'text-green-600 hover:bg-green-50'}" data-action="approve" data-id="${row.id}" title="${isApproved ? (this.getCurrentLang() === 'cn' ? '已通过' : '승인됨') : (this.getCurrentLang() === 'cn' ? '通过' : '승인')}" ${isApproved ? 'disabled' : ''}>
                <i class="fa-solid fa-check"></i>
              </button>
              <button class="px-2 py-1 text-xs rounded text-amber-500 hover:bg-amber-50 action-btn row-edit-btn" data-action="edit" data-id="${row.id}" title="${this.getCurrentLang() === 'cn' ? '编辑' : '편집'}">
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
      return {
        ...item,
        key,
        row: failed
          ? {
              ...item.row,
              aiNote: '未校验到门店编码/所属关系，请检查门店主数据。'
            }
          : item.row
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
    return this.getStashSourceRows().filter(({ row }) => {
      if (this.filters.teams.length > 0 && !this.filters.teams.includes(row.salesTeam)) {
        return false;
      }
      if (keyword) {
        const searchable = [
          row.storeName,
          row.storeCode,
          row.aiNote,
          row.salesTeam,
          row.region,
          row.salesOffice,
          row.dealer
        ].join(' ').toLowerCase();
        return searchable.includes(keyword);
      }
      return true;
    });
  },

  renderStashTable() {
    const container = document.getElementById('ingestion-stash-container');
    if (!container) return;

    const rows = this.getFilteredStashRows();
    const tableRows = rows.map(({ row, index, key }) => {
      return `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="px-4 py-3"><input type="checkbox" class="row-cb-ingestion-stash rounded border-gray-300 text-brand focus:ring-brand" data-stash-key="${this.escapeHtml(key)}"></td>
        <td class="px-4 py-3 text-[#4e5969]">${this.escapeHtml(this.getDisplayMonth(row))}</td>
        <td class="px-4 py-3">
          <button type="button" class="ingestion-stash-preview-trigger font-medium text-brand flex items-center gap-2 hover:text-blue-700 hover:underline transition-colors" data-index="${index}" data-email-id="${row.sourceEmailId || ''}" data-att-idx="${typeof row.sourceAttIdx === 'number' ? row.sourceAttIdx : ''}" title="预览 ${this.escapeHtml(row.storeName)}">
            <i class="fa-solid fa-store text-brand"></i>
            <span class="truncate max-w-[176px]">${this.escapeHtml(row.storeName)}</span>
          </button>
        </td>
        <td class="px-4 py-3 font-mono text-[#1d2129]">-</td>
        <td class="px-4 py-3 max-w-[160px] text-[#86909c]">-</td>
        <td class="px-4 py-3 max-w-[120px] text-[#86909c]">-</td>
        <td class="px-4 py-3 max-w-[160px] text-[#86909c]">-</td>
        <td class="px-4 py-3 max-w-[180px] text-[#86909c]">-</td>
        <td class="px-4 py-3">
          <button type="button" class="ingestion-stash-detail-btn px-2 py-1 text-xs rounded text-brand hover:bg-blue-50 transition-colors" data-stash-key="${this.escapeHtml(key)}" title="单据详情">
            <i class="fa-solid fa-list-check"></i>
          </button>
        </td>
      </tr>
    `;
    }).join('');

    container.innerHTML = `
      <div class="animate-[fadeIn_0.22s_ease-out]">
        <table class="w-full table-fixed min-w-[1360px] text-left text-sm text-[#4e5969]">
          <thead class="bg-[#f7f8fa] text-[#1d2129] font-medium sticky top-0 z-10">
            <tr>
              <th class="px-4 py-3 w-12 rounded-tl-lg"><input type="checkbox" id="ingestion-stash-select-all" class="rounded border-gray-300 text-brand focus:ring-brand"></th>
              <th class="px-4 py-3 w-28">年月</th>
              <th class="px-4 py-3 w-48">门店名称</th>
              <th class="px-4 py-3 w-28">门店编码</th>
              <th class="px-4 py-3 w-36">所属营业Team</th>
              <th class="px-4 py-3 w-28">所属区域</th>
              <th class="px-4 py-3 w-36">所属营业所</th>
              <th class="px-4 py-3 w-36">所属经销商</th>
              <th class="px-4 py-3 w-20 rounded-tr-lg">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            ${rows.length === 0 ? `
              <tr>
                <td colspan="9" class="px-4 py-16 text-center text-[#86909c]">
                  <i class="fa-regular fa-folder-open text-3xl mb-3 block text-gray-300"></i>
                  暂无暂存数据
                </td>
              </tr>
            ` : tableRows}
          </tbody>
        </table>
      </div>
    `;

    this.bindStashEvents();
  },

  updateStashBatchButton() {
    const container = document.getElementById('ingestion-stash-container');
    const rowCheckboxes = Array.from(container?.querySelectorAll('.row-cb-ingestion-stash') || []);
    const selected = rowCheckboxes.filter((checkbox) => checkbox.checked).length;
    const approveBtn = document.getElementById('btn-batch-approve');
    const selectAll = container?.querySelector('#ingestion-stash-select-all');

    if (approveBtn) {
      approveBtn.disabled = selected === 0;
      approveBtn.className = selected > 0
        ? 'px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium transition-all shadow-sm shadow-brand/20 hover:bg-blue-700 hover:shadow-brand/30 hover:-translate-y-0.5'
        : 'px-4 py-2 bg-[#86909c] text-white rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed';
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
        if (typeof QAView !== 'undefined' && typeof QAView.openStandardPreview === 'function') {
          QAView.openStandardPreview(index);
        }
      });
    });

    container?.querySelectorAll('.ingestion-stash-detail-btn').forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        event.stopPropagation();
        const key = trigger.dataset.stashKey;
        const item = this.getFilteredStashRows().find(row => row.key === key);
        if (!item) return;
        const row = item.row || {};
        this.openDocumentDetail({
          moduleName: '文件收取 - 暂存数据',
          currentNode: '暂存数据',
          title: row.storeName || '暂存单据',
          nameLabel: '门店名称',
          statusText: '暂存',
          row,
          moduleFields: [
            { label: '门店编码', value: row.storeCode || '-' },
            { label: 'AI判断', value: row.aiNote || '-' },
            { label: '所属营业Team', value: row.salesTeam || '-' },
            { label: '所属区域', value: row.region || '-' },
            { label: '所属营业所', value: row.salesOffice || '-' },
            { label: '所属经销商', value: row.dealer || '-' }
          ]
        });
      });
    });

    this.updateStashBatchButton();
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
      status: '正常',
      confidence: '98%',
      suggestion: 'AI校验通过，已从暂存数据流入原始门店数据列表。',
      handler: 'POS担当',
      region: row.region || '华北区域',
      salesOffice: row.salesOffice || '石家庄营业所',
      dealer: row.dealer || '河北聚昊商贸',
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
            <p class="mt-2 text-xs leading-5 text-green-700">以下数据已流入「原始门店数据列表」，请在原始门店数据列表中进入质检。</p>
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
      confirmText: successRows.length ? '查看原始门店数据列表' : '知道了',
      cancelText: '留在暂存数据',
      onConfirm: () => {
        if (successRows.length) {
          setTimeout(() => document.getElementById('tab-files')?.click(), 0);
        }
      }
    });
  },

  handleStashAiCheck() {
    const selectedRows = this.getSelectedStashRows();
    if (selectedRows.length === 0) {
      Dialog.toast('请先选择需要校验的暂存数据', 'error');
      return;
    }

    const successRows = selectedRows.slice(0, 1);
    const failedRows = selectedRows.slice(1);

    this.promoteStashRows(successRows);
    failedRows.forEach(item => this.failedStashKeys.add(item.key));
    this.updateStats();
    this.renderStashTable();
    this.showStashAiCheckResult(successRows, failedRows);
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
    if (this.activeDataMode === 'files') {
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
  
  updateBatchButtons() {
    const selected = document.querySelectorAll('.row-cb:checked').length;
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
        document.querySelectorAll('.row-cb').forEach(cb => cb.checked = e.target.checked);
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
          
          const filenameText = row.querySelector('.row-filename-text');
          const filenameInput = row.querySelector('.row-filename-input');
          const teamText = row.querySelector('.row-team-text');
          const teamSelect = row.querySelector('.row-team-select');
          
          if (!isEditing) {
            // 进入编辑态
            icon.className = 'fa-solid fa-check row-edit-icon';
            btn.title = this.getCurrentLang() === 'cn' ? '保存' : '저장';
            btn.classList.add('bg-amber-100');
            
            filenameText.classList.add('hidden');
            filenameInput.classList.remove('hidden');
            filenameInput.focus();
            filenameInput.select();
            
            teamText.classList.add('hidden');
            teamSelect.classList.remove('hidden');
          } else {
            // 保存并回到只读态
            icon.className = 'fa-solid fa-pen-to-square row-edit-icon';
            btn.title = this.getCurrentLang() === 'cn' ? '编辑' : '편집';
            btn.classList.remove('bg-amber-100');
            
            const newFileName = filenameInput.value.trim();
            const newTeam = teamSelect.value;
            
            if (newFileName) {
              filenameText.textContent = newFileName;
              filenameText.title = newFileName;
            }
            filenameText.classList.remove('hidden');
            filenameInput.classList.add('hidden');
            
            if (newTeam) {
              teamText.textContent = this.getLocalizedText(newTeam);
            }
            teamText.classList.remove('hidden');
            teamSelect.classList.add('hidden');
            
            // 更新数据
            this.data = this.data.map(r => {
              if (r.id === id) {
                if (newFileName) r.fileName = newFileName;
                if (newTeam) r.team = newTeam;
              }
              return r;
            });
            
            Dialog.toast(this.getCurrentLang() === 'cn' ? '已保存' : '저장되었습니다');
          }
        } else if (action === 'reject') {
          this.openOriginalFileRejectConfirm(id);
        } else {
          // 通过、归档操作
          const actionNames = this.getCurrentLang() === 'cn' 
            ? { approve: '通过', archive: '归档' }
            : { approve: '승인', archive: '보관' };
          const statusMap = { approve: '已通过', archive: '已归档' };
          const toastMsgs = this.getCurrentLang() === 'cn'
            ? { approve: '通过成功', archive: '归档成功' }
            : { approve: '승인 성공', archive: '보관 성공' };
          const confirmText = this.getCurrentLang() === 'cn' ? '确认' : '확인';
          const confirmContentText = this.getCurrentLang() === 'cn' ? '确认对文件「' : '파일「';
          const actionText = this.getCurrentLang() === 'cn' ? '」执行' : '」에 대해';
          const operationText = this.getCurrentLang() === 'cn' ? '操作？' : '조작하시겠습니까?';
          
          Dialog.show({
            title: `${confirmText}【${actionNames[action]}】`,
            content: `${confirmContentText}${rowData.fileName}${actionText}${actionNames[action]}${operationText}`,
            onConfirm: () => {
              if (action === 'approve' && this.activeDataMode === 'files') {
                this.markOriginalRowsApproved([id]);
              }
              this.data = this.data.map(row => {
                if (row.id === id) {
                  row.status = statusMap[action];
                  row.handler = row.team;
                }
                return row;
              });
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
  
  bindFilterEvents() {
    // 文件名称搜索
    const filenameInput = document.getElementById('filter-filename');
    if (filenameInput) {
      filenameInput.addEventListener('input', (e) => {
        this.debounce(() => {
          this.filters.fileName = e.target.value;
          this.applyFilters();
        }, 300);
      });
    }
    
    // Team多选下拉
    const teamBtn = document.getElementById('team-select-btn');
    const teamDropdown = document.getElementById('team-dropdown');
    const teamCheckboxes = document.querySelectorAll('.team-checkbox');
    const teamSelectAll = document.getElementById('team-select-all');
    const teamLabel = document.getElementById('team-select-label');
    
    if (teamBtn && teamDropdown) {
      teamBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.dropdown-open').forEach(el => {
          if (el !== teamDropdown) el.classList.add('hidden');
        });
        teamDropdown.classList.toggle('hidden');
        teamDropdown.classList.toggle('dropdown-open');
      });
      
      teamSelectAll?.addEventListener('change', (e) => {
        teamCheckboxes.forEach(cb => cb.checked = e.target.checked);
        this.updateTeamLabel();
      });
      
      teamCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
          this.updateTeamLabel();
        });
      });
      
      teamDropdown.addEventListener('click', (e) => e.stopPropagation());
    }
    
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
          this.clearAllCheckboxes();
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

  showUploadModal() {
    const cn = this.getCurrentLang() === 'cn';
    const currentDate = new Date();
    const previousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const defaultPeriod = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, '0')}`;
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
            <input id="upload-material-period" type="month" value="${defaultPeriod}" required
              class="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-[#4e5969] outline-none transition-colors focus:border-brand">
          </label>
          <div>
            <span class="mb-2 block text-sm font-medium text-[#1d2129]">${cn ? '本地文件' : '로컬 파일'} <span class="text-red-500">*</span></span>
            <input id="upload-material-files" type="file" multiple class="hidden" accept=".xlsx,.xls,.csv,.zip">
            <button type="button" id="upload-file-picker"
              class="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-blue-300 bg-blue-50/50 px-4 py-5 text-sm font-medium text-brand hover:bg-blue-50">
              <i class="fa-solid fa-cloud-arrow-up"></i>
              <span>${cn ? '选择本地文件' : '로컬 파일 선택'}</span>
            </button>
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
    let selectedFiles = [];

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

      const now = new Date();
      const uploadedItem = {
        id: `local-${Date.now()}`,
        index: 1,
        emailSubject: title,
        emailBody: content || '-',
        month: period ? `${period.slice(0, 4)}年${period.slice(5, 7)}月` : '',
        attachmentCount: selectedFiles.length,
        isNormal: true,
        statusText: '正常',
        suggestion: '-',
        provider: Store?.getState?.()?.user?.name || '当前用户',
        provideTime: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
        attachments: selectedFiles.map(file => ({
          name: file.name,
          status: '正常',
          rejectReason: '-',
          sourceMethod: '本地上传'
        }))
      };
      this.inboxDataCache = [uploadedItem, ...this.getInboxData()]
        .map((item, index) => ({ ...item, index: index + 1 }));
      this.renderInbox();
      close();
      Dialog.toast(cn ? `已上传 ${selectedFiles.length} 个文件` : `${selectedFiles.length}개 파일을 업로드했습니다`, 'success');
    });
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
  
  updateTeamLabel() {
    const checked = Array.from(document.querySelectorAll('.team-checkbox:checked')).map(cb => cb.value);
    this.filters.teams = checked;
    
    const label = document.getElementById('team-select-label');
    if (label) {
      if (checked.length === 0) {
        label.textContent = this.getCurrentLang() === 'cn' ? '全部 Team' : '전체 Team';
      } else if (checked.length === 1) {
        label.textContent = this.getLocalizedText(checked[0]);
      } else {
        label.textContent = this.getCurrentLang() === 'cn' ? `已选 ${checked.length} 个` : `${checked.length}개 선택`;
      }
    }
    
    this.applyFilters();
  },
  
  clearAllCheckboxes() {
    document.querySelectorAll('.team-checkbox').forEach(cb => cb.checked = false);
    document.getElementById('team-select-all').checked = false;
    this.updateTeamLabel();
  },
  
  bindBatchEvents() {
    const handleBatchAction = (action) => {
      if (this.activeDataMode === 'stash') {
        if (action !== 'approve') return;
        this.handleStashAiCheck();
        return;
      }

      const selected = Array.from(document.querySelectorAll('.row-cb:checked')).map(cb => cb.value);
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
        ? { archive: '归档', approve: '通过', reject: '驳回' }
        : { archive: '보관', approve: '승인', reject: '거부' };
      const statusMap = { archive: '已归档', approve: '已通过', reject: '已驳回' };
      const batchTitle = this.getCurrentLang() === 'cn' ? '确认批量' : '일괄 확인';
      const batchContent = this.getCurrentLang() === 'cn' ? '当前将对' : '현재';
      const batchMiddle = this.getCurrentLang() === 'cn' ? '】条数据执行' : '】개 데이터에 대해';
      const batchEnd = this.getCurrentLang() === 'cn' ? '操作，确认后不可撤销，是否继续？' : '조작을 실행하시겠습니까? 되돌릴 수 없습니다.';
      const successText = this.getCurrentLang() === 'cn' ? '已成功对' : '성공적으로';
      const successMiddle = this.getCurrentLang() === 'cn' ? '条数据执行' : '개 데이터에 대해';
      const successAction = this.getCurrentLang() === 'cn' ? '操作' : '조작';
      
      Dialog.show({
        title: `${batchTitle}【${actionNames[action]}】`,
        content: `${batchContent}【${selected.length}${batchMiddle}${actionNames[action]}${batchEnd}`,
        onConfirm: async () => {
          // 显示loading
          this.showLoading();
          
          // 模拟接口调用
          await new Promise(resolve => setTimeout(resolve, 800));

          if (action === 'approve' && this.activeDataMode === 'files') {
            this.markOriginalRowsApproved(selected);
          }
          
          // 更新数据状态
          this.data = this.data.map(row => {
            if (selected.includes(row.id)) {
              row.status = statusMap[action];
              row.handler = row.team;
            }
            return row;
          });
          
          // 更新统计
          this.updateStats();
          
          // 重新筛选和渲染
          this.hideLoading();
          this.applyFilters();
          
          // 清空选择
          document.getElementById('selectAll').checked = false;
          this.updateBatchButtons();
          
          Dialog.toast(`${successText}${selected.length}${successMiddle}${actionNames[action]}${successAction}`);
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
      document.getElementById('pagination-area')?.classList.toggle('hidden', showOriginal || showStash);
      document.getElementById('btn-upload-file')?.classList.toggle('hidden', !showOriginal);
      document.getElementById('btn-batch-archive')?.classList.toggle('hidden', showOriginal || showStash || activeTab === 'archive' || activeTab === 'files');
      document.getElementById('btn-batch-approve')?.classList.toggle('hidden', showOriginal || activeTab === 'archive');
      document.getElementById('btn-batch-reject')?.classList.toggle('hidden', showOriginal || showStash || activeTab === 'files');
      document.getElementById('team-select-wrapper')?.classList.toggle('hidden', showOriginal || showStash);
      document.getElementById('inbox-status-wrapper')?.classList.toggle('hidden', !showOriginal);
      const approveBtn = document.getElementById('btn-batch-approve');
      if (approveBtn) {
        approveBtn.innerHTML = showStash
          ? '<i class="fa-solid fa-wand-magic-sparkles mr-1"></i>AI校验'
          : `<i class="fa-solid fa-check mr-1"></i>${this.getCurrentLang() === 'cn' ? '通过' : '승인'}`;
      }
      const rejectBtn = document.getElementById('btn-batch-reject');
      if (rejectBtn) {
        rejectBtn.innerHTML = activeTab === 'archive'
          ? `<i class="fa-solid fa-inbox mr-1"></i>${this.getCurrentLang() === 'cn' ? '移动到收件箱' : '받은 편지함으로 이동'}`
          : `<i class="fa-solid fa-xmark mr-1"></i>${this.getCurrentLang() === 'cn' ? '驳回' : '거부'}`;
      }
      
      if (showOriginal) {
        this.activeDataMode = 'files';
        this.renderInbox();
      } else if (showStash) {
        this.activeDataMode = 'stash';
        this.renderStashTable();
      } else {
        this.activeDataMode = activeTab;
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

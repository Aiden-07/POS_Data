const QAView = {
  data: [],
  activeQaTab: 'standard',
  standardDisplayMode: 'table',
  exceptionDisplayMode: 'detail',
  rejectedStoreCodes: new Set(),
  approvedStandardStoreCodes: new Set(),
  confidenceFilter: {
    preset: ''
  },
  searchField: 'all',
  searchKeyword: '',
  standardStatusFilter: '',
  exceptionTypeFilter: '',
  statusFilter: '',
  exceptionStatusOptions: ['待处理', '营业担当处理中', 'POS担当待处理', '已通过'],
  hierarchyFilter: {
    teams: [],
    offices: [],
    dealers: []
  },
  hierarchyHover: {
    team: '',
    office: ''
  },
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

  getStandardSourceFileName(index, row = {}) {
    const sourceFiles = [
      '保定市聚昊商贸有限公司-S0091005.xlsx',
      '多客隆购物中心(会盟大街)-S0219489-12月.XLS',
      '邯郸市格耀商贸有限公司-F0807952.xls',
      '韩百 (韩百商场)S1018566.xlsx',
      '家得乐 (新民友谊商城)S0210780.xls',
      '其他-12月 POS.xls',
      '其他-F0514986-家家乐超市（大市场）12月 POS.xls',
      '其他-F0714211-利好果蔬生活广场（鞍山腾鳌店）12月 POS.xlsx',
      '其他-F0775134-台安家得乐超市 12月 POS.XLS',
      '其他-F0872160-利好生活广场（太和）12月 POS.xlsx',
      '其他-F0888730-中心城大卖场（金鼎）12月 POS.xls',
      'F0515524 欧亚长青城（浑南中路）.xls.xls',
      'F0528553 维多利（赤峰松山万达）-12月.xlsx',
      'F0582802-煊超市邻里中心店（乐桃路）.xlsx',
      'F0696540-好乐福超市（177县道）(2).xls',
      'F0779616-家乐惠超市（宁县早胜店）.xlsx',
      'S0074170 四海一家生活超市(南方花园).xls',
      'S0280536-新世纪商厦（崇信县）.xls',
      'S0282108 旺鲜生八佰伴店 12月.xlsx',
      'S0328228-益尚客（太阳城）-12月 POS.xlsx'
    ];
    return sourceFiles[index] || `${row.storeName || '原始门店'}-${row.storeCode || index + 1}.xlsx`;
  },

  getStandardSourceTime(index) {
    const totalMinutes = 22 * 60 + 15 + (Number(index) || 0) * 3;
    const hour = String(Math.floor(totalMinutes / 60) % 24).padStart(2, '0');
    const minute = String(totalMinutes % 60).padStart(2, '0');
    return `2026-05-20 ${hour}:${minute}:00`;
  },
  
  async loadData() {
    try {
      const res = await fetch('data/qa_conflicts_mock.json?v=20260611-qa-exception-reject-stash');
      this.data = await res.json();
      this.renderTable();
    } catch (e) {
      console.error('Failed to load QA data', e);
    }
  },
  
  renderAction() {
    return '';
  },

  getConfidenceSummary() {
    const total = this.standardData.length;
    const passed = this.standardData.filter((row) => Number.parseFloat(row.confidence) > 95).length;
    const rate = total > 0 ? Math.round((passed / total) * 1000) / 10 : 0;
    return { total, passed, rate: Number.isInteger(rate) ? rate.toFixed(0) : rate.toFixed(1) };
  },

  getRegionCollectionStats() {
    const items = [
      { region: '华北区域', passed: 18, rejected: 2, target: 50 },
      { region: '东北区域', passed: 14, rejected: 2, target: 35 },
      { region: '华东区域', passed: 16, rejected: 2, target: 45 },
      { region: '华中区域', passed: 11, rejected: 1, target: 30 },
      { region: '华南区域', passed: 9, rejected: 1, target: 25 },
      { region: '西北区域', passed: 8, rejected: 1, target: 20 }
    ];
    return items.map(({ region, passed, rejected, target }) => {
      const collected = passed + rejected;
      const collectedRate = Math.round((collected / target) * 100);
      const passedRate = Math.round((passed / target) * 100);
      const rejectedRate = Math.round((rejected / target) * 100);
      return { region, passed, rejected, target, collectedRate, passedRate, rejectedRate };
    });
  },

  renderQaStatsPanel() {
    const regionStats = this.getRegionCollectionStats();
    const confidenceStats = { rate: 90, passed: 18, total: 20 };
    return `
      <div class="grid grid-cols-1 xl:grid-cols-[1.6fr_0.7fr] gap-3 mb-3 animate-[fadeIn_0.4s_ease-out]">
        <section class="bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white px-4 py-3">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center min-w-0">
              <h3 class="text-sm font-bold text-[#1d2129] whitespace-nowrap">各区域门店数据校验量</h3>
            </div>
            <div class="w-8 h-8 rounded-lg bg-blue-50 text-brand flex items-center justify-center">
              <i class="fa-solid fa-chart-column"></i>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-2">
            ${regionStats.map((item) => `
              <div class="rounded-lg border border-gray-100 bg-[#f7f9fc] px-3 py-2">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-semibold text-[#1d2129]">${item.region}</span>
                  <span class="text-[11px] font-bold text-brand">${item.collectedRate}%</span>
                </div>
                <div class="flex items-baseline gap-1.5 whitespace-nowrap">
                  <span class="text-xs text-[#86909c]">通过</span>
                  <span class="text-sm font-black text-brand">${item.passed}</span>
                  <span class="text-xs text-[#86909c]">/ 异常</span>
                  <span class="text-sm font-black text-red-500">${item.rejected}</span>
                  <span class="text-xs text-[#86909c]">/ 应收${item.target}</span>
                </div>
                <div class="mt-1.5 h-1.5 rounded-full bg-gray-100 overflow-hidden flex">
                  <div class="h-full bg-brand" style="width: ${item.passedRate}%"></div>
                  <div class="h-full bg-red-500" style="width: ${item.rejectedRate}%"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
        <section class="bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white px-4 py-3 flex flex-col justify-between">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-sm font-bold text-[#1d2129]">置信度通过率</h3>
              <p class="text-[11px] text-[#86909c] mt-0.5">通过文件 / 全部文件</p>
            </div>
            <div class="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <i class="fa-solid fa-shield-check"></i>
            </div>
          </div>
          <div class="mt-2 flex flex-1 items-center justify-between gap-4">
            <div class="min-w-0">
              <div class="text-[34px] leading-none font-black text-brand">${confidenceStats.rate}%</div>
              <div class="mt-5 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs text-[#4e5969]">
                <span class="font-bold text-[#1d2129]">${confidenceStats.passed}</span>
                <span class="text-[#86909c]">/ ${confidenceStats.total} 文件</span>
              </div>
            </div>
            <div class="relative w-[72px] h-[72px] rounded-full flex items-center justify-center shrink-0"
              style="background: conic-gradient(#165dff ${confidenceStats.rate * 3.6}deg, #e8f0ff 0deg);">
              <div class="w-12 h-12 rounded-full bg-white shadow-inner flex items-center justify-center text-sm font-bold text-brand">${confidenceStats.rate}%</div>
            </div>
          </div>
          <div class="mt-2 h-2 rounded-full bg-blue-100 overflow-hidden">
            <div class="h-full rounded-full bg-brand" style="width: ${confidenceStats.rate}%"></div>
          </div>
        </section>
      </div>
    `;
  },

  getHierarchyOptions(context = {}) {
    const activeTeam = context.team || this.hierarchyHover.team || '';
    const activeOffice = context.office || this.hierarchyHover.office || '';
    const rowsForOffices = activeTeam
      ? this.standardData.filter((row) => row.salesTeam === activeTeam)
      : [];
    const rowsForDealers = activeOffice
      ? rowsForOffices.filter((row) => row.salesOffice === activeOffice)
      : [];
    return {
      teams: [...new Set(this.standardData.map((row) => row.salesTeam))],
      offices: [...new Set(rowsForOffices.map((row) => row.salesOffice))],
      dealers: [...new Set(rowsForDealers.map((row) => row.dealer))],
      activeTeam,
      activeOffice
    };
  },

  renderHierarchyCheckboxGroup(title, items, selected, className, emptyText, activeValue = '') {
    const itemHtml = items.length > 0
      ? items.map((item) => `
          <label class="flex items-center gap-2 px-2 py-1.5 hover:bg-blue-50 ${activeValue === item ? 'bg-blue-50 text-brand' : ''} rounded cursor-pointer transition-colors" data-cascade-value="${item}">
            <input type="checkbox" value="${item}" class="${className} rounded border-gray-300 text-brand focus:ring-brand" ${selected.includes(item) ? 'checked' : ''}>
            <span class="text-sm text-[#4e5969] truncate" title="${item}">${item}</span>
          </label>
        `).join('')
      : `<div class="px-2 py-6 text-center text-xs text-[#86909c]">${emptyText}</div>`;

    return `
      <div class="min-w-0">
        <div class="mb-2 flex items-center justify-between px-2">
          <span class="text-xs font-semibold text-[#1d2129]">${title}</span>
          <span class="text-[11px] text-[#86909c]">${selected.length ? `已选 ${selected.length}` : '全部'}</span>
        </div>
        <div class="max-h-64 overflow-auto rounded-lg border border-gray-100 bg-gray-50/50 p-1">
          ${itemHtml}
        </div>
      </div>
    `;
  },

  renderHierarchyDropdownContent() {
    const options = this.getHierarchyOptions();
    const columns = 1 + (options.activeTeam ? 1 : 0) + (options.activeOffice ? 1 : 0);
    return `
      <div class="grid gap-3" style="grid-template-columns: repeat(${columns}, minmax(210px, 1fr));">
        ${this.renderHierarchyCheckboxGroup('一级：营业Team', options.teams, this.hierarchyFilter.teams, 'qa-team-checkbox', '暂无营业Team', options.activeTeam)}
        ${options.activeTeam ? this.renderHierarchyCheckboxGroup('二级：营业所', options.offices, this.hierarchyFilter.offices, 'qa-office-checkbox', '暂无营业所', options.activeOffice) : ''}
        ${options.activeOffice ? this.renderHierarchyCheckboxGroup('三级：经销商', options.dealers, this.hierarchyFilter.dealers, 'qa-dealer-checkbox', '暂无经销商') : ''}
      </div>
    `;
  },

  pruneHierarchyFilter() {
    const options = this.getHierarchyOptions();
    this.hierarchyFilter.offices = this.hierarchyFilter.offices.filter((office) => options.offices.includes(office));
    const dealerOptions = this.getHierarchyOptions().dealers;
    this.hierarchyFilter.dealers = this.hierarchyFilter.dealers.filter((dealer) => dealerOptions.includes(dealer));
  },
  
  render() {
    this.loadData();
    const confidenceSummary = this.getConfidenceSummary();
    return `
      <div>
      <div class="bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white flex flex-col h-[calc(100vh-170px)] min-h-[620px] overflow-hidden animate-[fadeIn_0.4s_ease-out]">
        <div class="px-7 py-4 border-b border-gray-100 flex gap-2 bg-white shrink-0">
          <button type="button" id="tab-qa-standard" class="px-4 py-2 text-sm font-medium text-brand bg-blue-50 rounded-lg transition-all border border-blue-200">
            标准POS表
          </button>
          <button type="button" id="tab-qa-exception" class="px-4 py-2 text-sm text-[#86909c] hover:text-[#1d2129] hover:bg-gray-50 rounded-lg transition-all border border-transparent">
            异常数据
          </button>
        </div>
        <div class="px-7 py-4 border-b border-gray-100 bg-white shrink-0">
          <div class="flex items-center gap-4 flex-wrap">
            <div id="qa-search-combo-wrapper" class="relative flex h-10 w-[360px] items-center rounded-lg border border-gray-200 bg-white transition-all focus-within:border-brand">
              <button type="button" id="qa-search-field-btn"
                class="flex h-full w-36 shrink-0 items-center justify-between gap-2 border-r border-gray-100 px-3 text-left text-sm text-[#4e5969] hover:bg-gray-50 rounded-l-lg"
                title="${this.getQaSearchFieldLabel()}">
                <span id="qa-search-field-label" class="truncate">${this.getQaSearchFieldLabel()}</span>
                <i class="fa-solid fa-chevron-down text-[10px] text-[#86909c]"></i>
              </button>
              <div class="relative min-w-0 flex-1">
                <input type="text" id="qa-filter-filename" placeholder="搜索"
                  class="h-10 w-full border-0 bg-transparent pl-9 pr-10 text-sm text-[#4e5969] focus:outline-none">
                <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[#86909c]"></i>
              </div>
              <div id="qa-search-field-dropdown" class="hidden absolute top-full left-0 mt-1 w-48 rounded-lg border border-gray-200 bg-white p-2 shadow-lg z-50"></div>
            </div>
            <div class="flex items-center gap-4" id="qa-hierarchy-block">
            <span class="text-sm font-medium text-[#4e5969]" id="qa-team-label">组织架构</span>
            <div class="relative" id="qa-team-select-wrapper">
              <button type="button" id="qa-team-select-btn"
                class="px-4 py-2 w-40 border border-gray-200 rounded-lg text-sm text-[#4e5969] bg-white text-left flex items-center justify-between gap-2 focus:outline-none focus:border-brand transition-all">
                <span id="qa-team-select-label">全部 Team</span>
                <i class="fa-solid fa-chevron-down text-xs"></i>
              </button>
              <div id="qa-team-dropdown" class="hidden absolute top-full left-0 mt-1 min-w-[240px] w-max max-w-[720px] bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-3">
                ${this.renderHierarchyDropdownContent()}
              </div>
            </div>
            </div>
            <span class="text-sm font-medium text-[#4e5969]" id="qa-confidence-label-group">置信度</span>
            <div class="relative" id="qa-confidence-select-wrapper">
              <button type="button" id="qa-confidence-select-btn"
                class="px-4 py-2 w-36 border border-gray-200 rounded-lg text-sm text-[#4e5969] bg-white text-left flex items-center justify-between gap-2 focus:outline-none focus:border-brand transition-all">
                <span id="qa-confidence-select-label">全部</span>
                <i class="fa-solid fa-chevron-down text-xs"></i>
              </button>
              <div id="qa-confidence-dropdown" class="hidden absolute top-full left-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2">
                <button type="button" class="qa-confidence-option w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded text-sm text-[#4e5969]" data-value="">全部</button>
                <button type="button" class="qa-confidence-option w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded text-sm text-[#4e5969]" data-value="high">高</button>
                <button type="button" class="qa-confidence-option w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded text-sm text-[#4e5969]" data-value="medium">中</button>
                <button type="button" class="qa-confidence-option w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded text-sm text-[#4e5969]" data-value="low">低</button>
              </div>
            </div>
            <span class="text-sm font-medium text-[#4e5969]" id="qa-standard-status-label-group">状态</span>
            <div class="relative" id="qa-standard-status-select-wrapper">
              <button type="button" id="qa-standard-status-select-btn"
                class="px-4 py-2 w-36 border border-gray-200 rounded-lg text-sm text-[#4e5969] bg-white text-left flex items-center justify-between gap-2 focus:outline-none focus:border-brand transition-all">
                <span id="qa-standard-status-select-label">全部</span>
                <i class="fa-solid fa-chevron-down text-xs"></i>
              </button>
              <div id="qa-standard-status-dropdown" class="hidden absolute top-full left-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2">
                <button type="button" class="qa-standard-status-option w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded text-sm text-[#4e5969]" data-value="">全部</button>
                <button type="button" class="qa-standard-status-option w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded text-sm text-[#4e5969]" data-value="待通过">待通过</button>
                <button type="button" class="qa-standard-status-option w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded text-sm text-[#4e5969]" data-value="已通过">已通过</button>
              </div>
            </div>
            <span class="text-sm font-medium text-[#4e5969] hidden" id="qa-exception-type-label-group">异常类型</span>
            <div class="relative hidden" id="qa-exception-type-select-wrapper">
              <button type="button" id="qa-exception-type-select-btn"
                class="px-4 py-2 w-36 border border-gray-200 rounded-lg text-sm text-[#4e5969] bg-white text-left flex items-center justify-between gap-2 focus:outline-none focus:border-brand transition-all">
                <span id="qa-exception-type-select-label">全部</span>
                <i class="fa-solid fa-chevron-down text-xs"></i>
              </button>
              <div id="qa-exception-type-dropdown" class="hidden absolute top-full left-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2">
                <button type="button" class="qa-exception-type-option w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded text-sm text-[#4e5969]" data-value="">全部</button>
                <button type="button" class="qa-exception-type-option w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded text-sm text-[#4e5969]" data-value="字段级">字段级</button>
                <button type="button" class="qa-exception-type-option w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded text-sm text-[#4e5969]" data-value="数据级">数据级</button>
                <button type="button" class="qa-exception-type-option w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded text-sm text-[#4e5969]" data-value="产品级">产品级</button>
              </div>
            </div>
            <span class="text-sm font-medium text-[#4e5969] hidden" id="qa-status-label-group">状态</span>
            <div class="relative hidden" id="qa-status-select-wrapper">
              <button type="button" id="qa-status-select-btn"
                class="px-4 py-2 w-44 border border-gray-200 rounded-lg text-sm text-[#4e5969] bg-white text-left flex items-center justify-between gap-2 focus:outline-none focus:border-brand transition-all">
                <span id="qa-status-select-label">全部</span>
                <i class="fa-solid fa-chevron-down text-xs"></i>
              </button>
              <div id="qa-status-dropdown" class="hidden absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-2">
                <button type="button" class="qa-status-option w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded text-sm text-[#4e5969]" data-value="">全部</button>
                ${this.exceptionStatusOptions.map((status) => `
                  <button type="button" class="qa-status-option w-full text-left px-2 py-1.5 hover:bg-gray-50 rounded text-sm text-[#4e5969]" data-value="${status}">${status}</button>
                `).join('')}
              </div>
            </div>
            <button type="button" id="qa-btn-search"
              class="px-4 py-2 bg-brand hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm shadow-brand/20 hover:shadow-brand/30 hover:-translate-y-0.5">
              <i class="fa-solid fa-magnifying-glass mr-1"></i>检索
            </button>
            <button type="button" id="qa-btn-reset-filter"
              class="px-4 py-2 text-sm text-[#86909c] hover:text-[#1d2129] hover:bg-gray-50 rounded-lg transition-all">
              <i class="fa-solid fa-rotate-left mr-1"></i>重置筛选
            </button>
            <div class="ml-auto flex items-center gap-2">
              <button type="button" id="qa-btn-batch-approve" disabled
                class="px-4 py-2 bg-[#86909c] text-white rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                <i class="fa-solid fa-check mr-1"></i>通过
              </button>
              <button type="button" id="qa-standard-display-toggle"
                class="w-10 h-10 rounded-lg border border-blue-100 bg-blue-50 text-brand hover:bg-blue-100 hover:border-blue-200 transition-all flex items-center justify-center"
                title="${this.standardDisplayMode === 'table' ? '表格' : '明细数据'}"
                aria-label="${this.standardDisplayMode === 'table' ? '当前为表格展示，点击切换为明细数据' : '当前为明细数据展示，点击切换为表格'}">
                <i id="qa-standard-display-toggle-icon" class="fa-solid ${this.standardDisplayMode === 'table' ? 'fa-table-cells-large' : 'fa-list-ul'}"></i>
              </button>
              <button type="button" id="qa-exception-display-toggle"
                class="hidden w-10 h-10 rounded-lg border border-blue-100 bg-blue-50 text-brand hover:bg-blue-100 hover:border-blue-200 transition-all flex items-center justify-center"
                title="${this.exceptionDisplayMode === 'detail' ? '明细数据' : '文件数据'}"
                aria-label="${this.exceptionDisplayMode === 'detail' ? '当前为明细数据展示，点击切换为文件数据' : '当前为文件数据展示，点击切换为明细数据'}">
                <i id="qa-exception-display-toggle-icon" class="fa-solid ${this.exceptionDisplayMode === 'detail' ? 'fa-list-ul' : 'fa-table-cells-large'}"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="flex-1 min-h-0 flex flex-col px-2" id="qa-standard-container"></div>
        <div class="flex flex-1 min-h-0 flex-col px-2 hidden" id="qa-exception-container"></div>
      </div>
    `;
  },
  
  renderTable() {
    this.renderStandardTable();
    this.renderExceptionTable();
  },

  renderQaTableSummary(count) {
    return `
      <div class="flex h-10 shrink-0 items-center justify-end border-t border-gray-100 bg-white px-5 text-xs text-[#86909c]">
        共 ${count} 条数据
      </div>
    `;
  },

  getHeadquarter(row = {}) {
    if (row.headquarters) return row.headquarters;
    if (row.region) return row.region.replace('区域', '本部');
    if (row.salesTeam) return row.salesTeam.replace(/\s*Team$/, '本部');
    return '';
  },

  normalizeHeadquarterToTeam(headquarters = '') {
    return headquarters ? headquarters.replace('本部', ' Team') : '';
  },

  normalizeHeadquarterToRegion(headquarters = '') {
    return headquarters ? headquarters.replace('本部', '区域') : '';
  },

  getQaAccOptions() {
    return ['其它', '北京物美', '怀化佳惠', '南阳万德隆', '新玛特'];
  },

  getQaAccName(row = {}, index = 0) {
    const source = String(row?.acc || '').trim();
    const options = this.getQaAccOptions();
    if (source && source !== '-') {
      if (source === '其他') return '其它';
      const codeMatch = source.match(/^ACC-(\d+)$/i);
      if (codeMatch) {
        const numeric = Number.parseInt(codeMatch[1], 10);
        return options[Math.max(0, numeric - 100) % options.length];
      }
      if (['华北', '东北', '华东', '华中', '华南', '西北', '西南'].includes(source)) {
        return options[Math.abs(source.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)) % options.length];
      }
      return source;
    }
    const seed = `${row?.storeCode || ''}${row?.storeName || ''}${row?.region || ''}`;
    const hashed = seed
      ? seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
      : index;
    return options[Math.abs(hashed) % options.length];
  },

  getOrganizationRows() {
    const matchedExceptionRows = this.data.map((row) => {
      const matched = this.standardData.find((item) => item.storeCode === row.storeCode || item.storeName === row.storeName) || {};
      return {
        ...row,
        headquarters: this.getHeadquarter(matched) || this.getHeadquarter(row),
        salesOffice: matched.salesOffice || row.salesOffice,
        dealer: matched.dealer || row.dealer
      };
    });
    return [...this.standardData, ...matchedExceptionRows].filter(row => this.getHeadquarter(row) || row.salesOffice || row.dealer);
  },

  getInlineEditOptions(field, context = {}) {
    const fromStandard = (key) => [...new Set(this.standardData.map(row => row[key]).filter(Boolean))];
    const fromException = (key) => [...new Set(this.data.map(row => row[key]).filter(Boolean))];
    const orgRows = this.getOrganizationRows();
    const selectedHeadquarter = context.headquarters || '';
    const selectedOffice = context.salesOffice || '';
    const officeRows = selectedHeadquarter
      ? orgRows.filter((row) => this.getHeadquarter(row) === selectedHeadquarter)
      : orgRows;
    const dealerRows = selectedOffice
      ? orgRows.filter((row) => row.salesOffice === selectedOffice)
      : officeRows;
    const options = {
      acc: [...this.getQaAccOptions(), ...fromException('acc')],
      conflictType: ['产品级', '字段级', '数据级'],
      mainConflictType: ['产品级', '字段级', '数据级'],
      headquarters: orgRows.map((row) => this.getHeadquarter(row)).filter(Boolean),
      salesTeam: fromStandard('salesTeam'),
      region: fromStandard('region'),
      salesOffice: officeRows.map((row) => row.salesOffice).filter(Boolean),
      dealer: dealerRows.map((row) => row.dealer).filter(Boolean),
      workflowStatus: this.exceptionStatusOptions
    };
    return [...new Set(options[field] || [])];
  },

  renderEditableText(value, className = '', title = '') {
    const safeValue = value || '-';
    const titleAttr = title || safeValue;
    return `<span class="qa-inline-display ${className}" title="${titleAttr}">${safeValue}</span>`;
  },

  escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  renderStorePreviewTrigger(scope, value, index = '', id = '') {
    const safeValue = this.escapeHtml(value || '-');
    if (scope === 'exception') {
      return `<button type="button" class="qa-exception-preview-trigger max-w-full truncate text-brand hover:text-blue-700 hover:underline transition-colors text-left font-medium" data-id="${this.escapeHtml(id)}" title="预览 ${safeValue}">${safeValue}</button>`;
    }
    return `<button type="button" class="qa-standard-preview-trigger max-w-full truncate text-brand hover:text-blue-700 hover:underline transition-colors text-left font-medium" data-index="${this.escapeHtml(index)}" title="预览 ${safeValue}">${safeValue}</button>`;
  },

  renderQaActionButtons({ scope, index = '', id = '', row = null, hideDetail = false } = {}) {
    const safeScope = this.escapeHtml(scope || '');
    const safeIndex = this.escapeHtml(index);
    const safeId = this.escapeHtml(id);
    if (scope === 'exception') {
      const actions = this.getExceptionActions(row || this.data.find((item) => item.id === id) || {});
      return `
        <div class="flex items-center gap-1">
          ${hideDetail ? '' : `
            <button type="button" class="qa-exception-document-detail-trigger px-2 py-1 text-xs rounded text-brand hover:bg-blue-50" data-id="${safeId}" title="单据详情">
              <i class="fa-solid fa-list-check"></i>
            </button>
          `}
          ${actions.canEdit ? `
            <button type="button" class="qa-inline-edit-trigger px-2 py-1 text-xs rounded text-amber-500 hover:bg-amber-50" data-scope="${safeScope}" data-id="${safeId}" title="编辑">
              <i class="fa-regular fa-pen-to-square"></i>
            </button>
          ` : ''}
          ${actions.buttons.map((button) => `
            <button type="button" class="px-2 py-1 text-xs rounded action-btn ${button.className}" data-action="${button.action}" data-id="${safeId}" title="${button.title}" ${button.disabled ? 'disabled' : ''}>
              <i class="${button.icon}"></i>
            </button>
          `).join('')}
        </div>
      `;
    }
    return `
      <div class="flex items-center gap-1">
        <button type="button" class="qa-standard-detail-trigger px-2 py-1 text-xs rounded text-brand hover:bg-blue-50" data-index="${safeIndex}" title="详情">
          <i class="fa-solid fa-list-check"></i>
        </button>
        <button type="button" class="qa-inline-edit-trigger px-2 py-1 text-xs rounded text-amber-500 hover:bg-amber-50" data-scope="${safeScope}" data-index="${safeIndex}" title="编辑">
          <i class="fa-regular fa-pen-to-square"></i>
        </button>
        <button type="button" class="px-2 py-1 text-xs rounded text-red-500 hover:bg-red-50" title="删除">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>
    `;
  },

  getInlineEditContext(row) {
    const valueFor = (field) => {
      const cell = row.querySelector(`[data-edit-field="${field}"]`);
      return (cell?.dataset.editValue || cell?.textContent || '').replace(/^￥/, '').trim();
    };
    return {
      headquarters: valueFor('headquarters'),
      salesOffice: valueFor('salesOffice'),
      dealer: valueFor('dealer')
    };
  },

  renderInlineSelectOptions(options, value, placeholder = '') {
    const items = placeholder
      ? [`<option value="" ${value ? '' : 'selected'}>${placeholder}</option>`]
      : [];
    return items.concat(options.map(option => `<option value="${this.escapeHtml(option)}" ${option === value ? 'selected' : ''}>${this.escapeHtml(option)}</option>`)).join('');
  },

  renderQaEditableCell(field, value, className = '', title = '') {
    const rawValue = value || '';
    const displayValue = ['amount', 'cost', 'retailPrice'].includes(field) && rawValue && rawValue !== '-' && !String(rawValue).startsWith('￥')
      ? `￥${rawValue}`
      : rawValue;
    return `<td class="${className}" data-edit-field="${field}" data-edit-value="${rawValue}">${this.renderEditableText(displayValue, '', title || displayValue)}</td>`;
  },

  enterQaInlineEdit(button) {
    const row = button.closest('tr');
    if (!row || row.dataset.editing === 'true') return;
    row.dataset.editing = 'true';
    const originalHtml = row.innerHTML;
    const allowedDocumentFields = new Set(['storeName', 'storeCode', 'dealer']);
    const editableCells = Array.from(row.querySelectorAll('[data-edit-field]'))
      .filter(cell => allowedDocumentFields.has(cell.dataset.editField));
    const actionCell = button.closest('td');
    const editContext = this.getInlineEditContext(row);

    editableCells.forEach((cell) => {
      const field = cell.dataset.editField;
      const rawValue = (cell.dataset.editValue || cell.textContent || '').replace(/^￥/, '').trim();
      const options = this.getInlineEditOptions(field, editContext);
      if (options.length > 0) {
        const placeholder = field === 'salesOffice' ? '请选择营业所' : field === 'dealer' ? '请选择经销商' : '';
        cell.innerHTML = `
          <select class="qa-inline-input w-full rounded-lg border border-blue-100 bg-white px-2 py-1 text-sm text-[#1d2129] outline-none focus:border-brand" data-field="${field}">
            ${this.renderInlineSelectOptions(options, rawValue === '-' ? '' : rawValue, placeholder)}
          </select>
        `;
      } else if (field === 'aiJudgment') {
        cell.innerHTML = `<textarea rows="2" class="qa-inline-input w-full min-w-[220px] rounded-lg border border-blue-100 bg-white px-2 py-1 text-sm leading-5 text-[#1d2129] outline-none focus:border-brand resize-none" data-field="${field}">${rawValue === '-' ? '' : rawValue}</textarea>`;
      } else if (field === 'yearMonth') {
        cell.innerHTML = `<input type="month" class="qa-inline-input w-full rounded-lg border border-blue-100 bg-white px-2 py-1 text-sm text-[#1d2129] outline-none focus:border-brand" data-field="${field}" value="${rawValue === '-' ? '' : rawValue}">`;
      } else if (['quantity', 'amount', 'cost', 'retailPrice', 'exceptionCount'].includes(field)) {
        cell.innerHTML = `<input type="number" step="0.01" class="qa-inline-input w-full rounded-lg border border-blue-100 bg-white px-2 py-1 text-sm text-[#1d2129] outline-none focus:border-brand" data-field="${field}" value="${rawValue === '-' ? '' : rawValue}">`;
      } else {
        cell.innerHTML = `<input class="qa-inline-input w-full rounded-lg border border-blue-100 bg-white px-2 py-1 text-sm text-[#1d2129] outline-none focus:border-brand" data-field="${field}" value="${rawValue === '-' ? '' : rawValue}">`;
      }
    });

    const refreshOrgSelect = (field, options, placeholder) => {
      const select = row.querySelector(`.qa-inline-input[data-field="${field}"]`);
      if (!select) return;
      select.innerHTML = this.renderInlineSelectOptions(options, '', placeholder);
    };
    row.querySelector('.qa-inline-input[data-field="headquarters"]')?.addEventListener('change', (event) => {
      refreshOrgSelect('salesOffice', this.getInlineEditOptions('salesOffice', { headquarters: event.target.value }), '请选择营业所');
      refreshOrgSelect('dealer', [], '请选择经销商');
    });
    row.querySelector('.qa-inline-input[data-field="salesOffice"]')?.addEventListener('change', (event) => {
      const headquarters = row.querySelector('.qa-inline-input[data-field="headquarters"]')?.value || editContext.headquarters;
      refreshOrgSelect('dealer', this.getInlineEditOptions('dealer', { headquarters, salesOffice: event.target.value }), '请选择经销商');
    });

    if (actionCell) {
      actionCell.innerHTML = `
        <div class="flex items-center gap-1">
          <button type="button" class="qa-inline-save px-2 py-1 text-xs rounded text-green-600 hover:bg-green-50" title="保存">
            <i class="fa-solid fa-check"></i>
          </button>
          <button type="button" class="qa-inline-cancel px-2 py-1 text-xs rounded text-[#86909c] hover:bg-gray-50" title="取消">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      `;
      actionCell.querySelector('.qa-inline-cancel')?.addEventListener('click', () => {
        row.innerHTML = originalHtml;
        row.dataset.editing = 'false';
        this.bindStandardPreviewEvents();
        this.bindExceptionEvents();
        this.bindQaInlineEditEvents();
      });
      actionCell.querySelector('.qa-inline-save')?.addEventListener('click', () => {
        const values = {};
        row.querySelectorAll('.qa-inline-input').forEach(input => {
          values[input.dataset.field] = input.value.trim();
        });
        if (values.headquarters !== undefined && !values.salesOffice) {
          if (typeof Dialog !== 'undefined') Dialog.toast('请选择营业所', 'warning');
          return;
        }
        if (values.salesOffice !== undefined && !values.dealer) {
          if (typeof Dialog !== 'undefined') Dialog.toast('请选择经销商', 'warning');
          return;
        }
        editableCells.forEach((cell) => {
          const field = cell.dataset.editField;
          const value = values[field] || '-';
          cell.dataset.editValue = value;
          const displayValue = ['amount', 'cost', 'retailPrice'].includes(field) && value !== '-' && !String(value).startsWith('￥') ? `￥${value}` : value;
          cell.innerHTML = field === 'storeName'
            ? this.renderStorePreviewTrigger(button.dataset.scope, value, button.dataset.index, button.dataset.id)
            : this.renderEditableText(displayValue, 'qa-inline-display', displayValue);
        });
        if (button.dataset.scope === 'exception') {
          const target = this.data.find(item => item.id === button.dataset.id);
          if (target) {
            const relatedRows = this.data.filter(item => item.id === target.id || (target.storeCode && item.storeCode === target.storeCode));
            Object.entries(values).forEach(([field, value]) => {
              relatedRows.forEach((item) => {
                if (field === 'yearMonth') item.yearMonth = value;
                else if (field === 'workflowStatus') item.workflowStatus = value;
                else if (field === 'mainConflictType') item.conflictType = value;
                else if (field === 'headquarters') {
                  item.headquarters = value;
                  item.salesTeam = this.normalizeHeadquarterToTeam(value);
                  item.region = this.normalizeHeadquarterToRegion(value);
                }
                else item[field] = value;
              });
            });
          }
          row.dataset.editing = 'false';
          if (typeof Dialog !== 'undefined') Dialog.toast('已保存当前行', 'success');
          this.renderExceptionTable();
          return;
        } else if (button.dataset.scope === 'standard') {
          const target = this.standardData[Number(button.dataset.index)];
          if (target) {
            ['acc', 'dealer', 'storeCode', 'storeName', 'headquarters', 'salesOffice'].forEach(field => {
              if (values[field] !== undefined) target[field] = values[field];
            });
            if (values.headquarters !== undefined) {
              target.salesTeam = this.normalizeHeadquarterToTeam(values.headquarters);
              target.region = this.normalizeHeadquarterToRegion(values.headquarters);
            }
          }
        }
        row.dataset.editing = 'false';
        if (actionCell) {
          const targetRow = button.dataset.scope === 'exception' ? this.data.find(item => item.id === button.dataset.id) : null;
          actionCell.innerHTML = this.renderQaActionButtons({
            scope: button.dataset.scope || '',
            index: button.dataset.index || '',
            id: button.dataset.id || '',
            row: targetRow,
            hideDetail: button.dataset.scope === 'exception' && this.exceptionDisplayMode === 'detail'
          });
        }
        if (typeof Dialog !== 'undefined') Dialog.toast('已保存当前行', 'success');
        this.bindStandardPreviewEvents();
        this.bindExceptionEvents();
        this.bindQaInlineEditEvents();
      });
    }
  },

  bindQaInlineEditEvents() {
    document.querySelectorAll('.qa-inline-edit-trigger').forEach((button) => {
      if (button.dataset.boundInlineEdit === 'true') return;
      button.dataset.boundInlineEdit = 'true';
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        this.enterQaInlineEdit(button);
      });
    });
  },

  getQaSearchFieldOptions() {
    return [
      { value: 'all', label: '全部' },
      { value: 'acc', label: 'ACC' },
      { value: 'storeName', label: '门店名称' },
      { value: 'storeCode', label: '门店编码' },
      { value: 'dealer', label: '经销商' }
    ];
  },

  getQaSearchFieldLabel(value = this.searchField) {
    return this.getQaSearchFieldOptions().find(option => option.value === value)?.label || '全部';
  },

  getQaSearchValue(row = {}, field = this.searchField) {
    const values = {
      acc: this.getQaAccName(row),
      storeName: row.storeName || '',
      storeCode: row.storeCode || '',
      dealer: row.dealer || ''
    };
    return values[field] || '';
  },

  matchesQaSearch(row = {}) {
    const keyword = (this.searchKeyword || '').trim().toLowerCase();
    if (!keyword) return true;
    if (this.searchField === 'all') {
      return ['acc', 'storeName', 'storeCode', 'dealer']
        .some(field => String(this.getQaSearchValue(row, field)).toLowerCase().includes(keyword));
    }
    return String(this.getQaSearchValue(row, this.searchField)).toLowerCase().includes(keyword);
  },

  renderQaSearchFieldDropdown() {
    const dropdown = document.getElementById('qa-search-field-dropdown');
    if (!dropdown) return;
    dropdown.innerHTML = this.getQaSearchFieldOptions().map(option => `
      <button type="button" data-qa-search-field="${option.value}"
        class="qa-search-field-option w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${this.searchField === option.value ? 'bg-blue-50 text-brand font-medium' : 'text-[#4e5969] hover:bg-gray-50'}"
        title="${option.label}">
        ${option.label}
      </button>
    `).join('');
  },

  syncQaSearchControlUI() {
    const label = document.getElementById('qa-search-field-label');
    const button = document.getElementById('qa-search-field-btn');
    const input = document.getElementById('qa-filter-filename');
    const fieldLabel = this.getQaSearchFieldLabel();
    if (label) label.textContent = fieldLabel;
    if (button) button.title = fieldLabel;
    if (input) input.value = this.searchKeyword || '';
    this.renderQaSearchFieldDropdown();
  },

  renderStandardTable() {
    const container = document.getElementById('qa-standard-container');
    if (!container) return;
    const rows = this.getFilteredStandardData();
    const modeClass = 'animate-[fadeIn_0.22s_ease-out]';

    if (this.standardDisplayMode === 'detail') {
      const detailRows = rows.flatMap(({ row, index }) =>
        this.getStandardPreviewRows(row).map((detail, detailIndex) => ({
          ...detail,
          sourceIndex: index,
          detailIndex,
          aiNote: row.aiNote,
          changedFields: this.getAiChangedFields(row)
        }))
      );
      container.innerHTML = `
        <div class="${modeClass} flex min-h-0 flex-1 flex-col">
          <div class="min-h-0 flex-1 overflow-auto">
          <table class="w-full table-fixed min-w-[1560px] text-left text-sm text-[#4e5969]">
            <thead class="bg-[#f7f8fa] text-[#1d2129] font-medium sticky top-0 z-10">
              <tr>
                <th class="px-4 py-3 w-12 rounded-tl-lg">
                  <input type="checkbox" id="qa-standard-select-all" class="rounded border-gray-300 text-brand focus:ring-brand">
                </th>
                <th class="px-4 py-3 w-24">年月</th>
                <th class="px-4 py-3 w-20">ACC</th>
                <th class="px-4 py-3 w-36">经销商</th>
                <th class="px-4 py-3 w-36">门店编码</th>
                <th class="px-4 py-3 w-52">门店名称</th>
                <th class="px-4 py-3 w-36">69码</th>
                <th class="px-4 py-3 w-56">产品名称</th>
                <th class="px-4 py-3 w-24">销售数量</th>
                <th class="px-4 py-3 w-24">销售金额</th>
                <th class="px-4 py-3 w-24">销售成本</th>
                <th class="px-4 py-3 w-20">零售价</th>
                <th class="px-4 py-3 w-24">状态</th>
                <th class="px-4 py-3 w-64">AI判断</th>
                <th class="px-4 py-3 w-24 rounded-tr-lg">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              ${detailRows.length === 0 ? `
                <tr>
                  <td colspan="15" class="px-4 py-16 text-center text-[#86909c]">
                    <i class="fa-regular fa-folder-open text-3xl mb-3 block text-gray-300"></i>
                    暂无符合条件的明细数据
                  </td>
                </tr>
              ` : detailRows.map((item) => `
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-4 py-3">
                    <input type="checkbox" class="row-cb-qa-standard rounded border-gray-300 text-brand focus:ring-brand" value="${item.storeCode}">
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">${item.month}</td>
                  ${this.renderQaEditableCell('acc', item.acc, 'px-4 py-3')}
                  ${this.renderQaEditableCell('dealer', item.dealer, 'px-4 py-3 max-w-[150px] truncate', item.dealer)}
                  ${this.renderQaEditableCell('storeCode', item.storeCode, 'px-4 py-3 font-mono text-xs text-[#1d2129]')}
                  <td class="px-4 py-3 max-w-[180px]" data-edit-field="storeName" data-edit-value="${item.storeName}">
                    <button type="button" class="qa-standard-preview-trigger max-w-full truncate text-brand hover:text-blue-700 hover:underline transition-colors text-left font-medium" data-index="${item.sourceIndex}" title="预览 ${item.storeName}">
                      ${item.storeName}
                    </button>
                  </td>
                  ${this.renderQaEditableCell('barcode', item.barcode, 'px-4 py-3 font-mono text-xs')}
                  ${this.renderQaEditableCell('productName', item.productName, `px-4 py-3 max-w-[240px] truncate ${item.changedFields.productName ? 'text-green-600 font-semibold' : ''}`, item.productName)}
                  ${this.renderQaEditableCell('quantity', item.quantity, `px-4 py-3 text-right ${item.changedFields.quantity ? 'text-green-600 font-semibold' : ''}`)}
                  ${this.renderQaEditableCell('amount', item.amount, 'px-4 py-3 text-right')}
                  ${this.renderQaEditableCell('cost', item.cost, 'px-4 py-3 text-right')}
                  ${this.renderQaEditableCell('retailPrice', item.retailPrice, 'px-4 py-3 text-right')}
                  <td class="px-4 py-3">${this.renderStandardStatusBadge(rows.find(({ index }) => index === item.sourceIndex)?.row || {})}</td>
                  <td class="px-4 py-3 max-w-xs truncate text-[#1d2129]" title="${item.aiNote}">${item.aiNote}</td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-1">
                      <button type="button" class="qa-inline-edit-trigger px-2 py-1 text-xs rounded text-amber-500 hover:bg-amber-50" data-scope="standard" data-index="${item.sourceIndex}" title="编辑"><i class="fa-regular fa-pen-to-square"></i></button>
                      <button type="button" class="px-2 py-1 text-xs rounded text-red-500 hover:bg-red-50" title="删除"><i class="fa-regular fa-trash-can"></i></button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          </div>
          ${this.renderQaTableSummary(rows.length)}
        </div>
      `;
      this.bindStandardSelectionEvents();
      this.bindStandardPreviewEvents();
      this.bindQaInlineEditEvents();
      return;
    }

    const tableRows = rows.map(({ row, index }) => {
      const confidenceValue = Number.parseFloat(row.confidence);
      const confidenceLabel = confidenceValue >= 90 ? '高' : confidenceValue >= 70 ? '中' : '低';
      const confidenceClass = confidenceValue >= 90
        ? 'bg-blue-50 text-brand border-blue-100'
        : confidenceValue >= 70
        ? 'bg-green-50 text-green-700 border-green-100'
        : 'bg-orange-50 text-orange-700 border-orange-100';
      const headquarter = this.getHeadquarter(row);
      return `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="px-4 py-3">
            <input type="checkbox" class="row-cb-qa-standard rounded border-gray-300 text-brand focus:ring-brand" value="${row.storeCode}">
          </td>
          <td class="px-4 py-3" data-edit-field="storeName" data-edit-value="${row.storeName}">
            <button type="button" class="qa-standard-preview-trigger font-medium text-brand flex items-center gap-2 hover:text-blue-700 hover:underline transition-colors" data-index="${index}" title="预览 ${row.storeName}">
              <i class="fa-solid fa-store text-brand"></i>
              <span class="truncate max-w-[176px]">${row.storeName}</span>
            </button>
          </td>
          ${this.renderQaEditableCell('storeCode', row.storeCode, 'px-4 py-3 font-mono text-[#1d2129]')}
          <td class="px-4 py-3">
            <span class="px-2.5 py-1 rounded-full text-xs font-semibold border ${confidenceClass}">${confidenceLabel}</span>
          </td>
          <td class="px-4 py-3">${this.renderStandardStatusBadge(row)}</td>
          <td class="px-4 py-3 min-w-64">
            <div class="max-w-sm truncate" title="${row.aiNote}">${row.aiNote}</div>
          </td>
          ${this.renderQaEditableCell('acc', this.getQaAccName(row, index), 'px-4 py-3 max-w-[120px] truncate', this.getQaAccName(row, index))}
          ${this.renderQaEditableCell('headquarters', headquarter, 'px-4 py-3 max-w-[160px] truncate', headquarter)}
          ${this.renderQaEditableCell('salesOffice', row.salesOffice, 'px-4 py-3 max-w-[160px] truncate', row.salesOffice)}
          ${this.renderQaEditableCell('dealer', row.dealer, 'px-4 py-3 max-w-[180px] truncate', row.dealer)}
          <td class="px-4 py-3">
            ${this.renderQaActionButtons({ scope: 'standard', index })}
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div class="${modeClass} flex min-h-0 flex-1 flex-col">
        <div class="min-h-0 flex-1 overflow-auto">
        <table class="w-full table-fixed min-w-[1360px] text-left text-sm text-[#4e5969]">
          <thead class="bg-[#f7f8fa] text-[#1d2129] font-medium sticky top-0 z-10">
            <tr>
              <th class="px-4 py-3 w-12 rounded-tl-lg">
                <input type="checkbox" id="qa-standard-select-all" class="rounded border-gray-300 text-brand focus:ring-brand">
              </th>
              <th class="px-4 py-3 w-56">门店名称</th>
              <th class="px-4 py-3 w-36">门店编码</th>
              <th class="px-4 py-3 w-20">置信度</th>
              <th class="px-4 py-3 w-36">状态</th>
              <th class="px-4 py-3 w-64">AI判断</th>
              <th class="px-4 py-3 w-28">ACC</th>
              <th class="px-4 py-3 w-36">本部</th>
              <th class="px-4 py-3 w-36">营业所</th>
              <th class="px-4 py-3 w-36">经销商</th>
              <th class="px-4 py-3 w-24 rounded-tr-lg">操作</th>
            </tr>
          </thead>
          <tbody id="qa-standard-tbody" class="divide-y divide-gray-100">
            ${rows.length === 0 ? `
              <tr>
                <td colspan="11" class="px-4 py-16 text-center text-[#86909c]">
                  <i class="fa-regular fa-folder-open text-3xl mb-3 block text-gray-300"></i>
                  暂无符合条件的标准POS表数据
                </td>
              </tr>
            ` : tableRows}
          </tbody>
        </table>
        </div>
        ${this.renderQaTableSummary(rows.length)}
      </div>
    `;
    this.bindStandardSelectionEvents();
    this.bindStandardPreviewEvents();
    this.bindQaInlineEditEvents();
  },

  getAiChangedFields(row) {
    const aiNote = row.aiNote || '';
    const hasAiChange = row.confidence !== '100%' && !aiNote.includes('AI未发现异常');
    return {
      productName: hasAiChange && aiNote.includes('产品名称'),
      quantity: hasAiChange && aiNote.includes('销售数量'),
      aiNote: hasAiChange
    };
  },

  renderStashTable() {
    const container = document.getElementById('qa-stash-container');
    if (!container) return;
    const rows = this.getFilteredStandardData().slice(0, 5);
    const fixedAiNote = '门店编码缺失： 标准门店编码字段为空，且无法通过门店名称反向匹配 ERP 系统数据，导致数据无法关联。';
    const tableRows = rows.map(({ row, index }) => {
      return `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="px-4 py-3"><input type="checkbox" class="row-cb-qa-stash rounded border-gray-300 text-brand focus:ring-brand"></td>
          <td class="px-4 py-3">
            <button type="button" class="qa-standard-preview-trigger font-medium text-brand flex items-center gap-2 hover:text-blue-700 hover:underline transition-colors" data-index="${index}" title="预览 ${row.storeName}">
              <i class="fa-solid fa-store text-brand"></i>
              <span class="truncate max-w-[176px]">${row.storeName}</span>
            </button>
          </td>
          <td class="px-4 py-3 font-mono text-[#1d2129]">-</td>
          <td class="px-4 py-3 min-w-64"><div class="max-w-sm truncate" title="${fixedAiNote}">${fixedAiNote}</div></td>
          <td class="px-4 py-3 max-w-[160px] text-[#86909c]">-</td>
          <td class="px-4 py-3 max-w-[160px] text-[#86909c]">-</td>
          <td class="px-4 py-3 max-w-[180px] text-[#86909c]">-</td>
          <td class="px-4 py-3 text-[#d1d5db]">-</td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div class="animate-[fadeIn_0.22s_ease-out]">
        <table class="w-full table-fixed min-w-[1160px] text-left text-sm text-[#4e5969]">
          <thead class="bg-[#f7f8fa] text-[#1d2129] font-medium sticky top-0 z-10">
            <tr>
              <th class="px-4 py-3 w-12 rounded-tl-lg"><input type="checkbox" id="qa-stash-select-all" class="rounded border-gray-300 text-brand focus:ring-brand"></th>
              <th class="px-4 py-3 w-56">门店名称</th>
              <th class="px-4 py-3 w-36">门店编码</th>
              <th class="px-4 py-3 w-64">AI判断</th>
              <th class="px-4 py-3 w-36">本部</th>
              <th class="px-4 py-3 w-36">营业所</th>
              <th class="px-4 py-3 w-36">经销商</th>
              <th class="px-4 py-3 w-20 rounded-tr-lg">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            ${rows.length === 0 ? `
              <tr>
                <td colspan="8" class="px-4 py-16 text-center text-[#86909c]">
                  <i class="fa-regular fa-folder-open text-3xl mb-3 block text-gray-300"></i>
                  暂无暂存数据
                </td>
              </tr>
            ` : tableRows}
          </tbody>
        </table>
      </div>
    `;
    this.bindStandardPreviewEvents();

    const selectAll = document.getElementById('qa-stash-select-all');
    const rowCheckboxes = Array.from(document.querySelectorAll('.row-cb-qa-stash'));
    const approveBtn = document.getElementById('qa-btn-batch-approve');

    const updateBtn = () => {
      const checked = rowCheckboxes.filter((cb) => cb.checked).length;
      if (approveBtn) {
        approveBtn.disabled = checked === 0;
        approveBtn.className = checked > 0
          ? 'px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium transition-all shadow-sm shadow-brand/20 hover:bg-blue-700 hover:shadow-brand/30 hover:-translate-y-0.5'
          : 'px-4 py-2 bg-[#86909c] text-white rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed';
      }
      if (selectAll) {
        selectAll.checked = checked > 0 && checked === rowCheckboxes.length;
        selectAll.indeterminate = checked > 0 && checked < rowCheckboxes.length;
      }
    };

    selectAll?.addEventListener('change', (e) => {
      rowCheckboxes.forEach((cb) => { cb.checked = e.target.checked; });
      updateBtn();
    });
    rowCheckboxes.forEach((cb) => cb.addEventListener('change', updateBtn));
    updateBtn();
  },

  getFilteredStandardData() {
    return this.standardData
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => {
        if (!this.matchesQaSearch(row)) return false;
        if (this.hierarchyFilter.teams.length > 0 && !this.hierarchyFilter.teams.includes(row.salesTeam)) {
          return false;
        }
        if (this.hierarchyFilter.offices.length > 0 && !this.hierarchyFilter.offices.includes(row.salesOffice)) {
          return false;
        }
        if (this.hierarchyFilter.dealers.length > 0 && !this.hierarchyFilter.dealers.includes(row.dealer)) {
          return false;
        }

        const confidence = Number.parseFloat(row.confidence);
        if (this.confidenceFilter.preset === 'high') {
          return confidence >= 90;
        }
        if (this.confidenceFilter.preset === 'medium') {
          return confidence >= 70 && confidence < 90;
        }
        if (this.confidenceFilter.preset === 'low') {
          return confidence < 70;
        }
        if (this.standardStatusFilter && this.getStandardStatus(row) !== this.standardStatusFilter) {
          return false;
        }
        return true;
      });
  },

  getStandardStatus(row = {}) {
    return this.approvedStandardStoreCodes.has(row.storeCode) ? '已通过' : '待通过';
  },

  renderStandardStatusBadge(row = {}) {
    const status = this.getStandardStatus(row);
    const className = status === '已通过'
      ? 'bg-green-50 text-green-700 border-green-100'
      : 'bg-amber-50 text-amber-700 border-amber-100';
    return `<span class="inline-flex h-6 min-w-[56px] items-center justify-center whitespace-nowrap rounded-full border px-2 text-xs font-semibold leading-none ${className}">${status}</span>`;
  },

  getCurrentQaActorType() {
    const state = typeof Store !== 'undefined' ? Store.getState() : {};
    const roleName = state.userRole || '';
    const userName = state.userName || '';
    const roleByName = typeof SettingsView !== 'undefined'
      ? SettingsView.roles?.find((role) => role.name === roleName)
      : null;
    if (roleByName?.dataScope === '全部数据') return 'pos';
    if (roleByName?.dataScope === '按组织范围') return 'sales';
    if (/POS|系统管理员|管理员/.test(roleName)) return 'pos';
    const matchedUser = typeof SettingsView !== 'undefined'
      ? SettingsView.users?.find((user) => user.role === roleName || user.name === userName || user.name?.startsWith(userName))
      : null;
    const matchedRole = typeof SettingsView !== 'undefined'
      ? SettingsView.roles?.find((role) => role.name === matchedUser?.role)
      : null;
    if (matchedRole?.dataScope === '全部数据') return 'pos';
    if (matchedRole?.dataScope === '按组织范围') return 'sales';
    return 'sales';
  },

  isPosActor() {
    return this.getCurrentQaActorType() === 'pos';
  },

  getExceptionStatus(row) {
    if (row?.workflowStatus) return row.workflowStatus;
    if (this.rejectedStoreCodes.has(row.storeCode)) return '营业担当处理中';
    return '待处理';
  },

  getExceptionStatusBadge(status) {
    const classMap = {
      待处理: 'bg-orange-50 text-orange-600 border-orange-100',
      营业担当处理中: 'bg-blue-50 text-brand border-blue-100',
      POS担当待处理: 'bg-violet-50 text-violet-700 border-violet-100',
      已通过: 'bg-green-50 text-green-700 border-green-100'
    };
    return `<span class="inline-flex h-6 min-w-[72px] items-center justify-center rounded-full border px-2 text-xs font-semibold whitespace-nowrap ${classMap[status] || classMap.待处理}">${status}</span>`;
  },

  getExceptionActions(row = {}) {
    const status = this.getExceptionStatus(row);
    const isPos = this.isPosActor();
    if (status === '已通过') {
      return { canEdit: false, buttons: [] };
    }
    if (isPos && status === '待处理') {
      return {
        canEdit: true,
        buttons: [
          { action: 'reject', title: '驳回给营业', icon: 'fa-solid fa-reply', className: 'text-red-500 hover:bg-red-50' },
          { action: 'approve', title: '通过', icon: 'fa-solid fa-check', className: 'text-green-600 hover:bg-green-50' }
        ]
      };
    }
    if (isPos && status === '营业担当处理中') {
      return {
        canEdit: true,
        buttons: [
          { action: 'reject-disabled', title: '等待营业担当提交处理结果', icon: 'fa-solid fa-reply', className: 'text-gray-300 cursor-not-allowed', disabled: true }
        ]
      };
    }
    if (isPos && status === 'POS担当待处理') {
      return {
        canEdit: true,
        buttons: [
          { action: 'reject', title: '再次驳回给营业', icon: 'fa-solid fa-reply', className: 'text-red-500 hover:bg-red-50' },
          { action: 'approve', title: '通过', icon: 'fa-solid fa-check', className: 'text-green-600 hover:bg-green-50' }
        ]
      };
    }
    if (!isPos && status === '营业担当处理中') {
      return {
        canEdit: true,
        buttons: [
          { action: 'submit-sales-result', title: '通过', icon: 'fa-solid fa-check', className: 'text-green-600 hover:bg-green-50' }
        ]
      };
    }
    return { canEdit: status !== '已通过', buttons: [] };
  },

  canSelectExceptionRow(row = {}) {
    const status = this.getExceptionStatus(row);
    const isPos = this.isPosActor();
    if (isPos) return status === '待处理' || status === 'POS担当待处理';
    return status === '营业担当处理中';
  },

  getExceptionSelectionReason(row = {}) {
    const status = this.getExceptionStatus(row);
    if (this.canSelectExceptionRow(row)) return '可选择后点击通过';
    if (status === '营业担当处理中' && this.isPosActor()) return '等待营业担当处理';
    if (status === '待处理' && !this.isPosActor()) return '等待POS担当处理';
    if (status === 'POS担当待处理' && !this.isPosActor()) return '等待POS担当复核';
    if (status === '已通过') return '已通过，仅可查看';
    return '当前账号不可处理该状态';
  },

  updateExceptionStoreStatus(row, status, patch = {}) {
    this.data.forEach((item) => {
      const sameStore = row.storeCode
        ? item.storeCode === row.storeCode
        : item.id === row.id;
      if (!sameStore) return;
      item.workflowStatus = status;
      Object.assign(item, patch);
    });
  },

  getRejectTeam(row) {
    const matched = this.standardData.find((item) => item.storeCode === row.storeCode);
    return matched?.salesTeam || `${row.acc || '营业'} Team`;
  },

  getFilteredExceptionData() {
    let filteredData = this.exceptionTypeFilter
      ? this.data.filter(row => row.conflictType === this.exceptionTypeFilter)
      : this.data;
    
    if (this.statusFilter) {
      filteredData = filteredData.filter(row => this.getExceptionStatus(row) === this.statusFilter);
    }
    filteredData = filteredData.filter(row => this.matchesQaSearch(row));
    return filteredData;
  },

  getGroupedExceptionRows(rows = []) {
    const groups = new Map();
    rows.forEach((row) => {
      const key = row.storeCode || row.storeName || row.id;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(row);
    });

    return Array.from(groups.values()).map((items) => {
      const first = items[0] || {};
      const matched = this.standardData.find((item) => item.storeCode === first.storeCode || item.storeName === first.storeName) || {};
      const typeCounts = items.reduce((acc, item) => {
        const type = item.conflictType || '异常';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      const mainType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || first.conflictType || '-';
      return {
        ...first,
        exceptionCount: items.length,
        mainConflictType: mainType,
        aiJudgment: first.aiJudgment || '-',
        salesTeam: matched.salesTeam || this.getRejectTeam(first),
        region: matched.region || `${first.acc || '所属'}区域`,
        salesOffice: matched.salesOffice || '-',
        dealer: matched.dealer || first.dealer || '-',
        representativeId: first.id
      };
    });
  },

  renderExceptionDetailRows(filteredData) {
    return filteredData.map(row => {
      const conflictType = row.conflictType || '';
      const aiJudgment = row.aiJudgment || '';
      const status = this.getExceptionStatus(row);
      const selectable = this.canSelectExceptionRow(row);
      return `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="px-4 py-3"><input type="checkbox" class="row-cb-qa rounded border-gray-300 text-brand focus:ring-brand disabled:cursor-not-allowed disabled:opacity-40" value="${row.id}" data-status="${status}" title="${this.getExceptionSelectionReason(row)}" ${selectable ? '' : 'disabled'}></td>
          ${this.renderQaEditableCell('yearMonth', row.yearMonth || '-', 'px-4 py-3 whitespace-nowrap')}
          ${this.renderQaEditableCell('acc', this.getQaAccName(row), 'px-4 py-3 max-w-[120px] truncate', this.getQaAccName(row))}
          ${this.renderQaEditableCell('dealer', row.dealer || '-', 'px-4 py-3 max-w-[140px] truncate', row.dealer || '')}
          ${this.renderQaEditableCell('storeCode', row.storeCode || '-', 'px-4 py-3 font-mono text-xs')}
          <td class="px-4 py-3 max-w-[140px]" data-edit-field="storeName" data-edit-value="${row.storeName || ''}">
            <button type="button" class="qa-exception-preview-trigger max-w-full truncate text-brand hover:text-blue-700 hover:underline transition-colors text-left" data-id="${row.id}" title="预览 ${row.storeName || ''}">${row.storeName || '-'}</button>
          </td>
          ${this.renderQaEditableCell('barcode', row.barcode || '-', 'px-4 py-3 font-mono text-xs')}
          ${this.renderQaEditableCell('productName', row.productName || '-', 'px-4 py-3 max-w-xs truncate', row.productName || '')}
          ${this.renderQaEditableCell('quantity', row.quantity || '-', 'px-4 py-3 text-right')}
          ${this.renderQaEditableCell('amount', row.amount ? Number(row.amount).toFixed(2) : '-', 'px-4 py-3 text-right')}
          ${this.renderQaEditableCell('cost', row.cost ? Number(row.cost).toFixed(2) : '-', 'px-4 py-3 text-right')}
          ${this.renderQaEditableCell('retailPrice', row.retailPrice ? Number(row.retailPrice).toFixed(2) : '-', 'px-4 py-3 text-right')}
          <td class="px-4 py-3" data-edit-field="workflowStatus" data-edit-value="${status}">
            ${this.getExceptionStatusBadge(status)}
          </td>
          <td class="px-4 py-3" data-edit-field="conflictType" data-edit-value="${conflictType}">
            <span class="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 border border-red-200 whitespace-nowrap">${conflictType}</span>
          </td>
          <td class="px-4 py-3 text-xs max-w-xs truncate" data-edit-field="aiJudgment" data-edit-value="${aiJudgment}" title="${aiJudgment}">${aiJudgment || '-'}</td>
          <td class="px-4 py-3">
            ${this.renderQaActionButtons({ scope: 'exception', id: row.id, row, hideDetail: true })}
          </td>
        </tr>
      `;
    }).join('');
  },

  renderExceptionFileRows(groupedRows) {
    return groupedRows.map((row) => {
      const status = this.getExceptionStatus(row);
      const headquarter = this.getHeadquarter(row);
      const selectable = this.canSelectExceptionRow(row);
      return `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="px-4 py-3"><input type="checkbox" class="row-cb-qa rounded border-gray-300 text-brand focus:ring-brand disabled:cursor-not-allowed disabled:opacity-40" value="${row.representativeId}" data-status="${status}" title="${this.getExceptionSelectionReason(row)}" ${selectable ? '' : 'disabled'}></td>
          <td class="px-4 py-3" data-edit-field="storeName" data-edit-value="${row.storeName || ''}">
            <button type="button" class="qa-exception-preview-trigger font-medium text-brand flex items-center gap-2 hover:text-blue-700 hover:underline transition-colors text-left" data-id="${row.representativeId}" title="预览 ${row.storeName || ''}">
              <i class="fa-solid fa-store text-brand"></i>
              <span class="truncate max-w-[176px]">${row.storeName || '-'}</span>
            </button>
          </td>
          ${this.renderQaEditableCell('storeCode', row.storeCode || '-', 'px-4 py-3 font-mono text-xs text-[#1d2129]')}
          <td class="px-4 py-3 text-center">
            <span class="inline-flex h-6 min-w-[40px] items-center justify-center rounded-full bg-red-50 px-2 text-xs font-semibold text-red-600">${row.exceptionCount}</span>
          </td>
          <td class="px-4 py-3" data-edit-field="mainConflictType" data-edit-value="${row.mainConflictType || ''}">
            <span class="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 border border-red-200 whitespace-nowrap">${row.mainConflictType}</span>
          </td>
          <td class="px-4 py-3 min-w-64" data-edit-field="aiJudgment" data-edit-value="${row.aiJudgment || ''}">
            <div class="max-w-sm truncate" title="${row.aiJudgment || ''}">${row.aiJudgment || '-'}</div>
          </td>
          ${this.renderQaEditableCell('acc', this.getQaAccName(row), 'px-4 py-3 max-w-[120px] truncate', this.getQaAccName(row))}
          ${this.renderQaEditableCell('headquarters', headquarter, 'px-4 py-3 max-w-[160px] truncate', headquarter)}
          ${this.renderQaEditableCell('salesOffice', row.salesOffice, 'px-4 py-3 max-w-[160px] truncate', row.salesOffice)}
          ${this.renderQaEditableCell('dealer', row.dealer, 'px-4 py-3 max-w-[180px] truncate', row.dealer)}
          <td class="px-4 py-3" data-edit-field="workflowStatus" data-edit-value="${status}">
            ${this.getExceptionStatusBadge(status)}
          </td>
          <td class="px-4 py-3">
            ${this.renderQaActionButtons({ scope: 'exception', id: row.representativeId, row })}
          </td>
        </tr>
      `;
    }).join('');
  },

  renderExceptionTable() {
    const container = document.getElementById('qa-exception-container');
    if (!container) return;

    const filteredData = this.getFilteredExceptionData();
    const isDetailMode = this.exceptionDisplayMode === 'detail';
    const groupedRows = this.getGroupedExceptionRows(filteredData);
    const displayCount = isDetailMode ? filteredData.length : groupedRows.length;

    container.innerHTML = isDetailMode ? `
      <div class="flex-1 min-h-0 overflow-auto">
        <table class="w-full table-fixed min-w-[1640px] text-left text-sm text-[#4e5969]">
          <thead class="bg-[#f7f8fa] text-[#1d2129] font-medium sticky top-0 z-10">
            <tr>
              <th class="px-4 py-3 w-12 rounded-tl-lg"><input type="checkbox" id="qa-exception-select-all" class="rounded border-gray-300 text-brand focus:ring-brand disabled:cursor-not-allowed disabled:opacity-40"></th>
              <th class="px-4 py-3 w-24">年月</th>
              <th class="px-4 py-3 w-20">ACC</th>
              <th class="px-4 py-3 w-36">经销商</th>
              <th class="px-4 py-3 w-36">门店编码</th>
              <th class="px-4 py-3 w-52">门店名称</th>
              <th class="px-4 py-3 w-32">69 码</th>
              <th class="px-4 py-3 w-48">产品名称</th>
              <th class="px-4 py-3 w-20">销售数量</th>
              <th class="px-4 py-3 w-24">销售金额</th>
              <th class="px-4 py-3 w-24">销售成本</th>
              <th class="px-4 py-3 w-20">零售价</th>
              <th class="px-4 py-3 w-36">状态</th>
              <th class="px-4 py-3 w-24">异常类型</th>
              <th class="px-4 py-3 w-64">AI判断</th>
              <th class="px-4 py-3 w-40 rounded-tr-lg">操作</th>
            </tr>
          </thead>
          <tbody id="qa-tbody" class="divide-y divide-gray-100">
            ${filteredData.length === 0 ? `
              <tr><td colspan="16" class="px-4 py-16 text-center text-[#86909c]"><i class="fa-regular fa-folder-open text-3xl mb-3 block text-gray-300"></i>暂无符合条件的异常数据</td></tr>
            ` : this.renderExceptionDetailRows(filteredData)}
          </tbody>
        </table>
      </div>
      ${this.renderQaTableSummary(displayCount)}
    ` : `
      <div class="flex-1 min-h-0 overflow-auto">
        <table class="w-full table-fixed min-w-[1500px] text-left text-sm text-[#4e5969]">
          <thead class="bg-[#f7f8fa] text-[#1d2129] font-medium sticky top-0 z-10">
            <tr>
              <th class="px-4 py-3 w-12 rounded-tl-lg"><input type="checkbox" id="qa-exception-select-all" class="rounded border-gray-300 text-brand focus:ring-brand disabled:cursor-not-allowed disabled:opacity-40"></th>
              <th class="px-4 py-3 w-56">门店名称</th>
              <th class="px-4 py-3 w-36">门店编码</th>
              <th class="px-4 py-3 w-20">异常数</th>
              <th class="px-4 py-3 w-28">主要异常类型</th>
              <th class="px-4 py-3 w-64">AI判断</th>
              <th class="px-4 py-3 w-28">ACC</th>
              <th class="px-4 py-3 w-36">本部</th>
              <th class="px-4 py-3 w-36">营业所</th>
              <th class="px-4 py-3 w-36">经销商</th>
              <th class="px-4 py-3 w-36">状态</th>
              <th class="px-4 py-3 w-32 rounded-tr-lg">操作</th>
            </tr>
          </thead>
          <tbody id="qa-tbody" class="divide-y divide-gray-100">
            ${groupedRows.length === 0 ? `
              <tr><td colspan="12" class="px-4 py-16 text-center text-[#86909c]"><i class="fa-regular fa-folder-open text-3xl mb-3 block text-gray-300"></i>暂无符合条件的异常文件数据</td></tr>
            ` : this.renderExceptionFileRows(groupedRows)}
          </tbody>
        </table>
      </div>
      ${this.renderQaTableSummary(displayCount)}
    `;
    
    this.bindTableEvents();
    this.bindExceptionEvents();
    this.bindExceptionSelectionEvents();
    this.bindQaInlineEditEvents();
    this.updateExceptionDisplayToggle();
  },
  
  bindTableEvents() {
    this.bindStandardSelectionEvents();
    this.bindStandardPreviewEvents();
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
    return Array.from({ length: 24 }, (_, index) => {
      const productName = productNames[index % productNames.length];
      const quantity = [3, 6, 4, 8, 5, 9, 7, 12][index % 8];
      const price = [1.8, 4.5, 3.9, 5.2, 6.8, 7.5, 6.2, 8.9][index % 8];
      return {
        month: '2026年05月',
        acc: this.getQaAccName(row, index),
        dealer: row.dealer,
        storeCode: row.storeCode,
        storeName: row.storeName,
        productCode: `69209${String(7871409 + index * 137).padStart(8, '0')}`,
        productName,
        barcode: `69209${String(7871409 + index * 137).padStart(8, '0')}`,
        quantity,
        amount: (quantity * price).toFixed(1),
        cost: (quantity * (price * 0.72)).toFixed(1),
        retailPrice: price.toFixed(1),
        remark: index === 0 && row.confidence !== '100%' ? 'AI已回填' : ''
      };
    });
  },

  getOriginalPreviewRows(row) {
    return this.getStandardPreviewRows(row).map((item, index) => {
      const originalItem = { ...item };
      originalItem.productName = '';
      originalItem.remark = '原始缺失商品名称';
      if ([3, 11, 19].includes(index) && row.confidence !== '100%') {
        originalItem.quantity = '';
        originalItem.remark = '原始缺失销售数量';
      }
      if ([4, 12, 20].includes(index) && row.confidence !== '100%') {
        originalItem.quantity = '销售小计';
        originalItem.remark = '字段名异常';
      }
      return originalItem;
    });
  },

  getExceptionPreviewRows(exceptionRow) {
    const matched = this.standardData.find((item) => item.storeCode === exceptionRow.storeCode || item.storeName === exceptionRow.storeName) || {
      storeName: exceptionRow.storeName,
      storeCode: exceptionRow.storeCode,
      confidence: '98%',
      dealer: exceptionRow.dealer,
      salesTeam: this.getRejectTeam(exceptionRow),
      region: `${exceptionRow.acc || '华北'}区域`,
      salesOffice: '-'
    };
    const rows = this.getStandardPreviewRows(matched);
    const conflictType = exceptionRow.conflictType || '异常';
    const judgment = exceptionRow.aiJudgment || '异常数据待处理';
    return rows.map((item, index) => {
      if (index !== 0) return { ...item, remark: conflictType };
      return {
        ...item,
        productName: exceptionRow.productName || item.productName,
        barcode: exceptionRow.barcode || item.barcode,
        quantity: exceptionRow.quantity || item.quantity,
        amount: exceptionRow.amount || item.amount,
        cost: exceptionRow.cost || item.cost,
        retailPrice: exceptionRow.retailPrice || item.retailPrice,
        remark: `${conflictType}：${judgment}`
      };
    });
  },

  renderPreviewTable(headers, rows, editable = false) {
    return `
      <table class="w-full min-w-[1180px] text-xs text-center border-separate border-spacing-0 bg-white">
        <thead>
          <tr>
            ${headers.map((header) => `<th class="sticky top-0 z-20 px-3 py-2 border-b border-r border-gray-300 bg-[#f7f8fa] text-[#1d2129] font-semibold whitespace-nowrap shadow-[0_1px_0_rgba(148,163,184,0.35)] first:border-l">${header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map((item) => `
            <tr class="hover:bg-blue-50/30 transition-colors">
              ${this.renderPreviewCell(item.month, editable)}
              ${this.renderPreviewCell(item.acc, editable)}
              ${this.renderPreviewCell(item.dealer, editable, 'min-w-36')}
              ${this.renderPreviewCell(item.storeCode, editable)}
              ${this.renderPreviewCell(item.storeName, editable, 'min-w-44 text-left')}
              ${this.renderPreviewCell(item.productCode, editable)}
              ${this.renderPreviewCell(item.productName, editable, `min-w-52 text-left ${editable ? 'text-[#0dd387] font-semibold' : ''}`)}
              ${this.renderPreviewCell(item.barcode, editable)}
              ${this.renderPreviewCell(item.quantity, editable)}
              ${this.renderPreviewCell(item.amount, editable)}
              ${this.renderPreviewCell(item.cost, editable)}
              ${this.renderPreviewCell(item.retailPrice, editable)}
              ${this.renderPreviewCell(item.remark, editable)}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  },

  renderPreviewCell(value, editable = false, extraClass = '') {
    const baseClass = `px-3 py-2 border border-gray-200 bg-white min-w-24 ${extraClass}`;
    const displayValue = value || '<span class="text-red-500">空</span>';
    if (!editable) return `<td class="${baseClass}">${displayValue}</td>`;
    return `<td data-preview-editable="true" class="${baseClass}">${value || ''}</td>`;
  },

  renderEditablePreviewCell(value, extraClass = '') {
    return `<td data-preview-editable="true" class="px-3 py-2 border border-gray-200 bg-white min-w-28 ${extraClass}">${value || ''}</td>`;
  },

  bindQaPreviewEditControls(overlay, options = {}) {
    const editBtn = overlay.querySelector('#qa-standard-preview-edit');
    const editableCells = Array.from(overlay.querySelectorAll('[data-preview-editable="true"]'));
    let isEditing = false;
    let savedSnapshot = JSON.stringify(editableCells.map(cell => (cell.textContent || '').trim()));

    const syncDirty = () => {
      const current = JSON.stringify(editableCells.map(cell => (cell.textContent || '').trim()));
      overlay.dataset.previewDirty = current === savedSnapshot ? 'false' : 'true';
    };

    const setEditing = (nextEditing) => {
      isEditing = nextEditing;
      if (editBtn) {
        editBtn.title = isEditing ? '保存' : '编辑';
        editBtn.classList.toggle('bg-blue-50', isEditing);
        const icon = editBtn.querySelector('i');
        if (icon) icon.className = isEditing ? 'fa-solid fa-check' : 'fa-solid fa-pen-to-square';
      }
      editableCells.forEach(cell => {
        cell.contentEditable = isEditing ? 'true' : 'false';
        cell.classList.toggle('qa-preview-cell-editing', isEditing);
      });
      if (isEditing) editableCells[0]?.focus();
    };

    const saveEdits = () => {
      setEditing(false);
      savedSnapshot = JSON.stringify(editableCells.map(cell => (cell.textContent || '').trim()));
      overlay.dataset.previewDirty = 'false';
      options.onSave?.();
      if (typeof Dialog !== 'undefined') Dialog.toast(options.successMessage || '预览数据已保存', 'success');
    };

    editBtn?.addEventListener('click', () => {
      if (!isEditing) {
        setEditing(true);
        return;
      }
      saveEdits();
    });

    editableCells.forEach(cell => {
      cell.addEventListener('input', syncDirty);
      cell.addEventListener('blur', syncDirty);
    });

    const showUnsavedConfirm = (onDiscard) => {
      const existing = document.querySelector('.qa-preview-unsaved-confirm');
      if (existing) existing.remove();
      const confirm = document.createElement('div');
      confirm.className = 'qa-preview-unsaved-confirm fixed inset-0 z-[10002] flex items-center justify-center bg-slate-900/35 backdrop-blur-sm px-6';
      confirm.innerHTML = `
        <div class="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div class="px-6 py-4 border-b border-gray-100"><h3 class="text-base font-bold text-[#1d2129]">存在未保存修改</h3></div>
          <div class="px-6 py-5 text-sm leading-6 text-[#4e5969]">当前预览数据已修改但尚未保存，是否放弃修改并关闭？</div>
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <button type="button" class="qa-preview-keep px-4 py-2 rounded-lg text-sm text-[#4e5969] bg-white border border-gray-200 hover:bg-gray-50 transition-colors">继续编辑</button>
            <button type="button" class="qa-preview-discard px-4 py-2 rounded-lg text-sm text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm">放弃修改</button>
          </div>
        </div>
      `;
      document.body.appendChild(confirm);
      confirm.querySelector('.qa-preview-keep')?.addEventListener('click', () => confirm.remove());
      confirm.querySelector('.qa-preview-discard')?.addEventListener('click', () => {
        confirm.remove();
        overlay.dataset.previewDirty = 'false';
        onDiscard();
      });
    };

    return {
      save: saveEdits,
      requestClose: (closePreview) => {
        syncDirty();
        if (overlay.dataset.previewDirty === 'true') {
          showUnsavedConfirm(closePreview);
          return;
        }
        closePreview();
      }
    };
  },

  openStandardPreview(index) {
    const row = this.standardData[index];
    if (!row) return;
    const overlay = document.getElementById('overlay-container');
    if (!overlay) return;

    const headers = ['年月', 'ACC', '经销商', '门店编码', '门店名称', '产品编码', '产品名称', '69码', '销售数量', '销售金额', '销售成本', '零售价', '备注'];
    const rows = this.getStandardPreviewRows(row);
    overlay.innerHTML = `
      <div class="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center px-6 py-8">
        <div id="qa-standard-preview-modal" class="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col" style="width: min(1500px, calc(100vw - 48px)); height: min(680px, calc(100vh - 64px)); min-width: 820px; min-height: 420px; max-width: calc(100vw - 32px); max-height: calc(100vh - 32px);">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <h3 class="font-bold text-[#1d2129] text-base">标准POS表预览</h3>
              <p class="text-xs text-[#86909c] mt-1">${row.storeName} · ${row.storeCode} · 点击编辑后可修改单元格</p>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" id="qa-standard-preview-edit" class="w-8 h-8 rounded-lg text-[#86909c] hover:bg-blue-50 hover:text-brand transition-colors" title="编辑">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button type="button" id="qa-standard-preview-fullscreen" class="w-8 h-8 rounded-lg text-[#86909c] hover:bg-gray-100 hover:text-[#1d2129] transition-colors" title="全屏">
                <i class="fa-solid fa-expand"></i>
              </button>
              <button type="button" id="qa-standard-preview-close" class="w-8 h-8 rounded-lg text-[#86909c] hover:bg-gray-100 hover:text-[#1d2129] transition-colors" title="关闭">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
          <div class="p-6 bg-[#f7f9fc] flex-1 min-h-0">
            <div class="qa-preview-table-scroll h-full">
            <table class="w-full min-w-[1380px] text-sm text-center border-separate border-spacing-0 bg-white">
              <thead>
                <tr>
                  ${headers.map((header) => `<th class="sticky top-0 z-20 px-3 py-2 border-b border-r border-gray-300 bg-[#f7f8fa] text-[#1d2129] font-semibold whitespace-nowrap shadow-[0_1px_0_rgba(148,163,184,0.35)] first:border-l">${header}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${rows.map((item) => `
                  <tr class="hover:bg-blue-50/30 transition-colors">
                    ${this.renderEditablePreviewCell(item.month)}
                    ${this.renderEditablePreviewCell(item.acc)}
                    ${this.renderEditablePreviewCell(item.dealer, 'min-w-36')}
                    ${this.renderEditablePreviewCell(item.storeCode)}
                    ${this.renderEditablePreviewCell(item.storeName, 'min-w-48 text-left')}
                    ${this.renderEditablePreviewCell(item.productCode)}
                    ${this.renderEditablePreviewCell(item.productName, 'min-w-56 text-left')}
                    ${this.renderEditablePreviewCell(item.barcode)}
                    ${this.renderEditablePreviewCell(item.quantity)}
                    ${this.renderEditablePreviewCell(item.amount)}
                    ${this.renderEditablePreviewCell(item.cost)}
                    ${this.renderEditablePreviewCell(item.retailPrice)}
                    ${this.renderEditablePreviewCell(item.remark)}
                  </tr>
                `).join('')}
              </tbody>
            </table>
            </div>
          </div>
          <div class="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between gap-3 shrink-0">
            <button type="button" id="qa-original-compare-open" class="px-4 py-2 rounded-lg text-sm text-brand bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors">
              <i class="fa-solid fa-code-compare mr-1"></i>原始门店数据对比
            </button>
          </div>
          <div data-preview-resize="right" class="absolute right-0 top-0 h-full w-2 cursor-ew-resize hover:bg-brand/10"></div>
          <div data-preview-resize="bottom" class="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize hover:bg-brand/10"></div>
          <div data-preview-resize="corner" class="absolute right-0 bottom-0 w-5 h-5 cursor-nwse-resize">
            <div class="absolute right-1 bottom-1 w-3 h-3 border-r-2 border-b-2 border-brand/50"></div>
          </div>
        </div>
      </div>
    `;

    const closePreview = () => {
      overlay.innerHTML = '';
    };
    const previewEditor = this.bindQaPreviewEditControls(overlay);
    const requestClose = () => previewEditor.requestClose(closePreview);
    overlay.querySelector('#qa-standard-preview-close')?.addEventListener('click', requestClose);
    overlay.querySelector('#qa-original-compare-open')?.addEventListener('click', () => {
      this.openOriginalComparison(index);
    });
    this.bindStandardPreviewWindowControls(overlay);
  },

  openOriginalComparison(index) {
    const row = this.standardData[index];
    if (!row) return;
    const overlay = document.getElementById('overlay-container');
    if (!overlay) return;

    const headers = ['年月', 'ACC', '经销商', '门店编码', '门店名称', '产品编码', '产品名称', '69码', '销售数量', '销售金额', '销售成本', '零售价', '备注'];
    const originalRows = this.getOriginalPreviewRows(row);
    const standardRows = this.getStandardPreviewRows(row);
    overlay.innerHTML = `
      <div class="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center px-6 py-8">
        <div id="qa-standard-preview-modal" class="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col" style="width: min(1700px, calc(100vw - 48px)); height: min(760px, calc(100vh - 64px)); min-width: 980px; min-height: 520px; max-width: calc(100vw - 32px); max-height: calc(100vh - 32px);">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <h3 class="font-bold text-[#1d2129] text-base">原始门店数据对比</h3>
              <p class="text-xs text-[#86909c] mt-1">${row.storeName} · ${row.storeCode} · 左侧原始门店数据，右侧当前标准门店数据</p>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" id="qa-standard-preview-edit" class="w-8 h-8 rounded-lg text-[#86909c] hover:bg-blue-50 hover:text-brand transition-colors" title="编辑">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button type="button" id="qa-standard-preview-fullscreen" class="w-8 h-8 rounded-lg text-[#86909c] hover:bg-gray-100 hover:text-[#1d2129] transition-colors" title="全屏">
                <i class="fa-solid fa-expand"></i>
              </button>
              <button type="button" id="qa-standard-preview-close" class="w-8 h-8 rounded-lg text-[#86909c] hover:bg-gray-100 hover:text-[#1d2129] transition-colors" title="关闭">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 p-5 overflow-hidden bg-[#f7f9fc] flex-1 min-h-0">
            <section class="min-w-0 rounded-xl border border-orange-100 bg-white overflow-hidden flex flex-col">
              <div class="px-4 py-3 border-b border-orange-100 bg-orange-50/70">
                <h4 class="text-sm font-bold text-[#1d2129]">原始门店数据</h4>
                <p class="text-xs text-[#86909c] mt-1">来自门店原始附件，保留缺失、字段异常等原始状态</p>
              </div>
              <div class="p-3 flex-1 min-h-0">
                <div id="qa-compare-original-scroll" class="qa-preview-table-scroll h-full">
                  ${this.renderPreviewTable(headers, originalRows, false)}
                </div>
              </div>
            </section>
            <section class="min-w-0 rounded-xl border border-blue-100 bg-white overflow-hidden flex flex-col">
              <div class="px-4 py-3 border-b border-blue-100 bg-blue-50/70">
                <h4 class="text-sm font-bold text-[#1d2129]">当前标准门店数据</h4>
                <p class="text-xs text-[#86909c] mt-1">AI标准化后的结果，可直接作为标准POS表校验依据</p>
              </div>
              <div class="p-3 flex-1 min-h-0">
                <div id="qa-compare-standard-scroll" class="qa-preview-table-scroll h-full">
                  ${this.renderPreviewTable(headers, standardRows, true)}
                </div>
              </div>
            </section>
          </div>
          <div data-preview-resize="right" class="absolute right-0 top-0 h-full w-2 cursor-ew-resize hover:bg-brand/10"></div>
          <div data-preview-resize="bottom" class="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize hover:bg-brand/10"></div>
          <div data-preview-resize="corner" class="absolute right-0 bottom-0 w-5 h-5 cursor-nwse-resize">
            <div class="absolute right-1 bottom-1 w-3 h-3 border-r-2 border-b-2 border-brand/50"></div>
          </div>
        </div>
      </div>
    `;

    const closePreview = () => {
      overlay.innerHTML = '';
    };
    const previewEditor = this.bindQaPreviewEditControls(overlay, { successMessage: '标准门店数据已保存' });
    const requestClose = () => previewEditor.requestClose(closePreview);
    overlay.querySelector('#qa-standard-preview-close')?.addEventListener('click', requestClose);
    this.bindStandardPreviewWindowControls(overlay);
    this.bindComparisonScrollSync(overlay);
  },

  openExceptionOriginalPreview(exceptionRow) {
    const matched = this.standardData.find((item) => item.storeCode === exceptionRow.storeCode) || {
      storeName: exceptionRow.storeName,
      storeCode: exceptionRow.storeCode,
      confidence: '98%',
      dealer: exceptionRow.dealer,
      salesTeam: this.getRejectTeam(exceptionRow),
      region: `${exceptionRow.acc || '华北'}区域`,
      salesOffice: '-'
    };
    const overlay = document.getElementById('overlay-container');
    if (!overlay) return;

    const headers = ['年月', 'ACC', '经销商', '门店编码', '门店名称', '产品编码', '产品名称', '69码', '销售数量', '销售金额', '销售成本', '零售价', '备注'];
    const originalRows = this.getOriginalPreviewRows(matched);
    overlay.innerHTML = `
      <div class="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center px-6 py-8">
        <div id="qa-standard-preview-modal" class="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col" style="width: min(1500px, calc(100vw - 48px)); height: min(680px, calc(100vh - 64px)); min-width: 820px; min-height: 420px; max-width: calc(100vw - 32px); max-height: calc(100vh - 32px);">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <h3 class="font-bold text-[#1d2129] text-base">原始门店数据预览</h3>
              <p class="text-xs text-[#86909c] mt-1">${matched.storeName || '-'} · ${matched.storeCode || '-'} · 仅展示原始门店数据</p>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" id="qa-standard-preview-edit" class="w-8 h-8 rounded-lg text-[#86909c] hover:bg-blue-50 hover:text-brand transition-colors" title="编辑">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button type="button" id="qa-standard-preview-fullscreen" class="w-8 h-8 rounded-lg text-[#86909c] hover:bg-gray-100 hover:text-[#1d2129] transition-colors" title="全屏">
                <i class="fa-solid fa-expand"></i>
              </button>
              <button type="button" id="qa-standard-preview-close" class="w-8 h-8 rounded-lg text-[#86909c] hover:bg-gray-100 hover:text-[#1d2129] transition-colors" title="关闭">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
          <div class="p-6 bg-[#f7f9fc] flex-1 min-h-0">
            <div class="qa-preview-table-scroll h-full">
              ${this.renderPreviewTable(headers, originalRows, true)}
            </div>
          </div>
          <div class="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between gap-3 shrink-0">
            <button type="button" id="qa-exception-compare-open" class="px-4 py-2 rounded-lg text-sm text-brand bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors">
              <i class="fa-solid fa-code-compare mr-1"></i>原始数据对比
            </button>
          </div>
          <div data-preview-resize="right" class="absolute right-0 top-0 h-full w-2 cursor-ew-resize hover:bg-brand/10"></div>
          <div data-preview-resize="bottom" class="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize hover:bg-brand/10"></div>
          <div data-preview-resize="corner" class="absolute right-0 bottom-0 w-5 h-5 cursor-nwse-resize">
            <div class="absolute right-1 bottom-1 w-3 h-3 border-r-2 border-b-2 border-brand/50"></div>
          </div>
        </div>
      </div>
    `;

    const closePreview = () => {
      overlay.innerHTML = '';
    };
    const previewEditor = this.bindQaPreviewEditControls(overlay, { successMessage: '异常数据已保存' });
    const requestClose = () => previewEditor.requestClose(closePreview);
    overlay.querySelector('#qa-standard-preview-close')?.addEventListener('click', requestClose);
    overlay.querySelector('#qa-exception-compare-open')?.addEventListener('click', () => {
      this.openExceptionComparison(exceptionRow);
    });
    this.bindStandardPreviewWindowControls(overlay);
  },

  openExceptionComparison(exceptionRow) {
    const matched = this.standardData.find((item) => item.storeCode === exceptionRow.storeCode || item.storeName === exceptionRow.storeName) || {
      storeName: exceptionRow.storeName,
      storeCode: exceptionRow.storeCode,
      confidence: '98%',
      dealer: exceptionRow.dealer,
      salesTeam: this.getRejectTeam(exceptionRow),
      region: `${exceptionRow.acc || '华北'}区域`,
      salesOffice: '-'
    };
    const overlay = document.getElementById('overlay-container');
    if (!overlay) return;

    const headers = ['年月', 'ACC', '经销商', '门店编码', '门店名称', '产品编码', '产品名称', '69码', '销售数量', '销售金额', '销售成本', '零售价', '备注'];
    const originalRows = this.getOriginalPreviewRows(matched);
    const exceptionRows = this.getExceptionPreviewRows(exceptionRow);
    overlay.innerHTML = `
      <div class="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center px-6 py-8">
        <div id="qa-standard-preview-modal" class="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col" style="width: min(1700px, calc(100vw - 48px)); height: min(760px, calc(100vh - 64px)); min-width: 980px; min-height: 520px; max-width: calc(100vw - 32px); max-height: calc(100vh - 32px);">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <h3 class="font-bold text-[#1d2129] text-base">原始数据对比</h3>
              <p class="text-xs text-[#86909c] mt-1">${matched.storeName || '-'} · ${matched.storeCode || '-'} · 左侧原始数据，右侧异常数据</p>
            </div>
            <div class="flex items-center gap-2">
              <button type="button" id="qa-standard-preview-edit" class="w-8 h-8 rounded-lg text-[#86909c] hover:bg-blue-50 hover:text-brand transition-colors" title="编辑">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button type="button" id="qa-standard-preview-fullscreen" class="w-8 h-8 rounded-lg text-[#86909c] hover:bg-gray-100 hover:text-[#1d2129] transition-colors" title="全屏">
                <i class="fa-solid fa-expand"></i>
              </button>
              <button type="button" id="qa-standard-preview-close" class="w-8 h-8 rounded-lg text-[#86909c] hover:bg-gray-100 hover:text-[#1d2129] transition-colors" title="关闭">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4 p-5 overflow-hidden bg-[#f7f9fc] flex-1 min-h-0">
            <section class="min-w-0 rounded-xl border border-orange-100 bg-white overflow-hidden flex flex-col">
              <div class="px-4 py-3 border-b border-orange-100 bg-orange-50/70">
                <h4 class="text-sm font-bold text-[#1d2129]">原始门店数据</h4>
                <p class="text-xs text-[#86909c] mt-1">来自门店原始附件，保留缺失、字段异常等原始状态</p>
              </div>
              <div class="p-3 flex-1 min-h-0">
                <div id="qa-compare-original-scroll" class="qa-preview-table-scroll h-full">
                  ${this.renderPreviewTable(headers, originalRows, false)}
                </div>
              </div>
            </section>
            <section class="min-w-0 rounded-xl border border-red-100 bg-white overflow-hidden flex flex-col">
              <div class="px-4 py-3 border-b border-red-100 bg-red-50/70">
                <h4 class="text-sm font-bold text-[#1d2129]">异常数据</h4>
                <p class="text-xs text-[#86909c] mt-1">当前异常数据，保留异常类型和 AI 判断说明</p>
              </div>
              <div class="p-3 flex-1 min-h-0">
                <div id="qa-compare-standard-scroll" class="qa-preview-table-scroll h-full">
                  ${this.renderPreviewTable(headers, exceptionRows, true)}
                </div>
              </div>
            </section>
          </div>
          <div data-preview-resize="right" class="absolute right-0 top-0 h-full w-2 cursor-ew-resize hover:bg-brand/10"></div>
          <div data-preview-resize="bottom" class="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize hover:bg-brand/10"></div>
          <div data-preview-resize="corner" class="absolute right-0 bottom-0 w-5 h-5 cursor-nwse-resize">
            <div class="absolute right-1 bottom-1 w-3 h-3 border-r-2 border-b-2 border-brand/50"></div>
          </div>
        </div>
      </div>
    `;

    const closePreview = () => {
      overlay.innerHTML = '';
    };
    const previewEditor = this.bindQaPreviewEditControls(overlay, { successMessage: '异常数据已保存' });
    const requestClose = () => previewEditor.requestClose(closePreview);
    overlay.querySelector('#qa-standard-preview-close')?.addEventListener('click', requestClose);
    this.bindStandardPreviewWindowControls(overlay);
    this.bindComparisonScrollSync(overlay);
  },

  bindComparisonScrollSync(overlay) {
    const original = overlay.querySelector('#qa-compare-original-scroll');
    const standard = overlay.querySelector('#qa-compare-standard-scroll');
    if (!original || !standard) return;
    let syncing = false;
    const syncScroll = (source, target) => {
      if (syncing) return;
      syncing = true;
      target.scrollTop = source.scrollTop;
      target.scrollLeft = source.scrollLeft;
      requestAnimationFrame(() => {
        syncing = false;
      });
    };
    original.addEventListener('scroll', () => syncScroll(original, standard));
    standard.addEventListener('scroll', () => syncScroll(standard, original));
  },

  bindStandardPreviewWindowControls(overlay) {
    const modal = overlay.querySelector('#qa-standard-preview-modal');
    const fullscreenBtn = overlay.querySelector('#qa-standard-preview-fullscreen');
    if (!modal) return;

    const normalStyle = {
      width: modal.style.width,
      height: modal.style.height,
      borderRadius: modal.style.borderRadius
    };
    let isFullscreen = false;

    fullscreenBtn?.addEventListener('click', () => {
      isFullscreen = !isFullscreen;
      if (isFullscreen) {
        modal.style.width = 'calc(100vw - 32px)';
        modal.style.height = 'calc(100vh - 32px)';
        modal.style.maxWidth = 'none';
        modal.style.maxHeight = 'none';
        fullscreenBtn.innerHTML = '<i class="fa-solid fa-compress"></i>';
        fullscreenBtn.setAttribute('title', '还原');
      } else {
        modal.style.width = normalStyle.width;
        modal.style.height = normalStyle.height;
        modal.style.maxWidth = 'calc(100vw - 32px)';
        modal.style.maxHeight = 'calc(100vh - 32px)';
        fullscreenBtn.innerHTML = '<i class="fa-solid fa-expand"></i>';
        fullscreenBtn.setAttribute('title', '全屏');
      }
    });

    overlay.querySelectorAll('[data-preview-resize]').forEach((handle) => {
      handle.addEventListener('mousedown', (event) => {
        if (isFullscreen) return;
        event.preventDefault();
        const mode = handle.dataset.previewResize;
        const rect = modal.getBoundingClientRect();
        const startX = event.clientX;
        const startY = event.clientY;
        const startWidth = rect.width;
        const startHeight = rect.height;
        const maxWidth = window.innerWidth - 32;
        const maxHeight = window.innerHeight - 32;

        const onMove = (moveEvent) => {
          const nextWidth = Math.min(maxWidth, Math.max(820, startWidth + moveEvent.clientX - startX));
          const nextHeight = Math.min(maxHeight, Math.max(420, startHeight + moveEvent.clientY - startY));
          if (mode === 'right' || mode === 'corner') {
            modal.style.width = `${nextWidth}px`;
          }
          if (mode === 'bottom' || mode === 'corner') {
            modal.style.height = `${nextHeight}px`;
          }
        };

        const onUp = () => {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });
    });
  },

  bindStandardPreviewEvents() {
    document.querySelectorAll('.qa-standard-preview-trigger').forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        event.stopPropagation();
        this.openStandardPreview(Number(trigger.dataset.index));
      });
    });
    document.querySelectorAll('.qa-standard-detail-trigger').forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        event.stopPropagation();
        const index = Number(trigger.dataset.index);
        const row = this.standardData[index];
        if (!row || typeof IngestionView === 'undefined' || typeof IngestionView.openDocumentDetail !== 'function') return;
        IngestionView.openDocumentDetail({
          moduleName: '质量检查 - 标准POS表',
          currentNode: '标准POS表',
          title: row.storeName,
          nameLabel: '门店名称',
          statusText: 'AI质检通过',
          sourceFileName: this.getStandardSourceFileName(index, row),
          row: {
            ...row,
            sourceFileName: this.getStandardSourceFileName(index, row),
            updatedAt: row.updatedAt || this.getStandardSourceTime(index)
          },
          moduleFields: [
            { label: '门店编码', value: row.storeCode || '-' },
            { label: '置信度', value: row.confidence || '-' },
            { label: 'AI判断', value: row.aiNote || '-' },
            { label: 'ACC', value: this.getQaAccName(row, index) },
            { label: '本部', value: this.getHeadquarter(row) || '-' },
            { label: '营业所', value: row.salesOffice || '-' },
            { label: '经销商', value: row.dealer || '-' }
          ]
        });
      });
    });
  },

  bindExceptionEvents() {
    document.querySelectorAll('.qa-exception-document-detail-trigger').forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        event.stopPropagation();
        const row = this.data.find((item) => item.id === trigger.dataset.id);
        if (!row || typeof IngestionView === 'undefined' || typeof IngestionView.openDocumentDetail !== 'function') return;
        const standardIndex = this.standardData.findIndex((item) => item.storeCode === row.storeCode || item.storeName === row.storeName);
        const sourceIndex = standardIndex >= 0 ? standardIndex : 0;
        const sourceFileName = this.getStandardSourceFileName(sourceIndex, row);
        IngestionView.openDocumentDetail({
          moduleName: '质量检查 - 异常数据',
          currentNode: '异常数据',
          title: row.storeName || row.storeCode || '异常单据',
          nameLabel: '门店名称',
          statusText: this.getExceptionStatus(row),
          sourceFileName,
          row: {
            ...row,
            sourceFileName,
            updatedAt: row.updatedAt || this.getStandardSourceTime(sourceIndex)
          },
          moduleFields: [
            { label: '门店编码', value: row.storeCode || '-' },
            { label: '异常类型', value: row.conflictType || '-' },
            { label: 'AI判断', value: row.aiJudgment || '-' },
            { label: 'ACC', value: this.getQaAccName(row) },
            { label: '本部', value: this.getHeadquarter(row) || '-' },
            { label: '营业所', value: row.salesOffice || '-' },
            { label: '经销商', value: row.dealer || '-' }
          ]
        });
      });
    });

    document.querySelectorAll('.qa-exception-preview-trigger').forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        event.stopPropagation();
        const row = this.data.find((item) => item.id === trigger.dataset.id);
        if (row) this.openExceptionOriginalPreview(row);
      });
    });

    document.querySelectorAll('#qa-tbody .action-btn').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        if (button.disabled) return;
        const row = this.data.find((item) => item.id === button.dataset.id);
        if (!row) return;
        const action = button.dataset.action;
        if (action === 'reject') {
          this.openExceptionRejectConfirm(row);
          return;
        }
        if (action === 'submit-sales-result') {
          this.openExceptionSalesSubmitDialog(row);
          return;
        }
        if (action === 'stash') {
          if (typeof Dialog !== 'undefined') {
            Dialog.toast(`${row.storeName || row.storeCode} 已暂存`, 'success');
          }
          return;
        }
        if (action === 'approve' && typeof Dialog !== 'undefined') {
          this.updateExceptionStoreStatus(row, '已通过', {
            approvedBy: Store.getState().userName || 'POS担当',
            approvedAt: new Date().toLocaleString()
          });
          this.renderExceptionTable();
          Dialog.toast(`${row.storeName || row.storeCode} 已通过，并同步到标准POS表`, 'success');
        }
      });
    });
  },

  openExceptionRejectConfirm(row) {
    const overlay = document.getElementById('overlay-container');
    if (!overlay) return;
    const team = this.getRejectTeam(row);
    const isAgain = this.getExceptionStatus(row) === 'POS担当待处理';
    overlay.innerHTML = `
      <div class="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center px-6">
        <div class="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-[fadeIn_0.18s_ease-out]">
          <div class="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
            <div>
              <h3 class="text-lg font-bold text-[#1d2129]">${isAgain ? '确认再次驳回异常数据' : '确认驳回异常数据'}</h3>
              <p class="mt-1 text-sm text-[#86909c]">${row.storeName || '-'} · ${row.storeCode || '-'}</p>
            </div>
            <button type="button" id="qa-reject-confirm-close" class="w-8 h-8 rounded-lg text-[#86909c] hover:bg-gray-100 hover:text-[#1d2129] transition-colors">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="px-6 py-5 space-y-4">
            <div class="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
              <div class="text-xs font-semibold text-red-500 mb-1">驳回原因（AI判断）</div>
              <div class="text-sm leading-6 text-[#1d2129]">${row.aiJudgment || '-'}</div>
            </div>
            <div class="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 flex items-center justify-between">
              <span class="text-sm text-[#4e5969]">${isAgain ? '再次驳回至营业 Team' : '驳回至营业 Team'}</span>
              <span class="text-sm font-bold text-brand">${team}</span>
            </div>
            <div>
              <label for="qa-reject-manual-note" class="block mb-2 text-xs font-semibold text-[#4e5969]">手动备注信息</label>
              <textarea id="qa-reject-manual-note" rows="4"
                class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm leading-6 text-[#1d2129] resize-none focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
                placeholder="请输入补充说明或处理建议">${row.rejectNote || ''}</textarea>
            </div>
            <p class="text-xs text-[#86909c] leading-5"><span class="font-semibold text-[#4e5969]">说明：</span>驳回操作需针对门店级的完整 POS 表执行，而非单条数据。确认驳回后，该门店对应的所有状态将统一更新为「营业担当处理中」</p>
          </div>
          <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button type="button" id="qa-reject-confirm-cancel" class="px-4 py-2 rounded-lg text-sm text-[#4e5969] bg-gray-100 hover:bg-gray-200 transition-colors">取消</button>
            <button type="button" id="qa-reject-confirm-submit" class="px-4 py-2 rounded-lg text-sm text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm">${isAgain ? '确认再次驳回' : '确认驳回'}</button>
          </div>
        </div>
      </div>
    `;
    const close = () => {
      overlay.innerHTML = '';
    };
    overlay.querySelector('#qa-reject-confirm-close')?.addEventListener('click', close);
    overlay.querySelector('#qa-reject-confirm-cancel')?.addEventListener('click', close);
    overlay.querySelector('#qa-reject-confirm-submit')?.addEventListener('click', () => {
      const rejectNote = overlay.querySelector('#qa-reject-manual-note')?.value?.trim() || '';
      this.rejectedStoreCodes.add(row.storeCode);
      this.updateExceptionStoreStatus(row, '营业担当处理中', {
        rejectNote,
        rejectedBy: Store.getState().userName || 'POS担当',
        rejectedAt: new Date().toLocaleString()
      });
      close();
      this.renderExceptionTable();
      if (typeof Dialog !== 'undefined') {
        Dialog.toast(`${row.storeName || row.storeCode} 已${isAgain ? '再次' : ''}驳回至 ${team}`, 'success');
      }
    });
  },

  openExceptionSalesSubmitDialog(row) {
    const overlay = document.getElementById('overlay-container');
    if (!overlay) return;
    overlay.innerHTML = `
      <div class="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center px-6">
        <div class="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-[fadeIn_0.18s_ease-out]">
          <div class="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
            <div>
              <h3 class="text-lg font-bold text-[#1d2129]">通过异常数据</h3>
              <p class="mt-1 text-sm text-[#86909c]">${row.storeName || '-'} · ${row.storeCode || '-'}</p>
            </div>
            <button type="button" id="qa-sales-submit-close" class="w-8 h-8 rounded-lg text-[#86909c] hover:bg-gray-100 hover:text-[#1d2129] transition-colors">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="px-6 py-5 space-y-4">
            <div class="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
              <div class="text-xs font-semibold text-brand mb-1">当前责任方</div>
              <div class="text-sm leading-6 text-[#1d2129]">${this.getRejectTeam(row)} 处理完成后提交 POS担当复核</div>
            </div>
            <div>
              <label for="qa-sales-submit-note" class="block mb-2 text-xs font-semibold text-[#4e5969]">处理说明</label>
              <textarea id="qa-sales-submit-note" rows="4"
                class="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm leading-6 text-[#1d2129] resize-none focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
                placeholder="请输入补充、修正或回传说明">${row.salesSubmitNote || ''}</textarea>
            </div>
            <p class="text-xs text-[#86909c] leading-5"><span class="font-semibold text-[#4e5969]">说明：</span>提交后，该门店对应异常状态将变为「POS担当待处理」，等待 POS担当复核。</p>
          </div>
          <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button type="button" id="qa-sales-submit-cancel" class="px-4 py-2 rounded-lg text-sm text-[#4e5969] bg-gray-100 hover:bg-gray-200 transition-colors">取消</button>
            <button type="button" id="qa-sales-submit-confirm" class="px-4 py-2 rounded-lg text-sm text-white bg-brand hover:bg-blue-700 transition-colors shadow-sm">通过</button>
          </div>
        </div>
      </div>
    `;
    const close = () => {
      overlay.innerHTML = '';
    };
    overlay.querySelector('#qa-sales-submit-close')?.addEventListener('click', close);
    overlay.querySelector('#qa-sales-submit-cancel')?.addEventListener('click', close);
    overlay.querySelector('#qa-sales-submit-confirm')?.addEventListener('click', () => {
      const salesSubmitNote = overlay.querySelector('#qa-sales-submit-note')?.value?.trim() || '';
      this.updateExceptionStoreStatus(row, 'POS担当待处理', {
        salesSubmitNote,
        salesSubmittedBy: Store.getState().userName || '营业担当',
        salesSubmittedAt: new Date().toLocaleString()
      });
      close();
      this.renderExceptionTable();
      if (typeof Dialog !== 'undefined') {
        Dialog.toast(`${row.storeName || row.storeCode} 已提交 POS担当复核`, 'success');
      }
    });
  },

  updateStandardBatchButtons() {
    const selected = document.querySelectorAll('.row-cb-qa-standard:checked').length;
    const approveBtn = document.getElementById('qa-btn-batch-approve');
    if (approveBtn) {
      approveBtn.disabled = selected === 0;
      approveBtn.className = selected > 0
        ? 'px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium transition-all shadow-sm shadow-brand/20 hover:bg-blue-700 hover:shadow-brand/30 hover:-translate-y-0.5'
        : 'px-4 py-2 bg-[#86909c] text-white rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed';
    }
  },

  bindStandardSelectionEvents() {
    const selectAll = document.getElementById('qa-standard-select-all');
    const rowCheckboxes = Array.from(document.querySelectorAll('.row-cb-qa-standard'));
    const approveBtn = document.getElementById('qa-btn-batch-approve');

    const syncSelection = () => {
      const checked = rowCheckboxes.filter((checkbox) => checkbox.checked);
      if (selectAll) {
        selectAll.checked = checked.length > 0 && checked.length === rowCheckboxes.length;
        selectAll.indeterminate = checked.length > 0 && checked.length < rowCheckboxes.length;
      }
      if (this.activeQaTab === 'standard' && approveBtn) {
        approveBtn.disabled = checked.length === 0;
        approveBtn.className = checked.length > 0
          ? 'px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium transition-all shadow-sm shadow-brand/20 hover:bg-blue-700 hover:shadow-brand/30 hover:-translate-y-0.5'
          : 'px-4 py-2 bg-[#86909c] text-white rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed';
      }
    };

    selectAll?.addEventListener('change', (event) => {
      rowCheckboxes.forEach((checkbox) => {
        checkbox.checked = event.target.checked;
      });
      syncSelection();
    });

    rowCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', syncSelection);
    });

    if (approveBtn) approveBtn.onclick = () => {
      const selectedCheckboxes = Array.from(document.querySelectorAll('.row-cb-qa-standard:checked'));
      const selected = selectedCheckboxes.length;
      if (selected === 0) return;
      selectedCheckboxes.forEach((checkbox) => {
        if (checkbox.value) this.approvedStandardStoreCodes.add(checkbox.value);
      });
      if (typeof Dialog !== 'undefined') {
        Dialog.toast(`已通过 ${selected} 条标准POS表数据`, 'success');
      }
      this.renderStandardTable();
    };

    syncSelection();
  },

  bindExceptionSelectionEvents() {
    const selectAll = document.getElementById('qa-exception-select-all');
    const rowCheckboxes = Array.from(document.querySelectorAll('.row-cb-qa'));
    const selectableCheckboxes = rowCheckboxes.filter((checkbox) => !checkbox.disabled);
    const approveBtn = document.getElementById('qa-btn-batch-approve');

    const syncSelection = () => {
      const checked = selectableCheckboxes.filter((checkbox) => checkbox.checked);
      if (selectAll) {
        selectAll.disabled = selectableCheckboxes.length === 0;
        selectAll.checked = checked.length > 0 && checked.length === selectableCheckboxes.length;
        selectAll.indeterminate = checked.length > 0 && checked.length < selectableCheckboxes.length;
        selectAll.title = selectableCheckboxes.length === 0 ? '当前页面没有可处理数据' : '选择当前页面可处理数据';
      }
      if (this.activeQaTab === 'exception' && approveBtn) {
        approveBtn.disabled = checked.length === 0;
        approveBtn.className = checked.length > 0
          ? 'px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium transition-all shadow-sm shadow-brand/20 hover:bg-blue-700 hover:shadow-brand/30 hover:-translate-y-0.5'
          : 'px-4 py-2 bg-[#86909c] text-white rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed';
      }
    };

    selectAll?.addEventListener('change', (event) => {
      selectableCheckboxes.forEach((checkbox) => {
        checkbox.checked = event.target.checked;
      });
      syncSelection();
    });

    rowCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        if (checkbox.disabled) checkbox.checked = false;
        syncSelection();
      });
    });

    if (approveBtn) approveBtn.onclick = () => {
      if (this.activeQaTab !== 'exception') return;
      const selectedIds = selectableCheckboxes
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => checkbox.value);
      if (selectedIds.length === 0) return;
      const selectedRows = selectedIds
        .map((id) => this.data.find((row) => row.id === id))
        .filter(Boolean);
      if (selectedRows.length === 0) return;

      if (this.isPosActor()) {
        selectedRows.forEach((row) => this.updateExceptionStoreStatus(row, '已通过', {
          approvedBy: Store.getState().userName || 'POS担当',
          approvedAt: new Date().toLocaleString()
        }));
        if (typeof Dialog !== 'undefined') {
          Dialog.toast(`已通过 ${selectedRows.length} 条异常数据，并同步到标准POS表`, 'success');
        }
      } else {
        selectedRows.forEach((row) => this.updateExceptionStoreStatus(row, 'POS担当待处理', {
          salesSubmittedBy: Store.getState().userName || '营业担当',
          salesSubmittedAt: new Date().toLocaleString()
        }));
        if (typeof Dialog !== 'undefined') {
          Dialog.toast(`已通过 ${selectedRows.length} 条异常数据，提交至POS担当复核`, 'success');
        }
      }
      this.renderExceptionTable();
    };

    syncSelection();
  },

  toChineseText(text) {
    return String(text || '').split(' / ')[0];
  },

  getStatusFilterLabel(status) {
    return status;
  },

  updateStandardDisplayToggle() {
    const button = document.getElementById('qa-standard-display-toggle');
    const icon = document.getElementById('qa-standard-display-toggle-icon');
    if (!button || !icon) return;
    const isTableMode = this.standardDisplayMode === 'table';
    button.title = isTableMode ? '表格' : '明细数据';
    button.setAttribute('aria-label', isTableMode ? '当前为表格展示，点击切换为明细数据' : '当前为明细数据展示，点击切换为表格');
    icon.className = `fa-solid ${isTableMode ? 'fa-table-cells-large' : 'fa-list-ul'}`;
  },

  updateExceptionDisplayToggle() {
    const button = document.getElementById('qa-exception-display-toggle');
    const icon = document.getElementById('qa-exception-display-toggle-icon');
    if (!button || !icon) return;
    const isDetailMode = this.exceptionDisplayMode === 'detail';
    button.title = isDetailMode ? '明细数据' : '文件数据';
    button.setAttribute('aria-label', isDetailMode ? '当前为明细数据展示，点击切换为文件数据' : '当前为文件数据展示，点击切换为明细数据');
    icon.className = `fa-solid ${isDetailMode ? 'fa-list-ul' : 'fa-table-cells-large'}`;
  },
  
  bindEvents() {
    const tabStandard = document.getElementById('tab-qa-standard');
    const tabException = document.getElementById('tab-qa-exception');
    const standardContainer = document.getElementById('qa-standard-container');
    const exceptionContainer = document.getElementById('qa-exception-container');
    const activeClass = 'px-4 py-2 text-sm font-medium text-brand bg-blue-50 rounded-lg transition-all border border-blue-200';
    const inactiveClass = 'px-4 py-2 text-sm text-[#86909c] hover:text-[#1d2129] hover:bg-gray-50 rounded-lg transition-all border border-transparent';

    const switchTab = (target) => {
      const showStandard = target === 'standard';
      const showException = target === 'exception';
      this.activeQaTab = target;
      if (tabStandard) tabStandard.className = showStandard ? activeClass : inactiveClass;
      if (tabException) tabException.className = showException ? activeClass : inactiveClass;
      standardContainer?.classList.toggle('hidden', !showStandard);
      exceptionContainer?.classList.toggle('hidden', !showException);
      document.getElementById('qa-confidence-label-group')?.classList.toggle('hidden', showException);
      document.getElementById('qa-confidence-select-wrapper')?.classList.toggle('hidden', showException);
      document.getElementById('qa-standard-status-label-group')?.classList.toggle('hidden', showException);
      document.getElementById('qa-standard-status-select-wrapper')?.classList.toggle('hidden', showException);
      document.getElementById('qa-exception-type-label-group')?.classList.toggle('hidden', !showException);
      document.getElementById('qa-exception-type-select-wrapper')?.classList.toggle('hidden', !showException);
      document.getElementById('qa-status-label-group')?.classList.toggle('hidden', !showException);
      document.getElementById('qa-status-select-wrapper')?.classList.toggle('hidden', !showException);
      document.getElementById('qa-standard-display-toggle')?.classList.toggle('hidden', !showStandard);
      document.getElementById('qa-exception-display-toggle')?.classList.toggle('hidden', !showException);
      this.searchField = 'all';
      this.syncQaSearchControlUI();
      this.updateStandardDisplayToggle();
      this.updateExceptionDisplayToggle();
    };

    tabStandard?.addEventListener('click', () => switchTab('standard'));
    tabException?.addEventListener('click', () => switchTab('exception'));
    this.bindToolbarEvents();
  },

  bindToolbarEvents() {
    const toggleDropdown = (buttonId, dropdownId) => {
      const button = document.getElementById(buttonId);
      const dropdown = document.getElementById(dropdownId);
      button?.addEventListener('click', (event) => {
        event.stopPropagation();
        document.querySelectorAll('#qa-team-dropdown, #qa-status-dropdown, #qa-confidence-dropdown, #qa-standard-status-dropdown, #qa-exception-type-dropdown, #qa-search-field-dropdown').forEach((el) => {
          if (el !== dropdown) el.classList.add('hidden');
        });
        dropdown?.classList.toggle('hidden');
      });
      dropdown?.addEventListener('click', (event) => event.stopPropagation());
    };

    toggleDropdown('qa-team-select-btn', 'qa-team-dropdown');
    toggleDropdown('qa-status-select-btn', 'qa-status-dropdown');
    toggleDropdown('qa-confidence-select-btn', 'qa-confidence-dropdown');
    toggleDropdown('qa-standard-status-select-btn', 'qa-standard-status-dropdown');
    toggleDropdown('qa-exception-type-select-btn', 'qa-exception-type-dropdown');
    toggleDropdown('qa-search-field-btn', 'qa-search-field-dropdown');
    this.syncQaSearchControlUI();

    document.getElementById('qa-search-field-dropdown')?.addEventListener('click', (event) => {
      const option = event.target.closest('[data-qa-search-field]');
      if (!option) return;
      this.searchField = option.dataset.qaSearchField || 'all';
      this.syncQaSearchControlUI();
      document.getElementById('qa-search-field-dropdown')?.classList.add('hidden');
      this.renderStandardTable();
      this.renderExceptionTable();
    });

    document.getElementById('qa-filter-filename')?.addEventListener('input', (event) => {
      this.searchKeyword = event.target.value || '';
      this.renderStandardTable();
      this.renderExceptionTable();
    });

    document.getElementById('qa-standard-display-toggle')?.addEventListener('click', () => {
      if (this.activeQaTab !== 'standard') return;
      this.standardDisplayMode = this.standardDisplayMode === 'table' ? 'detail' : 'table';
      this.updateStandardDisplayToggle();
      this.renderStandardTable();
    });
    document.getElementById('qa-exception-display-toggle')?.addEventListener('click', () => {
      if (this.activeQaTab !== 'exception') return;
      this.exceptionDisplayMode = this.exceptionDisplayMode === 'detail' ? 'file' : 'detail';
      this.updateExceptionDisplayToggle();
      this.renderExceptionTable();
    });
    this.updateStandardDisplayToggle();
    this.updateExceptionDisplayToggle();

    const updateLabel = (selector, labelId, defaultText) => {
      const checked = Array.from(document.querySelectorAll(`${selector}:checked`)).map((item) => item.value);
      const label = document.getElementById(labelId);
      if (!label) return;
      if (checked.length === 0) {
        label.textContent = defaultText;
      } else if (checked.length === 1) {
        label.textContent = selector.includes('status') ? this.getStatusFilterLabel(checked[0]) : checked[0];
      } else {
        label.textContent = `已选 ${checked.length} 个`;
      }
    };

    const updateHierarchyLabel = () => {
      const label = document.getElementById('qa-team-select-label');
      if (!label) return;
      const selectedCount = this.hierarchyFilter.teams.length + this.hierarchyFilter.offices.length + this.hierarchyFilter.dealers.length;
      if (this.hierarchyFilter.dealers.length === 1) {
        label.textContent = this.hierarchyFilter.dealers[0];
      } else if (this.hierarchyFilter.offices.length === 1 && this.hierarchyFilter.dealers.length === 0) {
        label.textContent = this.hierarchyFilter.offices[0];
      } else if (this.hierarchyFilter.teams.length === 1 && this.hierarchyFilter.offices.length === 0 && this.hierarchyFilter.dealers.length === 0) {
        label.textContent = this.hierarchyFilter.teams[0];
      } else if (selectedCount > 0) {
        label.textContent = `已选 ${selectedCount} 项`;
      } else {
        label.textContent = '全部 Team';
      }
    };

    const bindHierarchyFilterEvents = () => {
      const refreshHierarchyDropdown = (shouldPrune = false) => {
        if (shouldPrune) this.pruneHierarchyFilter();
        const dropdown = document.getElementById('qa-team-dropdown');
        if (dropdown) dropdown.innerHTML = this.renderHierarchyDropdownContent();
        bindHierarchyFilterEvents();
        updateHierarchyLabel();
        this.renderStandardTable();
        this.renderStashTable();
      };

      document.querySelectorAll('.qa-team-checkbox').forEach((checkbox) => {
        const label = checkbox.closest('[data-cascade-value]');
        label?.addEventListener('mouseenter', () => {
          this.hierarchyHover.team = checkbox.value;
          this.hierarchyHover.office = '';
          refreshHierarchyDropdown();
        });
        checkbox.addEventListener('change', () => {
          this.hierarchyFilter.teams = Array.from(document.querySelectorAll('.qa-team-checkbox:checked')).map((item) => item.value);
          this.hierarchyHover.team = checkbox.value;
          this.hierarchyHover.office = '';
          refreshHierarchyDropdown(true);
        });
      });

      document.querySelectorAll('.qa-office-checkbox').forEach((checkbox) => {
        const label = checkbox.closest('[data-cascade-value]');
        label?.addEventListener('mouseenter', () => {
          this.hierarchyHover.office = checkbox.value;
          refreshHierarchyDropdown();
        });
        checkbox.addEventListener('change', () => {
          this.hierarchyFilter.offices = Array.from(document.querySelectorAll('.qa-office-checkbox:checked')).map((item) => item.value);
          this.hierarchyHover.office = checkbox.value;
          refreshHierarchyDropdown(true);
        });
      });

      document.querySelectorAll('.qa-dealer-checkbox').forEach((checkbox) => {
        checkbox.addEventListener('change', () => {
          this.hierarchyFilter.dealers = Array.from(document.querySelectorAll('.qa-dealer-checkbox:checked')).map((item) => item.value);
          refreshHierarchyDropdown(true);
        });
      });
    };

    bindHierarchyFilterEvents();
    updateHierarchyLabel();

    document.getElementById('qa-status-select-all')?.addEventListener('change', (event) => {
      document.querySelectorAll('.qa-status-checkbox').forEach((checkbox) => {
        checkbox.checked = event.target.checked;
      });
      updateLabel('.qa-status-checkbox', 'qa-status-select-label', '全部状态');
    });

    document.querySelectorAll('.qa-status-checkbox').forEach((checkbox) => {
      checkbox.addEventListener('change', () => updateLabel('.qa-status-checkbox', 'qa-status-select-label', '全部状态'));
    });

    document.querySelectorAll('.qa-confidence-option').forEach((option) => {
      option.addEventListener('click', () => {
        this.confidenceFilter.preset = option.dataset.value || '';
        const label = document.getElementById('qa-confidence-select-label');
        if (label) label.textContent = option.textContent.trim() || '高/中/低';
        document.getElementById('qa-confidence-dropdown')?.classList.add('hidden');
        this.renderStandardTable();
        this.renderStashTable();
      });
    });

    document.querySelectorAll('.qa-standard-status-option').forEach((option) => {
      option.addEventListener('click', () => {
        this.standardStatusFilter = option.dataset.value || '';
        const label = document.getElementById('qa-standard-status-select-label');
        if (label) label.textContent = option.textContent.trim() || '全部';
        document.getElementById('qa-standard-status-dropdown')?.classList.add('hidden');
        this.renderStandardTable();
        this.renderStashTable();
      });
    });

    document.querySelectorAll('.qa-exception-type-option').forEach((option) => {
      option.addEventListener('click', () => {
        this.exceptionTypeFilter = option.dataset.value || '';
        const label = document.getElementById('qa-exception-type-select-label');
        if (label) label.textContent = option.textContent.trim() || '全部';
        document.getElementById('qa-exception-type-dropdown')?.classList.add('hidden');
        this.renderExceptionTable();
      });
    });

    document.querySelectorAll('.qa-status-option').forEach((option) => {
      option.addEventListener('click', () => {
        this.statusFilter = option.dataset.value || '';
        const label = document.getElementById('qa-status-select-label');
        if (label) label.textContent = option.textContent.trim() || '全部';
        document.getElementById('qa-status-dropdown')?.classList.add('hidden');
        this.renderExceptionTable();
      });
    });

    document.getElementById('qa-btn-search')?.addEventListener('click', () => {
      this.searchKeyword = document.getElementById('qa-filter-filename')?.value || '';
      this.renderStandardTable();
      this.renderStashTable();
      this.renderExceptionTable();
    });

    document.getElementById('qa-btn-reset-filter')?.addEventListener('click', () => {
      this.searchField = 'all';
      this.searchKeyword = '';
      document.getElementById('qa-filter-filename').value = '';
      this.syncQaSearchControlUI();
      this.confidenceFilter = { preset: '' };
      this.standardStatusFilter = '';
      this.hierarchyFilter = { teams: [], offices: [], dealers: [] };
      this.hierarchyHover = { team: '', office: '' };
      document.getElementById('qa-confidence-select-label').textContent = '高/中/低';
      document.getElementById('qa-standard-status-select-label').textContent = '全部';
      this.exceptionTypeFilter = '';
      document.getElementById('qa-exception-type-select-label').textContent = '全部';
      this.statusFilter = '';
      document.getElementById('qa-status-select-label').textContent = '全部';
      const teamDropdown = document.getElementById('qa-team-dropdown');
      if (teamDropdown) teamDropdown.innerHTML = this.renderHierarchyDropdownContent();
      bindHierarchyFilterEvents();
      updateHierarchyLabel();
      document.querySelectorAll('.qa-status-checkbox').forEach((checkbox) => {
        checkbox.checked = false;
      });
      document.getElementById('qa-status-select-all').checked = false;
      updateLabel('.qa-status-checkbox', 'qa-status-select-label', '全部状态');
      this.renderStandardTable();
      this.renderStashTable();
      this.renderExceptionTable();
    });

    document.addEventListener('click', () => {
      document.querySelectorAll('#qa-team-dropdown, #qa-status-dropdown, #qa-confidence-dropdown, #qa-standard-status-dropdown, #qa-exception-type-dropdown, #qa-search-field-dropdown').forEach((el) => el.classList.add('hidden'));
    });
  }
};

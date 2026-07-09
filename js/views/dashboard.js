const DashboardView = {
  renderAction() {
    return '';
  },

  renderMetricCard({ icon, title, value, desc, tone = 'blue' }) {
    const toneMap = {
      blue: 'bg-blue-50 text-brand',
      green: 'bg-green-50 text-green-600',
      amber: 'bg-amber-50 text-amber-600',
      red: 'bg-red-50 text-red-500',
      slate: 'bg-slate-50 text-slate-600'
    };
    return `
      <div class="rounded-xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs font-semibold text-[#86909c]">${title}</p>
            <div class="mt-3 text-2xl font-black text-[#1d2129]">${value}</div>
            <p class="mt-2 text-xs text-[#86909c]">${desc}</p>
          </div>
          <div class="w-9 h-9 rounded-lg ${toneMap[tone] || toneMap.blue} flex items-center justify-center shrink-0">
            <i class="${icon}"></i>
          </div>
        </div>
      </div>
    `;
  },

  renderRegionTotals(regions) {
    return `
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        ${regions.map((item) => `
          <div class="rounded-xl border border-gray-100 bg-[#f7f9fc] px-4 py-3">
            <div class="flex items-center justify-between gap-3">
              <span class="text-sm font-bold text-[#1d2129]">${item.name}</span>
              <span class="text-lg font-black text-brand">${item.total}</span>
            </div>
            <div class="mt-2 h-2 rounded-full bg-blue-100 overflow-hidden">
              <div class="h-full rounded-full bg-brand" style="width: ${item.percent}%"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  renderProgressRegions(regions, mode) {
    const isQa = mode === 'qa';
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        ${regions.map((item) => `
          <div class="rounded-xl border border-gray-100 bg-[#f7f9fc] px-4 py-3">
            <div class="flex items-center justify-between gap-3">
              <span class="text-sm font-bold text-[#1d2129]">${item.name}</span>
              <span class="text-sm font-black text-brand">${item.rate}%</span>
            </div>
            <div class="mt-2 flex items-baseline gap-1.5 text-xs text-[#86909c]">
              <span>${isQa ? '通过' : '已收'}</span>
              <span class="text-sm font-black text-brand">${item.done}</span>
              <span>/ ${isQa ? '异常' : '异常'}</span>
              <span class="text-sm font-black text-red-500">${item.error}</span>
              <span>/ ${isQa ? '应检' : '应收'}${item.total}</span>
            </div>
            <div class="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden flex">
              <div class="h-full bg-brand" style="width: ${item.doneRate}%"></div>
              <div class="h-full bg-red-500" style="width: ${item.errorRate}%"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  getFileStoreDetails() {
    return [
      { acc: 'ACC-100', storeName: '保定聚昊门店', storeCode: 'C9001001', region: '华北区域', office: '石家庄营业所', dealerStore: '河北聚昊商贸', status: '正常' },
      { acc: 'ACC-100', storeName: '北京朝阳便利店', storeCode: 'C9001002', region: '华北区域', office: '北京营业所', dealerStore: '河北聚昊商贸', status: '异常' },
      { acc: 'ACC-101', storeName: '沈阳商场店', storeCode: 'C9001003', region: '东北区域', office: '沈阳营业所', dealerStore: '沈阳欧亚商贸', status: '正常' },
      { acc: 'ACC-101', storeName: '长春欧亚超市', storeCode: 'C9001004', region: '东北区域', office: '长春营业所', dealerStore: '沈阳欧亚商贸', status: '异常' },
      { acc: 'ACC-102', storeName: '上海虹桥店', storeCode: 'C9001005', region: '华东区域', office: '上海营业所', dealerStore: '上海煊超供应链', status: '正常' },
      { acc: 'ACC-102', storeName: '南京新街口店', storeCode: 'C9001006', region: '华东区域', office: '南京营业所', dealerStore: '上海煊超供应链', status: '正常' },
      { acc: 'ACC-103', storeName: '武汉汉街店', storeCode: 'C9001007', region: '华中区域', office: '武汉营业所', dealerStore: '武汉多客隆商贸', status: '正常' },
      { acc: 'ACC-103', storeName: '郑州万达店', storeCode: 'C9001008', region: '华中区域', office: '郑州营业所', dealerStore: '武汉多客隆商贸', status: '异常' },
      { acc: 'ACC-104', storeName: '广州天河店', storeCode: 'C9001009', region: '华南区域', office: '广州营业所', dealerStore: '广州利好商贸', status: '正常' },
      { acc: 'ACC-104', storeName: '深圳南山店', storeCode: 'C9001010', region: '华南区域', office: '深圳营业所', dealerStore: '广州利好商贸', status: '正常' },
      { acc: 'ACC-105', storeName: '西安高新店', storeCode: 'C9001011', region: '西北区域', office: '西安营业所', dealerStore: '西安家乐惠商贸', status: '正常' },
      { acc: 'ACC-105', storeName: '兰州中心店', storeCode: 'C9001012', region: '西北区域', office: '兰州营业所', dealerStore: '西安家乐惠商贸', status: '异常' }
    ];
  },

  getQaStoreDetails() {
    return [
      { acc: 'ACC-100', storeName: '保定聚昊门店', storeCode: 'C9001001', region: '华北区域', office: '石家庄营业所', dealerStore: '河北聚昊商贸', status: '通过' },
      { acc: 'ACC-100', storeName: '北京朝阳便利店', storeCode: 'C9001002', region: '华北区域', office: '北京营业所', dealerStore: '河北聚昊商贸', status: '异常' },
      { acc: 'ACC-101', storeName: '沈阳商场店', storeCode: 'C9001003', region: '东北区域', office: '沈阳营业所', dealerStore: '沈阳欧亚商贸', status: '通过' },
      { acc: 'ACC-101', storeName: '长春欧亚超市', storeCode: 'C9001004', region: '东北区域', office: '长春营业所', dealerStore: '沈阳欧亚商贸', status: '异常' },
      { acc: 'ACC-102', storeName: '上海虹桥店', storeCode: 'C9001005', region: '华东区域', office: '上海营业所', dealerStore: '上海煊超供应链', status: '通过' },
      { acc: 'ACC-102', storeName: '南京新街口店', storeCode: 'C9001006', region: '华东区域', office: '南京营业所', dealerStore: '上海煊超供应链', status: '通过' },
      { acc: 'ACC-103', storeName: '武汉汉街店', storeCode: 'C9001007', region: '华中区域', office: '武汉营业所', dealerStore: '武汉多客隆商贸', status: '通过' },
      { acc: 'ACC-103', storeName: '郑州万达店', storeCode: 'C9001008', region: '华中区域', office: '郑州营业所', dealerStore: '武汉多客隆商贸', status: '异常' },
      { acc: 'ACC-104', storeName: '广州天河店', storeCode: 'C9001009', region: '华南区域', office: '广州营业所', dealerStore: '广州利好商贸', status: '通过' },
      { acc: 'ACC-104', storeName: '深圳南山店', storeCode: 'C9001010', region: '华南区域', office: '深圳营业所', dealerStore: '广州利好商贸', status: '通过' },
      { acc: 'ACC-105', storeName: '西安高新店', storeCode: 'C9001011', region: '西北区域', office: '西安营业所', dealerStore: '西安家乐惠商贸', status: '通过' },
      { acc: 'ACC-105', storeName: '兰州中心店', storeCode: 'C9001012', region: '西北区域', office: '兰州营业所', dealerStore: '西安家乐惠商贸', status: '异常' }
    ];
  },

  openStoreDetailPreview({ title, subtitle, statusTitle, rows, normalStatus }) {
    const overlay = document.getElementById('overlay-container');
    if (!overlay) return;

    overlay.innerHTML = `
      <div id="dashboard-store-detail-overlay" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-6 backdrop-blur-sm">
        <div class="flex max-h-[82vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="dashboard-store-detail-title">
          <div class="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
            <div>
              <h3 id="dashboard-store-detail-title" class="text-lg font-black text-[#1d2129]">${title}</h3>
              <p class="mt-1 text-sm text-[#86909c]">${subtitle}</p>
            </div>
            <button type="button" id="dashboard-store-detail-close" class="flex h-8 w-8 items-center justify-center rounded-lg text-[#86909c] transition-colors hover:bg-gray-100 hover:text-[#1d2129]" aria-label="关闭">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="min-h-0 flex-1 overflow-auto px-6 py-5">
            <table class="w-full min-w-[980px] table-fixed text-left text-sm text-[#4e5969]">
              <thead class="sticky top-0 z-10 bg-[#f7f8fa] font-semibold text-[#1d2129]">
                <tr>
                  <th class="w-28 rounded-tl-lg px-4 py-3">ACC</th>
                  <th class="w-44 px-4 py-3">门店名称</th>
                  <th class="w-36 px-4 py-3">门店编码</th>
                  <th class="w-36 px-4 py-3">本部（区域）</th>
                  <th class="w-36 px-4 py-3">营业所</th>
                  <th class="w-44 px-4 py-3">经销商门店</th>
                  <th class="w-24 rounded-tr-lg px-4 py-3">${statusTitle}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                ${rows.map((row) => {
                  const normal = row.status === normalStatus;
                  return `
                    <tr class="hover:bg-slate-50">
                      <td class="px-4 py-3 font-semibold text-[#1d2129]">${row.acc}</td>
                      <td class="px-4 py-3">${row.storeName}</td>
                      <td class="px-4 py-3 font-mono text-xs">${row.storeCode}</td>
                      <td class="px-4 py-3">${row.region}</td>
                      <td class="px-4 py-3">${row.office}</td>
                      <td class="px-4 py-3">${row.dealerStore}</td>
                      <td class="px-4 py-3">
                        <span class="inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${normal ? 'border-green-100 bg-green-50 text-green-700' : 'border-red-100 bg-red-50 text-red-600'}">${row.status}</span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
          <div class="flex justify-end border-t border-gray-100 bg-white px-6 py-3 text-xs text-[#86909c]">
            共 ${rows.length} 条门店数据
          </div>
        </div>
      </div>
    `;

    const close = () => { overlay.innerHTML = ''; };
    overlay.querySelector('#dashboard-store-detail-close')?.addEventListener('click', close);
    overlay.querySelector('#dashboard-store-detail-overlay')?.addEventListener('click', (event) => {
      if (event.target.id === 'dashboard-store-detail-overlay') close();
    });
  },

  openFileDetailPreview() {
    this.openStoreDetailPreview({
      title: '区域文件收取明细',
      subtitle: '展示各区域门店 POS 文件收取与异常状态',
      statusTitle: '状态',
      rows: this.getFileStoreDetails(),
      normalStatus: '正常'
    });
  },

  openQaDetailPreview() {
    this.openStoreDetailPreview({
      title: '区域门店质检明细',
      subtitle: '展示各区域门店 POS 数据校验通过与异常状态',
      statusTitle: '质检状态',
      rows: this.getQaStoreDetails(),
      normalStatus: '通过'
    });
  },

  renderSectionHeader(title, desc, buttonText, buttonId) {
    return `
      <div class="flex items-center justify-between gap-4 mb-5">
        <div>
          <h2 class="text-xl font-black text-[#1d2129]">${title}</h2>
          <p class="mt-1 text-sm text-[#86909c]">${desc}</p>
        </div>
        <button type="button" id="${buttonId}" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-100 bg-blue-50 text-sm font-bold text-brand hover:bg-blue-100 transition-colors shrink-0">
          <span>${buttonText}</span>
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    `;
  },

  render() {
    const ledgerRegions = [
      { name: '东北', total: 72, percent: 15 },
      { name: '华北', total: 120, percent: 25 },
      { name: '华东', total: 94, percent: 20 },
      { name: '华南', total: 68, percent: 14 },
      { name: '华中', total: 76, percent: 16 },
      { name: '西北', total: 30, percent: 6 },
      { name: '全国渠道', total: 20, percent: 4 }
    ];

    const fileRegions = [
      { name: '东北', done: 32, error: 2, total: 40, rate: 80 },
      { name: '华北', done: 42, error: 3, total: 50, rate: 85 },
      { name: '华东', done: 53, error: 2, total: 60, rate: 88 },
      { name: '华南', done: 21, error: 1, total: 25, rate: 84 },
      { name: '华中', done: 27, error: 1, total: 30, rate: 90 },
      { name: '西北', done: 15, error: 1, total: 20, rate: 75 },
      { name: '全国渠道', done: 240, error: 10, total: 275, rate: 87 }
    ].map((item) => ({
      ...item,
      doneRate: Math.round((item.done / item.total) * 100),
      errorRate: Math.round((item.error / item.total) * 100)
    }));

    const qaRegions = [
      { name: '东北', done: 14, error: 2, total: 35, rate: 46 },
      { name: '华北', done: 18, error: 2, total: 50, rate: 40 },
      { name: '华东', done: 16, error: 2, total: 45, rate: 40 },
      { name: '华南', done: 9, error: 1, total: 25, rate: 40 },
      { name: '华中', done: 11, error: 1, total: 30, rate: 40 },
      { name: '西北', done: 8, error: 1, total: 20, rate: 45 },
      { name: '全国渠道', done: 18, error: 2, total: 20, rate: 90 }
    ].map((item) => ({
      ...item,
      doneRate: Math.round((item.done / item.total) * 100),
      errorRate: Math.round((item.error / item.total) * 100)
    }));

    return `
      <div class="max-w-[1480px] mx-auto space-y-6 animate-[fadeIn_0.4s_ease-out]">
        <section class="glass-card p-7">
          ${this.renderSectionHeader('平台总览', '汇总当前平台标准 POS 明细和各区域数据规模', '进入台账与汇总', 'dashboard-go-ledger')}
          <div class="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
            ${this.renderMetricCard({
              icon: 'fa-solid fa-table-list',
              title: 'POS明细总数',
              value: '480',
              desc: '当前标准 POS 明细记录总量',
              tone: 'blue'
            })}
            <div class="rounded-xl border border-gray-100 bg-white p-5">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-base font-black text-[#1d2129]">各区域明细总数</h3>
                <span class="text-xs text-[#86909c]">按标准 POS 明细归属区域统计</span>
              </div>
              ${this.renderRegionTotals(ledgerRegions)}
            </div>
          </div>
        </section>

        <section class="glass-card p-7">
          ${this.renderSectionHeader('文件收取', '跟踪应收文件、已收文件、异常文件和收取完成情况', '进入文件收取', 'dashboard-go-ingestion')}
          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
            ${this.renderMetricCard({ icon: 'fa-regular fa-folder-open', title: '应收文件数', value: '450', desc: '本周期应提交文件数', tone: 'slate' })}
            ${this.renderMetricCard({ icon: 'fa-solid fa-file-circle-check', title: '已收文件数', value: '430', desc: '已完成收取文件数', tone: 'green' })}
            ${this.renderMetricCard({ icon: 'fa-solid fa-triangle-exclamation', title: '异常文件数', value: '20', desc: '需人工处理或确认', tone: 'red' })}
            ${this.renderMetricCard({ icon: 'fa-solid fa-percent', title: '文件收取率', value: '95.7%', desc: '已收文件 / 应收文件', tone: 'blue' })}
          </div>
          <div class="rounded-xl border border-gray-100 bg-white p-5">
            <div class="mb-4 flex items-center justify-between gap-3">
              <h3 class="text-base font-black text-[#1d2129]">各区域文件收取情况</h3>
              <button type="button" id="dashboard-file-detail-preview" class="inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-brand transition-colors hover:bg-blue-100">
                <i class="fa-solid fa-table-list"></i>
                <span>明细预览</span>
              </button>
            </div>
            ${this.renderProgressRegions(fileRegions, 'file')}
          </div>
        </section>

        <section class="glass-card p-7">
          ${this.renderSectionHeader('质量检查', '展示门店数据校验、异常识别和整体质检通过情况', '进入质量检查', 'dashboard-go-qa')}
          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
            ${this.renderMetricCard({ icon: 'fa-solid fa-store', title: '应检门店数', value: '20', desc: '进入标准质检的门店数', tone: 'slate' })}
            ${this.renderMetricCard({ icon: 'fa-solid fa-circle-check', title: '通过门店数', value: '18', desc: 'AI 质检通过门店数', tone: 'green' })}
            ${this.renderMetricCard({ icon: 'fa-solid fa-bug', title: '异常门店数', value: '2', desc: '存在字段或数据异常', tone: 'red' })}
            ${this.renderMetricCard({ icon: 'fa-solid fa-shield-check', title: '质检通过率', value: '90%', desc: '通过门店 / 应检门店', tone: 'blue' })}
          </div>
          <div class="rounded-xl border border-gray-100 bg-white p-5">
            <div class="mb-4 flex items-center justify-between gap-3">
              <h3 class="text-base font-black text-[#1d2129]">各区域门店数据校验量</h3>
              <button type="button" id="dashboard-qa-detail-preview" class="inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-brand transition-colors hover:bg-blue-100">
                <i class="fa-solid fa-table-list"></i>
                <span>明细预览</span>
              </button>
            </div>
            ${this.renderProgressRegions(qaRegions, 'qa')}
          </div>
        </section>
      </div>
    `;
  },

  mount() {
    const go = (id, hash) => {
      const button = document.getElementById(id);
      if (button) {
        button.addEventListener('click', () => {
          window.location.hash = hash;
        });
      }
    };

    go('dashboard-go-ledger', '#ledger');
    go('dashboard-go-ingestion', '#ingestion');
    go('dashboard-go-qa', '#qa');
    document.getElementById('dashboard-file-detail-preview')?.addEventListener('click', () => {
      this.openFileDetailPreview();
    });
    document.getElementById('dashboard-qa-detail-preview')?.addEventListener('click', () => {
      this.openQaDetailPreview();
    });
  },

  bindEvents() {
    this.mount();
  }
};

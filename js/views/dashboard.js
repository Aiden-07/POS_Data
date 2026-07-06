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
            <h3 class="text-base font-black text-[#1d2129] mb-4">各区域文件收取情况</h3>
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
            <h3 class="text-base font-black text-[#1d2129] mb-4">各区域门店数据校验量</h3>
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
  }
};

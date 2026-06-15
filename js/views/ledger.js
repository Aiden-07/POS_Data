const LedgerView = {
  renderAction() {
    return `
      <div class="flex items-center text-sm text-[#1d2129] font-bold mr-6">
        <span class="w-1 h-4 bg-brand rounded-full mr-2"></span>
        <span data-i18n="nav_ledger">台账与汇总</span>
      </div>
      <div class="flex gap-3 items-center ml-auto">
        <div class="relative">
          <i class="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86909c]"></i>
          <input type="text" placeholder="文件名 / 门店..." class="pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white text-sm text-[#4e5969] focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 w-56 transition-all shadow-sm">
        </div>
        
        <select id="ledger-filter-team" class="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm text-[#4e5969] focus:outline-none focus:border-brand shadow-sm transition-all">
          <option>All Teams</option>
          <option>Team A</option>
          <option>Team B</option>
        </select>
        
        <select id="ledger-filter-month" class="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm text-[#4e5969] focus:outline-none focus:border-brand shadow-sm transition-all">
          <option>2026-05</option>
          <option>2026-04</option>
        </select>
        
        <div class="w-px h-6 bg-gray-200 mx-2"></div>
        
        <button class="px-4 py-2 border border-gray-200 text-[#4e5969] rounded-lg bg-white hover:bg-gray-50 text-sm font-medium transition-colors shadow-sm" data-i18n="generate_summary">生成月度汇总</button>
        <button class="px-4 py-2 bg-brand text-white rounded-lg hover:bg-[#0e42d2] text-sm font-medium transition-all shadow-sm shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-0.5" data-i18n="preview_download">预览与下载</button>
      </div>
    `;
  },
  
  render() {
    return `
      <div class="bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white flex flex-col h-[calc(100vh-140px)] overflow-hidden animate-[fadeIn_0.4s_ease-out]">
        <div class="px-7 py-5 border-b border-gray-100 bg-white shrink-0">
          <h3 class="font-bold text-[#1d2129] text-base">标准化 POS 明细台账</h3>
        </div>
        <div class="overflow-auto flex-1 relative px-2">
          <table class="w-full text-left text-sm text-[#4e5969]" id="ledger-table">
            <thead class="bg-[#f7f8fa] text-[#1d2129] font-medium sticky top-0 z-10">
              <tr>
                <th class="px-5 py-4 rounded-tl-lg">Record ID</th>
                <th class="px-5 py-4">Store</th>
                <th class="px-5 py-4">Team</th>
                <th class="px-5 py-4">Barcode</th>
                <th class="px-5 py-4">Product Name</th>
                <th class="px-5 py-4 text-right">Qty</th>
                <th class="px-5 py-4 text-right rounded-tr-lg">Total Amount</th>
              </tr>
            </thead>
            <tbody id="ledger-tbody" class="divide-y divide-gray-100">
              ${this.getSkeletonRows()}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },
  
  getSkeletonRows() {
    return Array(5).fill(0).map(() => `
      <tr>
        <td class="px-5 py-4"><div class="h-4 w-16 skeleton rounded"></div></td>
        <td class="px-5 py-4"><div class="h-4 w-24 skeleton rounded"></div></td>
        <td class="px-5 py-4"><div class="h-4 w-20 skeleton rounded"></div></td>
        <td class="px-5 py-4"><div class="h-4 w-32 skeleton rounded"></div></td>
        <td class="px-5 py-4"><div class="h-4 w-40 skeleton rounded"></div></td>
        <td class="px-5 py-4"><div class="h-4 w-8 skeleton rounded ml-auto"></div></td>
        <td class="px-5 py-4"><div class="h-4 w-16 skeleton rounded ml-auto"></div></td>
      </tr>
    `).join('');
  },
  
  getRealRows() {
    return `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="px-4 py-3 font-mono text-xs text-slate-400">REC-001</td>
        <td class="px-4 py-3 font-medium text-slate-700">万象城店</td>
        <td class="px-4 py-3">Team A</td>
        <td class="px-4 py-3 font-mono text-[#86909c]">6901234567890</td>
        <td class="px-4 py-3">Coca Cola 500ml</td>
        <td class="px-4 py-3 text-right">120</td>
        <td class="px-4 py-3 text-right font-medium text-[#1d2129]">¥ 420.00</td>
      </tr>
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="px-4 py-3 font-mono text-xs text-slate-400">REC-002</td>
        <td class="px-4 py-3 font-medium text-slate-700">万象城店</td>
        <td class="px-4 py-3">Team A</td>
        <td class="px-4 py-3 font-mono text-[#86909c]">6909876543210</td>
        <td class="px-4 py-3">Lays Chips 330ml</td>
        <td class="px-4 py-3 text-right">45</td>
        <td class="px-4 py-3 text-right font-medium text-[#1d2129]">¥ 180.00</td>
      </tr>
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="px-4 py-3 font-mono text-xs text-slate-400">REC-003</td>
        <td class="px-4 py-3 font-medium text-slate-700">明洞店</td>
        <td class="px-4 py-3">Team B</td>
        <td class="px-4 py-3 font-mono text-[#86909c]">8801234567890</td>
        <td class="px-4 py-3">Soju 360ml</td>
        <td class="px-4 py-3 text-right">200</td>
        <td class="px-4 py-3 text-right font-medium text-[#1d2129]">¥ 1,200.00</td>
      </tr>
    `;
  },
  
  loadDataMock() {
    const tbody = document.getElementById('ledger-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = this.getSkeletonRows();
    
    setTimeout(() => {
      const tb = document.getElementById('ledger-tbody');
      if (tb) tb.innerHTML = this.getRealRows();
    }, 500);
  },
  
  bindEvents() {
    this.loadDataMock();
    
    const reloadOnSelect = (id) => {
      document.getElementById(id)?.addEventListener('change', () => {
        this.loadDataMock();
      });
    };
    
    reloadOnSelect('ledger-filter-team');
    reloadOnSelect('ledger-filter-month');
  }
};
const SDKView = {
  renderAction() {
    return `
      <div class="flex items-center text-sm text-[#1d2129] font-bold mr-6">
        <span class="w-1 h-4 bg-brand rounded-full mr-2"></span>
        <span data-i18n="nav_sdk">SDK 窗口</span>
      </div>
    `;
  },
  
  render() {
    return `
      <div class="max-w-4xl mx-auto space-y-6 animate-[fadeIn_0.4s_ease-out]">
        <div class="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white">
          <h2 class="text-xl font-bold text-[#1d2129] mb-3 flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-blue-50 text-brand flex items-center justify-center"><i class="fa-solid fa-terminal"></i></div>
            Data Export API Interface
          </h2>
          <p class="text-sm text-[#86909c] mb-8">
            Use this interface to test data extraction payloads. Select your parameters below and generate a mock Excel output.
          </p>
          
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-semibold text-[#1d2129] mb-2">Target Table</label>
              <select class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-[#f7f8fa] focus:bg-white focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all text-sm text-[#4e5969]">
                <option>pos_standardized_ledger_v2</option>
                <option>pos_monthly_summary_view</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-[#1d2129] mb-2">Query Parameters (JSON)</label>
              <textarea rows="4" class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-[#f7f8fa] focus:bg-white focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all text-sm font-mono text-[#4e5969] resize-none leading-relaxed">
{
  "date_range": ["2026-05-01", "2026-05-31"],
  "teams": ["Team A", "Team B"],
  "format": "xlsx",
  "include_metadata": true
}</textarea>
            </div>
            
            <div class="pt-6 mt-6 border-t border-gray-100 flex justify-end">
              <button id="btn-sdk-export" class="px-6 py-3 bg-brand text-white rounded-xl hover:bg-[#0e42d2] font-semibold transition-all duration-300 shadow-lg shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-0.5 flex items-center gap-2" data-i18n="excel_export">
                <i class="fa-solid fa-download"></i> Excel 结果输出
              </button>
            </div>
          </div>
        </div>
        
        <div class="bg-[#1d2129] rounded-2xl shadow-xl overflow-hidden border border-gray-800">
          <div class="px-5 py-3 bg-[#272c36] flex items-center gap-2 border-b border-gray-800">
            <div class="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div class="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div class="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            <span class="ml-3 text-xs font-mono text-[#86909c]">terminal / console</span>
          </div>
          <div class="p-5 text-sm font-mono text-[#27c93f] h-56 overflow-auto leading-relaxed" id="sdk-console">
            > System initialized.<br>
            > Ready for API testing...
          </div>
        </div>
      </div>
    `;
  },
  
  bindEvents() {
    document.getElementById('btn-sdk-export')?.addEventListener('click', () => {
      const consoleEl = document.getElementById('sdk-console');
      const time = new Date().toLocaleTimeString();
      
      consoleEl.innerHTML += `<br>> [${time}] Generating payload...`;
      consoleEl.innerHTML += `<br>> [${time}] Fetching from pos_standardized_ledger_v2...`;
      consoleEl.innerHTML += `<br>> [${time}] Formatting to .xlsx...`;
      
      setTimeout(() => {
        consoleEl.innerHTML += `<br>> [${new Date().toLocaleTimeString()}] Download triggered.`;
        consoleEl.scrollTop = consoleEl.scrollHeight;
        
        // Create mock download
        const blob = new Blob(['Mock Excel Data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'export_mock.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        Dialog.toast('Excel 文件已下载 / Excel 파일이 다운로드되었습니다', 'success');
      }, 800);
    });
  }
};
const DashboardView = {
  renderAction() {
    return '';
  },
  
  render() {
    return `
      <div class="max-w-[1480px] mx-auto space-y-6 animate-[fadeIn_0.4s_ease-out]">
        <!-- KPI Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="glass-card p-7 hover:-translate-y-1 transition-all duration-300 group">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="flex items-center gap-2 text-[#86909c] text-xs font-semibold mb-3">
                  <div class="w-8 h-8 rounded-xl bg-blue-50 text-brand flex items-center justify-center"><i class="fa-solid fa-folder-open"></i></div>
                  <span class="whitespace-nowrap" data-i18n="dashboard_kpi_1">总文件数</span>
                </div>
                <div class="text-2xl font-extrabold text-[#1d2129] mb-2 whitespace-nowrap">450</div>
              </div>
              <svg class="w-16 h-10 mt-1" viewBox="0 0 72 42" fill="none">
                <path d="M2 33 C13 27 16 18 28 21 C40 24 43 9 55 11 C63 12 66 8 70 5" stroke="#165dff" stroke-width="3" stroke-linecap="round" class="chart-line"/>
              </svg>
            </div>
          </div>
          
          <div id="kpi-pending" class="glass-card p-7 hover:-translate-y-1 transition-all duration-300 group cursor-pointer hover:border-brand/30">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="flex items-center gap-2 text-[#86909c] text-xs font-semibold mb-3">
                  <div class="w-8 h-8 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center"><i class="fa-regular fa-clock"></i></div>
                  <span class="whitespace-nowrap" data-i18n="dashboard_kpi_2">待处理数量</span>
                </div>
                <div class="text-2xl font-extrabold text-brand mb-2">14</div>
              </div>
              <svg class="w-16 h-10 mt-1" viewBox="0 0 72 42" fill="none">
                <path d="M2 12 C13 14 17 31 28 27 C41 23 43 16 55 18 C64 19 66 12 70 10" stroke="#f97316" stroke-width="3" stroke-linecap="round" class="chart-line"/>
              </svg>
            </div>
            <div class="text-xs text-[#165dff] flex items-center gap-1 font-semibold bg-blue-50 w-fit px-2.5 py-1 rounded-full"><i class="fa-solid fa-bell"></i> 需优先处理</div>
          </div>
          
          <div class="glass-card p-7 hover:-translate-y-1 transition-all duration-300 group">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="flex items-center gap-2 text-[#86909c] text-xs font-semibold mb-3">
                  <div class="w-8 h-8 rounded-xl bg-blue-50 text-brand flex items-center justify-center"><i class="fa-solid fa-file-import"></i></div>
                  <span class="whitespace-nowrap" data-i18n="dashboard_kpi_3">当日接入量</span>
                </div>
                <div class="text-2xl font-extrabold text-[#1d2129] mb-2">328</div>
              </div>
              <svg class="w-16 h-10 mt-1" viewBox="0 0 72 42" fill="none">
                <path d="M2 34 C12 30 16 24 26 25 C38 26 41 11 52 14 C62 17 64 28 70 20" stroke="#165dff" stroke-width="3" stroke-linecap="round" class="chart-line"/>
              </svg>
            </div>
            <div class="text-xs text-[#165dff] flex items-center gap-1 font-semibold bg-blue-50 w-fit px-2.5 py-1 rounded-full"><i class="fa-solid fa-arrow-trend-up"></i> 同比 +5.2%</div>
          </div>
          
          <div class="glass-card p-7 hover:-translate-y-1 transition-all duration-300 group">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="flex items-center gap-2 text-[#86909c] text-xs font-semibold mb-3">
                  <div class="w-8 h-8 rounded-xl bg-green-50 text-green-500 flex items-center justify-center"><i class="fa-regular fa-circle-check"></i></div>
                  <span class="whitespace-nowrap" data-i18n="dashboard_kpi_4">处理完成率</span>
                </div>
                <div class="text-2xl font-extrabold text-[#1d2129] mb-2">95.7%</div>
              </div>
              <svg class="w-16 h-10 mt-1" viewBox="0 0 72 42" fill="none">
                <path d="M2 35 C16 32 18 24 29 20 C42 15 47 18 56 10 C63 5 67 7 70 4" stroke="#22c55e" stroke-width="3" stroke-linecap="round" class="chart-line"/>
              </svg>
            </div>
          </div>

        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section class="glass-card p-7 xl:col-span-2">
            <div class="flex items-center justify-between gap-4 mb-6">
              <div>
                <h3 class="font-extrabold text-[#1d2129] text-base">文件收取趋势</h3>
              </div>
            </div>
            <div class="h-72 relative overflow-hidden rounded-2xl bg-gradient-to-b from-white to-[#f7faff] border border-blue-50">
              <svg viewBox="0 0 720 260" class="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="#165dff" stop-opacity="0.35"/>
                    <stop offset="100%" stop-color="#165dff" stop-opacity="0.02"/>
                  </linearGradient>
                </defs>
                <g stroke="#dbeafe" stroke-width="1">
                  <line x1="50" y1="40" x2="700" y2="40"/><line x1="50" y1="78" x2="700" y2="78"/><line x1="50" y1="116" x2="700" y2="116"/><line x1="50" y1="154" x2="700" y2="154"/><line x1="50" y1="192" x2="700" y2="192"/>
                </g>
                <g stroke="#dbeafe" stroke-width="1" stroke-dasharray="4,4">
                  <line x1="40" y1="40" x2="40" y2="235"/><line x1="150" y1="40" x2="150" y2="235"/><line x1="260" y1="40" x2="260" y2="235"/><line x1="370" y1="40" x2="370" y2="235"/><line x1="480" y1="40" x2="480" y2="235"/><line x1="590" y1="40" x2="590" y2="235"/><line x1="700" y1="40" x2="700" y2="235"/>
                </g>
                <g fill="#86909c" font-size="11" font-family="system-ui">
                  <text x="8" y="44" text-anchor="start">250</text>
                  <text x="8" y="82" text-anchor="start">200</text>
                  <text x="8" y="120" text-anchor="start">150</text>
                  <text x="8" y="158" text-anchor="start">100</text>
                  <text x="8" y="196" text-anchor="start">50</text>
                  <text x="8" y="234" text-anchor="start">0</text>
                </g>
                <path d="M40 205 C105 188 118 118 176 126 C242 136 250 176 318 150 C384 124 407 84 472 105 C535 126 555 172 618 148 C660 132 676 93 700 102 L700 235 L40 235 Z" fill="url(#areaGradient)"/>
                <path d="M40 205 C105 188 118 118 176 126 C242 136 250 176 318 150 C384 124 407 84 472 105 C535 126 555 172 618 148 C660 132 676 93 700 102" fill="none" stroke="#165dff" stroke-width="4" stroke-linecap="round" class="chart-line"/>
                <g id="chart-data-points">
                  <rect x="30" y="40" width="40" height="200" fill="transparent" class="data-point" data-value="60" data-label="周一" style="pointer-events: all;"/>
                  <rect x="130" y="40" width="40" height="200" fill="transparent" class="data-point" data-value="140" data-label="周二" style="pointer-events: all;"/>
                  <rect x="240" y="40" width="40" height="200" fill="transparent" class="data-point" data-value="100" data-label="周三" style="pointer-events: all;"/>
                  <rect x="350" y="40" width="40" height="200" fill="transparent" class="data-point" data-value="200" data-label="周四" style="pointer-events: all;"/>
                  <rect x="460" y="40" width="40" height="200" fill="transparent" class="data-point" data-value="180" data-label="周五" style="pointer-events: all;"/>
                  <rect x="570" y="40" width="40" height="200" fill="transparent" class="data-point" data-value="105" data-label="周六" style="pointer-events: all;"/>
                  <rect x="680" y="40" width="40" height="200" fill="transparent" class="data-point" data-value="185" data-label="周日" style="pointer-events: all;"/>
                </g>
              </svg>
              <div id="chart-tooltip" class="absolute hidden bg-white px-3 py-2 rounded-lg shadow-lg border border-blue-100 text-xs z-10">
                <div class="font-bold text-[#1d2129]" id="tooltip-value"></div>
                <div class="text-[#86909c]" id="tooltip-label"></div>
              </div>
              <div class="absolute bottom-4 left-12 right-7 flex justify-between text-xs text-[#86909c]">
                <span>周一</span><span>周二</span><span>周三</span><span>周四</span><span>周五</span><span>周六</span><span>周日</span>
              </div>
            </div>
          </section>

          <section class="glass-card p-7">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h3 class="font-extrabold text-[#1d2129] text-base">营业Team占比</h3>
                <p class="text-xs text-[#86909c] mt-1">POS数据来源结构</p>
              </div>
            </div>
            <div class="flex items-center justify-center">
              <div class="relative w-52 h-52">
                <div class="absolute inset-0 rounded-full" style="background: conic-gradient(#1e3a8a 0 20%, #2563eb 20% 32%, #3b82f6 32% 50%, #60a5fa 50% 66%, #93c5fd 66% 80%, #bfdbfe 80% 90%, #dbeafe 90% 100%);"></div>
                <div class="absolute inset-7 rounded-full bg-white shadow-inner flex flex-col items-center justify-center">
                  <span class="text-xs text-[#86909c]">总POS表</span>
                  <strong class="text-2xl text-[#1d2129]">1,024</strong>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-y-3 gap-x-6 mt-6 text-xs text-[#4e5969]">
              <span class="flex items-center gap-2"><i class="w-2 h-2 rounded-full bg-[#1e3a8a]"></i>华北 Team</span>
              <span class="flex items-center gap-2"><i class="w-2 h-2 rounded-full bg-[#2563eb]"></i>东北 Team</span>
              <span class="flex items-center gap-2"><i class="w-2 h-2 rounded-full bg-[#3b82f6]"></i>华东 Team</span>
              <span class="flex items-center gap-2"><i class="w-2 h-2 rounded-full bg-[#60a5fa]"></i>华中 Team</span>
              <span class="flex items-center gap-2"><i class="w-2 h-2 rounded-full bg-[#93c5fd]"></i>华南 Team</span>
              <span class="flex items-center gap-2"><i class="w-2 h-2 rounded-full bg-[#bfdbfe]"></i>西南 Team</span>
              <span class="flex items-center gap-2"><i class="w-2 h-2 rounded-full bg-[#dbeafe]"></i>西北 Team</span>
            </div>
          </section>
        </div>
        
        <!-- Progress Tracking -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div class="glass-card overflow-hidden xl:col-span-2">
          <div class="px-7 py-5 border-b border-blue-50 flex justify-between items-center bg-white/50">
            <div>
              <h3 class="font-extrabold text-[#1d2129] text-base">待处理队列</h3>
              <p class="text-xs text-[#86909c] mt-1">文件收取中需优先关注的事项</p>
            </div>
            <div class="flex items-center gap-2">
              <select id="queue-team-filter" class="px-3 py-1.5 text-xs border border-blue-100 rounded-lg bg-white text-[#4e5969] focus:outline-none focus:border-brand">
                <option value="">全部 Team</option>
                <option value="华北 Team">华北 Team</option>
                <option value="东北 Team">东北 Team</option>
                <option value="华东 Team">华东 Team</option>
                <option value="华中 Team">华中 Team</option>
                <option value="华南 Team">华南 Team</option>
                <option value="西南 Team">西南 Team</option>
                <option value="西北 Team">西北 Team</option>
              </select>
              <button class="w-9 h-9 rounded-lg bg-blue-50 text-brand hover:bg-[#165dff] hover:text-white"><i class="fa-solid fa-arrow-right"></i></button>
            </div>
          </div>
          <div class="overflow-auto">
            <table class="w-full text-left text-sm text-[#4e5969]">
              <thead class="bg-[#f7f8fa]">
                <tr>
                  <th class="px-5 py-4">文件名称</th>
                  <th class="px-5 py-4">营业Team</th>
                  <th class="px-5 py-4">状态</th>
                  <th class="px-5 py-4">处理人</th>
                  <th class="px-5 py-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody id="queue-tbody" class="divide-y divide-gray-100">
                <!-- 第1页数据 -->
                <tr data-page="1">
                  <td class="px-5 py-4 font-semibold text-[#1d2129]">POS_Store_A_0522.xlsx</td>
                  <td class="px-5 py-4">华北 Team</td>
                  <td class="px-5 py-4"><span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">待处理</span></td>
                  <td class="px-5 py-4">POS担当</td>
                  <td class="px-5 py-4 text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button class="w-7 h-7 rounded text-green-600 hover:bg-green-50" title="通过"><i class="fa-solid fa-check"></i></button>
                      <button class="w-7 h-7 rounded text-red-500 hover:bg-red-50" title="驳回"><i class="fa-solid fa-xmark"></i></button>
                      <button class="w-7 h-7 rounded text-brand hover:bg-blue-50" title="预览"><i class="fa-regular fa-eye"></i></button>
                      <button class="w-7 h-7 rounded text-[#86909c] hover:bg-gray-50" title="归档"><i class="fa-solid fa-archive"></i></button>
                    </div>
                  </td>
                </tr>
                <tr data-page="1">
                  <td class="px-5 py-4 font-semibold text-[#1d2129]">POS_Store_B_0522.csv</td>
                  <td class="px-5 py-4">东北 Team</td>
                  <td class="px-5 py-4"><span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-brand border border-blue-100">异常</span></td>
                  <td class="px-5 py-4">东北 Team</td>
                  <td class="px-5 py-4 text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button class="w-7 h-7 rounded text-green-600 hover:bg-green-50" title="通过"><i class="fa-solid fa-check"></i></button>
                      <button class="w-7 h-7 rounded text-red-500 hover:bg-red-50" title="驳回"><i class="fa-solid fa-xmark"></i></button>
                      <button class="w-7 h-7 rounded text-brand hover:bg-blue-50" title="预览"><i class="fa-regular fa-eye"></i></button>
                      <button class="w-7 h-7 rounded text-[#86909c] hover:bg-gray-50" title="归档"><i class="fa-solid fa-archive"></i></button>
                    </div>
                  </td>
                </tr>
                <tr data-page="1">
                  <td class="px-5 py-4 font-semibold text-[#1d2129]">POS_Store_C_0521.xlsx</td>
                  <td class="px-5 py-4">华东 Team</td>
                  <td class="px-5 py-4"><span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">待处理</span></td>
                  <td class="px-5 py-4">POS担当</td>
                  <td class="px-5 py-4 text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button class="w-7 h-7 rounded text-green-600 hover:bg-green-50" title="通过"><i class="fa-solid fa-check"></i></button>
                      <button class="w-7 h-7 rounded text-red-500 hover:bg-red-50" title="驳回"><i class="fa-solid fa-xmark"></i></button>
                      <button class="w-7 h-7 rounded text-brand hover:bg-blue-50" title="预览"><i class="fa-regular fa-eye"></i></button>
                      <button class="w-7 h-7 rounded text-[#86909c] hover:bg-gray-50" title="归档"><i class="fa-solid fa-archive"></i></button>
                    </div>
                  </td>
                </tr>
                <tr data-page="1">
                  <td class="px-5 py-4 font-semibold text-[#1d2129]">POS_Store_D_0520.xlsx</td>
                  <td class="px-5 py-4">华中 Team</td>
                  <td class="px-5 py-4"><span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">待处理</span></td>
                  <td class="px-5 py-4">POS担当</td>
                  <td class="px-5 py-4 text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button class="w-7 h-7 rounded text-green-600 hover:bg-green-50" title="通过"><i class="fa-solid fa-check"></i></button>
                      <button class="w-7 h-7 rounded text-red-500 hover:bg-red-50" title="驳回"><i class="fa-solid fa-xmark"></i></button>
                      <button class="w-7 h-7 rounded text-brand hover:bg-blue-50" title="预览"><i class="fa-regular fa-eye"></i></button>
                      <button class="w-7 h-7 rounded text-[#86909c] hover:bg-gray-50" title="归档"><i class="fa-solid fa-archive"></i></button>
                    </div>
                  </td>
                </tr>
                <tr data-page="1">
                  <td class="px-5 py-4 font-semibold text-[#1d2129]">POS_Store_E_0519.csv</td>
                  <td class="px-5 py-4">华南 Team</td>
                  <td class="px-5 py-4"><span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-brand border border-blue-100">异常</span></td>
                  <td class="px-5 py-4">华南 Team</td>
                  <td class="px-5 py-4 text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button class="w-7 h-7 rounded text-green-600 hover:bg-green-50" title="通过"><i class="fa-solid fa-check"></i></button>
                      <button class="w-7 h-7 rounded text-red-500 hover:bg-red-50" title="驳回"><i class="fa-solid fa-xmark"></i></button>
                      <button class="w-7 h-7 rounded text-brand hover:bg-blue-50" title="预览"><i class="fa-regular fa-eye"></i></button>
                      <button class="w-7 h-7 rounded text-[#86909c] hover:bg-gray-50" title="归档"><i class="fa-solid fa-archive"></i></button>
                    </div>
                  </td>
                </tr>
                <!-- 第2页数据 -->
                <tr data-page="2" class="hidden">
                  <td class="px-5 py-4 font-semibold text-[#1d2129]">POS_Store_F_0518.xlsx</td>
                  <td class="px-5 py-4">西南 Team</td>
                  <td class="px-5 py-4"><span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">待处理</span></td>
                  <td class="px-5 py-4">POS担当</td>
                  <td class="px-5 py-4 text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button class="w-7 h-7 rounded text-green-600 hover:bg-green-50" title="通过"><i class="fa-solid fa-check"></i></button>
                      <button class="w-7 h-7 rounded text-red-500 hover:bg-red-50" title="驳回"><i class="fa-solid fa-xmark"></i></button>
                      <button class="w-7 h-7 rounded text-brand hover:bg-blue-50" title="预览"><i class="fa-regular fa-eye"></i></button>
                      <button class="w-7 h-7 rounded text-[#86909c] hover:bg-gray-50" title="归档"><i class="fa-solid fa-archive"></i></button>
                    </div>
                  </td>
                </tr>
                <tr data-page="2" class="hidden">
                  <td class="px-5 py-4 font-semibold text-[#1d2129]">POS_Store_G_0517.csv</td>
                  <td class="px-5 py-4">西北 Team</td>
                  <td class="px-5 py-4"><span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-brand border border-blue-100">异常</span></td>
                  <td class="px-5 py-4">西北 Team</td>
                  <td class="px-5 py-4 text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button class="w-7 h-7 rounded text-green-600 hover:bg-green-50" title="通过"><i class="fa-solid fa-check"></i></button>
                      <button class="w-7 h-7 rounded text-red-500 hover:bg-red-50" title="驳回"><i class="fa-solid fa-xmark"></i></button>
                      <button class="w-7 h-7 rounded text-brand hover:bg-blue-50" title="预览"><i class="fa-regular fa-eye"></i></button>
                      <button class="w-7 h-7 rounded text-[#86909c] hover:bg-gray-50" title="归档"><i class="fa-solid fa-archive"></i></button>
                    </div>
                  </td>
                </tr>
                <tr data-page="2" class="hidden">
                  <td class="px-5 py-4 font-semibold text-[#1d2129]">POS_Store_H_0516.xlsx</td>
                  <td class="px-5 py-4">华北 Team</td>
                  <td class="px-5 py-4"><span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">待处理</span></td>
                  <td class="px-5 py-4">POS担当</td>
                  <td class="px-5 py-4 text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button class="w-7 h-7 rounded text-green-600 hover:bg-green-50" title="通过"><i class="fa-solid fa-check"></i></button>
                      <button class="w-7 h-7 rounded text-red-500 hover:bg-red-50" title="驳回"><i class="fa-solid fa-xmark"></i></button>
                      <button class="w-7 h-7 rounded text-brand hover:bg-blue-50" title="预览"><i class="fa-regular fa-eye"></i></button>
                      <button class="w-7 h-7 rounded text-[#86909c] hover:bg-gray-50" title="归档"><i class="fa-solid fa-archive"></i></button>
                    </div>
                  </td>
                </tr>
                <tr data-page="2" class="hidden">
                  <td class="px-5 py-4 font-semibold text-[#1d2129]">POS_Store_I_0515.csv</td>
                  <td class="px-5 py-4">东北 Team</td>
                  <td class="px-5 py-4"><span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">待处理</span></td>
                  <td class="px-5 py-4">POS担当</td>
                  <td class="px-5 py-4 text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button class="w-7 h-7 rounded text-green-600 hover:bg-green-50" title="通过"><i class="fa-solid fa-check"></i></button>
                      <button class="w-7 h-7 rounded text-red-500 hover:bg-red-50" title="驳回"><i class="fa-solid fa-xmark"></i></button>
                      <button class="w-7 h-7 rounded text-brand hover:bg-blue-50" title="预览"><i class="fa-regular fa-eye"></i></button>
                      <button class="w-7 h-7 rounded text-[#86909c] hover:bg-gray-50" title="归档"><i class="fa-solid fa-archive"></i></button>
                    </div>
                  </td>
                </tr>
                <tr data-page="2" class="hidden">
                  <td class="px-5 py-4 font-semibold text-[#1d2129]">POS_Store_J_0514.xlsx</td>
                  <td class="px-5 py-4">华东 Team</td>
                  <td class="px-5 py-4"><span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-brand border border-blue-100">异常</span></td>
                  <td class="px-5 py-4">华东 Team</td>
                  <td class="px-5 py-4 text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button class="w-7 h-7 rounded text-green-600 hover:bg-green-50" title="通过"><i class="fa-solid fa-check"></i></button>
                      <button class="w-7 h-7 rounded text-red-500 hover:bg-red-50" title="驳回"><i class="fa-solid fa-xmark"></i></button>
                      <button class="w-7 h-7 rounded text-brand hover:bg-blue-50" title="预览"><i class="fa-regular fa-eye"></i></button>
                      <button class="w-7 h-7 rounded text-[#86909c] hover:bg-gray-50" title="归档"><i class="fa-solid fa-archive"></i></button>
                    </div>
                  </td>
                </tr>
                <!-- 第3页数据 -->
                <tr data-page="3" class="hidden">
                  <td class="px-5 py-4 font-semibold text-[#1d2129]">POS_Store_K_0513.csv</td>
                  <td class="px-5 py-4">华中 Team</td>
                  <td class="px-5 py-4"><span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">待处理</span></td>
                  <td class="px-5 py-4">POS担当</td>
                  <td class="px-5 py-4 text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button class="w-7 h-7 rounded text-green-600 hover:bg-green-50" title="通过"><i class="fa-solid fa-check"></i></button>
                      <button class="w-7 h-7 rounded text-red-500 hover:bg-red-50" title="驳回"><i class="fa-solid fa-xmark"></i></button>
                      <button class="w-7 h-7 rounded text-brand hover:bg-blue-50" title="预览"><i class="fa-regular fa-eye"></i></button>
                      <button class="w-7 h-7 rounded text-[#86909c] hover:bg-gray-50" title="归档"><i class="fa-solid fa-archive"></i></button>
                    </div>
                  </td>
                </tr>
                <tr data-page="3" class="hidden">
                  <td class="px-5 py-4 font-semibold text-[#1d2129]">POS_Store_L_0512.xlsx</td>
                  <td class="px-5 py-4">华南 Team</td>
                  <td class="px-5 py-4"><span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">待处理</span></td>
                  <td class="px-5 py-4">POS担当</td>
                  <td class="px-5 py-4 text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button class="w-7 h-7 rounded text-green-600 hover:bg-green-50" title="通过"><i class="fa-solid fa-check"></i></button>
                      <button class="w-7 h-7 rounded text-red-500 hover:bg-red-50" title="驳回"><i class="fa-solid fa-xmark"></i></button>
                      <button class="w-7 h-7 rounded text-brand hover:bg-blue-50" title="预览"><i class="fa-regular fa-eye"></i></button>
                      <button class="w-7 h-7 rounded text-[#86909c] hover:bg-gray-50" title="归档"><i class="fa-solid fa-archive"></i></button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- 分页 -->
          <div class="px-7 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
            <div class="text-xs text-[#86909c]">共 <span id="total-count">12</span> 条数据</div>
            <div class="flex items-center gap-2">
              <button id="prev-page" class="px-3 py-1.5 text-xs rounded bg-gray-100 text-[#4e5969] hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                <i class="fa-solid fa-chevron-left"></i> 上一页
              </button>
              <div id="page-numbers" class="flex items-center gap-1">
                <button class="page-btn w-7 h-7 rounded text-xs font-medium bg-brand text-white" data-page="1">1</button>
                <button class="page-btn w-7 h-7 rounded text-xs font-medium text-[#4e5969] hover:bg-gray-100" data-page="2">2</button>
                <button class="page-btn w-7 h-7 rounded text-xs font-medium text-[#4e5969] hover:bg-gray-100" data-page="3">3</button>
              </div>
              <button id="next-page" class="px-3 py-1.5 text-xs rounded bg-gray-100 text-[#4e5969] hover:bg-gray-200">
                下一页 <i class="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="glass-card overflow-hidden xl:col-span-1">
          <div class="px-7 py-5 border-b border-blue-50 flex justify-between items-center bg-white/50">
            <div>
              <h3 class="font-extrabold text-[#1d2129] text-base">Team 数据提报进度</h3>
              <p class="text-xs text-[#86909c] mt-1">按团队跟踪标准文件提报完成情况</p>
            </div>
            <button id="progress-sort-btn" class="px-3 py-1.5 text-xs rounded-lg bg-blue-50 text-brand hover:bg-brand hover:text-white transition-colors flex items-center gap-2">
              <i class="fa-solid fa-arrow-down"></i>
              降序
            </button>
          </div>
          <div class="p-7 space-y-7" style="background-color: #e0f2fe;">
            <div class="group">
              <div class="flex justify-between text-sm mb-2.5">
                <span class="font-medium text-[#1d2129] flex items-center gap-2"><i class="fa-solid fa-circle text-[8px] text-[#1e3a8a]"></i> 华北 Team</span>
                <span class="text-[#1d2129] font-bold">120 / 120 <span class="text-[#86909c] font-normal ml-1">(100%)</span></span>
              </div>
              <div class="w-full bg-[#cfd2d3] rounded-full h-2.5 overflow-hidden">
                <div class="progress-fill bg-[#cfd2d3] bg-gradient-to-r from-[#2563eb] to-[#1e3a8a] h-full rounded-full relative w-full transition-all duration-1000"></div>
              </div>
            </div>
            
            <div class="group">
              <div class="flex justify-between text-sm mb-2.5">
                <span class="font-medium text-[#1d2129] flex items-center gap-2"><i class="fa-solid fa-circle text-[8px] text-[#93c5fd]"></i> 华南 Team</span>
                <span class="text-[#1d2129] font-bold">110 / 110 <span class="text-[#86909c] font-normal ml-1">(100%)</span></span>
              </div>
              <div class="w-full bg-[#cfd2d3] rounded-full h-2.5 overflow-hidden">
                <div class="progress-fill bg-[#cfd2d3] bg-gradient-to-r from-[#bfdbfe] to-[#93c5fd] h-full rounded-full relative w-full transition-all duration-1000"></div>
              </div>
            </div>
            
            <div class="group">
              <div class="flex justify-between text-sm mb-2.5">
                <span class="font-medium text-[#1d2129] flex items-center gap-2"><i class="fa-solid fa-circle text-[8px] text-[#2563eb]"></i> 东北 Team</span>
                <span class="text-[#1d2129] font-bold">85 / 100 <span class="text-[#86909c] font-normal ml-1">(85%)</span></span>
              </div>
              <div class="w-full bg-[#cfd2d3] rounded-full h-2.5 overflow-hidden">
                <div class="progress-fill bg-[#cfd2d3] bg-gradient-to-r from-[#3b82f6] to-[#2563eb] h-full rounded-full relative w-[85%] transition-all duration-1000"></div>
              </div>
            </div>
            
            <div class="group">
              <div class="flex justify-between text-sm mb-2.5">
                <span class="font-medium text-[#1d2129] flex items-center gap-2"><i class="fa-solid fa-circle text-[8px] text-[#60a5fa]"></i> 华中 Team</span>
                <span class="text-[#1d2129] font-bold">98 / 120 <span class="text-[#86909c] font-normal ml-1">(82%)</span></span>
              </div>
              <div class="w-full bg-[#cfd2d3] rounded-full h-2.5 overflow-hidden">
                <div class="progress-fill bg-[#cfd2d3] bg-gradient-to-r from-[#93c5fd] to-[#60a5fa] h-full rounded-full relative w-[82%] transition-all duration-1000"></div>
              </div>
            </div>
            
            <div class="group">
              <div class="flex justify-between text-sm mb-2.5">
                <span class="font-medium text-[#1d2129] flex items-center gap-2"><i class="fa-solid fa-circle text-[8px] text-[#bfdbfe]"></i> 西南 Team</span>
                <span class="text-[#1d2129] font-bold">65 / 80 <span class="text-[#86909c] font-normal ml-1">(81%)</span></span>
              </div>
              <div class="w-full bg-[#cfd2d3] rounded-full h-2.5 overflow-hidden">
                <div class="progress-fill bg-[#cfd2d3] bg-gradient-to-r from-[#dbeafe] to-[#bfdbfe] h-full rounded-full relative w-[81%] transition-all duration-1000"></div>
              </div>
            </div>
            
            <div class="group">
              <div class="flex justify-between text-sm mb-2.5">
                <span class="font-medium text-[#1d2129] flex items-center gap-2"><i class="fa-solid fa-circle text-[8px] text-[#dbeafe]"></i> 西北 Team</span>
                <span class="text-[#1d2129] font-bold">30 / 50 <span class="text-[#86909c] font-normal ml-1">(60%)</span></span>
              </div>
              <div class="w-full bg-[#cfd2d3] rounded-full h-2.5 overflow-hidden">
                <div class="progress-fill bg-[#cfd2d3] bg-gradient-to-r from-[#eff6ff] to-[#dbeafe] h-full rounded-full relative w-[60%] transition-all duration-1000"></div>
              </div>
            </div>
            
            <div class="group">
              <div class="flex justify-between text-sm mb-2.5">
                <span class="font-medium text-[#1d2129] flex items-center gap-2"><i class="fa-solid fa-circle text-[8px] text-[#3b82f6]"></i> 华东 Team</span>
                <span class="text-[#1d2129] font-bold">45 / 150 <span class="text-[#86909c] font-normal ml-1">(30%)</span></span>
              </div>
              <div class="w-full bg-[#cfd2d3] rounded-full h-2.5 overflow-hidden">
                <div class="progress-fill bg-[#cfd2d3] bg-gradient-to-r from-[#60a5fa] to-[#3b82f6] h-full rounded-full relative w-[30%] transition-all duration-1000"></div>
          </div>
          </div>
          </div>
        </div>
        </div>
      </div>
    `;
  },
  
  bindEvents() {
    const pendingCard = document.getElementById('kpi-pending');
    if (pendingCard) {
      pendingCard.addEventListener('click', () => {
        window.location.hash = '#ingestion';
      });
    }

    const teamFilter = document.getElementById('queue-team-filter');
    if (teamFilter) {
      teamFilter.addEventListener('change', () => {
        const selectedTeam = teamFilter.value;
        const rows = document.querySelectorAll('#queue-tbody tr');
        rows.forEach(row => {
          const teamCell = row.querySelector('td:nth-child(2)');
          if (!selectedTeam || teamCell?.textContent === selectedTeam) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      });
    }

    const sortBtn = document.getElementById('progress-sort-btn');
    if (sortBtn) {
      let isDesc = true;
      sortBtn.addEventListener('click', () => {
        isDesc = !isDesc;
        const container = sortBtn.closest('.glass-card')?.querySelector('.space-y-7');
        if (!container) return;
        const groups = Array.from(container.querySelectorAll('.group'));
        groups.sort((a, b) => {
          const percentA = parseFloat(a.querySelector('.text-\\[\\#86909c\\]')?.textContent?.match(/\((\d+)%\)/)?.[1] || '0');
          const percentB = parseFloat(b.querySelector('.text-\\[\\#86909c\\]')?.textContent?.match(/\((\d+)%\)/)?.[1] || '0');
          return isDesc ? percentB - percentA : percentA - percentB;
        });
        groups.forEach(group => container.appendChild(group));
        sortBtn.innerHTML = `<i class="fa-solid fa-arrow-${isDesc ? 'down' : 'up'}"></i> ${isDesc ? '降序' : '升序'}`;
      });
    }

    const dataPoints = document.querySelectorAll('.data-point');
    const tooltip = document.getElementById('chart-tooltip');
    const tooltipValue = document.getElementById('tooltip-value');
    const tooltipLabel = document.getElementById('tooltip-label');
    const chartContainer = document.querySelector('.h-72');

    dataPoints.forEach(point => {
      point.style.cursor = 'pointer';
      
      point.addEventListener('mouseenter', (e) => {
        const value = e.target.getAttribute('data-value');
        const label = e.target.getAttribute('data-label');
        if (tooltip && tooltipValue && tooltipLabel) {
          tooltipValue.textContent = value;
          tooltipLabel.textContent = label;
          tooltip.classList.remove('hidden');
        }
      });

      point.addEventListener('mousemove', (e) => {
        if (tooltip && chartContainer) {
          const rect = chartContainer.getBoundingClientRect();
          tooltip.style.left = `${e.clientX - rect.left - 30}px`;
          tooltip.style.top = `${e.clientY - rect.top - 60}px`;
        }
      });

      point.addEventListener('mouseleave', () => {
        if (tooltip) {
          tooltip.classList.add('hidden');
        }
      });
    });

    // 分页功能
    let currentPage = 1;
    const totalPages = 3;
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageNumbersContainer = document.getElementById('page-numbers');

    function goToPage(page) {
      if (page < 1 || page > totalPages) return;
      
      currentPage = page;
      
      // 隐藏所有行
      document.querySelectorAll('#queue-tbody tr').forEach(row => {
        row.classList.add('hidden');
      });
      
      // 显示当前页行
      document.querySelectorAll(`#queue-tbody tr[data-page="${page}"]`).forEach(row => {
        row.classList.remove('hidden');
      });
      
      // 更新页码按钮样式
      document.querySelectorAll('.page-btn').forEach(btn => {
        const btnPage = parseInt(btn.dataset.page);
        if (btnPage === page) {
          btn.classList.add('bg-brand', 'text-white');
          btn.classList.remove('text-[#4e5969]');
        } else {
          btn.classList.remove('bg-brand', 'text-white');
          btn.classList.add('text-[#4e5969]');
        }
      });
      
      // 更新上一页/下一页按钮状态
      prevPageBtn.disabled = page === 1;
      nextPageBtn.disabled = page === totalPages;
    }

    // 初始化显示第一页
    goToPage(1);

    // 分页事件监听
    if (prevPageBtn) {
      prevPageBtn.addEventListener('click', () => goToPage(currentPage - 1));
    }

    if (nextPageBtn) {
      nextPageBtn.addEventListener('click', () => goToPage(currentPage + 1));
    }

    if (pageNumbersContainer) {
      pageNumbersContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('page-btn')) {
          const page = parseInt(e.target.dataset.page);
          goToPage(page);
        }
      });
    }

    // 团队筛选功能
    const queueTeamFilter = document.getElementById('queue-team-filter');
    if (queueTeamFilter) {
      queueTeamFilter.addEventListener('change', () => {
        const selectedTeam = queueTeamFilter.value;
        goToPage(1); // 重置到第一页
        document.querySelectorAll('#queue-tbody tr').forEach(row => {
          const rowTeam = row.querySelector('td:nth-child(2)')?.textContent;
          const rowPage = row.dataset.page;
          
          if (selectedTeam === '') {
            // 显示全部团队的当前页数据
            if (rowPage === '1') {
              row.classList.remove('hidden');
            } else {
              row.classList.add('hidden');
            }
          } else {
            // 只显示选中团队的数据
            if (rowTeam === selectedTeam) {
              row.classList.remove('hidden');
            } else {
              row.classList.add('hidden');
            }
          }
        });
      });
    }
  }
};

import re

# 1. Update index.html
with open('index.html', 'r') as f:
    index_html = f.read()

tailwind_config = """    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: '#1d2129',
            secondary: '#4e5969',
            brand: '#e14d43',
            'brand-light': '#fff5f5'
          }
        }
      }
    }"""
index_html = re.sub(r'    tailwind\.config = \{.*?\n    \}', tailwind_config, index_html, flags=re.DOTALL)

body_layout = """<body class="bg-gradient-to-b from-[#fff5f5] to-[#fef2f2] text-[#4e5969] font-sans min-h-screen flex overflow-hidden">
  
  <!-- Main Layout Wrapper -->
  <div id="app-layout" class="hidden flex-1 flex h-screen w-full">
    
    <!-- Sidebar -->
    <aside class="w-64 bg-white/80 backdrop-blur-xl border-r border-red-100/50 flex flex-col shrink-0 shadow-[4px_0_24px_rgba(225,77,67,0.04)] z-20 transition-all">
      <div class="h-20 flex items-center px-6 border-b border-red-100/50 shrink-0">
        <div class="w-8 h-8 bg-gradient-to-br from-brand to-[#ff8f8a] text-white rounded-lg flex items-center justify-center text-sm shadow-lg shadow-brand/20">
          <i class="fa-solid fa-layer-group"></i>
        </div>
        <h1 class="ml-3 text-lg font-bold text-[#1d2129] tracking-tight" data-i18n="system_title">POS DATA</h1>
      </div>
      
      <nav class="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto" id="main-nav">
        <a href="#dashboard" class="nav-item flex items-center gap-3 px-4 py-3 rounded-xl text-[#4e5969] hover:bg-red-50 hover:text-brand transition-all duration-200" data-i18n="nav_dashboard">
          <i class="fa-solid fa-chart-pie w-5 text-center"></i>
          <span class="font-medium">首页概览</span>
        </a>
        <a href="#ingestion" class="nav-item flex items-center gap-3 px-4 py-3 rounded-xl text-[#4e5969] hover:bg-red-50 hover:text-brand transition-all duration-200" data-i18n="nav_ingestion">
          <i class="fa-solid fa-file-import w-5 text-center"></i>
          <span class="font-medium">文件收取</span>
        </a>
        <a href="#qa" class="nav-item flex items-center gap-3 px-4 py-3 rounded-xl text-[#4e5969] hover:bg-red-50 hover:text-brand transition-all duration-200" data-i18n="nav_qa">
          <i class="fa-solid fa-shield-check w-5 text-center"></i>
          <span class="font-medium">质量检查</span>
        </a>
        <a href="#ledger" class="nav-item flex items-center gap-3 px-4 py-3 rounded-xl text-[#4e5969] hover:bg-red-50 hover:text-brand transition-all duration-200" data-i18n="nav_ledger">
          <i class="fa-solid fa-table-list w-5 text-center"></i>
          <span class="font-medium">台账与汇总</span>
        </a>
        <a href="#sdk" class="nav-item flex items-center gap-3 px-4 py-3 rounded-xl text-[#4e5969] hover:bg-red-50 hover:text-brand transition-all duration-200" data-i18n="nav_sdk">
          <i class="fa-solid fa-terminal w-5 text-center"></i>
          <span class="font-medium">SDK 窗口</span>
        </a>
      </nav>

      <!-- Bottom Status Area in Sidebar -->
      <div class="p-5 border-t border-red-100/50 bg-white/40 text-xs space-y-3 shrink-0">
        <div class="flex items-center gap-2 text-[#4e5969]">
          <i class="fa-solid fa-users text-brand/70 w-4 text-center"></i>
          <span class="flex-1 truncate font-medium" id="status-team-val">Team A</span>
        </div>
        <div class="flex items-center gap-2 text-[#4e5969]">
          <i class="fa-solid fa-database text-brand/70 w-4 text-center"></i>
          <span class="flex-1 truncate font-medium" id="status-data-val">已同步</span>
        </div>
        <div class="flex items-center gap-2 text-[#86909c]">
          <i class="fa-solid fa-clock w-4 text-center"></i>
          <span class="flex-1 truncate" id="status-time-val">--</span>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col h-screen overflow-hidden relative">
      <!-- Header -->
      <header class="h-20 bg-white/60 backdrop-blur-md border-b border-red-100/50 flex items-center justify-between px-8 shrink-0 z-10">
        <div id="view-actions" class="flex items-center gap-3"></div>
        
        <div class="flex items-center gap-5">
          <button id="lang-toggle" class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white shadow-sm border border-red-100 hover:border-brand/30 hover:text-brand transition-all text-sm font-medium text-[#4e5969]">
            <i class="fa-solid fa-globe"></i>
            <span id="current-lang-text">CN</span>
          </button>
          <div class="w-px h-5 bg-red-200"></div>
          <button id="logout-btn" class="w-9 h-9 rounded-full bg-red-50 text-brand flex items-center justify-center hover:bg-brand hover:text-white transition-all shadow-sm">
            <i class="fa-solid fa-sign-out-alt"></i>
          </button>
        </div>
      </header>

      <!-- Main -->
      <main id="main-content" class="flex-1 overflow-auto p-6 lg:p-8 relative">
        <!-- Views will be mounted here -->
      </main>
    </div>
  </div>

  <!-- Login View Container -->
  <div id="login-container" class="h-screen w-screen flex items-center justify-center bg-gradient-to-b from-[#fff5f5] to-[#fef2f2] relative overflow-hidden px-4">
    <div class="absolute -top-24 -right-24 w-96 h-96 bg-brand/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
    <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-red-400/10 rounded-full blur-3xl z-0 pointer-events-none"></div>

    <div id="login-view-slot" class="relative z-10 w-full flex items-center justify-center"></div>
    <div class="absolute bottom-8 text-[#86909c] text-xs font-medium z-10">
      Copyright 2019 by ORION. All right reserved
    </div>
  </div>

  <div id="drawer-container" class="fixed inset-0 z-50 hidden">"""
index_html = re.sub(r'<body.*<div id="drawer-container"', body_layout, index_html, flags=re.DOTALL)
with open('index.html', 'w') as f:
    f.write(index_html)

# 2. Update app.js
with open('js/core/app.js', 'r') as f:
    app_js = f.read()
app_js = re.sub(
    r"el\.classList\.remove\('active',.*?\);",
    "el.classList.remove('active', 'bg-red-50', 'text-brand', 'font-semibold', 'shadow-sm');",
    app_js
)
app_js = re.sub(
    r"el\.classList\.add\('active',.*?\);",
    "el.classList.add('active', 'bg-red-50', 'text-brand', 'font-semibold', 'shadow-sm');",
    app_js
)
with open('js/core/app.js', 'w') as f:
    f.write(app_js)

# 3. Update dashboard.js
with open('js/views/dashboard.js', 'r') as f:
    dash_js = f.read()
dash_render_action = """  renderAction() {
    return `
      <div class="flex items-center text-sm text-[#1d2129] font-bold">
        <span class="w-1 h-4 bg-brand rounded-full mr-2"></span>
        <span data-i18n="nav_dashboard">首页概览</span>
      </div>
    `;
  },"""
dash_render = """  render() {
    return `
      <div class="max-w-7xl mx-auto space-y-6 animate-[fadeIn_0.4s_ease-out]">
        <!-- KPI Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <div class="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white hover:-translate-y-1 transition-all duration-300 group">
            <div class="flex items-center gap-2 text-[#86909c] text-xs font-medium mb-3">
              <div class="w-6 h-6 rounded-md bg-red-50 text-brand flex items-center justify-center"><i class="fa-solid fa-sack-dollar"></i></div>
              <span data-i18n="dashboard_kpi_1">总收益</span>
            </div>
            <div class="text-2xl font-bold text-[#1d2129] mb-2">¥ 1,284.5k</div>
            <div class="text-xs text-[#e14d43] flex items-center gap-1 font-medium bg-red-50 w-fit px-2 py-0.5 rounded"><i class="fa-solid fa-arrow-trend-up"></i> +12.5%</div>
          </div>
          
          <div id="kpi-pending" class="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white hover:-translate-y-1 transition-all duration-300 group cursor-pointer hover:border-brand/30">
            <div class="flex items-center gap-2 text-[#86909c] text-xs font-medium mb-3">
              <div class="w-6 h-6 rounded-md bg-orange-50 text-orange-500 flex items-center justify-center"><i class="fa-solid fa-clock"></i></div>
              <span data-i18n="dashboard_kpi_2">待处理数量</span>
            </div>
            <div class="text-2xl font-bold text-brand mb-2">14</div>
            <div class="text-xs text-[#86909c] flex items-center gap-1 font-medium bg-gray-50 w-fit px-2 py-0.5 rounded">需优先处理</div>
          </div>
          
          <div class="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white hover:-translate-y-1 transition-all duration-300 group">
            <div class="flex items-center gap-2 text-[#86909c] text-xs font-medium mb-3">
              <div class="w-6 h-6 rounded-md bg-blue-50 text-blue-500 flex items-center justify-center"><i class="fa-solid fa-file-import"></i></div>
              <span data-i18n="dashboard_kpi_3">当日接入量</span>
            </div>
            <div class="text-2xl font-bold text-[#1d2129] mb-2">328</div>
            <div class="text-xs text-blue-500 flex items-center gap-1 font-medium bg-blue-50 w-fit px-2 py-0.5 rounded"><i class="fa-solid fa-arrow-trend-up"></i> +5.2%</div>
          </div>
          
          <div class="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white hover:-translate-y-1 transition-all duration-300 group">
            <div class="flex items-center gap-2 text-[#86909c] text-xs font-medium mb-3">
              <div class="w-6 h-6 rounded-md bg-green-50 text-green-500 flex items-center justify-center"><i class="fa-solid fa-check-circle"></i></div>
              <span data-i18n="dashboard_kpi_4">处理完成率</span>
            </div>
            <div class="text-2xl font-bold text-[#1d2129] mb-2">95.7%</div>
            <div class="text-xs text-green-500 flex items-center gap-1 font-medium bg-green-50 w-fit px-2 py-0.5 rounded">状态良好</div>
          </div>

          <div class="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white hover:-translate-y-1 transition-all duration-300 group hidden xl:block">
            <div class="flex items-center gap-2 text-[#86909c] text-xs font-medium mb-3">
              <div class="w-6 h-6 rounded-md bg-purple-50 text-purple-500 flex items-center justify-center"><i class="fa-solid fa-store"></i></div>
              <span>活跃门店</span>
            </div>
            <div class="text-2xl font-bold text-[#1d2129] mb-2">1,024</div>
            <div class="text-xs text-purple-500 flex items-center gap-1 font-medium bg-purple-50 w-fit px-2 py-0.5 rounded"><i class="fa-solid fa-arrow-trend-up"></i> +2.1%</div>
          </div>

          <div class="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white hover:-translate-y-1 transition-all duration-300 group hidden xl:block">
            <div class="flex items-center gap-2 text-[#86909c] text-xs font-medium mb-3">
              <div class="w-6 h-6 rounded-md bg-teal-50 text-teal-500 flex items-center justify-center"><i class="fa-solid fa-user-plus"></i></div>
              <span>新增会员</span>
            </div>
            <div class="text-2xl font-bold text-[#1d2129] mb-2">8,500</div>
            <div class="text-xs text-teal-500 flex items-center gap-1 font-medium bg-teal-50 w-fit px-2 py-0.5 rounded"><i class="fa-solid fa-arrow-trend-up"></i> +8.4%</div>
          </div>
        </div>
        
        <!-- Progress Tracking -->
        <div class="bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white overflow-hidden mt-6">
          <div class="px-7 py-5 border-b border-gray-100 flex justify-between items-center bg-white/50">
            <h3 class="font-bold text-[#1d2129] text-base flex items-center gap-2">Team 数据提报进度</h3>
            <div class="flex bg-[#f7f8fa] rounded-lg p-1">
              <button class="px-4 py-1.5 text-xs font-medium bg-white shadow-sm rounded-md text-[#1d2129] transition-all">今日</button>
              <button class="px-4 py-1.5 text-xs font-medium text-[#86909c] hover:text-[#1d2129] transition-all">本周</button>
              <button class="px-4 py-1.5 text-xs font-medium text-[#86909c] hover:text-[#1d2129] transition-all">本月</button>
            </div>
          </div>
          <div class="p-7 space-y-7">
            
            <div class="group">
              <div class="flex justify-between text-sm mb-2.5">
                <span class="font-medium text-[#4e5969] flex items-center gap-2"><i class="fa-solid fa-circle text-[8px] text-[#e14d43]"></i> Team A (营业 Team A)</span>
                <span class="text-[#1d2129] font-bold">120 / 120 <span class="text-[#86909c] font-normal ml-1">(100%)</span></span>
              </div>
              <div class="w-full bg-[#f7f8fa] rounded-full h-2.5 overflow-hidden">
                <div class="bg-gradient-to-r from-[#ff8f8a] to-[#e14d43] h-full rounded-full relative w-full transition-all duration-1000"></div>
              </div>
            </div>
            
            <div class="group">
              <div class="flex justify-between text-sm mb-2.5">
                <span class="font-medium text-[#4e5969] flex items-center gap-2"><i class="fa-solid fa-circle text-[8px] text-[#e14d43]"></i> Team B (营业 Team B)</span>
                <span class="text-[#1d2129] font-bold">85 / 100 <span class="text-[#86909c] font-normal ml-1">(85%)</span></span>
              </div>
              <div class="w-full bg-[#f7f8fa] rounded-full h-2.5 overflow-hidden">
                <div class="bg-gradient-to-r from-[#ff8f8a] to-[#e14d43] h-full rounded-full relative w-[85%] transition-all duration-1000"></div>
              </div>
            </div>
            
            <div class="group">
              <div class="flex justify-between text-sm mb-2.5">
                <span class="font-medium text-[#4e5969] flex items-center gap-2"><i class="fa-solid fa-circle text-[8px] text-[#ffb4a9]"></i> Team C (营业 Team C)</span>
                <span class="text-[#1d2129] font-bold">45 / 150 <span class="text-[#86909c] font-normal ml-1">(30%)</span></span>
              </div>
              <div class="w-full bg-[#f7f8fa] rounded-full h-2.5 overflow-hidden">
                <div class="bg-gradient-to-r from-[#ffd4d0] to-[#ffb4a9] h-full rounded-full relative w-[30%] transition-all duration-1000"></div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    `;
  },"""
dash_js = re.sub(r'  renderAction\(\) \{.*?\n  \},', dash_render_action, dash_js, flags=re.DOTALL)
dash_js = re.sub(r'  render\(\) \{.*?\n  \},', dash_render, dash_js, flags=re.DOTALL)
with open('js/views/dashboard.js', 'w') as f:
    f.write(dash_js)

# 4. Update ingestion.js
with open('js/views/ingestion.js', 'r') as f:
    ingest_js = f.read()
ingest_render_action = """  renderAction() {
    return `
      <div class="flex items-center text-sm text-[#1d2129] font-bold mr-6">
        <span class="w-1 h-4 bg-brand rounded-full mr-2"></span>
        <span data-i18n="nav_ingestion">文件收取</span>
      </div>
      <div class="flex gap-3 items-center ml-auto">
        <button id="btn-archive" class="px-4 py-2 border border-gray-200 text-[#4e5969] rounded-lg bg-white hover:bg-gray-50 hover:text-[#1d2129] text-sm font-medium transition-all shadow-sm" data-i18n="action_archive">归档 (非 Pos 表)</button>
        <button id="btn-approve" class="px-4 py-2 bg-brand text-white rounded-lg hover:bg-[#c94038] text-sm font-medium transition-all shadow-sm shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-0.5" data-i18n="action_approve">通过</button>
        <button id="btn-reject" class="px-4 py-2 border border-red-100 bg-red-50 text-[#e14d43] rounded-lg hover:bg-red-100 text-sm font-medium transition-all shadow-sm" data-i18n="action_reject">驳回</button>
        
        <div class="w-px h-6 bg-gray-200 mx-2"></div>
        
        <select class="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm text-[#4e5969] focus:outline-none focus:border-brand shadow-sm transition-all">
          <option>All Teams</option>
          <option>Team A</option>
          <option>Team B</option>
        </select>
        
        <select class="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm text-[#4e5969] focus:outline-none focus:border-brand shadow-sm transition-all">
          <option>Latest Snapshot</option>
          <option>v1.0</option>
          <option>v1.2</option>
        </select>
      </div>
    `;
  },"""
ingest_render = """  render() {
    this.loadData();
    return `
      <div class="bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white flex flex-col h-[calc(100vh-140px)] overflow-hidden animate-[fadeIn_0.4s_ease-out]">
        <div class="px-7 py-4 border-b border-gray-100 flex gap-8 text-sm bg-white shrink-0">
          <div class="text-[#86909c]">收取总量: <span class="font-bold text-[#1d2129] ml-1 text-base">450</span></div>
          <div class="text-[#86909c]">待处理: <span class="font-bold text-brand ml-1 text-base">14</span></div>
          <div class="text-[#86909c]">当日接入: <span class="font-bold text-[#1d2129] ml-1 text-base">328</span></div>
          <div class="text-[#86909c]">完成率: <span class="font-bold text-green-500 ml-1 text-base">95.7%</span></div>
        </div>
        <div class="overflow-auto flex-1 relative px-2">
          <table class="w-full text-left text-sm text-[#4e5969]" id="ingestion-table">
            <thead class="bg-[#f7f8fa] text-[#1d2129] font-medium sticky top-0 z-10">
              <tr>
                <th class="px-5 py-4 w-12 rounded-tl-lg"><input type="checkbox" id="selectAll" class="rounded border-gray-300 text-brand focus:ring-brand"></th>
                <th class="px-5 py-4">File Name</th>
                <th class="px-5 py-4">Version</th>
                <th class="px-5 py-4">Team</th>
                <th class="px-5 py-4">Store</th>
                <th class="px-5 py-4">Status</th>
                <th class="px-5 py-4">Upload Time</th>
                <th class="px-5 py-4 w-24 rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody id="ingestion-tbody" class="divide-y divide-gray-100">
              <tr><td colspan="8" class="text-center py-12 text-[#86909c]">Loading...</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },"""
ingest_js = re.sub(r'  renderAction\(\) \{.*?\n  \},', ingest_render_action, ingest_js, flags=re.DOTALL)
ingest_js = re.sub(r'  render\(\) \{.*?\n  \},', ingest_render, ingest_js, flags=re.DOTALL)
ingest_js = re.sub(
    r'<tr class="hover:bg-gray-50/50 transition-colors" data-id="\$\{row\.id\}">',
    r'<tr class="hover:bg-red-50/30 transition-colors group" data-id="${row.id}">',
    ingest_js
)
ingest_js = re.sub(
    r'<td class="px-4 py-4 font-medium text-slate-800 flex items-center gap-2">\s*<i class="fa-solid fa-file-excel text-green-600"></i>',
    r'<td class="px-5 py-4 font-medium text-[#1d2129] flex items-center gap-3">\n            <div class="w-8 h-8 rounded bg-gray-50 flex items-center justify-center text-[#86909c] group-hover:bg-white group-hover:text-brand transition-colors"><i class="fa-solid fa-file-excel"></i></div>',
    ingest_js
)
ingest_js = re.sub(
    r'bg-yellow-50 text-yellow-600',
    r'bg-orange-50 text-orange-600',
    ingest_js
)
ingest_js = re.sub(
    r'bg-red-50 text-red-600',
    r'bg-red-50 text-[#e14d43]',
    ingest_js
)
ingest_js = re.sub(
    r'<button class="text-slate-400 hover:text-brand transition-colors preview-btn"',
    r'<button class="w-8 h-8 rounded-lg text-[#86909c] hover:bg-brand hover:text-white transition-colors preview-btn flex items-center justify-center"',
    ingest_js
)
ingest_js = re.sub(r'px-4 py-4', r'px-5 py-4', ingest_js)
with open('js/views/ingestion.js', 'w') as f:
    f.write(ingest_js)

# 5. Update qa.js
with open('js/views/qa.js', 'r') as f:
    qa_js = f.read()

qa_render_action = """  renderAction() {
    return `
      <div class="flex items-center text-sm text-[#1d2129] font-bold mr-6">
        <span class="w-1 h-4 bg-brand rounded-full mr-2"></span>
        <span data-i18n="nav_qa">质量检查</span>
      </div>
      <div class="flex gap-3 ml-auto">
        <button id="btn-export-qa" class="px-4 py-2 border border-gray-200 text-[#4e5969] rounded-lg bg-white hover:bg-gray-50 text-sm font-medium transition-colors shadow-sm" data-i18n="export_exception">异常文件列表导出</button>
        <button id="btn-qa-pass" class="px-4 py-2 bg-brand text-white rounded-lg hover:bg-[#c94038] text-sm font-medium transition-all shadow-sm shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-0.5" data-i18n="qa_pass">质量通过</button>
        <button id="btn-qa-reject" class="px-4 py-2 border border-red-100 bg-red-50 text-[#e14d43] rounded-lg hover:bg-red-100 text-sm font-medium transition-colors shadow-sm" data-i18n="qa_reject">驳回处置</button>
      </div>
    `;
  },"""

qa_render = """  render() {
    this.loadData();
    return `
      <div class="bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white flex flex-col h-[calc(100vh-140px)] overflow-hidden animate-[fadeIn_0.4s_ease-out]">
        <div class="px-7 py-4 border-b border-gray-100 flex gap-8 text-sm bg-white shrink-0">
          <div class="text-[#86909c]">校验文件总数: <span class="font-bold text-[#1d2129] ml-1 text-base">125</span></div>
          <div class="text-[#86909c]">异常文件数: <span class="font-bold text-[#e14d43] ml-1 text-base">1</span></div>
          <div class="text-[#86909c]">质量通过率: <span class="font-bold text-[#1d2129] ml-1 text-base">99.2%</span></div>
        </div>
        <div class="overflow-auto flex-1 relative px-2">
          <table class="w-full text-left text-sm text-[#4e5969]">
            <thead class="bg-[#f7f8fa] text-[#1d2129] font-medium sticky top-0 z-10">
              <tr>
                <th class="px-5 py-4 w-12 rounded-tl-lg"><input type="checkbox" class="rounded border-gray-300 text-brand focus:ring-brand"></th>
                <th class="px-5 py-4">File Name</th>
                <th class="px-5 py-4">Conflict Type</th>
                <th class="px-5 py-4">Barcode</th>
                <th class="px-5 py-4 rounded-tr-lg">Suggested Action</th>
              </tr>
            </thead>
            <tbody id="qa-tbody" class="divide-y divide-gray-100">
            </tbody>
          </table>
        </div>
      </div>
    `;
  },"""

qa_js = re.sub(r'  renderAction\(\) \{.*?\n  \},', qa_render_action, qa_js, flags=re.DOTALL)
qa_js = re.sub(r'  render\(\) \{.*?\n  \},', qa_render, qa_js, flags=re.DOTALL)

qa_js = re.sub(
    r'<tr class="hover:bg-gray-50/50 transition-colors">',
    r'<tr class="hover:bg-red-50/30 transition-colors group">',
    qa_js
)
qa_js = re.sub(
    r'<td class="px-4 py-4 font-medium text-slate-800 flex items-center gap-2">\s*<i class="fa-solid fa-file-csv text-slate-400"></i>',
    r'<td class="px-5 py-4 font-medium text-[#1d2129] flex items-center gap-3">\n            <div class="w-8 h-8 rounded bg-gray-50 flex items-center justify-center text-[#86909c] group-hover:bg-white group-hover:text-brand transition-colors"><i class="fa-solid fa-file-csv"></i></div>',
    qa_js
)
qa_js = re.sub(
    r'<span class="px-2\.5 py-1 rounded text-xs font-medium bg-red-50 text-red-600">',
    r'<span class="px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-[#e14d43]">',
    qa_js
)
qa_js = re.sub(
    r'bg-red-50 text-red-600 px-2 py-1 rounded border border-red-100',
    r'bg-[#fff5f5] text-[#e14d43] px-2.5 py-1 rounded-md border border-red-100 hover:bg-red-50 transition-colors',
    qa_js
)
qa_js = re.sub(r'px-4 py-4', r'px-5 py-4', qa_js)
with open('js/views/qa.js', 'w') as f:
    f.write(qa_js)

# 6. Update ledger.js
with open('js/views/ledger.js', 'r') as f:
    ledger_js = f.read()

ledger_render_action = """  renderAction() {
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
        <button class="px-4 py-2 bg-brand text-white rounded-lg hover:bg-[#c94038] text-sm font-medium transition-all shadow-sm shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-0.5" data-i18n="preview_download">预览与下载</button>
      </div>
    `;
  },"""

ledger_render = """  render() {
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
  },"""

ledger_js = re.sub(r'  renderAction\(\) \{.*?\n  \},', ledger_render_action, ledger_js, flags=re.DOTALL)
ledger_js = re.sub(r'  render\(\) \{.*?\n  \},', ledger_render, ledger_js, flags=re.DOTALL)
ledger_js = re.sub(
    r'<tr class="hover:bg-gray-50/50 transition-colors">',
    r'<tr class="hover:bg-red-50/30 transition-colors">',
    ledger_js
)
ledger_js = re.sub(r'text-slate-800', r'text-[#1d2129]', ledger_js)
ledger_js = re.sub(r'text-slate-500', r'text-[#86909c]', ledger_js)
ledger_js = re.sub(r'px-4 py-4', r'px-5 py-4', ledger_js)
ledger_js = re.sub(r'px-4 py-5', r'px-5 py-5', ledger_js)
with open('js/views/ledger.js', 'w') as f:
    f.write(ledger_js)

# 7. Update sdk.js
with open('js/views/sdk.js', 'r') as f:
    sdk_js = f.read()

sdk_render_action = """  renderAction() {
    return `
      <div class="flex items-center text-sm text-[#1d2129] font-bold mr-6">
        <span class="w-1 h-4 bg-brand rounded-full mr-2"></span>
        <span data-i18n="nav_sdk">SDK 窗口</span>
      </div>
    `;
  },"""

sdk_render = """  render() {
    return `
      <div class="max-w-4xl mx-auto space-y-6 animate-[fadeIn_0.4s_ease-out]">
        <div class="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white">
          <h2 class="text-xl font-bold text-[#1d2129] mb-3 flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-red-50 text-brand flex items-center justify-center"><i class="fa-solid fa-terminal"></i></div>
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
              <button id="btn-sdk-export" class="px-6 py-3 bg-brand text-white rounded-xl hover:bg-[#c94038] font-semibold transition-all duration-300 shadow-lg shadow-brand/20 hover:shadow-brand/40 hover:-translate-y-0.5 flex items-center gap-2" data-i18n="excel_export">
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
  },"""

sdk_js = re.sub(r'  renderAction\(\) \{.*?\n  \},', sdk_render_action, sdk_js, flags=re.DOTALL)
sdk_js = re.sub(r'  render\(\) \{.*?\n  \},', sdk_render, sdk_js, flags=re.DOTALL)
with open('js/views/sdk.js', 'w') as f:
    f.write(sdk_js)


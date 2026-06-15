import re

# 1. Update index.html
with open('index.html', 'r') as f:
    index_html = f.read()

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

  <!-- Global Overlay (Dialog, Drawer, Toast) -->"""

index_html = re.sub(r'<body.*<!-- Global Overlay \(Dialog, Drawer, Toast\) -->', body_layout, index_html, flags=re.DOTALL)
with open('index.html', 'w') as f:
    f.write(index_html)

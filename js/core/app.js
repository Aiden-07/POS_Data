const App = {
  views: {
    'login': typeof LoginView !== 'undefined' ? LoginView : null,
    'dashboard': typeof DashboardView !== 'undefined' ? DashboardView : null,
    'ingestion': typeof IngestionView !== 'undefined' ? IngestionView : null,
    'qa': typeof QAView !== 'undefined' ? QAView : null,
    'ledger': typeof LedgerView !== 'undefined' ? LedgerView : null,
    'settings-users': typeof SettingsView !== 'undefined' ? SettingsView : null,
    'settings-roles': typeof SettingsView !== 'undefined' ? SettingsView : null,
    'settings-fields': typeof SettingsView !== 'undefined' ? SettingsView : null,
    'settings-logs': typeof SettingsView !== 'undefined' ? SettingsView : null
  },
  placeholderRoutes: {},
  
  async init() {
    Store.restoreAccount();
    await I18n.init();
    
    // Setup listeners
    document.getElementById('lang-toggle').addEventListener('click', () => I18n.toggle());
    this.bindUserMenu();
    document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
      document.getElementById('app-layout')?.classList.toggle('sidebar-open');
    });
    this.bindSidebarControls();
    if (typeof AIAssistant !== 'undefined') {
      AIAssistant.init();
    }
    if (typeof GlobalPeriod !== 'undefined') {
      GlobalPeriod.mount();
    }
    
    // Handle routing
    window.addEventListener('hashchange', () => this.handleRoute());
    
    // Initial route
    if (!window.location.hash) {
      window.location.hash = '#login';
    } else {
      this.handleRoute();
    }
    
    // Set initial status bar time
    Store.setState({ lastUpdated: this.getCurrentTime() });
  },

  bindUserMenu() {
    const menuWrap = document.querySelector('.user-menu-wrap');
    const menuBtn = document.getElementById('user-menu-btn');
    const menuPanel = document.getElementById('user-menu-panel');
    const logoutBtn = document.getElementById('logout-btn');
    const settingsCenterBtn = document.getElementById('settings-center-btn');
    const userNameEl = document.getElementById('header-user-name');
    const userRoleEl = document.getElementById('header-user-role');
    const state = Store.getState();

    if (userNameEl) userNameEl.textContent = state.userName || 'Aiden';
    if (userRoleEl) userRoleEl.textContent = state.userRole || 'POS担当';

    const closeMenu = () => {
      menuPanel?.classList.add('hidden');
      menuBtn?.setAttribute('aria-expanded', 'false');
    };

    menuBtn?.addEventListener('click', (event) => {
      event.stopPropagation();
      const willOpen = menuPanel?.classList.contains('hidden');
      menuPanel?.classList.toggle('hidden', !willOpen);
      menuBtn.setAttribute('aria-expanded', String(willOpen));
    });

    settingsCenterBtn?.addEventListener('click', (event) => {
      event.stopPropagation();
      closeMenu();
      this.openSettingsCenter();
    });

    logoutBtn?.addEventListener('click', (event) => {
      event.stopPropagation();
      closeMenu();
      this.logout();
    });

    document.addEventListener('click', (event) => {
      if (menuWrap && !menuWrap.contains(event.target)) {
        closeMenu();
      }
    });
  },

  syncHeaderUser() {
    const state = Store.getState();
    const name = document.getElementById('header-user-name');
    const role = document.getElementById('header-user-role');
    if (name) name.textContent = state.userName;
    if (role) role.textContent = state.userRole;
  },

  applyRoleVisibility() {
    const isPos = Store.isPosActor();
    document.getElementById('settings-nav-group')?.classList.toggle('hidden', !isPos);
  },

  bindSidebarControls() {
    const layout = document.getElementById('app-layout');
    const collapseBtn = document.getElementById('sidebar-collapse-toggle');
    const settingsToggle = document.getElementById('settings-nav-toggle');
    const settingsSubnav = document.getElementById('settings-subnav');

    const closeSettings = () => {
      settingsSubnav?.classList.add('hidden');
      settingsToggle?.setAttribute('aria-expanded', 'false');
    };

    collapseBtn?.addEventListener('click', () => {
      const collapsed = !layout?.classList.contains('sidebar-collapsed');
      layout?.classList.toggle('sidebar-collapsed', collapsed);
      collapseBtn.setAttribute('aria-expanded', String(!collapsed));
      collapseBtn.querySelector('i').className = collapsed
        ? 'fa-solid fa-angles-right'
        : 'fa-solid fa-angles-left';
      if (collapsed) closeSettings();
    });

    settingsToggle?.addEventListener('click', () => {
      if (layout?.classList.contains('sidebar-collapsed')) return;
      const willOpen = settingsSubnav?.classList.contains('hidden');
      settingsSubnav?.classList.toggle('hidden', !willOpen);
      settingsToggle.setAttribute('aria-expanded', String(willOpen));
    });
  },

  getQualityCheckConfig() {
    try {
      const saved = JSON.parse(localStorage.getItem('pos_quality_check_config') || '{}');
      return {
        manual: saved.manual !== false,
        updatedBy: saved.updatedBy || 'Aiden',
        updatedAt: saved.updatedAt || '尚未修改'
      };
    } catch (error) {
      return { manual: true, updatedBy: 'Aiden', updatedAt: '尚未修改' };
    }
  },

  renderSettingsCenterSection(section = 'profile') {
    const state = Store.getState();
    const binding = this.getAccountBindingState();
    const quality = this.getQualityCheckConfig();
    const qrExpiresAt = Number(binding.qrExpiresAt) || Date.now() + 5 * 60 * 1000;
    const qrExpired = !binding.bound && Date.now() >= qrExpiresAt;
    const qrCells = Array.from({ length: 81 }).map((_, index) => {
      const row = Math.floor(index / 9);
      const col = index % 9;
      const finder = ((row < 3 || row > 5) && (col < 3 || col > 5));
      const active = finder || ((index * 7 + row * 3 + col) % 5 < 2);
      return `<span class="${active ? 'bg-[#172b4d]' : 'bg-white'} rounded-[1px]"></span>`;
    }).join('');
    if (section === 'password') return `
      <div class="max-w-xl">
        <h3 class="text-lg font-black text-[#1d2129]">修改密码</h3>
        <p class="mt-1 text-sm text-[#86909c]">更新当前登录账号的访问密码</p>
        <form id="settings-password-form" class="mt-6 space-y-4">
          ${['原密码','新密码','确认新密码'].map((label, index) => `<label class="block"><span class="mb-2 block text-sm font-semibold text-[#4e5969]">${label}</span><input type="password" data-password-index="${index}" class="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-blue-100"></label>`).join('')}
          <p id="settings-password-error" class="hidden text-sm text-red-600"></p>
          <button type="submit" class="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm">确认修改</button>
        </form>
      </div>`;
    if (section === 'binding') return `
      <div>
        <h3 class="text-lg font-black text-[#1d2129]">账号绑定</h3>
        <p class="mt-1 text-sm text-[#86909c]">绑定企业微信后，可用于消息通知和身份确认</p>
        <div class="mt-6 rounded-2xl border ${binding.bound ? 'border-green-100 bg-green-50/40' : 'border-blue-100 bg-blue-50/40'} p-5">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3"><span class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl text-green-600 shadow-sm"><i class="fa-brands fa-weixin"></i></span><div><div class="font-bold text-[#1d2129]">企业微信</div><div class="mt-1 text-xs text-[#86909c]">${binding.bound ? `${binding.nickname || state.userName} · ${binding.company || 'Orion POS'}` : '当前账号尚未绑定'}</div></div></div>
            <span class="rounded-full px-2.5 py-1 text-xs font-bold ${binding.bound ? 'bg-green-100 text-green-700' : binding.scanStatus === 'pending' ? 'bg-blue-100 text-brand' : 'bg-amber-100 text-amber-700'}">${binding.bound ? '已绑定' : binding.scanStatus === 'pending' ? '待确认' : '未绑定'}</span>
          </div>
          ${binding.bound ? `
            <div class="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div class="rounded-xl bg-white px-4 py-3"><div class="text-xs text-[#86909c]">企业微信昵称</div><div class="mt-1 font-bold text-[#1d2129]">${binding.nickname || state.userName}</div></div>
              <div class="rounded-xl bg-white px-4 py-3"><div class="text-xs text-[#86909c]">所属企业</div><div class="mt-1 font-bold text-[#1d2129]">${binding.company || 'Orion POS'}</div></div>
              <div class="rounded-xl bg-white px-4 py-3"><div class="text-xs text-[#86909c]">绑定账号</div><div class="mt-1 font-bold text-[#1d2129]">${state.account || '-'}</div></div>
              <div class="rounded-xl bg-white px-4 py-3"><div class="text-xs text-[#86909c]">绑定时间</div><div class="mt-1 font-bold text-[#1d2129]">${binding.boundAt || '-'}</div></div>
            </div>
            <div class="mt-5 flex justify-end gap-3"><button type="button" id="settings-binding-unbind" class="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">解除绑定</button><button type="button" id="settings-binding-rebind" class="rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-brand">重新绑定</button></div>
          ` : `
            <div class="mt-5 flex gap-6 rounded-2xl bg-white p-5">
              <div class="relative shrink-0 rounded-xl border border-blue-100 bg-white p-3 shadow-sm">
                <div class="grid h-40 w-40 grid-cols-9 gap-1 ${qrExpired ? 'opacity-20' : ''}">${qrCells}</div>
                ${qrExpired ? '<div class="absolute inset-0 flex items-center justify-center"><span class="rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#4e5969] shadow">二维码已失效</span></div>' : ''}
                ${binding.scanStatus === 'pending' && !qrExpired ? '<div class="absolute inset-0 flex items-center justify-center bg-white/90"><div class="text-center"><i class="fa-solid fa-circle-check text-2xl text-green-600"></i><div class="mt-2 text-xs font-bold text-[#1d2129]">已扫码</div></div></div>' : ''}
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-base font-bold text-[#1d2129]">${binding.scanStatus === 'pending' ? '请在企业微信中确认授权' : '使用企业微信扫码绑定'}</div>
                <ol class="mt-3 space-y-2 text-sm text-[#4e5969]"><li>1. 打开企业微信“扫一扫”</li><li>2. 扫描左侧二维码</li><li>3. 在企业微信中确认账号授权</li></ol>
                <div class="mt-4 text-xs text-[#86909c]">二维码有效期：<span id="settings-binding-countdown" class="font-bold text-[#4e5969]" data-expires-at="${qrExpiresAt}">${qrExpired ? '已失效' : '05:00'}</span></div>
                <div class="mt-5 flex flex-wrap gap-2">
                  <button type="button" id="settings-binding-refresh" class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-[#4e5969]">刷新二维码</button>
                  ${binding.scanStatus === 'pending' && !qrExpired
                    ? '<button type="button" id="settings-binding-confirm" class="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-brand">模拟确认绑定</button>'
                    : `<button type="button" id="settings-binding-scan" class="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-brand" ${qrExpired ? 'disabled' : ''}>模拟扫码</button>`}
                </div>
              </div>
            </div>
          `}
        </div>
      </div>`;
    if (section === 'accounts') return `
      <div>
        <h3 class="text-lg font-black text-[#1d2129]">切换演示账号</h3>
        <p class="mt-1 text-sm text-[#86909c]">切换账号以验证不同角色的页面和操作权限</p>
        <div class="mt-6 grid gap-3">
          ${Object.values(Store.accounts).map(account => `<button type="button" class="settings-account-option flex items-center justify-between rounded-2xl border p-4 text-left transition-colors ${state.account === account.account ? 'border-blue-200 bg-blue-50' : 'border-gray-100 hover:border-blue-100 hover:bg-slate-50'}" data-account="${account.account}"><span class="flex items-center gap-3"><span class="flex h-10 w-10 items-center justify-center rounded-full bg-white font-bold text-brand shadow-sm">${account.userName.slice(0, 1)}</span><span><span class="block font-bold text-[#1d2129]">${account.userName}</span><span class="mt-1 block text-xs text-[#86909c]">${account.userRole}${account.team ? ` · ${account.team}` : ''}</span></span></span>${state.account === account.account ? '<span class="text-xs font-bold text-brand"><i class="fa-solid fa-check mr-1"></i>当前账号</span>' : '<span class="text-xs font-semibold text-[#86909c]">切换</span>'}</button>`).join('')}
        </div>
      </div>`;
    if (section === 'quality') return `
      <div>
        <h3 class="text-lg font-black text-[#1d2129]">质检配置</h3>
        <p class="mt-1 text-sm text-[#86909c]">配置单门店已匹配数据进入质量检查的方式</p>
        <div class="mt-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div class="flex items-start justify-between gap-6">
            <div><div class="font-bold text-[#1d2129]">人工触发质检</div><p class="mt-2 max-w-xl text-sm leading-6 text-[#4e5969]">开启后，需要人工在“单门店已匹配数据”中选择单据并点击“质检”；关闭后，新进入的已匹配数据由系统自动提交质量检查。</p></div>
            <label class="relative mt-1 inline-flex cursor-pointer items-center"><input id="settings-quality-manual" type="checkbox" class="peer sr-only" ${quality.manual ? 'checked' : ''}><span class="h-6 w-11 rounded-full bg-gray-200 transition-colors peer-checked:bg-brand"></span><span class="absolute left-1 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5"></span></label>
          </div>
          <div class="mt-5 grid grid-cols-2 gap-3 text-xs"><div class="rounded-xl bg-slate-50 px-4 py-3"><span class="text-[#86909c]">当前模式</span><strong class="ml-2 text-[#1d2129]">${quality.manual ? '人工质检' : '自动质检'}</strong></div><div class="rounded-xl bg-slate-50 px-4 py-3"><span class="text-[#86909c]">最后修改</span><strong class="ml-2 text-[#1d2129]">${quality.updatedBy} · ${quality.updatedAt}</strong></div></div>
          <div class="mt-5 flex justify-end"><button id="settings-quality-save" type="button" class="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm">保存配置</button></div>
        </div>
      </div>`;
    return `
      <div>
        <h3 class="text-lg font-black text-[#1d2129]">账号信息</h3>
        <p class="mt-1 text-sm text-[#86909c]">查看当前登录用户及组织归属</p>
        <div class="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white">
          ${[
            ['姓名', state.userName || '-'], ['登录账号', state.account || '-'], ['当前角色', state.userRole || '-'],
            ['所属Team', state.team || '-'], ['所属营业所', state.salesOffice || '-']
          ].map(([label, value]) => `<div class="grid grid-cols-[140px_1fr] border-b border-gray-100 px-5 py-4 last:border-b-0"><span class="text-sm font-semibold text-[#86909c]">${label}</span><span class="text-sm font-bold text-[#1d2129]">${value}</span></div>`).join('')}
        </div>
      </div>`;
  },

  openSettingsCenter(initialSection = 'profile') {
    const overlay = document.getElementById('overlay-container');
    if (!overlay) return;
    const canManageQuality = Store.getState().isAdmin || Store.isPosActor();
    const navItems = [
      ['profile', 'fa-user', '账号信息'],
      ['password', 'fa-key', '修改密码'],
      ['binding', 'fa-link', '账号绑定'],
      ['accounts', 'fa-people-arrows', '账号切换'],
      ...(canManageQuality ? [['quality', 'fa-list-check', '质检配置']] : [])
    ];
    overlay.innerHTML = `<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-6 backdrop-blur-sm"><div class="flex h-[min(680px,86vh)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"><div class="flex items-center justify-between border-b border-gray-100 px-6 py-4"><div><h2 class="text-lg font-black text-[#1d2129]">设置中心</h2><p class="mt-1 text-xs text-[#86909c]">个人账号与业务流程配置</p></div><button id="settings-center-close" type="button" class="flex h-9 w-9 items-center justify-center rounded-lg text-[#86909c] hover:bg-gray-100"><i class="fa-solid fa-xmark"></i></button></div><div class="flex min-h-0 flex-1"><aside class="w-52 shrink-0 border-r border-gray-100 bg-slate-50/60 p-3"><nav class="space-y-1">${navItems.map(([key, icon, label]) => `<button type="button" class="settings-center-nav flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold" data-section="${key}"><i class="fa-solid ${icon} w-4"></i><span>${label}</span></button>`).join('')}</nav></aside><main id="settings-center-content" class="min-w-0 flex-1 overflow-auto p-7"></main></div></div></div>`;
    let activeSection = initialSection;
    const render = () => {
      overlay.querySelectorAll('.settings-center-nav').forEach(button => {
        const active = button.dataset.section === activeSection;
        button.classList.toggle('bg-blue-50', active);
        button.classList.toggle('text-brand', active);
        button.classList.toggle('text-[#4e5969]', !active);
      });
      const content = overlay.querySelector('#settings-center-content');
      if (!content) return;
      content.innerHTML = this.renderSettingsCenterSection(activeSection);
      this.bindSettingsCenterSection(activeSection, render);
    };
    overlay.querySelector('#settings-center-close')?.addEventListener('click', () => {
      if (this.settingsBindingTimer) clearInterval(this.settingsBindingTimer);
      this.settingsBindingTimer = null;
      overlay.innerHTML = '';
    });
    overlay.querySelectorAll('.settings-center-nav').forEach(button => button.addEventListener('click', () => {
      activeSection = button.dataset.section;
      render();
    }));
    render();
  },

  bindSettingsCenterSection(section, rerender) {
    const overlay = document.getElementById('overlay-container');
    if (this.settingsBindingTimer) {
      clearInterval(this.settingsBindingTimer);
      this.settingsBindingTimer = null;
    }
    if (section === 'password') {
      overlay.querySelector('#settings-password-form')?.addEventListener('submit', event => {
        event.preventDefault();
        const values = [...event.currentTarget.querySelectorAll('input')].map(input => input.value.trim());
        const error = overlay.querySelector('#settings-password-error');
        const showError = message => { error.textContent = message; error.classList.remove('hidden'); };
        if (values.some(value => !value)) return showError('请完整填写原密码、新密码和确认新密码');
        if (values[1].length < 6) return showError('新密码至少需要6位');
        if (values[1] !== values[2]) return showError('两次输入的新密码不一致');
        event.currentTarget.reset();
        error.classList.add('hidden');
        Dialog.toast('密码修改成功');
      });
    }
    if (section === 'binding') {
      let current = this.getAccountBindingState();
      if (!current.bound && !current.qrExpiresAt) {
        current = { ...current, scanStatus: 'idle', qrExpiresAt: Date.now() + 5 * 60 * 1000 };
        this.saveAccountBindingState(current);
      }
      const countdown = overlay.querySelector('#settings-binding-countdown');
      const updateCountdown = () => {
        if (!countdown) return;
        const remaining = Math.max(0, Number(countdown.dataset.expiresAt) - Date.now());
        if (!remaining) {
          const shouldRefreshState = countdown.textContent !== '已失效';
          countdown.textContent = '已失效';
          clearInterval(this.settingsBindingTimer);
          this.settingsBindingTimer = null;
          if (shouldRefreshState) rerender();
          return;
        }
        const totalSeconds = Math.ceil(remaining / 1000);
        countdown.textContent = `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`;
      };
      updateCountdown();
      if (countdown) this.settingsBindingTimer = setInterval(updateCountdown, 1000);
      overlay.querySelector('#settings-binding-refresh')?.addEventListener('click', () => {
        this.saveAccountBindingState({ ...this.getAccountBindingState(), bound: false, scanStatus: 'idle', qrExpiresAt: Date.now() + 5 * 60 * 1000 });
        rerender();
        Dialog.toast('二维码已刷新');
      });
      overlay.querySelector('#settings-binding-scan')?.addEventListener('click', () => {
        this.saveAccountBindingState({ ...this.getAccountBindingState(), scanStatus: 'pending' });
        rerender();
        Dialog.toast('已扫码，请在企业微信中确认');
      });
      overlay.querySelector('#settings-binding-confirm')?.addEventListener('click', () => {
        this.saveAccountBindingState({
          bound: true,
          scanStatus: 'confirmed',
          qrExpiresAt: 0,
          nickname: Store.getState().userName,
          company: 'Orion POS',
          boundAt: this.getCurrentTime()
        });
        rerender();
        Dialog.toast('企业微信绑定成功');
      });
      overlay.querySelector('#settings-binding-unbind')?.addEventListener('click', () => {
        this.saveAccountBindingState({ bound: false, scanStatus: 'idle', qrExpiresAt: Date.now() + 5 * 60 * 1000, nickname: '', company: '', boundAt: '' });
        rerender();
        Dialog.toast('已解除企业微信绑定');
      });
      overlay.querySelector('#settings-binding-rebind')?.addEventListener('click', () => {
        this.saveAccountBindingState({ ...this.getAccountBindingState(), bound: false, scanStatus: 'idle', qrExpiresAt: Date.now() + 5 * 60 * 1000 });
        rerender();
      });
    }
    if (section === 'accounts') {
      overlay.querySelectorAll('.settings-account-option').forEach(button => button.addEventListener('click', () => {
        if (!Store.switchAccount(button.dataset.account)) return;
        this.applyRoleVisibility();
        this.syncHeaderUser();
        this.mountView(Store.getState().currentView || 'dashboard');
        rerender();
        Dialog.toast(`已切换为 ${Store.getState().userName}（${Store.getState().userRole}）`, 'success');
      }));
    }
    if (section === 'quality') {
      overlay.querySelector('#settings-quality-save')?.addEventListener('click', () => {
        const manual = Boolean(overlay.querySelector('#settings-quality-manual')?.checked);
        localStorage.setItem('pos_quality_check_config', JSON.stringify({
          manual,
          updatedBy: Store.getState().userName,
          updatedAt: this.getCurrentTime(),
          effectiveAt: manual ? null : Date.now()
        }));
        this.mountView(Store.getState().currentView || 'dashboard');
        rerender();
        Dialog.toast(`已切换为${manual ? '人工' : '自动'}质检模式`, 'success');
      });
    }
  },

  openChangePasswordDialog() {
    const overlay = document.getElementById('overlay-container');
    if (!overlay) return;

    overlay.innerHTML = `
      <div class="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center backdrop-blur-sm toast-enter toast-enter-active">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div>
              <h3 class="font-bold text-slate-800">修改密码</h3>
              <p class="text-xs text-slate-500 mt-1">更新当前登录用户的访问密码</p>
            </div>
            <button class="text-slate-400 hover:text-slate-600 change-password-close" type="button" aria-label="关闭">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <form id="change-password-form" class="p-6 space-y-4">
            <label class="block">
              <span class="block text-sm font-semibold text-slate-700 mb-1.5">原密码</span>
              <input id="current-password" type="password" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" autocomplete="current-password">
            </label>
            <label class="block">
              <span class="block text-sm font-semibold text-slate-700 mb-1.5">新密码</span>
              <input id="new-password" type="password" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" autocomplete="new-password">
            </label>
            <label class="block">
              <span class="block text-sm font-semibold text-slate-700 mb-1.5">确认新密码</span>
              <input id="confirm-password" type="password" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" autocomplete="new-password">
            </label>
            <p id="change-password-error" class="hidden text-sm text-red-600"></p>
            <div class="pt-2 flex justify-end gap-3">
              <button type="button" class="px-4 py-2 text-slate-600 text-sm hover:bg-gray-100 rounded transition-colors change-password-cancel">取消</button>
              <button type="submit" class="px-4 py-2 bg-brand text-white text-sm rounded hover:bg-blue-700 transition-colors shadow-sm">确认修改</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const closeDialog = () => {
      overlay.innerHTML = '';
    };
    const showError = (message) => {
      const error = document.getElementById('change-password-error');
      if (!error) return;
      error.textContent = message;
      error.classList.remove('hidden');
    };

    overlay.querySelector('.change-password-close')?.addEventListener('click', closeDialog);
    overlay.querySelector('.change-password-cancel')?.addEventListener('click', closeDialog);
    overlay.querySelector('#change-password-form')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const currentPassword = document.getElementById('current-password')?.value.trim() || '';
      const newPassword = document.getElementById('new-password')?.value.trim() || '';
      const confirmPassword = document.getElementById('confirm-password')?.value.trim() || '';

      if (!currentPassword || !newPassword || !confirmPassword) {
        showError('请完整填写原密码、新密码和确认新密码');
        return;
      }
      if (newPassword.length < 6) {
        showError('新密码至少需要 6 位');
        return;
      }
      if (newPassword !== confirmPassword) {
        showError('两次输入的新密码不一致');
        return;
      }

      closeDialog();
      Dialog.toast('密码修改成功');
    });
  },

  getAccountBindingState() {
    try {
      const saved = JSON.parse(localStorage.getItem('pos_account_binding') || '{}');
      return saved && typeof saved === 'object'
        ? { bound: false, scanStatus: 'idle', qrExpiresAt: 0, nickname: '', company: '', boundAt: '', ...saved }
        : { bound: false, scanStatus: 'idle', qrExpiresAt: 0, nickname: '', company: '', boundAt: '' };
    } catch (error) {
      return { bound: false, scanStatus: 'idle', qrExpiresAt: 0, nickname: '', company: '', boundAt: '' };
    }
  },

  saveAccountBindingState(state) {
    localStorage.setItem('pos_account_binding', JSON.stringify(state));
  },

  openAccountBindingDialog(mode = 'status') {
    const overlay = document.getElementById('overlay-container');
    if (!overlay) return;

    const appState = Store.getState();
    const binding = this.getAccountBindingState();
    const isQrMode = mode === 'qr';
    const statusBadge = binding.bound
      ? '<span class="inline-flex items-center rounded-full border border-green-100 bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">已绑定</span>'
      : '<span class="inline-flex items-center rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">未绑定</span>';
    const qrCells = Array.from({ length: 49 }).map((_, index) => {
      const active = [0, 1, 2, 6, 7, 8, 10, 14, 18, 22, 24, 25, 27, 30, 31, 34, 36, 40, 42, 43, 44, 46, 48].includes(index);
      return `<span class="${active ? 'bg-[#1d2129]' : 'bg-white'} rounded-[2px]"></span>`;
    }).join('');

    overlay.innerHTML = `
      <div class="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center backdrop-blur-sm toast-enter toast-enter-active">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
          <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-start bg-gray-50">
            <div>
              <h3 class="font-black text-slate-800 text-lg">账号绑定</h3>
              <p class="text-xs text-slate-500 mt-1">绑定企业微信后，可用于消息通知和账号身份确认</p>
            </div>
            <button class="text-slate-400 hover:text-slate-600 account-binding-close" type="button" aria-label="关闭">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <section class="rounded-xl border border-gray-100 bg-white p-4">
              <div class="mb-3 flex items-center justify-between">
                <h4 class="text-sm font-black text-[#1d2129]">当前账号</h4>
                ${statusBadge}
              </div>
              <div class="grid grid-cols-3 gap-3 text-sm">
                <div class="rounded-lg bg-slate-50 px-3 py-2">
                  <div class="text-xs font-semibold text-[#86909c]">用户名</div>
                  <div class="mt-1 font-bold text-[#1d2129]">${appState.userName || 'Aiden'}</div>
                </div>
                <div class="rounded-lg bg-slate-50 px-3 py-2">
                  <div class="text-xs font-semibold text-[#86909c]">角色</div>
                  <div class="mt-1 font-bold text-[#1d2129]">${appState.userRole || 'POS担当'}</div>
                </div>
                <div class="rounded-lg bg-slate-50 px-3 py-2">
                  <div class="text-xs font-semibold text-[#86909c]">登录账号</div>
                  <div class="mt-1 font-bold text-[#1d2129]">A123456</div>
                </div>
              </div>
            </section>

            ${isQrMode ? `
              <section class="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <div class="flex gap-5">
                  <div class="shrink-0 rounded-xl border border-blue-100 bg-white p-3 shadow-sm">
                    <div class="grid h-32 w-32 grid-cols-7 gap-1">${qrCells}</div>
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 text-sm font-black text-brand">
                      <i class="fa-brands fa-weixin"></i>
                      企业微信扫码绑定
                    </div>
                    <p class="mt-2 text-sm leading-6 text-[#4e5969]">请使用企业微信扫描左侧二维码完成授权。当前为演示流程，可点击下方按钮模拟绑定成功。</p>
                    <div class="mt-4 rounded-lg bg-white px-3 py-2 text-xs leading-5 text-[#86909c]">
                      绑定后，系统可将文件收取提醒、质检异常提醒推送至企业微信。
                    </div>
                  </div>
                </div>
              </section>
            ` : `
              <section class="rounded-xl border ${binding.bound ? 'border-green-100 bg-green-50/60' : 'border-amber-100 bg-amber-50/60'} p-4">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <div class="flex items-center gap-2 text-sm font-black ${binding.bound ? 'text-green-700' : 'text-amber-700'}">
                      <i class="fa-brands fa-weixin"></i>
                      企业微信
                    </div>
                    ${binding.bound ? `
                      <div class="mt-3 grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <div class="text-xs font-semibold text-[#86909c]">企业微信昵称</div>
                          <div class="mt-1 font-bold text-[#1d2129]">${binding.nickname || 'Aiden'}</div>
                        </div>
                        <div>
                          <div class="text-xs font-semibold text-[#86909c]">所属企业</div>
                          <div class="mt-1 font-bold text-[#1d2129]">${binding.company || 'Orion POS'}</div>
                        </div>
                        <div>
                          <div class="text-xs font-semibold text-[#86909c]">绑定时间</div>
                          <div class="mt-1 font-bold text-[#1d2129]">${binding.boundAt || '-'}</div>
                        </div>
                      </div>
                    ` : `
                      <p class="mt-2 text-sm leading-6 text-[#4e5969]">当前账号尚未绑定企业微信。绑定后可接收业务提醒，并用于后续账号安全校验。</p>
                    `}
                  </div>
                </div>
              </section>
            `}
          </div>
          <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
            <button type="button" class="px-4 py-2 text-slate-600 text-sm hover:bg-gray-100 rounded-lg transition-colors account-binding-cancel">关闭</button>
            ${isQrMode ? `
              <button type="button" class="px-4 py-2 bg-brand text-white text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm account-binding-success">
                模拟绑定成功
              </button>
            ` : binding.bound ? `
              <button type="button" class="px-4 py-2 text-red-600 bg-red-50 text-sm rounded-lg hover:bg-red-100 transition-colors account-binding-unbind">解绑</button>
              <button type="button" class="px-4 py-2 bg-brand text-white text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm account-binding-rebind">重新绑定</button>
            ` : `
              <button type="button" class="px-4 py-2 bg-brand text-white text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-sm account-binding-start">
                绑定企业微信
              </button>
            `}
          </div>
        </div>
      </div>
    `;

    const closeDialog = () => { overlay.innerHTML = ''; };
    overlay.querySelector('.account-binding-close')?.addEventListener('click', closeDialog);
    overlay.querySelector('.account-binding-cancel')?.addEventListener('click', closeDialog);
    overlay.querySelector('.account-binding-start')?.addEventListener('click', () => this.openAccountBindingDialog('qr'));
    overlay.querySelector('.account-binding-rebind')?.addEventListener('click', () => this.openAccountBindingDialog('qr'));
    overlay.querySelector('.account-binding-success')?.addEventListener('click', () => {
      this.saveAccountBindingState({
        bound: true,
        nickname: appState.userName || 'Aiden',
        company: 'Orion POS',
        boundAt: this.getCurrentTime()
      });
      this.openAccountBindingDialog('status');
      Dialog.toast('企业微信绑定成功');
    });
    overlay.querySelector('.account-binding-unbind')?.addEventListener('click', () => {
      this.saveAccountBindingState({ bound: false, nickname: '', company: '', boundAt: '' });
      this.openAccountBindingDialog('status');
      Dialog.toast('已解除企业微信绑定');
    });
  },
  
  getCurrentTime() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  },
  
  updateTime() {
    Store.setState({ lastUpdated: this.getCurrentTime() });
  },
  
  handleRoute() {
    const hash = window.location.hash.slice(1) || 'login';
    const state = Store.getState();
    if (hash === 'settings-org') {
      window.location.hash = '#settings-users';
      return;
    }
    if (hash === 'sdk') {
      window.location.hash = '#dashboard';
      return;
    }
    
    // Auth guard
    if (hash !== 'login' && !state.isAuthenticated) {
      window.location.hash = '#login';
      return;
    }
    
    // UI Layout toggle
    const layout = document.getElementById('app-layout');
    const loginContainer = document.getElementById('login-container');
    
    if (hash === 'login') {
      layout.classList.add('hidden');
      layout.classList.remove('flex');
      loginContainer.classList.remove('hidden');
      loginContainer.classList.add('flex');

      if (typeof LoginView !== 'undefined') {
        LoginView.mount();
      }
    } else {
      layout.classList.remove('hidden');
      layout.classList.add('flex');
      loginContainer.classList.add('hidden');
      loginContainer.classList.remove('flex');
      layout.classList.remove('sidebar-open');
      this.applyRoleVisibility();
      this.syncHeaderUser();
    }

    if (hash.startsWith('settings-') && !Store.isPosActor()) {
      window.location.hash = '#dashboard';
      return;
    }
    
    // Update active nav
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.remove('active', 'bg-blue-50', 'text-brand', 'font-semibold', 'shadow-sm');
      if (el.getAttribute('href') === `#${hash}`) {
        el.classList.add('active', 'bg-blue-50', 'text-brand', 'font-semibold', 'shadow-sm');
      }
    });
    document.querySelectorAll('.subnav-item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('href') === `#${hash}`);
    });
    this.syncSettingsNav(hash);
    this.syncGlobalPeriodVisibility(hash);
    
    if (hash !== 'login') {
      this.mountView(hash);
    }
  },

  syncGlobalPeriodVisibility(hash) {
    const picker = document.getElementById('global-period-picker');
    if (!picker) return;
    picker.classList.toggle('hidden', hash === 'ledger' || hash.startsWith('settings-'));
  },

  syncSettingsNav(hash) {
    const layout = document.getElementById('app-layout');
    const settingsGroup = document.getElementById('settings-nav-group');
    const settingsToggle = document.getElementById('settings-nav-toggle');
    const settingsSubnav = document.getElementById('settings-subnav');
    const inSettings = hash.startsWith('settings-');

    settingsGroup?.classList.toggle('active', inSettings);
    settingsToggle?.classList.toggle('active', inSettings);
    if (settingsSubnav && settingsToggle && !layout?.classList.contains('sidebar-collapsed')) {
      settingsSubnav.classList.toggle('hidden', !inSettings && settingsToggle.getAttribute('aria-expanded') !== 'true');
      if (inSettings) settingsToggle.setAttribute('aria-expanded', 'true');
    }
  },
  
  mountView(viewName) {
    const contentArea = document.getElementById('main-content');
    const actionBarArea = document.getElementById('view-actions');
    const view = this.views[viewName];
    const placeholderTitle = this.placeholderRoutes[viewName];
    
    if (view || placeholderTitle) {
      Store.setState({ currentView: viewName });
      
      // Clear previous
      contentArea.innerHTML = '';
      actionBarArea.innerHTML = '';
      
      // Render new
      if (view?.renderAction) {
        actionBarArea.innerHTML = view.renderAction();
      }
      contentArea.innerHTML = view ? view.render() : this.renderPlaceholder(placeholderTitle);
      
      // Re-apply i18n for new DOM
      I18n.updateDOM();
      
      // Bind events
      if (view?.bindEvents) {
        view.bindEvents();
      }
    }
  },

  renderPlaceholder(title) {
    return `
      <section class="h-full min-h-[520px] rounded-2xl border border-white bg-white/90 shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center justify-center animate-[fadeIn_0.4s_ease-out]">
        <div class="text-center px-6">
          <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 text-brand flex items-center justify-center text-2xl">
            <i class="fa-solid fa-compass-drafting"></i>
          </div>
          <h2 class="text-xl font-extrabold text-[#1d2129]">${title}</h2>
          <p class="mt-2 text-sm text-[#86909c]">待设计</p>
        </div>
      </section>
    `;
  },
  
  logout() {
    Store.setState({ isAuthenticated: false });
    window.location.hash = '#login';
  }
};

// Start app
document.addEventListener('DOMContentLoaded', () => App.init());

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
  placeholderRoutes: {
    analytics: '数据分析'
  },
  
  async init() {
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
    const changePasswordBtn = document.getElementById('change-password-btn');
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

    changePasswordBtn?.addEventListener('click', (event) => {
      event.stopPropagation();
      closeMenu();
      this.openChangePasswordDialog();
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

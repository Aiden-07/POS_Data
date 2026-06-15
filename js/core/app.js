const App = {
  views: {
    'login': typeof LoginView !== 'undefined' ? LoginView : null,
    'dashboard': typeof DashboardView !== 'undefined' ? DashboardView : null,
    'ingestion': typeof IngestionView !== 'undefined' ? IngestionView : null,
    'qa': typeof QAView !== 'undefined' ? QAView : null,
    'ledger': typeof LedgerView !== 'undefined' ? LedgerView : null
  },
  
  async init() {
    await I18n.init();
    
    // Setup listeners
    document.getElementById('lang-toggle').addEventListener('click', () => I18n.toggle());
    document.getElementById('logout-btn').addEventListener('click', () => this.logout());
    document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
      document.getElementById('app-layout')?.classList.toggle('sidebar-open');
    });
    document.getElementById('notification-btn')?.addEventListener('click', (event) => {
      event.stopPropagation();
      document.getElementById('notification-panel')?.classList.toggle('hidden');
    });
    document.addEventListener('click', (event) => {
      const notificationWrap = document.querySelector('.notification-wrap');
      const notificationPanel = document.getElementById('notification-panel');
      if (notificationWrap && notificationPanel && !notificationWrap.contains(event.target)) {
        notificationPanel.classList.add('hidden');
      }
    });
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
    
    if (hash !== 'login') {
      this.mountView(hash);
    }
  },
  
  mountView(viewName) {
    const contentArea = document.getElementById('main-content');
    const actionBarArea = document.getElementById('view-actions');
    const view = this.views[viewName];
    
    if (view) {
      Store.setState({ currentView: viewName });
      
      // Clear previous
      contentArea.innerHTML = '';
      actionBarArea.innerHTML = '';
      
      // Render new
      if (view.renderAction) {
        actionBarArea.innerHTML = view.renderAction();
      }
      contentArea.innerHTML = view.render();
      
      // Re-apply i18n for new DOM
      I18n.updateDOM();
      
      // Bind events
      if (view.bindEvents) {
        view.bindEvents();
      }
    }
  },
  
  logout() {
    Store.setState({ isAuthenticated: false });
    window.location.hash = '#login';
  }
};

// Start app
document.addEventListener('DOMContentLoaded', () => App.init());

const Store = {
  accounts: {
    'aiden.pos': { account: 'aiden.pos', password: 'Demo@123456', userName: 'Aiden', userRole: 'POS担当', team: '全部数据', salesOffice: '', isAdmin: true },
    'wangmin.sales': { account: 'wangmin.sales', password: 'Demo@123456', userName: '王敏', userRole: '营业担当', team: '华北 Team', salesOffice: '石家庄营业所', isAdmin: false }
  },
  state: {
    lang: 'cn',
    isAuthenticated: false,
    userName: 'Aiden',
    userRole: 'POS担当',
    account: 'aiden.pos',
    team: '全部数据',
    salesOffice: '',
    isAdmin: true,
    lastUpdated: new Date().toLocaleString(),
    currentView: 'login',
    selectedYear: '2026',
    selectedMonth: '04'
  },
  listeners: [],
  
  getState() {
    return this.state;
  },
  
  setState(newState) {
    this.state = { ...this.state, ...newState };
    if (newState.account || newState.userName || newState.userRole) {
      localStorage.setItem('pos_demo_current_account', this.state.account || 'aiden.pos');
    }
    this.notify();
  },

  restoreAccount() {
    const account = localStorage.getItem('pos_demo_current_account') || 'aiden.pos';
    const profile = this.accounts[account] || this.accounts['aiden.pos'];
    this.state = { ...this.state, ...profile };
    return profile;
  },

  switchAccount(account) {
    const profile = this.accounts[account];
    if (!profile) return false;
    this.setState({ ...profile, isAuthenticated: true });
    return true;
  },

  isPosActor() {
    return this.state.userRole === 'POS担当' || this.state.isAdmin === true;
  },
  
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },
  
  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }
};

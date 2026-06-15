const Store = {
  state: {
    lang: 'cn',
    isAuthenticated: false,
    team: 'Team A',
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
    this.notify();
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

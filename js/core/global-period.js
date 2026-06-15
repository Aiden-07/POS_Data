const GlobalPeriod = {
  mounted: false,

  render() {
    return `
      <div id="global-period-picker" class="global-period-picker">
        <div class="relative">
          <select id="global-year-select" class="global-period-select" aria-label="选择年份">
            <option value="2026">2026 年</option>
            <option value="2025">2025 年</option>
            <option value="2024">2024 年</option>
          </select>
          <i class="fa-solid fa-chevron-down global-period-chevron"></i>
        </div>
        <div class="relative">
          <select id="global-month-select" class="global-period-select" aria-label="选择月份"></select>
          <i class="fa-solid fa-chevron-down global-period-chevron"></i>
        </div>
      </div>
    `;
  },

  getAvailableMonths(year) {
    const now = new Date();
    const currentYear = String(now.getFullYear());
    const maxMonth = year === currentYear ? Math.max(1, now.getMonth()) : 12;
    return Array.from({ length: maxMonth }, (_, index) => String(index + 1).padStart(2, '0'));
  },

  formatDisplay(year, month) {
    if (!month) return '请选择月份';
    return `${year} 年 ${Number(month)} 月`;
  },

  mount() {
    if (this.mounted) return;
    const slot = document.getElementById('global-period-slot');
    if (!slot) return;
    slot.innerHTML = this.render();
    this.bindEvents();
    this.syncFromStore();
    Store.subscribe(() => this.syncFromStore());
    this.mounted = true;
  },

  bindEvents() {
    const yearSelect = document.getElementById('global-year-select');
    const monthSelect = document.getElementById('global-month-select');

    yearSelect?.addEventListener('change', () => {
      const year = yearSelect.value;
      const months = this.getAvailableMonths(year);
      Store.setState({
        selectedYear: year,
        selectedMonth: months.includes(Store.getState().selectedMonth) ? Store.getState().selectedMonth : ''
      });
    });

    monthSelect?.addEventListener('change', () => {
      Store.setState({ selectedMonth: monthSelect.value });
    });
  },

  syncFromStore() {
    const state = Store.getState();
    const yearSelect = document.getElementById('global-year-select');
    const monthSelect = document.getElementById('global-month-select');
    const display = document.getElementById('selected-date-display');
    if (!yearSelect || !monthSelect) return;

    const year = state.selectedYear || '2026';
    const months = this.getAvailableMonths(year);
    yearSelect.value = year;
    monthSelect.innerHTML = '<option value="" disabled>选择月份</option>';
    months.forEach((month) => {
      const option = document.createElement('option');
      option.value = month;
      option.textContent = `${Number(month)} 月`;
      monthSelect.appendChild(option);
    });
    monthSelect.value = months.includes(state.selectedMonth) ? state.selectedMonth : '';

    if (display) {
      display.textContent = this.formatDisplay(year, monthSelect.value);
    }
  }
};

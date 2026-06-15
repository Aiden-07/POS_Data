const AIAssistant = {
  conversations: [],
  activeId: null,
  lastResult: null,
  dragState: null,

  init() {
    this.cacheDom();
    if (!this.fab || !this.windowEl) return;

    this.createConversation('默认咨询');
    this.bindEvents();
  },

  cacheDom() {
    this.fab = document.getElementById('ai-assistant-fab');
    this.windowEl = document.getElementById('ai-assistant-window');
    this.header = document.getElementById('ai-window-header');
    this.closeBtn = document.getElementById('ai-close');
    this.fullscreenBtn = document.getElementById('ai-fullscreen');
    this.newChatBtn = document.getElementById('ai-new-chat');
    this.historyList = document.getElementById('ai-history-list');
    this.messagesEl = document.getElementById('ai-chat-messages');
    this.previewPanel = document.getElementById('ai-preview-panel');
    this.form = document.getElementById('ai-chat-form');
    this.questionEl = document.getElementById('ai-question');
  },

  bindEvents() {
    this.fab.addEventListener('click', () => this.open());
    this.closeBtn.addEventListener('click', () => this.close());
    this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    this.newChatBtn.addEventListener('click', () => this.createConversation());
    this.form.addEventListener('submit', (event) => {
      event.preventDefault();
      this.ask();
    });

    this.header.addEventListener('mousedown', (event) => this.startDrag(event));
    document.addEventListener('mousemove', (event) => this.drag(event));
    document.addEventListener('mouseup', () => this.stopDrag());
  },

  open() {
    this.windowEl.classList.remove('hidden');
    this.render();
  },

  close() {
    this.windowEl.classList.add('hidden');
  },

  toggleFullscreen() {
    this.windowEl.classList.toggle('ai-fullscreen');
    const icon = this.fullscreenBtn.querySelector('i');
    icon.className = this.windowEl.classList.contains('ai-fullscreen')
      ? 'fa-solid fa-compress'
      : 'fa-solid fa-expand';
  },

  startDrag(event) {
    if (event.target.closest('button') || this.windowEl.classList.contains('ai-fullscreen')) return;
    const rect = this.windowEl.getBoundingClientRect();
    this.dragState = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top
    };
    this.windowEl.style.right = 'auto';
    this.windowEl.style.bottom = 'auto';
    this.windowEl.style.left = `${rect.left}px`;
    this.windowEl.style.top = `${rect.top}px`;
  },

  drag(event) {
    if (!this.dragState) return;
    const maxLeft = window.innerWidth - this.windowEl.offsetWidth - 10;
    const maxTop = window.innerHeight - this.windowEl.offsetHeight - 10;
    const left = Math.min(Math.max(10, event.clientX - this.dragState.offsetX), Math.max(10, maxLeft));
    const top = Math.min(Math.max(10, event.clientY - this.dragState.offsetY), Math.max(10, maxTop));
    this.windowEl.style.left = `${left}px`;
    this.windowEl.style.top = `${top}px`;
  },

  stopDrag() {
    this.dragState = null;
  },

  createConversation(title = '新的 POS 咨询') {
    const id = `chat-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const conversation = {
      id,
      title,
      subtitle: '尚未提问',
      messages: [
        {
          role: 'assistant',
          content: '您好，我可以按照年月与门店名称，查询数据并生产EXCEL'
        }
      ]
    };
    this.conversations.unshift(conversation);
    this.activeId = id;
    this.lastResult = null;
    this.hidePreview();
    this.render();
  },

  get activeConversation() {
    return this.conversations.find((item) => item.id === this.activeId);
  },

  switchConversation(id) {
    this.activeId = id;
    this.lastResult = null;
    this.hidePreview();
    this.render();
  },

  ask() {
    const conversation = this.activeConversation;
    if (!conversation) return;

    const question = this.questionEl.value.trim();
    const query = this.parseQuery(question);
    const { year, month, store } = query;
    const prompt = question || `查询 ${year} 年 ${month} 月 ${store} POS 数据`;

    conversation.title = `${store} ${year}-${String(month).padStart(2, '0')}`;
    conversation.subtitle = '已生成 Excel 结果';
    conversation.messages.push({ role: 'user', content: prompt });

    const rows = this.makeRows(year, month, store);
    const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0);
    const totalQty = rows.reduce((sum, row) => sum + row.qty, 0);
    const result = { year, month, store, rows, totalAmount, totalQty };
    this.lastResult = result;

    conversation.messages.push({
      role: 'assistant',
      content: `已生成  ${store}${year}年${Number(month)}月POS明细Excel。`,
      result
    });

    this.render();
    this.questionEl.value = '';
  },

  parseQuery(question) {
    const now = new Date();
    const yearMatch = question.match(/(20\d{2})\s*年?/);
    const monthMatch = question.match(/(?:20\d{2}\s*年\s*)?(\d{1,2})\s*月/);
    const storeCandidates = ['万象城店', '明洞店', '华北旗舰店', '东北直营店'];
    const foundStore = storeCandidates.find((store) => question.includes(store));

    return {
      year: yearMatch ? yearMatch[1] : String(now.getFullYear()),
      month: monthMatch ? monthMatch[1] : String(now.getMonth() + 1),
      store: foundStore || '万象城店'
    };
  },

  makeRows(year, month, store) {
    const base = [
      ['6901234567890', 'Coca Cola 500ml', 120, 420],
      ['6909876543210', 'Lays Chips 330g', 84, 672],
      ['8801234567890', 'Soju 360ml', 56, 1008],
      ['6905555555555', 'Instant Noodles', 142, 710],
      ['6907777777777', 'Mineral Water 550ml', 210, 630]
    ];

    return base.map((item, index) => {
      const multiplier = Number(month) + index + store.length;
      const qty = item[2] + (multiplier % 17);
      const amount = item[3] + (multiplier * 18);
      return {
        date: `${year}-${String(month).padStart(2, '0')}-${String(index + 3).padStart(2, '0')}`,
        store,
        barcode: item[0],
        product: item[1],
        qty,
        amount
      };
    });
  },

  render() {
    this.renderHistory();
    this.renderMessages();
  },

  renderHistory() {
    this.historyList.innerHTML = this.conversations.map((conversation) => `
      <button type="button" class="ai-history-item ${conversation.id === this.activeId ? 'active' : ''}" data-id="${conversation.id}">
        <strong>${conversation.title}</strong>
        <span>${conversation.subtitle}</span>
      </button>
    `).join('');

    this.historyList.querySelectorAll('.ai-history-item').forEach((button) => {
      button.addEventListener('click', () => this.switchConversation(button.dataset.id));
    });
  },

  renderMessages() {
    const conversation = this.activeConversation;
    if (!conversation) return;

    this.messagesEl.innerHTML = conversation.messages.map((message) => `
      <div class="ai-message ${message.role}">
        <div class="ai-bubble">
          ${message.content}
          ${message.result ? this.renderResultCard(message.result) : ''}
        </div>
      </div>
    `).join('');

    this.messagesEl.querySelectorAll('[data-ai-action="preview"]').forEach((button) => {
      button.addEventListener('click', () => this.showPreview(this.findResult(button.dataset.resultId)));
    });
    this.messagesEl.querySelectorAll('[data-ai-action="download"]').forEach((button) => {
      button.addEventListener('click', () => this.downloadExcel(this.findResult(button.dataset.resultId)));
    });
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  },

  renderResultCard(result) {
    const id = this.resultId(result);
    return `
      <div class="ai-result-card">
        <strong>${result.store} POS Excel 已就绪</strong>
        <div class="text-xs text-[#86909c] mt-1">${result.year}-${String(result.month).padStart(2, '0')}，89 条明细</div>
        <div class="ai-result-actions">
          <button type="button" data-ai-action="preview" data-result-id="${id}">
            <i class="fa-regular fa-eye"></i> 在线预览
          </button>
          <button type="button" data-ai-action="download" data-result-id="${id}">
            <i class="fa-solid fa-download"></i> 下载 Excel
          </button>
        </div>
      </div>
    `;
  },

  resultId(result) {
    return `${result.year}-${result.month}-${result.store}`;
  },

  findResult(id) {
    const conversation = this.activeConversation;
    const message = conversation?.messages.find((item) => item.result && this.resultId(item.result) === id);
    return message?.result || this.lastResult;
  },

  showPreview(result) {
    if (!result) return;
    this.previewPanel.classList.remove('hidden');
    this.previewPanel.innerHTML = `
      <div class="ai-preview-head">
        <strong>${result.store} ${result.year}-${String(result.month).padStart(2, '0')} POS 明细预览</strong>
        <button type="button" id="ai-preview-close"><i class="fa-solid fa-xmark"></i></button>
      </div>
      ${this.tableHtml(result.rows)}
    `;
    document.getElementById('ai-preview-close')?.addEventListener('click', () => this.hidePreview());
  },

  hidePreview() {
    if (!this.previewPanel) return;
    this.previewPanel.classList.add('hidden');
    this.previewPanel.innerHTML = '';
  },

  tableHtml(rows) {
    return `
      <table class="ai-table">
        <thead>
          <tr>
            <th>日期</th>
            <th>门店</th>
            <th>条码</th>
            <th>商品名称</th>
            <th>数量</th>
            <th>金额</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => `
            <tr>
              <td>${row.date}</td>
              <td>${row.store}</td>
              <td>${row.barcode}</td>
              <td>${row.product}</td>
              <td>${row.qty}</td>
              <td>¥${row.amount.toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  },

  downloadExcel(result) {
    if (!result) return;
    const html = `
      <html>
        <head><meta charset="UTF-8"></head>
        <body>${this.tableHtml(result.rows)}</body>
      </html>
    `;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${result.store}_${result.year}_${String(result.month).padStart(2, '0')}_POS数据.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    Dialog.toast('Excel 文件已生成并开始下载', 'success');
  }
};

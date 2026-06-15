const Dialog = {
  show(options) {
    const { title, content, onConfirm, onCancel, confirmText = '确认', cancelText = '取消' } = options;
    
    const overlay = document.getElementById('overlay-container');
    overlay.innerHTML = `
      <div class="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center backdrop-blur-sm toast-enter toast-enter-active">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 class="font-bold text-slate-800">${title}</h3>
            <button class="text-slate-400 hover:text-slate-600 dialog-close">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="p-6 text-slate-600 text-sm">
            ${content}
          </div>
          <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
            <button class="px-4 py-2 text-slate-600 text-sm hover:bg-gray-100 rounded transition-colors dialog-cancel">${cancelText}</button>
            <button class="px-4 py-2 bg-brand text-white text-sm rounded hover:bg-blue-700 transition-colors shadow-sm dialog-confirm">${confirmText}</button>
          </div>
        </div>
      </div>
    `;
    
    const closeDialog = () => {
      overlay.innerHTML = '';
    };
    
    overlay.querySelector('.dialog-close').addEventListener('click', () => {
      if (onCancel) onCancel();
      closeDialog();
    });
    
    overlay.querySelector('.dialog-cancel').addEventListener('click', () => {
      if (onCancel) onCancel();
      closeDialog();
    });
    
    overlay.querySelector('.dialog-confirm').addEventListener('click', () => {
      if (onConfirm) onConfirm();
      closeDialog();
    });
  },
  
  toast(message, type = 'success') {
    const overlay = document.getElementById('overlay-container');
    const toastEl = document.createElement('div');
    const bgClass = type === 'success' ? 'bg-green-600' : (type === 'error' ? 'bg-red-600' : 'bg-slate-800');
    
    toastEl.className = `fixed top-6 left-1/2 -translate-x-1/2 ${bgClass} text-white px-6 py-3 rounded shadow-lg z-[10001] flex items-center gap-3 toast-enter`;
    toastEl.innerHTML = `
      <i class="fa-solid ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
      <span class="text-sm font-medium">${message}</span>
    `;
    
    overlay.appendChild(toastEl);
    
    // Trigger animation
    requestAnimationFrame(() => {
      toastEl.classList.add('toast-enter-active');
    });
    
    setTimeout(() => {
      toastEl.classList.remove('toast-enter-active');
      toastEl.style.opacity = '0';
      toastEl.style.transform = 'translateY(-20px) translateX(-50%)';
      setTimeout(() => toastEl.remove(), 300);
    }, 3000);
  }
};
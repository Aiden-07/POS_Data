const Drawer = {
  show(options) {
    const { title, content, width = '60vw', editable = false } = options;
    const overlay = document.getElementById('overlay-container');
    
    overlay.innerHTML = `
      <div class="fixed inset-0 z-40 drawer-overlay">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/30 backdrop-blur-sm drawer-backdrop transition-opacity"></div>
        
        <!-- Drawer Panel -->
        <div class="absolute inset-y-0 right-0 bg-white shadow-2xl flex flex-col drawer-enter" style="width: ${width};">
          <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0 drawer-header-row">
            <h3 class="font-bold text-slate-800 text-lg flex items-center gap-2">
              ${editable ? '<span class="drawer-mode-label text-xs px-2 py-0.5 rounded-full bg-blue-50 text-brand border border-blue-100">预览</span>' : ''}
              <i class="fa-solid fa-file-excel text-green-600"></i>
              ${editable
                ? `<span class="drawer-title-text">${title}</span><input type="text" class="drawer-title-input hidden text-lg font-bold text-slate-800 bg-transparent border-b border-gray-300 focus:outline-none focus:border-brand" value="${title}" style="width: 300px;">`
                : title
              }
            </h3>
            <div class="flex items-center gap-2">
              ${editable ? '<button class="drawer-edit-btn w-8 h-8 flex items-center justify-center rounded-lg text-[#86909c] hover:bg-blue-50 hover:text-brand transition-all" title="编辑"><i class="fa-solid fa-pen-to-square"></i></button>' : ''}
              <button class="text-slate-400 hover:text-slate-600 p-2 drawer-close transition-colors">
                <i class="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>
          </div>
          <div class="flex-1 overflow-auto bg-gray-50 p-6">
            ${content}
          </div>
        </div>
      </div>
    `;
    
    const panel = overlay.querySelector('.drawer-enter');
    
    // Trigger enter animation
    requestAnimationFrame(() => {
      panel.classList.add('drawer-enter-active');
    });
    
    const closeDrawer = () => {
      panel.classList.remove('drawer-enter-active');
      panel.classList.add('drawer-exit', 'drawer-exit-active');
      
      setTimeout(() => {
        overlay.innerHTML = '';
      }, 300);
    };
    
    overlay.querySelector('.drawer-close').addEventListener('click', closeDrawer);
    overlay.querySelector('.drawer-backdrop').addEventListener('click', closeDrawer);
    
    // 返回overlay引用供调用方绑定事件
    return overlay;
  }
};

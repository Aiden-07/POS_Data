const LoginView = {
  outsideClickHandler: null,

  render() {
    return `
      <div class="relative w-full max-w-[440px] bg-white/95 backdrop-blur-xl p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-white flex flex-col items-center animate-[fadeIn_0.6s_ease-out]">
        
        <!-- Language Toggle Dropdown -->
        <div class="absolute top-6 right-6">
          <div class="relative" id="lang-dropdown-container">
            <button type="button" id="login-lang-toggle" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-slate-600 transition-colors text-xs font-semibold border border-gray-200 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20">
              <i class="fa-solid fa-language text-brand"></i>
              <span id="login-lang-text">中文</span>
              <i class="fa-solid fa-chevron-down text-[10px] ml-0.5 transition-transform duration-200" id="lang-chevron"></i>
            </button>
            <div id="lang-dropdown-menu" class="absolute right-0 mt-1.5 w-28 bg-white border border-gray-100 rounded-lg shadow-lg py-1 hidden z-50 transform origin-top-right transition-all">
              <button type="button" class="lang-option w-full text-left px-3 py-2 text-xs font-medium bg-blue-50 text-brand flex items-center justify-between" data-lang="cn">
                中文 <i class="fa-solid fa-check"></i>
              </button>
              <button type="button" class="lang-option w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:bg-gray-50 transition-colors flex items-center justify-between" data-lang="kr">
                한국어 <i class="fa-solid fa-check hidden"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center text-3xl mb-5 shadow-sm border border-brand/20">
          <i class="fa-solid fa-layer-group"></i>
        </div>
        <h2 class="text-2xl font-bold mb-8 flex items-center justify-center gap-1.5">
          <span class="text-brand font-black tracking-tight">POS</span>
          <span class="text-slate-800" data-i18n="login_title_suffix">数据管理平台</span>
        </h2>
        
        <form id="login-form" class="w-full flex flex-col gap-5">
          <div class="relative group">
            <i class="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-brand/70 group-focus-within:text-brand transition-colors"></i>
            <input type="text" data-i18n="username_placeholder" placeholder="请输入账号" class="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all text-sm text-slate-800 font-medium placeholder-slate-400">
          </div>
          
          <div class="relative group">
            <i class="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-brand/70 group-focus-within:text-brand transition-colors"></i>
            <input type="password" id="login-password" data-i18n="password_placeholder" placeholder="请输入密码" class="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all text-sm text-slate-800 font-medium placeholder-slate-400">
            <button type="button" id="toggle-password" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand transition-colors focus:outline-none">
              <i class="fa-solid fa-eye-slash" id="toggle-password-icon"></i>
            </button>
          </div>
          
          <button type="submit" class="w-full bg-brand hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl mt-4 transition-all duration-300 shadow-lg shadow-brand/30 hover:shadow-brand/50 hover:-translate-y-0.5 flex items-center justify-center gap-2" data-i18n="login_btn">
            登录
          </button>
        </form>
      </div>
    `;
  },

  updateLanguageDropdown() {
    const currentLang = Store.getState().lang;
    const langText = document.getElementById('login-lang-text');
    const langOptions = document.querySelectorAll('.lang-option');

    if (langText) {
      langText.textContent = currentLang === 'cn' ? '中文' : '한국어';
    }

    langOptions.forEach((opt) => {
      const isActive = opt.getAttribute('data-lang') === currentLang;
      const checkIcon = opt.querySelector('.fa-check');
      opt.className = isActive
        ? 'lang-option w-full text-left px-3 py-2 text-xs font-medium bg-blue-50 text-brand flex items-center justify-between'
        : 'lang-option w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:bg-gray-50 transition-colors flex items-center justify-between';
      if (checkIcon) {
        checkIcon.classList.toggle('hidden', !isActive);
      }
    });
  },

  mount() {
    const slot = document.getElementById('login-view-slot');
    if (!slot) return;

    slot.innerHTML = this.render();
    I18n.updateDOM();
    this.updateLanguageDropdown();
    this.bindEvents();
  },

  bindEvents() {
    const form = document.getElementById('login-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        Store.setState({ isAuthenticated: true });
        window.location.hash = '#dashboard';
      });
    }
    
    // Password Toggle Logic
    const togglePasswordBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('login-password');
    const togglePasswordIcon = document.getElementById('toggle-password-icon');
    
    if (togglePasswordBtn && passwordInput) {
      togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePasswordIcon.className = type === 'password' ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
      });
    }
    
    // Language Dropdown Logic
    const langToggleBtn = document.getElementById('login-lang-toggle');
    const langDropdownMenu = document.getElementById('lang-dropdown-menu');
    const langChevron = document.getElementById('lang-chevron');
    
    if (langToggleBtn && langDropdownMenu && langChevron) {
      langToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = langDropdownMenu.classList.contains('hidden');
        langDropdownMenu.classList.toggle('hidden', !isHidden);
        langChevron.classList.toggle('rotate-180', isHidden);
      });

      if (this.outsideClickHandler) {
        document.removeEventListener('click', this.outsideClickHandler);
      }

      this.outsideClickHandler = (event) => {
        if (!langDropdownMenu.contains(event.target) && !langToggleBtn.contains(event.target)) {
          langDropdownMenu.classList.add('hidden');
          langChevron.classList.remove('rotate-180');
        }
      };

      document.addEventListener('click', this.outsideClickHandler);

      const langOptions = document.querySelectorAll('.lang-option');
      langOptions.forEach(option => {
        option.addEventListener('click', (e) => {
          e.stopPropagation();
          const selectedLang = option.getAttribute('data-lang');

          if (Store.getState().lang !== selectedLang) {
            Store.setState({ lang: selectedLang });
            I18n.updateDOM();
          }

          const globalLangText = document.getElementById('current-lang-text');
          if (globalLangText) {
            globalLangText.textContent = selectedLang.toUpperCase();
          }

          this.updateLanguageDropdown();
          langDropdownMenu.classList.add('hidden');
          langChevron.classList.remove('rotate-180');
        });
      });
    }
  }
};

// Initialize login view immediately if we are on login page
if (window.location.hash === '' || window.location.hash === '#login') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      if (!Store.getState().isAuthenticated) {
        LoginView.mount();
      }
    }, 100);
  });
}

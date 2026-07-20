const LoginView = {
  outsideClickHandler: null,
  rememberedCredentialKey: 'pos_demo_remembered_login',

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
            <input type="text" id="login-account" data-i18n="username_placeholder" placeholder="请输入账号" class="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all text-sm text-slate-800 font-medium placeholder-slate-400">
          </div>
          
          <div class="relative group">
            <i class="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-brand/70 group-focus-within:text-brand transition-colors"></i>
            <input type="password" id="login-password" data-i18n="password_placeholder" placeholder="请输入密码" class="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 focus:bg-white transition-all text-sm text-slate-800 font-medium placeholder-slate-400">
            <button type="button" id="toggle-password" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand transition-colors focus:outline-none" aria-label="显示密码" aria-pressed="false" title="显示密码">
              <i class="fa-solid fa-eye-slash" id="toggle-password-icon"></i>
            </button>
          </div>

          <p id="login-error-message" class="hidden -mt-2 text-sm text-red-600 font-medium leading-5">
            账号或密码不正确，忘记密码请联系管理员重置密码
          </p>

          <label class="flex items-center gap-2 -mt-1 text-sm text-slate-600 cursor-pointer select-none">
            <input id="remember-password" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand/30">
            <span>记住密码</span>
          </label>
          
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
    this.restoreRememberedCredential();
  },

  restoreRememberedCredential() {
    try {
      const remembered = JSON.parse(localStorage.getItem(this.rememberedCredentialKey) || 'null');
      if (!remembered?.remember) return;
      const accountInput = document.getElementById('login-account');
      const passwordInput = document.getElementById('login-password');
      const rememberInput = document.getElementById('remember-password');
      if (accountInput) accountInput.value = remembered.account || '';
      if (passwordInput) passwordInput.value = remembered.password || '';
      if (rememberInput) rememberInput.checked = true;
    } catch (error) {
      localStorage.removeItem(this.rememberedCredentialKey);
    }
  },

  persistRememberedCredential(account, password) {
    const rememberInput = document.getElementById('remember-password');
    if (rememberInput?.checked) {
      localStorage.setItem(this.rememberedCredentialKey, JSON.stringify({
        remember: true,
        account,
        password
      }));
      return;
    }
    localStorage.removeItem(this.rememberedCredentialKey);
  },

  bindEvents() {
    const form = document.getElementById('login-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const accountInput = document.getElementById('login-account');
        const passwordInput = document.getElementById('login-password');
        const errorMessage = document.getElementById('login-error-message');
        const account = accountInput?.value.trim() || '';
        const password = passwordInput?.value.trim() || '';

        const legacyLogin = account === 'A123456' && password === '123456';
        const profile = Store.accounts[account];
        if (legacyLogin || (profile && profile.password === password)) {
          errorMessage?.classList.add('hidden');
          this.persistRememberedCredential(account, password);
          if (legacyLogin) Store.switchAccount('aiden.pos');
          else Store.switchAccount(account);
          window.location.hash = '#dashboard';
          return;
        }

        errorMessage?.classList.remove('hidden');
        accountInput?.classList.add('border-red-300', 'focus:border-red-500', 'focus:ring-red-100');
        passwordInput?.classList.add('border-red-300', 'focus:border-red-500', 'focus:ring-red-100');
      });
    }

    const accountInput = document.getElementById('login-account');
    const loginPasswordInput = document.getElementById('login-password');
    const clearLoginError = () => {
      document.getElementById('login-error-message')?.classList.add('hidden');
      accountInput?.classList.remove('border-red-300', 'focus:border-red-500', 'focus:ring-red-100');
      loginPasswordInput?.classList.remove('border-red-300', 'focus:border-red-500', 'focus:ring-red-100');
    };
    accountInput?.addEventListener('input', clearLoginError);
    loginPasswordInput?.addEventListener('input', clearLoginError);
    
    // Password Toggle Logic
    const togglePasswordBtn = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('login-password');
    const togglePasswordIcon = document.getElementById('toggle-password-icon');
    
    if (togglePasswordBtn && passwordInput) {
      togglePasswordBtn.addEventListener('click', () => {
        const willShowPassword = passwordInput.getAttribute('type') === 'password';
        passwordInput.setAttribute('type', willShowPassword ? 'text' : 'password');
        togglePasswordIcon.className = willShowPassword ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash';
        togglePasswordBtn.setAttribute('aria-pressed', String(willShowPassword));
        togglePasswordBtn.setAttribute('aria-label', willShowPassword ? '隐藏密码' : '显示密码');
        togglePasswordBtn.setAttribute('title', willShowPassword ? '隐藏密码' : '显示密码');
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

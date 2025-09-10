export function initLogout() {
    const btn = document.getElementById('logoutBtn');
    if (!btn) return;
  
    btn.addEventListener('click', e => {
      e.preventDefault();
      localStorage.removeItem('user_token');
      window.location.href = 'login.html';
    });
  }
  
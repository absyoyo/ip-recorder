const btn = document.getElementById('btn');
const pwd = document.getElementById('pwd');
const err = document.getElementById('err');

async function doLogin() {
  err.textContent = '';
  btn.disabled = true;
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd.value })
    });
    const data = await res.json();
    if (data.ok) {
      location.href = '/admin/dashboard';
    } else {
      err.textContent = data.message || '密码错误';
    }
  } catch {
    err.textContent = '网络错误，请重试';
  } finally {
    btn.disabled = false;
  }
}

btn.addEventListener('click', doLogin);
pwd.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

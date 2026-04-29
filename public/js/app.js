import { fetchLogs, fetchStats } from './utils/api.js';

const state = {
  page: 1,
  limit: 10,
  days: 36500,
  daysLabel: 'all',
  start: null,
  end: null,
};

const filterMap = {
  'today': 1,
  'yesterday': 2,
  '7days': 7,
  '30days': 30,
  'all': 36500
};

async function init() {
  bindEvents();
  await refresh();
  document.getElementById('summary-online').textContent = '运行中';
  document.getElementById('summary-online').classList.add('tag');
}

function bindEvents() {
  document.getElementById('time-filter').addEventListener('change', async (e) => {
    const val = e.target.value;
    state.daysLabel = val;
    state.page = 1;
    state.start = null;
    state.end = null;

    const dateRange = document.getElementById('date-range');
    if (val === 'custom') {
      dateRange.style.display = 'flex';
      return;
    }
    dateRange.style.display = 'none';
    state.days = filterMap[val] || 36500;
    await refreshLogs();
  });

  document.getElementById('apply-date').addEventListener('click', async () => {
    const start = document.getElementById('date-start').value;
    const end = document.getElementById('date-end').value;
    if (!start || !end) return;
    state.start = start.replace('T', ' ') + ':00';
    state.end = end.replace('T', ' ') + ':59';
    state.page = 1;
    await refreshLogs();
  });

  document.getElementById('pagination').addEventListener('click', async (e) => {
    const btn = e.target.closest('.page-btn');
    if (!btn || btn.disabled || btn.classList.contains('active')) return;
    const newPage = parseInt(btn.dataset.page);
    if (newPage) {
      state.page = newPage;
      await refreshLogs();
    }
  });
}

async function refresh() {
  try {
    await Promise.all([refreshStats(), refreshLogs()]);
    document.getElementById('summary-last-update').textContent = new Date().toLocaleTimeString();
  } catch (err) {
    console.error('Refresh error:', err);
  }
}

async function refreshStats() {
  const { todayCount, totalCount, geoDist } = await fetchStats();
  document.getElementById('today-count').textContent = todayCount.toLocaleString();
  document.getElementById('total-count').textContent = totalCount.toLocaleString();

  const geoList = document.getElementById('geo-list');
  if (geoDist.length === 0) {
    geoList.innerHTML = '<div style="color: var(--text-secondary); padding: 1rem 0;">暂无地区数据</div>';
  } else {
    geoList.innerHTML = geoDist.map(item => `
      <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--card-border);">
        <span>${escapeHtml(item.province || '未知')}</span>
        <span class="tag">${escapeHtml(String(item.count))} 次</span>
      </div>
    `).join('');
  }
}

async function refreshLogs() {
  const params = { page: state.page, limit: state.limit };
  if (state.start && state.end) {
    params.start = state.start;
    params.end = state.end;
  } else {
    params.days = state.days;
  }
  const { logs, total, page, limit } = await fetchLogs(params);
  renderLogTable(logs);
  renderPagination(total, page, limit);
}

function renderLogTable(logs) {
  const tbody = document.getElementById('log-body');
  if (logs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">暂无访问记录</td></tr>';
    return;
  }

  tbody.innerHTML = logs.map(log => {
    const isVpn = log.is_vpn === 1;
    const rowStyle = isVpn ? 'style="background: rgba(255, 0, 0, 0.1)"' : '';
    const geo = [log.country, log.province, log.city].filter(v => v && v !== '未知').join(' ');
    const webrtcGeo = [log.webrtc_country, log.webrtc_province, log.webrtc_city].filter(v => v && v !== '未知').join(' ');

    return `
      <tr class="log-row" ${rowStyle} data-ua="${escapeHtml(log.user_agent)}">
        <td data-label="时间">${escapeHtml(new Date(log.created_at).toLocaleString())}</td>
        <td data-label="访问 IP / 地区">
          <code style="color: var(--accent-color)">${escapeHtml(log.ip)}</code>
          <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.2rem">${escapeHtml(geo || '未知')}${log.isp && log.isp !== '未知' ? ' · ' + escapeHtml(log.isp) : ''}</div>
        </td>
        <td data-label="WebRTC IP">
          ${log.webrtc_ip ? `
            <code>${escapeHtml(log.webrtc_ip)}</code>
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.2rem">${escapeHtml(webrtcGeo || '未知')}${log.webrtc_isp && log.webrtc_isp !== '未知' ? ' · ' + escapeHtml(log.webrtc_isp) : ''}</div>
          ` : '-'}
        </td>
        <td data-label="状态">
          ${isVpn ? '<span class="tag" style="background: #f87171; color: white">疑似 VPN</span>' : '<span class="tag" style="background: #10b981; color: white">正常</span>'}
        </td>
        <td data-label="用户代理">
          <div class="tag" style="margin-bottom: 0.25rem">${escapeHtml(log.platform)}</div>
          <div style="font-size: 0.75rem">${escapeHtml(log.browser)} ${escapeHtml(log.browser_ver)}</div>
          ${log.device_model !== 'Unknown' ? `<div style="font-size: 0.75rem; color: var(--text-secondary)">${escapeHtml(log.device_vendor)} ${escapeHtml(log.device_model)}</div>` : ''}
        </td>
      </tr>
      <tr class="ua-detail" style="display: none">
        <td colspan="5" style="background: rgba(0,0,0,0.2); padding: 1rem; font-family: monospace; font-size: 0.75rem; word-break: break-all;">
          <strong>User Agent:</strong> ${escapeHtml(log.user_agent)}
        </td>
      </tr>    `;
  }).join('');

  tbody.querySelectorAll('.log-row').forEach(row => {
    row.style.cursor = 'pointer';
    row.addEventListener('click', () => {
      const nextRow = row.nextElementSibling;
      if (nextRow && nextRow.classList.contains('ua-detail')) {
        const isVisible = nextRow.style.display !== 'none';
        nextRow.style.display = isVisible ? 'none' : 'table-row';
      }
    });
  });
}

function renderPagination(total, currentPage, limit) {
  const totalPages = Math.ceil(total / limit);
  const container = document.getElementById('pagination');

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '';
  html += `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">&lt;</button>`;

  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, start + 4);
  if (end - start < 4) start = Math.max(1, end - 4);

  for (let i = start; i <= end; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }

  html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">&gt;</button>`;
  container.innerHTML = html;
}

function escapeHtml(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

init();

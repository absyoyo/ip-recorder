import { fetchLogs, fetchStats } from './utils/api.js';

const state = {
  page: 1,
  limit: 10,
  days: 7,
  daysLabel: '7days'
};

const filterMap = {
  'today': 1,
  'yesterday': 2,
  '7days': 7,
  '30days': 30,
  'all': 36500
};

/**
 * Initialize the application
 */
async function init() {
  bindEvents();
  await refresh();
  
  // Set summary online status
  document.getElementById('summary-online').textContent = '运行中';
  document.getElementById('summary-online').classList.add('tag');
}

/**
 * Bind event listeners
 */
function bindEvents() {
  // Time filter change
  document.getElementById('time-filter').addEventListener('change', async (e) => {
    state.daysLabel = e.target.value;
    state.days = filterMap[state.daysLabel] || 7;
    state.page = 1;
    await refresh();
  });

  // Pagination click events (using delegation)
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

/**
 * Refresh all data
 */
async function refresh() {
  showLoading(true);
  try {
    await Promise.all([refreshStats(), refreshLogs()]);
    document.getElementById('summary-last-update').textContent = new Date().toLocaleTimeString();
  } catch (err) {
    console.error('Refresh error:', err);
  } finally {
    showLoading(false);
  }
}

/**
 * Refresh stats and geo distribution
 */
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
        <span>${item.province || '未知'}</span>
        <span class="tag">${item.count} 次</span>
      </div>
    `).join('');
  }
}

/**
 * Refresh logs and pagination
 */
async function refreshLogs() {
  const { logs, total, page, limit } = await fetchLogs({
    page: state.page,
    limit: state.limit,
    days: state.days
  });

  renderLogTable(logs);
  renderPagination(total, page, limit);
}

/**
 * Render log table
 */
function renderLogTable(logs) {
  const tbody = document.getElementById('log-body');
  if (logs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem;">暂无访问记录</td></tr>';
    return;
  }

  tbody.innerHTML = logs.map(log => `
    <tr class="log-row" data-ua="${escapeHtml(log.user_agent)}">
      <td>${new Date(log.created_at).toLocaleString()}</td>
      <td><code style="color: var(--accent-color)">${log.ip}</code></td>
      <td>
        <div>${log.country} ${log.province}</div>
        <div style="font-size: 0.75rem; color: var(--text-secondary)">${log.city} ${log.isp}</div>
      </td>
      <td>
        <div class="tag" style="margin-bottom: 0.25rem">${log.platform}</div>
        <div style="font-size: 0.75rem">${log.browser} ${log.browser_ver}</div>
        ${log.device_model !== 'Unknown' ? `<div style="font-size: 0.75rem; color: var(--text-secondary)">${log.device_vendor} ${log.device_model}</div>` : ''}
      </td>
    </tr>
    <tr class="ua-detail" style="display: none">
      <td colspan="4" style="background: rgba(0,0,0,0.2); padding: 1rem; font-family: monospace; font-size: 0.75rem; word-break: break-all;">
        <strong>User Agent:</strong> ${log.user_agent}
      </td>
    </tr>
  `).join('');

  // Add click listener for row expansion
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

/**
 * Render pagination buttons
 */
function renderPagination(total, currentPage, limit) {
  const totalPages = Math.ceil(total / limit);
  const container = document.getElementById('pagination');
  
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '';
  
  // Previous button
  html += `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">&lt;</button>`;

  // Page numbers (showing max 5)
  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, start + 4);
  if (end - start < 4) {
    start = Math.max(1, end - 4);
  }

  for (let i = start; i <= end; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }

  // Next button
  html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">&gt;</button>`;

  container.innerHTML = html;
}

/**
 * Simple HTML escaper
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Show/hide loading state (optional UI improvement)
 */
function showLoading(loading) {
  // Can be expanded to show a global spinner
}

// Start the app
init();

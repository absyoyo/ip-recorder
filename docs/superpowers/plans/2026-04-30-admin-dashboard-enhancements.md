# Admin Dashboard Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the admin dashboard logs table with WebRTC IP and VPN status information.

**Architecture:** Modify the frontend HTML structure and JavaScript rendering logic to accommodate new data fields (`webrtc_ip`, `is_vpn`) returned by the backend.

**Tech Stack:** HTML, JavaScript (ESM).

---

### Task 1: Update Admin Dashboard HTML Table Header

**Files:**
- Modify: `public/admin/dashboard.html`

- [ ] **Step 1: Add "WebRTC IP" and "状态" columns to the table header**

```html
<<<<
                            <th>IP 地址</th>
                            <th>地区</th>
                            <th>用户代理</th>
====
                            <th>IP 地址</th>
                            <th>WebRTC IP</th>
                            <th>地区</th>
                            <th>状态</th>
                            <th>用户代理</th>
>>>>
```

- [ ] **Step 2: Verify changes in the HTML file**

### Task 2: Update JavaScript Rendering Logic

**Files:**
- Modify: `public/js/app.js`

- [ ] **Step 1: Update `renderLogTable` to handle new columns and VPN highlighting**

Update empty state `colspan`:
```javascript
<<<<
  if (logs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem;">暂无访问记录</td></tr>';
    return;
  }
====
  if (logs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">暂无访问记录</td></tr>';
    return;
  }
>>>>
```

Update row template:
```javascript
<<<<
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
====
  tbody.innerHTML = logs.map(log => {
    const isVpn = log.is_vpn === 1;
    const rowStyle = isVpn ? 'style="background: rgba(255, 0, 0, 0.1)"' : '';
    
    return `
      <tr class="log-row" ${rowStyle} data-ua="${escapeHtml(log.user_agent)}">
        <td>${new Date(log.created_at).toLocaleString()}</td>
        <td><code style="color: var(--accent-color)">${log.ip}</code></td>
        <td>${log.webrtc_ip ? `<code>${log.webrtc_ip}</code>` : '-'}</td>
        <td>
          <div>${log.country} ${log.province}</div>
          <div style="font-size: 0.75rem; color: var(--text-secondary)">${log.city} ${log.isp}</div>
        </td>
        <td>
          ${isVpn ? '<span class="tag" style="background: #f87171; color: white">疑似 VPN</span>' : '<span class="tag" style="background: #10b981; color: white">正常</span>'}
        </td>
        <td>
          <div class="tag" style="margin-bottom: 0.25rem">${log.platform}</div>
          <div style="font-size: 0.75rem">${log.browser} ${log.browser_ver}</div>
          ${log.device_model !== 'Unknown' ? `<div style="font-size: 0.75rem; color: var(--text-secondary)">${log.device_vendor} ${log.device_model}</div>` : ''}
        </td>
      </tr>
      <tr class="ua-detail" style="display: none">
        <td colspan="6" style="background: rgba(0,0,0,0.2); padding: 1rem; font-family: monospace; font-size: 0.75rem; word-break: break-all;">
          <strong>User Agent:</strong> ${log.user_agent}
        </td>
      </tr>
    `;
  }).join('');
>>>>
```

- [ ] **Step 2: Commit changes**

```bash
git add public/admin/dashboard.html public/js/app.js
git commit -m "feat: enhance admin dashboard with WebRTC IP and VPN status"
```

### Task 3: Verification

- [ ] **Step 1: Manually check the dashboard (if possible) or verify the code structure**
- [ ] **Step 2: Ensure column count matches between header and body**
- [ ] **Step 3: Ensure conditional formatting logic is correct**

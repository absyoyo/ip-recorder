# 2026-04-29 IP Recorder Design Spec

## Goal
Transform the IP recorder into a high-fidelity 'Delta Force' (三角洲行动) themed site. Implement WebRTC-based IP detection and VPN usage analysis, with a detailed dashboard display.

## Architecture
- **Frontend:** Interactive single-page UI using 'Delta Force' assets. Client-side WebRTC detection.
- **Backend:** Node.js Express server. Extended visit logging to include WebRTC IP and VPN status.
- **Database:** SQLite (better-sqlite3) with updated schema for WebRTC IP and VPN flags.
- **Admin Dashboard:** Enhanced UI to display dual IPs and contrast warnings for VPN usage.

## Functional Requirements
1. **Interactive Single-Page UI:**
   - Visual style: Dark military/tactical theme based on `df.qq.com`.
   - Local assets: All images downloaded and served from `public/assets/images/`.
   - Copyright: "泡泡国际" at the bottom.
2. **WebRTC IP Detection:**
   - Detect real local/public IP using `RTCPeerConnection`.
   - Send WebRTC IP to `/v` endpoint along with regular tracking.
3. **VPN Usage Analysis:**
   - Compare `req.ip` (regular) with WebRTC detected IP.
   - If they differ (and WebRTC IP is a valid public IP), flag as "疑似 VPN".
4. **Admin Dashboard Enhancements:**
   - Display both "Regular IP" and "WebRTC IP".
   - Highlight records with red color if VPN is detected.
   - Show geo-location for both IPs if possible.

## Data Flow
1. User visits `/`.
2. Frontend script executes WebRTC detection.
3. Frontend sends `POST /v` (or updated `GET /v`) with `webrtc_ip`.
4. Backend compares `req.ip` and `webrtc_ip`.
5. Backend stores `ip`, `webrtc_ip`, and `is_vpn` in `visit_logs`.
6. Admin views `/admin/dashboard`.
7. Dashboard fetches logs and applies visual highlights for `is_vpn == 1`.

## Security & Privacy
- Standard session-based auth for admin dashboard.
- No sensitive data exposure in public frontend.

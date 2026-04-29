/**
 * API Utility for fetching logs and stats
 */

export const fetchLogs = async ({ page = 1, limit = 10, days = 7, start, end } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (start && end) {
    params.set('start', start);
    params.set('end', end);
  } else {
    params.set('days', days);
  }
  const response = await fetch(`/api/logs?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch logs');
  }
  return response.json();
};

export const fetchStats = async () => {
  const response = await fetch('/api/stats');
  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }
  return response.json();
};

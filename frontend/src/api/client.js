import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000';

export { API_BASE_URL };

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

async function withRetry(requestFn, retries = 2) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;

      if (attempt === retries) {
        break;
      }

      await new Promise((resolve) => {
        setTimeout(resolve, 500 * (attempt + 1));
      });
    }
  }

  throw lastError;
}

export { withRetry };

export function getUserId() {
  return localStorage.getItem('userId');
}

export async function fetchDashboard(userId) {
  const { data } = await withRetry(() =>
    api.get(`/dashboard/${userId}`),
  );
  return data;
}

export async function syncCodeforces(userId) {
  const { data } = await api.post(`/codeforces/sync/${userId}`);
  return data;
}

export async function fetchSheets() {
  const { data } = await api.get('/sheets');
  return data;
}

export async function fetchSheetProblems(sheetName, userId) {
  const params = userId ? { userId } : {};
  const { data } = await api.get(`/sheets/${sheetName}/problems`, { params });
  return data;
}

export async function fetchSheetProgress(userId) {
  const { data } = await withRetry(() =>
    api.get(`/sheets/progress/${userId}`),
  );
  return data;
}

export async function fetchAnalyticsWeaknesses(userId) {
  const { data } = await withRetry(() =>
    api.get(`/analytics/user/${userId}/weaknesses`),
  );
  return data;
}

export async function fetchTopicStats(userId) {
  const { data } = await withRetry(() =>
    api.get(`/analytics/user/${userId}/topic-stats`),
  );
  return data;
}

export async function fetchProgressTrend(userId, days = 30) {
  const { data } = await withRetry(() =>
    api.get(`/analytics/user/${userId}/progress-trend`, {
      params: { days },
    }),
  );
  return data;
}

export async function fetchRevisionRecommendations(userId, limit = 10) {
  const { data } = await withRetry(() =>
    api.get(`/revision/user/${userId}/recommendations`, {
      params: { limit },
    }),
  );
  return data;
}

export async function fetchWeakTopics(userId) {
  const { data } = await withRetry(() =>
    api.get(`/revision/user/${userId}/weak-topics`),
  );
  return data;
}

export async function fetchUserSubmissions(userId) {
  const { data } = await api.get(`/submissions/${userId}`);
  return data;
}

export async function fetchUserProfile(userId) {
  const { data } = await api.get(`/users/${userId}`);
  return data;
}

export async function updateUserHandles(userId, handles) {
  const { data } = await api.patch(
    `/users/${userId}/handles`,
    handles,
  );
  return data;
}

export async function updateSheetHandles(userId, sheetHandles) {
  const { data } = await api.patch(
    `/users/${userId}/sheet-handles`,
    sheetHandles,
  );
  return data;
}

export async function syncA2ZSheet(userId) {
  const { data } = await api.post(`/sheets/sync/a2z/${userId}`);
  return data;
}

export async function syncTLESheet(userId) {
  const { data } = await api.post(`/sheets/sync/daily/${userId}`);
  return data;
}

export async function syncTLE31Sheet(userId) {
  const { data } = await api.post(`/sheets/sync/tle31/${userId}`);
  return data;
}

export async function fetchUserSheetProgressSummary(userId) {
  const { data } = await api.get(`/sheets/user/${userId}`);
  return data;
}

export async function toggleManualCheck(userId, sheetProblemId, isSolved) {
  const { data } = await api.post(`/sheets/manual-check`, {
    userId,
    sheetProblemId,
    isSolved,
  });
  return data;
}

export async function fetchUserAnalytics(userId) {
  const { data } = await withRetry(() =>
    api.get(`/analytics/user/${userId}`),
  );
  return data;
}

export async function fetchDetailedWeaknesses(userId) {
  const { data } = await withRetry(() =>
    api.get(`/analytics/user/${userId}/weaknesses`),
  );
  return data;
}

export async function fetchRevisionQueue(userId, limit = 10) {
  const { data } = await withRetry(() =>
    api.get(`/revision/user/${userId}`, { params: { limit } }),
  );
  return data;
}

export async function fetchContestAnalysis(userId) {
  const { data } = await withRetry(() =>
    api.get(`/analytics/user/${userId}/contest-analysis`),
  );
  return data;
}

export async function fetchUpsolvingQueue(userId) {
  const { data } = await withRetry(() =>
    api.get(`/analytics/user/${userId}/upsolving`),
  );
  return data;
}

export async function fetchUpcomingContests() {
  const { data } = await api.get('/contests/upcoming');
  return data;
}

export default api;

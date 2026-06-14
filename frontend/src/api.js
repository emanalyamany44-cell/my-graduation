const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const FILE_BASE = API_URL.replace(/\/api$/, '');

const TOKEN_KEY = 'gh_token';
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));
export const fileUrl = (path) => (path?.startsWith('http') ? path : `${FILE_BASE}${path}`);

async function request(path, { method = 'GET', body, isForm = false, headers = {} } = {}) {
  const opts = { method, headers: { ...headers } };
  const token = getToken();
  if (token) opts.headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) {
    if (isForm) {
      opts.body = body;
    } else {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
  }
  const res = await fetch(`${API_URL}${path}`, opts);
  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) throw new Error((data && data.message) || `HTTP ${res.status}`);
  return data;
}

export const api = {
  // auth
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  me: () => request('/auth/me'),
  updateMe: (payload) => request('/auth/me', { method: 'PATCH', body: payload }),
  changePassword: (payload) => request('/auth/change-password', { method: 'POST', body: payload }),

  // projects
  listProjects: (q = '') => request(`/projects${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  myProject: () => request('/projects/mine'),
  getProject: (id) => request(`/projects/${id}`),
  createProject: (payload) => request('/projects', { method: 'POST', body: payload }),
  updateProject: (id, payload) => request(`/projects/${id}`, { method: 'PATCH', body: payload }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),

  // teams / join requests
  joinProject: (projectId, message = '') =>
    request(`/teams/${projectId}/join`, { method: 'POST', body: { message } }),
  cancelJoin: (projectId) => request(`/teams/${projectId}/join`, { method: 'DELETE' }),
  listJoinRequests: (projectId) => request(`/teams/${projectId}/requests`),
  respondJoinRequest: (requestId, decision) =>
    request(`/teams/requests/${requestId}/respond`, { method: 'POST', body: { decision } }),
  removeMember: (projectId, userId) =>
    request(`/teams/${projectId}/members/${userId}`, { method: 'DELETE' }),
  leaveTeam: (projectId) => request(`/teams/${projectId}/leave`, { method: 'POST' }),

  // supervisors
  listSupervisors: (q = '') => request(`/supervisors${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  requestSupervisor: (projectId, supervisorId, message = '') =>
    request(`/supervisors/requests`, { method: 'POST', body: { projectId, supervisorId, message } }),
  mySupervisionRequests: () => request('/supervisors/me/requests'),
  respondSupervision: (requestId, decision) =>
    request(`/supervisors/requests/${requestId}/respond`, { method: 'POST', body: { decision } }),
  mySupervisedProjects: () => request('/supervisors/me/projects'),

  // messages
  projectMessages: (projectId) => request(`/messages/project/${projectId}`),
  sendProjectMessage: (projectId, body) =>
    request(`/messages/project/${projectId}`, { method: 'POST', body: { body } }),

  // files
  listFiles: (projectId) => request(`/files/project/${projectId}`),
  uploadFile: (projectId, file, folder = 'General') => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);
    return request(`/files/project/${projectId}`, { method: 'POST', body: fd, isForm: true });
  },
  deleteFile: (id) => request(`/files/${id}`, { method: 'DELETE' }),

  // notifications
  listNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'POST' }),
};

// API client for Mathathlon

const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    credentials: 'include',
    ...options
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

// Auth
export const auth = {
  signup: (data) => request('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me')
};

// Classrooms
export const classrooms = {
  list: () => request('/classrooms'),
  create: (data) => request('/classrooms', { method: 'POST', body: JSON.stringify(data) }),
  get: (id) => request(`/classrooms/${id}`),
  getByCode: (code) => request(`/classrooms/join/${code}`),
  delete: (id) => request(`/classrooms/${id}`, { method: 'DELETE' })
};

// Students
export const students = {
  join: (data) => request('/students/join', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/students/me'),
  leave: () => request('/students/leave', { method: 'POST' })
};

// Heats
export const heats = {
  list: (classroomId) => request(`/heats/classroom/${classroomId}`),
  start: (data) => request('/heats/start', { method: 'POST', body: JSON.stringify(data) }),
  active: () => request('/heats/active'),
  answer: (data) => request('/heats/answer', { method: 'POST', body: JSON.stringify(data) }),
  end: (id) => request(`/heats/${id}/end`, { method: 'POST' }),
  results: (id) => request(`/heats/${id}/results`)
};

// Analytics (Pro feature)
export const analytics = {
  student: (studentId) => request(`/analytics/student/${studentId}`),
  classroom: (classroomId) => request(`/analytics/classroom/${classroomId}`),
  export: (classroomId) => request(`/analytics/classroom/${classroomId}/export`)
};

// Subscriptions
export const subscriptions = {
  status: () => request('/subscriptions/status'),
  checkout: (plan) => request('/subscriptions/checkout', { method: 'POST', body: JSON.stringify({ plan }) }),
  portal: () => request('/subscriptions/portal', { method: 'POST' })
};

// Challenges (Class vs Class)
export const challenges = {
  search: (query) => request(`/challenges/search?query=${encodeURIComponent(query)}`),
  pending: () => request('/challenges/pending'),
  my: () => request('/challenges/my'),
  create: (data) => request('/challenges/create', { method: 'POST', body: JSON.stringify(data) }),
  accept: (id) => request(`/challenges/${id}/accept`, { method: 'POST' }),
  decline: (id) => request(`/challenges/${id}/decline`, { method: 'POST' }),
  start: (id, classroomId) => request(`/challenges/${id}/start`, { method: 'POST', body: JSON.stringify({ classroomId }) }),
  results: (id) => request(`/challenges/${id}/results`)
};

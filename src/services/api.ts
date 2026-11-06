const API_BASE = '/api';

export function getToken(): string | null {
  return localStorage.getItem('churchflow_token');
}

export function setToken(token: string): void {
  localStorage.setItem('churchflow_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('churchflow_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMsg = 'Erro na requisição.';
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorData.message || errorMsg;
    } catch {
      errorMsg = response.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: any; tenant: any; congregations: any[] }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  registerChurch: (data: any) =>
    request<{ token: string; user: any; tenant: any; congregationId: string }>('/auth/register-church', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getMe: () =>
    request<{ user: any; tenant: any; tenantSettings: any; congregations: any[] }>('/auth/me'),

  quickSwitchRole: (roleCode: string, tenantId?: string) =>
    request<{ token: string; user: any; tenant: any; congregations: any[] }>('/auth/quick-switch-role', {
      method: 'POST',
      body: JSON.stringify({ roleCode, tenantId })
    }),

  // Dashboard
  getDashboardSummary: (congregationId?: string) =>
    request<any>(`/dashboard/summary${congregationId ? `?congregationId=${congregationId}` : ''}`),

  // Members & Visitors
  getMembers: (params?: { search?: string; status?: string; congregationId?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.congregationId) query.set('congregationId', params.congregationId);
    return request<any[]>(`/members?${query.toString()}`);
  },

  createMember: (data: any) =>
    request<any>('/members', { method: 'POST', body: JSON.stringify(data) }),

  updateMember: (id: string, data: any) =>
    request<any>(`/members/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  getVisitors: (params?: { search?: string; funnelStage?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.funnelStage) query.set('funnelStage', params.funnelStage);
    return request<any[]>(`/visitors?${query.toString()}`);
  },

  createVisitor: (data: any) =>
    request<any>('/visitors', { method: 'POST', body: JSON.stringify(data) }),

  convertVisitor: (id: string) =>
    request<any>(`/visitors/${id}/convert`, { method: 'POST' }),

  // Cells & Meetings
  getCells: () => request<any[]>('/cells'),

  createCell: (data: any) =>
    request<any>('/cells', { method: 'POST', body: JSON.stringify(data) }),

  getCellMeetings: (cellId: string) =>
    request<any[]>(`/cells/${cellId}/meetings`),

  createCellMeeting: (cellId: string, data: any) =>
    request<any>(`/cells/${cellId}/meetings`, { method: 'POST', body: JSON.stringify(data) }),

  getLeadershipTree: () =>
    request<any>('/leadership/tree'),

  // Discipleship
  getDiscipleshipPipeline: () =>
    request<any>('/discipleship/pipeline'),

  createFollowup: (data: any) =>
    request<any>('/discipleship/followup', { method: 'POST', body: JSON.stringify(data) }),

  updateFollowup: (id: string, data: any) =>
    request<any>(`/discipleship/followup/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Events
  getEvents: () => request<any[]>('/events'),

  createEvent: (data: any) =>
    request<any>('/events', { method: 'POST', body: JSON.stringify(data) }),

  getEventDetails: (id: string) =>
    request<any>(`/events/${id}/details`),

  createEventExpense: (eventId: string, data: any) =>
    request<any>(`/events/${eventId}/expenses`, { method: 'POST', body: JSON.stringify(data) }),

  checkin: (codeOrToken: string) =>
    request<any>('/events/checkin', { method: 'POST', body: JSON.stringify({ codeOrToken }) }),

  // Public Event
  getPublicEvent: (slug: string) =>
    request<any>(`/public/events/${slug}`),

  registerPublicEvent: (slug: string, data: any) =>
    request<any>(`/public/events/${slug}/register`, { method: 'POST', body: JSON.stringify(data) }),

  // Financial
  getFinancialSummary: () =>
    request<any>('/financial/summary'),

  getFinancialTransactions: (params?: { type?: string; status?: string; search?: string; eventId?: string }) => {
    const query = new URLSearchParams();
    if (params?.type) query.set('type', params.type);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.eventId) query.set('eventId', params.eventId);
    return request<any[]>(`/financial/transactions?${query.toString()}`);
  },

  createFinancialTransaction: (data: any) =>
    request<any>('/financial/transactions', { method: 'POST', body: JSON.stringify(data) }),

  getFinancialAccounts: () => request<any[]>('/financial/accounts'),
  getFinancialCategories: () => request<any[]>('/financial/categories'),
  getFinancialCostCenters: () => request<any[]>('/financial/cost-centers'),

  getReconciliation: () => request<any>('/financial/reconciliation'),
  reconcileTransaction: (id: string) => request<any>(`/financial/reconcile-tx/${id}`, { method: 'POST' }),

  // Gateways & Webhooks
  getGateways: () => request<any[]>('/gateways'),
  toggleGateway: (id: string) => request<any>(`/gateways/${id}/toggle-status`, { method: 'POST' }),
  testGatewayConnection: (id: string) => request<any>(`/gateways/${id}/test-connection`, { method: 'POST' }),

  getWebhooks: () => request<any[]>('/webhooks'),
  simulateWebhook: (data: any) => request<any>('/webhooks/simulate', { method: 'POST', body: JSON.stringify(data) }),

  // SaaS Commercial
  getSaasMetrics: () => request<any>('/saas/metrics'),
  getSaasTenants: () => request<any[]>('/saas/tenants'),
  updateTenantStatus: (id: string, status: string) =>
    request<any>(`/saas/tenants/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }),
  getPlans: () => request<any[]>('/saas/plans'),

  // Audit
  getAuditLogs: () => request<any[]>('/audit-logs'),

  // MySQL Database
  getDatabaseStatus: () => request<any>('/database/status'),
  syncDatabase: () => request<any>('/database/sync', { method: 'POST' })
};

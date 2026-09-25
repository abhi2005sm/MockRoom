const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('mockroom_jwt_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('mockroom_jwt_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mockroom_jwt_token');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (err: any) {
      console.warn(`API call ${endpoint} failed:`, err.message);
      throw err;
    }
  }

  // Auth Endpoints
  async signup(email: string, password: string, name: string) {
    const res = await this.request<{ user: any; accessToken: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    if (res.accessToken) this.setToken(res.accessToken);
    return res;
  }

  async login(email: string, password: string) {
    const res = await this.request<{ user: any; accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.accessToken) this.setToken(res.accessToken);
    return res;
  }

  async getMe() {
    return this.request<any>('/me');
  }

  // Job & Analyzer Endpoints
  async createJob(dto: { title: string; company: string; experienceLevel: string; jdText: string; resumeText?: string; targetInterviewDate?: string }) {
    return this.request<any>('/jobs', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async getJob(id: string) {
    return this.request<any>(`/jobs/${id}`);
  }

  async getJobAnalysis(id: string) {
    return this.request<any>(`/jobs/${id}/analysis`);
  }

  // Interview Plans
  async createPlan(dto: { jobId: string; difficulty?: string; mode?: string; personaId?: string }) {
    return this.request<any>('/plans', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async updatePlan(id: string, dto: { mode?: string; personaId?: string; difficulty?: string }) {
    return this.request<any>(`/plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  }

  async getPlan(id: string) {
    return this.request<any>(`/plans/${id}`);
  }

  // Sessions Lifecycle & Evaluation
  async createSession(dto: { planId: string; mode?: string; personaId?: string }) {
    return this.request<{ sessionId: string; status: string; wsToken: string; mode: string; personaId: string }>(
      '/sessions',
      {
        method: 'POST',
        body: JSON.stringify(dto),
      }
    );
  }

  async getSession(id: string) {
    return this.request<any>(`/sessions/${id}`);
  }

  async endSession(id: string) {
    return this.request<any>(`/sessions/${id}/end`, { method: 'POST' });
  }

  async getSessionReport(id: string) {
    return this.request<any>(`/sessions/${id}/report`);
  }

  // Communication Coach
  async getCoachingSections(sessionId?: string, sectionType?: string, practiced?: boolean) {
    const params = new URLSearchParams();
    if (sessionId) params.append('sessionId', sessionId);
    if (sectionType) params.append('sectionType', sectionType);
    if (practiced !== undefined) params.append('practiced', String(practiced));

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<any[]>(`/coaching/sections${query}`);
  }

  async submitPracticeAttempt(sectionId: string, attemptText: string, attemptAudioUrl?: string) {
    return this.request<any>(`/coaching/sections/${sectionId}/practice`, {
      method: 'POST',
      body: JSON.stringify({ attemptText, attemptAudioUrl }),
    });
  }

  async getCoachingTrends() {
    return this.request<any[]>('/coaching/trends');
  }

  // Analytics & Presets
  async getWeakAreas() {
    return this.request<any[]>('/analytics/weak-areas');
  }

  async getRetryQueue() {
    return this.request<any[]>('/analytics/retry-queue');
  }

  async searchAnswerLibrary(query: string) {
    return this.request<any[]>(`/answers/search?q=${encodeURIComponent(query)}`);
  }

  async getPersonas() {
    return this.request<any[]>('/analyzer/personas');
  }

  async getModes() {
    return this.request<any[]>('/analyzer/modes');
  }
}

export const api = new ApiClient();

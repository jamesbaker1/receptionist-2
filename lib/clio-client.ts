const API_BASE_URL = "https://{{region}}/api/v4";

export interface ClioContact {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email_addresses: Array<{
    name: string;
    address: string;
    default_email: boolean;
  }>;
  phone_numbers: Array<{
    name: string;
    number: string;
    default_number: boolean;
  }>;
}

export interface ClioMatter {
  id: number;
  display_number: string;
  description: string;
  status: string;
  client: {
    id: number;
    name: string;
  };
}

export interface ClioTask {
  id: number;
  name: string;
  description: string;
  due_at: string;
  assignee: {
    id: number;
    name: string;
  };
}

export class ClioClient {
  private accessToken: string;
  private region: string;

  constructor(accessToken: string, region: string = "app.clio.com") {
    this.accessToken = accessToken;
    this.region = region;
  }

  private getApiUrl(endpoint: string): string {
    return API_BASE_URL.replace("{{region}}", this.region) + endpoint;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = this.getApiUrl(endpoint);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        "Authorization": `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Clio API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    return response.json();
  }

  // User info
  async getCurrentUser() {
    return this.makeRequest("/users/who_am_i");
  }

  // Contacts
  async getContacts(params: { limit?: number; offset?: number } = {}): Promise<{ data: ClioContact[] }> {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.offset) searchParams.append("offset", params.offset.toString());
    
    const endpoint = `/contacts${searchParams.toString() ? `?${searchParams}` : ""}`;
    return this.makeRequest(endpoint);
  }

  async getContact(id: number): Promise<{ data: ClioContact }> {
    return this.makeRequest(`/contacts/${id}`);
  }

  async createContact(contactData: {
    name: string;
    first_name?: string;
    last_name?: string;
    email_addresses?: Array<{ address: string; name?: string }>;
    phone_numbers?: Array<{ number: string; name?: string }>;
  }): Promise<{ data: ClioContact }> {
    return this.makeRequest("/contacts", {
      method: "POST",
      body: JSON.stringify({ data: contactData }),
    });
  }

  // Matters
  async getMatters(params: { limit?: number; offset?: number } = {}): Promise<{ data: ClioMatter[] }> {
    const searchParams = new URLSearchParams();
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.offset) searchParams.append("offset", params.offset.toString());
    
    const endpoint = `/matters${searchParams.toString() ? `?${searchParams}` : ""}`;
    return this.makeRequest(endpoint);
  }

  async createMatter(matterData: {
    client: { id: number };
    description: string;
    practice_area?: { id: number };
  }): Promise<{ data: ClioMatter }> {
    return this.makeRequest("/matters", {
      method: "POST",
      body: JSON.stringify({ data: matterData }),
    });
  }

  // Tasks
  async createTask(taskData: {
    name: string;
    description?: string;
    due_at?: string;
    assignee?: { id: number };
    matter?: { id: number };
  }): Promise<{ data: ClioTask }> {
    return this.makeRequest("/tasks", {
      method: "POST",
      body: JSON.stringify({ data: taskData }),
    });
  }
} 
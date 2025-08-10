const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : import.meta.env.PROD
  ? "https://student-system-production.up.railway.app/api" // הבאק האמיתי!
  : "http://localhost:5000/api";

class ApiService {
  constructor() {
    this.token = localStorage.getItem("dailydev-token");
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem("dailydev-token", token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("dailydev-token");
  }

  getAuthHeaders() {
    const token = this.token || localStorage.getItem("dailydev-token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`🔗 API Request: ${config.method || "GET"} ${url}`);
      console.log(`📋 Request config:`, config);

      const response = await fetch(url, config);
      console.log(`📡 Response status:`, response.status);
      console.log(`📡 Response headers:`, response.headers);

      // Check if response has content before parsing JSON
      const text = await response.text();
      console.log(`📄 Response text:`, text);

      let data;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error(`❌ JSON Parse Error:`, parseError);
          throw new Error(`Invalid JSON response: ${text}`);
        }
      } else {
        data = {};
      }

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          this.clearToken();
          throw new Error("Session expired. Please login again.");
        }
        throw new Error(data.message || "Something went wrong");
      }

      console.log(`✅ API Success:`, data);
      return data;
    } catch (error) {
      console.error(`❌ API Error (${endpoint}):`, error);
      console.error(`❌ Error details:`, {
        message: error.message,
        stack: error.stack,
        url: url,
        config: config,
      });
      throw error;
    }
  }

  // Health check
  async checkHealth() {
    return this.request("/health");
  }

  // Authentication
  async register(name, email, password) {
    const data = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async login(email, password) {
    const data = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async getCurrentUser() {
    return this.request("/auth/me");
  }

  logout() {
    this.clearToken();
  }

  // Journal
  async saveJournalEntry(entry) {
    return this.request("/journal", {
      method: "POST",
      body: JSON.stringify(entry),
    });
  }

  async getJournalEntries() {
    return this.request("/journal");
  }

  async updateJournalEntry(id, updates) {
    return this.request(`/journal/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteJournalEntry(id) {
    return this.request(`/journal/${id}`, {
      method: "DELETE",
    });
  }

  // Tasks
  async saveTask(task) {
    console.log("Saving task:", task);
    const result = await this.request("/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    });
    console.log("Task save result:", result);
    return result;
  }

  async getTasks() {
    return this.request("/tasks");
  }

  async updateTask(id, updates) {
    return this.request(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(id) {
    return this.request(`/tasks/${id}`, {
      method: "DELETE",
    });
  }

  async toggleTaskCompletion(id, completed) {
    return this.updateTask(id, { completed });
  }

  // Courses
  async saveCourse(course) {
    return this.request("/courses", {
      method: "POST",
      body: JSON.stringify(course),
    });
  }

  async getCourses() {
    return this.request("/courses");
  }

  async updateCourse(id, updates) {
    return this.request(`/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteCourse(id) {
    return this.request(`/courses/${id}`, {
      method: "DELETE",
    });
  }

  async updateCourseProgress(id, progress) {
    return this.updateCourse(id, { progress });
  }

  // User Profile
  async updateProfile(updates) {
    return this.request("/users", {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async changePassword(currentPassword, newPassword) {
    return this.request("/users/change-password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Stats
  async getStats() {
    return this.request("/users/stats");
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.token || localStorage.getItem("dailydev-token");
    return !!token;
  }
}

export const api = new ApiService();

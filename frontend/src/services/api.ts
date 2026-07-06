// frontend/src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Base API client for GuardianAI backend
 */
class APIClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Generic GET request handler
   */
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication token if needed
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Generic POST request handler
   */
  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication token if needed
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const apiClient = new APIClient();

/**
 * Dashboard API service
 */
export const dashboardService = {
  /**
   * Get threat levels statistics
   */
  getThreatLevels: async () => {
    try {
      return await apiClient.get('/dashboard/threat-levels');
    } catch (error) {
      console.error('Error fetching threat levels:', error);
      throw error;
    }
  },

  /**
   * Get recent incidents
   */
  getRecentIncidents: async () => {
    try {
      return await apiClient.get('/dashboard/recent-incidents');
    } catch (error) {
      console.error('Error fetching recent incidents:', error);
      throw error;
    }
  },
};

/**
 * Camera API service
 */
export const cameraService = {
  /**
   * Get live cameras feed
   */
  getCameras: async () => {
    try {
      return await apiClient.get('/cameras');
    } catch (error) {
      console.error('Error fetching cameras:', error);
      throw error;
    }
  },
};

/**
 * Incident API service
 */
export const incidentService = {
  /**
   * Get all incidents
   */
  getIncidents: async () => {
    try {
      return await apiClient.get('/incidents');
    } catch (error) {
      console.error('Error fetching incidents:', error);
      throw error;
    }
  },
};

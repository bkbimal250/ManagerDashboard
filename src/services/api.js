import axios from 'axios';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://company.d0s369.co.in/api';
const API_BASE_URL = 'http://127.0.0.1:8000/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // Increased timeout for ZKTeco operations
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔑 API Request: Adding Bearer token to request');
        } else {
          console.log('⚠️ API Request: No access token found in localStorage');
        }
        
        // Debug request details
        console.log('🔍 API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          hasToken: !!token,
          headers: config.headers
        });
        
        return config;
      },
      (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh - IMPROVED
    this.api.interceptors.response.use(
      (response) => {
        console.log('✅ API Response:', {
          status: response.status,
          url: response.config.url,
          method: response.config.method?.toUpperCase()
        });
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        
        console.log('❌ API Response Error:', {
          status: error.response?.status,
          url: originalRequest.url,
          method: originalRequest.method?.toUpperCase(),
          message: error.response?.data?.detail || error.message
        });
        
        // Only attempt token refresh for 401 errors and if we haven't already tried
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              console.log('🔄 Attempting token refresh...');
              // Use the correct token refresh endpoint from your Django backend
              const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
                refresh: refreshToken,
              });
              
              if (response.data.access) {
                localStorage.setItem('access_token', response.data.access);
                originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                console.log('✅ Token refreshed successfully');
                return this.api(originalRequest);
              }
            }
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError);
            // Don't automatically redirect - let the component handle it
            // Only clear tokens if refresh explicitly fails
            if (refreshError.response?.status === 401) {
              console.log('🔄 Refresh token expired, clearing auth data');
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user');
            }
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Authentication endpoints
  async login(credentials) {
    try {
      const loginData = {
        ...credentials,
        dashboard_type: 'manager'
      };
      console.log('🔐 Login attempt with data:', loginData);
      // Use the correct login endpoint from your Django backend
      const response = await this.api.post('/auth/login/', loginData);
      console.log('✅ Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Login API error:', error);
      throw error; // Re-throw to be handled by AuthContext
    }
  }

  async getProfile() {
    try {
      console.log('🔍 API: Fetching profile...');
      const token = localStorage.getItem('access_token');
      console.log('🔍 API: Current token:', token ? `${token.substring(0, 20)}...` : 'None');
      
      // Use the correct profile endpoint from your Django backend
      const response = await this.api.get('/auth/profile/');
      console.log('✅ API: Profile fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API: Get profile failed:', error);
      console.error('❌ API: Error response:', error.response?.data);
      console.error('❌ API: Error status:', error.response?.status);
      
      // If it's a 401 error, don't throw - let AuthContext handle it gracefully
      if (error.response?.status === 401) {
        console.log('⚠️ API: Profile fetch returned 401, will use stored user data');
        throw new Error('PROFILE_FETCH_401');
      }
      
      throw error; // Re-throw to be handled by AuthContext
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await this.api.put('/auth/profile/update/', profileData);
      return { success: true, data: response.data };
    } catch (error) {
      const errorData = this.handleError(error);
      return { success: false, error: errorData.message };
    }
  }

  async changePassword(passwordData) {
    try {
      const response = await this.api.post('/auth/change-password/', passwordData);
      return { success: true, data: response.data };
    } catch (error) {
      const errorData = this.handleError(error);
      return { success: false, error: errorData.message };
    }
  }

  async logout() {
    try {
      await this.api.post('/auth/logout/');
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  }

  // Dashboard endpoints
  async getDashboardStats() {
    const response = await this.api.get('/dashboard/stats/');
    return response.data;
  }

  async getOfficeStats(officeId) {
    if (!officeId) {
      // Fallback to general stats if no office ID
      return this.getDashboardStats();
    }
    const response = await this.api.get(`/dashboard/office/${officeId}/stats/`);
    return response.data;
  }

  async getManagerDashboardStats() {
    // Get manager-specific dashboard stats
    const response = await this.api.get('/dashboard/manager/stats/');
    return response.data;
  }

  // Employee endpoints (office-specific)
  async getEmployees(params = {}) {
    const response = await this.api.get('/users/', { params });
    return response.data;
  }

  async getManagerEmployees(params = {}) {
    // Get employees from the manager's office
    const response = await this.api.get('/users/', { 
      params: { 
        ...params,
        role: 'employee'
      } 
    });
    return response.data;
  }

  async getManagerAttendance(params = {}) {
    // Get attendance data for manager's office
    const response = await this.api.get('/attendance/', { 
      params: { 
        ...params,
        limit: params.limit || 10
      } 
    });
    return response.data;
  }

  async getManagerLeaves(params = {}) {
    // Get leaves data for manager's office
    const response = await this.api.get('/leaves/', { 
      params: { 
        ...params,
        limit: params.limit || 10
      } 
    });
    return response.data;
  }

  async getEmployee(id) {
    const response = await this.api.get(`/users/${id}/`);
    return response.data;
  }

  async createEmployee(employeeData) {
    const response = await this.api.post('/users/', employeeData);
    return response.data;
  }

  async updateEmployee(id, employeeData) {
    const response = await this.api.put(`/users/${id}/`, employeeData);
    return response.data;
  }

  async deleteEmployee(id) {
    const response = await this.api.delete(`/users/${id}/`);
    return response.data;
  }

  // Attendance endpoints (office-specific)
  async getAttendance(params = {}) {
    const response = await this.api.get('/attendance/', { params });
    return response.data;
  }

  async getTodayAttendance(params = {}) {
    const response = await this.api.get('/attendance/today/', { params });
    return response.data;
  }

  async getRealtimeAttendance(params = {}) {
    const response = await this.api.get('/attendance/realtime/', { params });
    return response.data;
  }

  async getCheckinCheckoutData(params = {}) {
    const response = await this.api.get('/attendance/checkin_checkout/', { params });
    return response.data;
  }

  async getMonthlyAttendance(month, year, params = {}) {
    const response = await this.api.get('/attendance/monthly/', { 
      params: { 
        month, 
        year, 
        ...params 
      } 
    });
    return response.data;
  }

  async getAttendanceReport(startDate, endDate, params = {}) {
    const response = await this.api.get('/attendance/report/', { 
      params: { 
        start_date: startDate,
        end_date: endDate,
        ...params 
      } 
    });
    return response.data;
  }

  async getAttendanceByDate(date, params = {}) {
    const response = await this.api.get(`/attendance/date/${date}/`, { params });
    return response.data;
  }

  async getAttendanceByEmployee(employeeId, params = {}) {
    const response = await this.api.get(`/attendance/employee/${employeeId}/`, { params });
    return response.data;
  }

  async createAttendance(attendanceData) {
    const response = await this.api.post('/attendance/', attendanceData);
    return response.data;
  }

  async updateAttendance(id, attendanceData) {
    const response = await this.api.put(`/attendance/${id}/`, attendanceData);
    return response.data;
  }

  async deleteAttendance(id) {
    const response = await this.api.delete(`/attendance/${id}/`);
    return response.data;
  }

  // Leave endpoints
  async getLeaves(params = {}) {
    const response = await this.api.get('/leaves/', { params });
    return response.data;
  }

  async getMyLeaves(params = {}) {
    const response = await this.api.get('/leaves/my/', { params });
    return response.data;
  }

  async getLeave(id) {
    const response = await this.api.get(`/leaves/${id}/`);
    return response.data;
  }

  async createLeave(leaveData) {
    const response = await this.api.post('/leaves/', leaveData);
    return response.data;
  }

  async updateLeave(id, leaveData) {
    const response = await this.api.put(`/leaves/${id}/`, leaveData);
    return response.data;
  }

  async deleteLeave(id) {
    const response = await this.api.delete(`/leaves/${id}/`);
    return response.data;
  }

  async approveLeave(id) {
    const response = await this.api.post(`/leaves/${id}/approve/`);
    return response.data;
  }

  async rejectLeave(id, reason) {
    const response = await this.api.post(`/leaves/${id}/reject/`, { reason });
    return response.data;
  }

  // Document endpoints
  async getDocuments(params = {}) {
    const response = await this.api.get('/documents/', { params });
    return response.data;
  }

  async getDocument(id) {
    const response = await this.api.get(`/documents/${id}/`);
    return response.data;
  }

  async uploadDocument(documentData) {
    const response = await this.api.post('/documents/', documentData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateDocument(id, documentData) {
    const response = await this.api.put(`/documents/${id}/`, documentData);
    return response.data;
  }

  async deleteDocument(id) {
    const response = await this.api.delete(`/documents/${id}/`);
    return response.data;
  }

  // Office endpoints
  async getOffices(params = {}) {
    const response = await this.api.get('/offices/', { params });
    return response.data;
  }

  async getOffice(id) {
    const response = await this.api.get(`/offices/${id}/`);
    return response.data;
  }

  async createOffice(officeData) {
    const response = await this.api.post('/offices/', officeData);
    return response.data;
  }

  async updateOffice(id, officeData) {
    const response = await this.api.put(`/offices/${id}/`, officeData);
    return response.data;
  }

  async deleteOffice(id) {
    const response = await this.api.delete(`/offices/${id}/`);
    return response.data;
  }

  // Device endpoints
  async getDevices(params = {}) {
    const response = await this.api.get('/devices/', { params });
    return response.data;
  }

  async getManagerDevices(params = {}) {
    // Get devices for the manager's office (backend automatically filters by office)
    const response = await this.api.get('/devices/', { params });
    return response.data;
  }

  async getDevice(id) {
    const response = await this.api.get(`/devices/${id}/`);
    return response.data;
  }

  async createDevice(deviceData) {
    const response = await this.api.post('/devices/', deviceData);
    return response.data;
  }

  async updateDevice(id, deviceData) {
    const response = await this.api.put(`/devices/${id}/`, deviceData);
    return response.data;
  }

  async deleteDevice(id) {
    const response = await this.api.delete(`/devices/${id}/`);
    return response.data;
  }

  // ZKTeco endpoints
  async getZKTecoDevices(params = {}) {
    const response = await this.api.get('/zkteco/devices/', { params });
    return response.data;
  }

  async getZKTecoDevice(id) {
    const response = await this.api.get(`/zkteco/devices/${id}/`);
    return response.data;
  }

  async createZKTecoDevice(deviceData) {
    const response = await this.api.post('/zkteco/devices/', deviceData);
    return response.data;
  }

  async updateZKTecoDevice(id, deviceData) {
    const response = await this.api.put(`/zkteco/devices/${id}/`, deviceData);
    return response.data;
  }

  async deleteZKTecoDevice(id) {
    const response = await this.api.delete(`/zkteco/devices/${id}/`);
    return response.data;
  }

  async syncZKTecoDevice(id) {
    const response = await this.api.post(`/zkteco/devices/${id}/sync/`);
    return response.data;
  }

  // ESSL endpoints
  async getESSLDevices(params = {}) {
    const response = await this.api.get('/essl/devices/', { params });
    return response.data;
  }

  async getESSLDevice(id) {
    const response = await this.api.get(`/essl/devices/${id}/`);
    return response.data;
  }

  async createESSLDevice(deviceData) {
    const response = await this.api.post('/essl/devices/', deviceData);
    return response.data;
  }

  async updateESSLDevice(id, deviceData) {
    const response = await this.api.put(`/essl/devices/${id}/`, deviceData);
    return response.data;
  }

  async deleteESSLDevice(id) {
    const response = await this.api.delete(`/essl/devices/${id}/`);
    return response.data;
  }

  async syncESSLDevice(id) {
    const response = await this.api.post(`/essl/devices/${id}/sync/`);
    return response.data;
  }

  // Reports endpoints
  async generateAttendanceReport(params = {}) {
    const response = await this.api.get('/reports/attendance/', { params });
    return response.data;
  }

  async generateLeaveReport(params = {}) {
    const response = await this.api.get('/reports/leaves/', { params });
    return response.data;
  }

  async generateEmployeeReport(params = {}) {
    const response = await this.api.get('/reports/employees/', { params });
    return response.data;
  }

  async exportReport(reportType, params = {}) {
    const response = await this.api.get(`/reports/${reportType}/export/`, { 
      params,
      responseType: 'blob'
    });
    return response.data;
  }

  // Document endpoints
  async getDocuments(params = {}) {
    const response = await this.api.get('/documents/', { params });
    return response.data;
  }

  async getDocument(id) {
    const response = await this.api.get(`/documents/${id}/`);
    return response.data;
  }

  async createDocument(documentData) {
    const response = await this.api.post('/documents/', documentData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async updateDocument(id, documentData) {
    const response = await this.api.put(`/documents/${id}/`, documentData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteDocument(id) {
    const response = await this.api.delete(`/documents/${id}/`);
    return response.data;
  }

  async getMyDocuments(params = {}) {
    const response = await this.api.get('/documents/my/', { params });
    return response.data;
  }

  async downloadDocument(id) {
    const response = await this.api.get(`/documents/${id}/download/`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Utility methods
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      console.error('API Error Response:', { status, data });
      
      if (status === 401) {
        return { message: 'Authentication failed. Please login again.' };
      } else if (status === 403) {
        return { message: 'You do not have permission to perform this action.' };
      } else if (status === 404) {
        return { message: 'Resource not found.' };
      } else if (status === 500) {
        return { message: 'Server error. Please try again later.' };
      } else if (data && data.message) {
        return { message: data.message };
      } else if (data && data.detail) {
        return { message: data.detail };
      } else {
        return { message: `Request failed with status ${status}` };
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('API No Response:', error.request);
      return { message: 'No response from server. Please check your connection.' };
    } else {
      // Something else happened
      console.error('API Error:', error.message);
      return { message: error.message || 'An unexpected error occurred.' };
    }
  }
}

const api = new ApiService();
export default api;

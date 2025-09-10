import axios from 'axios';

const API_BASE_URL ='https://company.d0s369.co.in/api';
// const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // Increased timeout for ZKTeco operations
      headers: {
        'Content-Type': 'application/json',
      },
      // Add these configurations to handle CORS and redirect issues
      withCredentials: false, // Disable credentials for CORS
      maxRedirects: 0, // Prevent redirect loops
      validateStatus: function (status) {
        return status >= 200 && status < 300; // Accept only 2xx status codes
      },
    });

    // Request interceptor to add auth token
   this.api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ Ensure trailing slash for GET requests
    if (config.method === 'get' && config.url && !config.url.endsWith('/')) {
      config.url += '/';
    }

    // Note: CORS headers are set by the server, not the client
    // The server should handle CORS configuration

    return config;
  },
  (error) => Promise.reject(error)
);

    // Response interceptor to handle token refresh - IMPROVED
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        
        
        // Only attempt token refresh for 401 errors and if we haven't already tried
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              // Use the correct token refresh endpoint from your Django backend
              const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
                refresh: refreshToken,
              });
              
              if (response.data.access) {
                localStorage.setItem('access_token', response.data.access);
                originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                return this.api(originalRequest);
              }
            }
          } catch (refreshError) {
            // Don't automatically redirect - let the component handle it
            // Only clear tokens if refresh explicitly fails
            if (refreshError.response?.status === 401) {
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

  // Authentication methods
  async login(credentials) {
    try {
      
      // Add dashboard_type parameter that backend expects
      const loginData = {
        ...credentials,
        dashboard_type: 'manager' // Manager dashboard type
      };
      
      const response = await this.api.post('/auth/login/', loginData);
      
      const { access, refresh, user } = response.data;
      
      if (!access || !refresh) {
        throw new Error('Invalid response from server');
      }
      
      
      return {
        success: true,
        access,
        refresh,
        user
      };
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      // console.log('🔐 API Service: Logout attempt');
      await this.api.post('/auth/logout/');
      // console.log('✅ API Service: Logout successful');
      return { success: true };
    } catch (error) {
      // console.error('❌ API Service: Logout failed:', error);
      // Don't throw error for logout - just return success
      return { success: true };
    }
  }

  async getProfile() {
    try {
      // console.log('🔐 API Service: Fetching profile...');
      const response = await this.api.get('/auth/profile/');
      // console.log('✅ API Service: Profile fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      // console.error('❌ API Service: Profile fetch failed:', error);
      if (error.response?.status === 401) {
        const customError = new Error('PROFILE_FETCH_401');
        customError.response = error.response;
        throw customError;
      }
      throw error;
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await this.api.put('/auth/profile/', profileData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: this.handleError(error).message };
    }
  }

  async changePassword(passwordData) {
    try {
      const response = await this.api.post('/auth/change-password/', passwordData);
      return { success: true };
    } catch (error) {
      return { success: false, error: this.handleError(error).message };
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
    const response = await this.api.get('/dashboard/manager_stats/');
    return response.data;
  }

  // Employee endpoints (office-specific)
  async getEmployees(params = {}) {
    const response = await this.api.get('/users/', { params });
    return response.data;
  }

  async getManagerEmployees(params = {}) {
    // Get employees from the manager's office
    const response = await this.api.get('/dashboard/manager_employees/', { 
      params: { 
        ...params,
        role: 'employee'
      } 
    });
    return response.data;
  }

  async getManagerAttendance(params = {}) {
    // Get attendance data for manager's office
    const response = await this.api.get('/dashboard/manager_attendance/', { 
      params: { 
        ...params,
        limit: params.limit || 10
      } 
    });
    return response.data;
  }

  async getManagerLeaves(params = {}) {
    // Get leaves data for manager's office
    const response = await this.api.get('/dashboard/manager_leaves/', { 
      params: { 
        ...params,
        limit: params.limit || 10
      } 
    });
    return response.data;
  }

  async approveLeave(leaveId, action, reason = '') {
    // Approve or reject leave request
    const response = await this.api.put(`/dashboard/manager_approve_leave/${leaveId}/`, {
      action,
      reason
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
    // Use the new checkin_checkout endpoint
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

  async getEmployeeAttendance(employeeId, startDate, endDate, params = {}) {
    // Get monthly attendance data for a specific employee with all days including absent days
    const startDateObj = new Date(startDate);
    const year = startDateObj.getFullYear();
    const month = startDateObj.getMonth() + 1; // getMonth() returns 0-11
    
    const response = await this.api.get('/attendance/monthly_attendance/', {
      params: {
        user: employeeId,
        year: year,
        month: month,
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
    const response = await this.api.get('/reports/user/', { params });
    return response.data;
  }

  async exportReport(reportType, params = {}) {
    // Map frontend report types to backend method names
    const methodMap = {
      'attendance': 'attendance',
      'leave': 'leave',
      'employee': 'user'
    };
    
    const backendMethod = methodMap[reportType] || reportType;
    const response = await this.api.get(`/reports/${backendMethod}/export/`, { 
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

  // Employee Attendance Methods
  async getEmployeeAttendance(employeeId, startDate, endDate, params = {}) {
    try {
      // Get monthly attendance data for a specific employee with all days including absent days
      // Extract year and month from startDate (format: YYYY-MM-DD)
      const [year, month] = startDate.split('-').map(Number);
      
      
      const response = await this.api.get('/attendance/monthly_attendance/', {
        params: {
          user: employeeId,
          year: year,
          month: month,
          ...params
        }
      });
      
      // console.log('✅ API response received:', response.data);
      return response.data;
    } catch (error) {
      // console.error('❌ Error fetching employee attendance:', error);
      throw error;
    }
  }

  async updateAttendanceStatus(userId, date, status, dayStatus = null, notes = '') {
    try {
      
      const response = await this.api.post('/attendance/update_status/', {
        user_id: userId,
        date: date,
        status: status,
        day_status: dayStatus,
        notes: notes
      });
      
      // console.log('✅ API Service: Attendance status updated successfully:', response.data);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      // console.error('❌ API Service: Failed to update attendance status:', error);
      return {
        success: false,
        error: this.handleError(error).message
      };
    }
  }

  // Utility methods
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      // console.error('API Error Response:', { status, data });
      
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
      // console.error('API No Response:', error.request);
      return { message: 'No response from server. Please check your connection.' };
    } else {
      // Something else happened
      // console.error('API Error:', error.message);
      return { message: error.message || 'An unexpected error occurred.' };
    }
  }

  // Test API connection method
  async testConnection() {
    try {
      // console.log('🔍 Testing API connection...');
      // console.log('🔍 API Base URL:', API_BASE_URL);
      
      // Test with a simple GET request
      const response = await this.api.get('/auth/profile/', {
        timeout: 10000, // Shorter timeout for testing
        validateStatus: () => true, // Accept any status for testing
      });
      
      
      return {
        success: true,
        status: response.status,
        message: 'API connection successful'
      };
    } catch (error) {
      
      return {
        success: false,
        error: error.code || 'UNKNOWN',
        message: error.message,
        details: this.getErrorDetails(error)
      };
    }
  }

  // Get detailed error information
  getErrorDetails(error) {
    if (error.code === 'ERR_NETWORK') {
      return 'Network error - likely CORS issue or server unreachable';
    } else if (error.code === 'ERR_TOO_MANY_REDIRECTS') {
      return 'Redirect loop detected - server configuration issue';
    } else if (error.code === 'ECONNABORTED') {
      return 'Request timeout - server may be slow or unresponsive';
    } else if (error.code === 'ERR_BAD_REQUEST') {
      return 'Bad request - check request parameters';
    } else if (error.code === 'ERR_BAD_RESPONSE') {
      return 'Bad response - server returned invalid data';
    }
    return 'Unknown error occurred';
  }

  // Document Generation API Methods
  async getEmployeesForDocumentGeneration() {
    try {
      // console.log('📄 API Service: Fetching employees for document generation...');
      const response = await this.api.get('/document-generation/get_employees/');
      // console.log('✅ API Service: Employees fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      // console.error('❌ API Service: Failed to fetch employees:', error);
      throw error;
    }
  }

  async generateDocument(documentData) {
    try {
      // console.log('📄 API Service: Generating document...', documentData);
      const response = await this.api.post('/document-generation/generate_document/', documentData);
      // console.log('✅ API Service: Document generated successfully:', response.data);
      return response.data;
    } catch (error) {
      // console.error('❌ API Service: Failed to generate document:', error);
      throw error;
    }
  }

  async getGeneratedDocuments(params = {}) {
    try {
      // console.log('📄 API Service: Fetching generated documents...');
      const response = await this.api.get('/generated-documents/', { params });
      // console.log('✅ API Service: Generated documents fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      // console.error('❌ API Service: Failed to fetch generated documents:', error);
      throw error;
    }
  }

  async downloadDocumentPDF(documentId) {
    try {
      console.log('📄 API Service: Downloading document PDF...', documentId);
      
      const response = await this.api.get(`/generated-documents/${documentId}/download_pdf/`, {
        responseType: 'blob',
        timeout: 60000, // 60 seconds timeout for PDF generation
        headers: {
          'Accept': 'application/pdf, application/octet-stream, */*'
        }
      });
      
      console.log('✅ API Service: Document PDF downloaded successfully');
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      console.log('Response data size:', response.data.size);
      
      return response; // Return full response to access headers
    } catch (error) {
      console.error('❌ API Service: Failed to download document PDF:', error);
      console.error('Error response:', error.response);
      throw error;
    }
  }

  async previewDocument(documentData) {
    try {
      // console.log('📄 API Service: Previewing document...', documentData);
      const response = await this.api.post('/document-generation/preview_document/', documentData);
      // console.log('✅ API Service: Document preview generated successfully:', response.data);
      return response.data;
    } catch (error) {
      // console.error('❌ API Service: Failed to preview document:', error);
      throw error;
    }
  }

  async getMyDocuments() {
    try {
      // console.log('📄 API Service: Fetching my documents...');
      const response = await this.api.get('/document-generation/my_documents/');
      // console.log('✅ API Service: My documents fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      // console.error('❌ API Service: Failed to fetch my documents:', error);
      throw error;
    }
  }

  async sendDocumentEmail(documentId) {
    try {
      // console.log('📄 API Service: Sending document email...', documentId);
      const response = await this.api.post(`/generated-documents/${documentId}/send_email/`);
      // console.log('✅ API Service: Document email sent successfully:', response.data);
      return response.data;
    } catch (error) {
      // console.error('❌ API Service: Failed to send document email:', error);
      throw error;
    }
  }

  async deleteGeneratedDocument(documentId) {
    try {
      // console.log('📄 API Service: Deleting generated document...', documentId);
      const response = await this.api.delete(`/generated-documents/${documentId}/`);
      // console.log('✅ API Service: Generated document deleted successfully');
      return response.data;
    } catch (error) {
      // console.error('❌ API Service: Failed to delete generated document:', error);
      throw error;
    }
  }

  async getDocumentTemplates() {
    try {
      // console.log('📄 API Service: Fetching document templates...');
      const response = await this.api.get('/document-templates/');
      // console.log('✅ API Service: Document templates fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      // console.error('❌ API Service: Failed to fetch document templates:', error);
      throw error;
    }
  }

  // Resignation endpoints
  async getResignations(params = {}) {
    try {
      // console.log('📋 API Service: Fetching resignations...', params);
      const response = await this.api.get('/resignations/', { params });
      // console.log('✅ API Service: Resignations fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      // console.error('❌ API Service: Failed to fetch resignations:', error);
      throw error;
    }
  }

  async getResignation(id) {
    try {
      // console.log('📋 API Service: Fetching resignation...', id);
      const response = await this.api.get(`/resignations/${id}/`);
      // console.log('✅ API Service: Resignation fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      // console.error('❌ API Service: Failed to fetch resignation:', error);
      throw error;
    }
  }

  async getResignationStats() {
    try {
      // console.log('📊 API Service: Fetching resignation stats...');
      const response = await this.api.get('/resignations/stats/');
      // console.log('✅ API Service: Resignation stats fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      // console.error('❌ API Service: Failed to fetch resignation stats:', error);
      throw error;
    }
  }

  async approveResignation(id) {
    try {
      // console.log('✅ API Service: Approving resignation...', id);
      const response = await this.api.post(`/resignations/${id}/approve/`);
      // console.log('✅ API Service: Resignation approved successfully:', response.data);
      return response.data;
    } catch (error) {
      // console.error('❌ API Service: Failed to approve resignation:', error);
      throw error;
    }
  }

  async rejectResignation(id, data) {
    try {
      // console.log('❌ API Service: Rejecting resignation...', id, data);
      const response = await this.api.post(`/resignations/${id}/reject/`, data);
      // console.log('✅ API Service: Resignation rejected successfully:', response.data);
      return response.data;
    } catch (error) {
      // console.error('❌ API Service: Failed to reject resignation:', error);
      throw error;
    }
  }

  async createResignation(resignationData) {
    try {
      // console.log('📝 API Service: Creating resignation...', resignationData);
      const response = await this.api.post('/resignations/', resignationData);
      // console.log('✅ API Service: Resignation created successfully:', response.data);
      return response.data;
    } catch (error) {
      // console.error('❌ API Service: Failed to create resignation:', error);
      throw error;
    }
  }

  async updateResignation(id, resignationData) {
    try {
      // console.log('📝 API Service: Updating resignation...', id, resignationData);
      const response = await this.api.put(`/resignations/${id}/`, resignationData);
      // console.log('✅ API Service: Resignation updated successfully:', response.data);
      return response.data;
    } catch (error) {
      // console.error('❌ API Service: Failed to update resignation:', error);
      throw error;
    }
  }

  async deleteResignation(id) {
    try {
      // console.log('🗑️ API Service: Deleting resignation...', id);
      const response = await this.api.delete(`/resignations/${id}/`);
      // console.log('✅ API Service: Resignation deleted successfully');
      return response.data;
    } catch (error) {
      // console.error('❌ API Service: Failed to delete resignation:', error);
      throw error;
    }
  }
}

const api = new ApiService();
export default api;

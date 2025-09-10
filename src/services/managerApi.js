import api from './api';

// Manager-specific API methods
const managerApi = {
  // Resignation methods
  getResignations: (params) => api.getResignations(params),
  getResignation: (id) => api.getResignation(id),
  getResignationStats: () => api.getResignationStats(),
  approveResignation: (id) => api.approveResignation(id),
  rejectResignation: (id, data) => api.rejectResignation(id, data),
  createResignation: (data) => api.createResignation(data),
  updateResignation: (id, data) => api.updateResignation(id, data),
  deleteResignation: (id) => api.deleteResignation(id),

  // Employee methods
  getEmployees: (params) => api.getManagerEmployees(params),
  getEmployee: (id) => api.getEmployee(id),
  createEmployee: (data) => api.createEmployee(data),
  updateEmployee: (id, data) => api.updateEmployee(id, data),
  deleteEmployee: (id) => api.deleteEmployee(id),

  // Attendance methods
  getAttendance: (params) => api.getManagerAttendance(params),
  getTodayAttendance: (params) => api.getTodayAttendance(params),
  getRealtimeAttendance: (params) => api.getRealtimeAttendance(params),
  getMonthlyAttendance: (month, year, params) => api.getMonthlyAttendance(month, year, params),
  getEmployeeAttendance: (employeeId, startDate, endDate, params) => api.getEmployeeAttendance(employeeId, startDate, endDate, params),
  updateAttendanceStatus: (userId, date, status, dayStatus, notes) => api.updateAttendanceStatus(userId, date, status, dayStatus, notes),

  // Leave methods
  getLeaves: (params) => api.getManagerLeaves(params),
  getLeave: (id) => api.getLeave(id),
  approveLeave: (id, action, reason) => api.approveLeave(id, action, reason),

  // Dashboard methods
  getDashboardStats: () => api.getManagerDashboardStats(),
  getOfficeStats: (officeId) => api.getOfficeStats(officeId),

  // Document methods
  getDocuments: (params) => api.getDocuments(params),
  uploadDocument: (data) => api.uploadDocument(data),
  downloadDocument: (id) => api.downloadDocument(id),
  deleteDocument: (id) => api.deleteDocument(id),

  // Device methods
  getDevices: (params) => api.getManagerDevices(params),
  getDevice: (id) => api.getDevice(id),
  createDevice: (data) => api.createDevice(data),
  updateDevice: (id, data) => api.updateDevice(id, data),
  deleteDevice: (id) => api.deleteDevice(id),

  // Report methods
  generateAttendanceReport: (params) => api.generateAttendanceReport(params),
  generateLeaveReport: (params) => api.generateLeaveReport(params),
  generateEmployeeReport: (params) => api.generateEmployeeReport(params),
  exportReport: (reportType, params) => api.exportReport(reportType, params),

  // Document Generation methods
  getEmployeesForDocumentGeneration: () => api.getEmployeesForDocumentGeneration(),
  generateDocument: (data) => api.generateDocument(data),
  getGeneratedDocuments: (params) => api.getGeneratedDocuments(params),
  downloadDocumentPDF: (documentId) => api.downloadDocumentPDF(documentId),
  previewDocument: (data) => api.previewDocument(data),
  getMyDocuments: () => api.getMyDocuments(),
  sendDocumentEmail: (documentId) => api.sendDocumentEmail(documentId),
  deleteGeneratedDocument: (documentId) => api.deleteGeneratedDocument(documentId),
  getDocumentTemplates: () => api.getDocumentTemplates(),

  // Authentication methods
  login: (credentials) => api.login(credentials),
  logout: () => api.logout(),
  getProfile: () => api.getProfile(),
  updateProfile: (data) => api.updateProfile(data),
  changePassword: (data) => api.changePassword(data),
};

export { managerApi };
export default managerApi;

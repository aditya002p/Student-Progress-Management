/**
 * API Endpoint Constants
 * 
 * This file contains constants for all API endpoints used in the application.
 * Using these constants ensures consistency between frontend and backend.
 */

// Base API URL
const API_BASE_URL = '/api';

// Student endpoints
const STUDENTS_API = {
  BASE: `${API_BASE_URL}/students`,
  GET_ALL: `${API_BASE_URL}/students`,
  GET_BY_ID: (id) => `${API_BASE_URL}/students/${id}`,
  CREATE: `${API_BASE_URL}/students`,
  UPDATE: (id) => `${API_BASE_URL}/students/${id}`,
  DELETE: (id) => `${API_BASE_URL}/students/${id}`,
  GET_WITH_CODEFORCES_DATA: (id) => `${API_BASE_URL}/students/${id}/codeforces`,
  TOGGLE_REMINDERS: (id) => `${API_BASE_URL}/students/${id}/toggle-reminders`,
  GET_EMAIL_HISTORY: (id) => `${API_BASE_URL}/students/${id}/email-history`,
  REFRESH_CODEFORCES_DATA: (id) => `${API_BASE_URL}/students/${id}/refresh`
};

// Codeforces data endpoints
const CODEFORCES_API = {
  BASE: `${API_BASE_URL}/codeforces`,
  GET_CONTEST_HISTORY: (id) => `${API_BASE_URL}/codeforces/students/${id}/contests`,
  GET_PROBLEM_SOLVING_DATA: (id) => `${API_BASE_URL}/codeforces/students/${id}/problems`,
  GET_SUBMISSION_HEATMAP: (id) => `${API_BASE_URL}/codeforces/students/${id}/heatmap`,
  GET_UNSOLVED_PROBLEMS: (id) => `${API_BASE_URL}/codeforces/students/${id}/unsolved`,
  GET_RATING_DISTRIBUTION: (id) => `${API_BASE_URL}/codeforces/students/${id}/distribution`,
  GET_OVERALL_STATISTICS: (id) => `${API_BASE_URL}/codeforces/students/${id}/statistics`
};

// Cron job endpoints
const CRON_API = {
  BASE: `${API_BASE_URL}/cron`,
  GET_ALL: `${API_BASE_URL}/cron`,
  GET_BY_NAME: (name) => `${API_BASE_URL}/cron/${name}`,
  UPDATE: (name) => `${API_BASE_URL}/cron/${name}`,
  TRIGGER: (name) => `${API_BASE_URL}/cron/${name}/trigger`,
  RESET: `${API_BASE_URL}/cron/reset`,
  GET_HISTORY: (name) => `${API_BASE_URL}/cron/${name}/history`
};

// Export endpoints
const EXPORT_API = {
  BASE: `${API_BASE_URL}/export`,
  STUDENTS: `${API_BASE_URL}/export/students`,
  STUDENT_CODEFORCES_DATA: (id) => `${API_BASE_URL}/export/students/${id}/codeforces`,
  STUDENT_CONTESTS: (id) => `${API_BASE_URL}/export/students/${id}/contests`,
  STUDENT_SUBMISSIONS: (id) => `${API_BASE_URL}/export/students/${id}/submissions`,
  STUDENT_PROBLEMS: (id) => `${API_BASE_URL}/export/students/${id}/problems`,
  INACTIVE_STUDENTS: `${API_BASE_URL}/export/inactive`,
  EMAIL_HISTORY: `${API_BASE_URL}/export/email-history`
};

// Health check endpoint
const HEALTH_API = `${API_BASE_URL}/health`;

// Export all API constants
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    API_BASE_URL,
    STUDENTS_API,
    CODEFORCES_API,
    CRON_API,
    EXPORT_API,
    HEALTH_API
  };
}

import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    // Handle session timeout
    if (response && response.status === 401) {
      // Clear auth data
      Cookies.remove('auth_token');
      Cookies.remove('user');
      
      // Show message
      toast.error('Your session has expired. Please log in again.');
      
      // Redirect to login page
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        Router.push('/login');
      }
    }
    
    // Handle server errors
    if (response && response.status >= 500) {
      toast.error('A server error occurred. Please try again later.');
    }
    
    // Handle specific API errors
    if (response && response.data && response.data.detail) {
      toast.error(response.data.detail);
    }
    
    return Promise.reject(error);
  }
);

// Authentication API calls
export const auth = {
  login: async (credentials) => {
    const response = await api.post('/users/login/', credentials);
    return response.data;
  },
  
  verify2FA: async (userId, token) => {
    const response = await api.post('/users/verify-2fa/', { user_id: userId, token });
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/users/', userData);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/users/logout/');
    // Clear cookies
    Cookies.remove('auth_token');
    Cookies.remove('user');
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/users/me/');
    return response.data;
  },
  
  updateProfile: async (userData) => {
    const response = await api.patch('/users/me/', userData);
    return response.data;
  },
  
  setup2FA: async () => {
    const response = await api.post('/users/setup-2fa/');
    return response.data;
  },
  
  confirm2FA: async (token) => {
    const response = await api.post('/users/confirm-2fa/', { token });
    return response.data;
  },
  
  disable2FA: async (password) => {
    const response = await api.post('/users/disable-2fa/', { password });
    return response.data;
  },
};

// Healthcare API calls
export const healthcare = {
  getMedicalRecord: async (id) => {
    const response = await api.get(`/healthcare/medical-records/${id}/`);
    return response.data;
  },
  
  getMedicalRecords: async (patientId) => {
    const response = await api.get(`/healthcare/medical-records/?patient=${patientId}`);
    return response.data;
  },
  
  getMedications: async (medicalRecordId) => {
    const response = await api.get(`/healthcare/medications/?medical_record=${medicalRecordId}`);
    return response.data;
  },
  
  getAllergies: async (medicalRecordId) => {
    const response = await api.get(`/healthcare/allergies/?medical_record=${medicalRecordId}`);
    return response.data;
  },
  
  getConditions: async (medicalRecordId) => {
    const response = await api.get(`/healthcare/conditions/?medical_record=${medicalRecordId}`);
    return response.data;
  },
  
  getImmunizations: async (medicalRecordId) => {
    const response = await api.get(`/healthcare/immunizations/?medical_record=${medicalRecordId}`);
    return response.data;
  },
  
  getLabTests: async (medicalRecordId) => {
    const response = await api.get(`/healthcare/lab-tests/?medical_record=${medicalRecordId}`);
    return response.data;
  },
  
  getLabResults: async (testId) => {
    const response = await api.get(`/healthcare/lab-results/?lab_test=${testId}`);
    return response.data;
  },
  
  getVitalSigns: async (medicalRecordId) => {
    const response = await api.get(`/healthcare/vital-signs/?medical_record=${medicalRecordId}`);
    return response.data;
  },
};

// Telemedicine API calls
export const telemedicine = {
  getAppointments: async (options = {}) => {
    const params = new URLSearchParams();
    if (options.status) params.append('status', options.status);
    if (options.patientId) params.append('patient', options.patientId);
    if (options.providerId) params.append('provider', options.providerId);
    
    const response = await api.get(`/telemedicine/appointments/?${params.toString()}`);
    return response.data;
  },
  
  getUpcomingAppointments: async () => {
    const response = await api.get('/telemedicine/appointments/upcoming/');
    return response.data;
  },
  
  createAppointment: async (appointmentData) => {
    const response = await api.post('/telemedicine/appointments/', appointmentData);
    return response.data;
  },
  
  getAppointment: async (id) => {
    const response = await api.get(`/telemedicine/appointments/${id}/`);
    return response.data;
  },
  
  updateAppointment: async (id, appointmentData) => {
    const response = await api.patch(`/telemedicine/appointments/${id}/`, appointmentData);
    return response.data;
  },
  
  cancelAppointment: async (id, reason) => {
    const response = await api.post(`/telemedicine/appointments/${id}/cancel/`, { reason });
    return response.data;
  },
  
  getConsultation: async (id) => {
    const response = await api.get(`/telemedicine/consultations/${id}/`);
    return response.data;
  },
  
  getConsultationsByAppointment: async (appointmentId) => {
    const response = await api.get(`/telemedicine/consultations/?appointment=${appointmentId}`);
    return response.data;
  },
  
  startConsultation: async (consultationId) => {
    const response = await api.post(`/telemedicine/consultations/${consultationId}/start/`);
    return response.data;
  },
  
  endConsultation: async (consultationId, notes) => {
    const response = await api.post(`/telemedicine/consultations/${consultationId}/end/`, { notes });
    return response.data;
  },
  
  getJoinInfo: async (consultationId) => {
    const response = await api.get(`/telemedicine/consultations/${consultationId}/join_info/`);
    return response.data;
  },
  
  getPrescriptions: async (patientId) => {
    const response = await api.get(`/telemedicine/prescriptions/?patient=${patientId}`);
    return response.data;
  },
};

// Communication API calls
export const communication = {
  getConversations: async () => {
    const response = await api.get('/communication/conversations/');
    return response.data;
  },
  
  createConversation: async (conversationData) => {
    const response = await api.post('/communication/conversations/', conversationData);
    return response.data;
  },
  
  getMessages: async (conversationId) => {
    const response = await api.get(`/communication/conversations/${conversationId}/messages/`);
    return response.data;
  },
  
  sendMessage: async (messageData) => {
    const response = await api.post('/communication/messages/', messageData);
    return response.data;
  },
  
  getNotifications: async () => {
    const response = await api.get('/communication/notifications/');
    return response.data;
  },
  
  markNotificationAsRead: async (notificationId) => {
    const response = await api.post(`/communication/notifications/${notificationId}/mark_read/`);
    return response.data;
  },
};

// Wearables API calls
export const wearables = {
  getWithingsProfile: async () => {
    try {
      const response = await api.get('/wearables/withings/profile/');
      return response.data;
    } catch (error) {
      // Return null if profile doesn't exist (404)
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw error;
    }
  },
  
  connectWithings: async () => {
    const response = await api.get('/wearables/withings/connect/');
    return response.data;
  },
  
  fetchWithingsData: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await api.get(`/wearables/withings/fetch-data/?${params.toString()}`);
    return response.data;
  },
};

// Audit API calls (admin only)
export const audit = {
  getEvents: async (options = {}) => {
    const params = new URLSearchParams();
    if (options.userId) params.append('user', options.userId);
    if (options.eventType) params.append('event_type', options.eventType);
    if (options.resourceType) params.append('resource_type', options.resourceType);
    if (options.startDate) params.append('start_date', options.startDate);
    if (options.endDate) params.append('end_date', options.endDate);
    
    const response = await api.get(`/audit/events/?${params.toString()}`);
    return response.data;
  },
  
  exportEvents: async (options = {}) => {
    const params = new URLSearchParams();
    if (options.userId) params.append('user', options.userId);
    if (options.eventType) params.append('event_type', options.eventType);
    if (options.resourceType) params.append('resource_type', options.resourceType);
    if (options.startDate) params.append('start_date', options.startDate);
    if (options.endDate) params.append('end_date', options.endDate);
    
    const response = await api.post(`/audit/exports/?${params.toString()}`);
    return response.data;
  },
};

export default api;

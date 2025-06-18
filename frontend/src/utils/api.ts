import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface LoginResponse {
  user: {
    id: number;
    username: string;
    role: string;
    first_name: string;
    last_name: string;
    name?: string;
  };
  access: string;
  refresh: string;
  role: string;
}

interface RegisterResponse {
  message: string;
  user: {
    id: number;
    username: string;
    role: string;
    first_name: string;
    last_name: string;
    name?: string;
  };
  tokens?: {
    access: string;
    refresh: string;
  };
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: { username?: string; phone_number?: string; password: string }) => {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  },

  register: async (userData: {
    username: string;
    password: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    role?: string;
  }) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/me/');
    return response.data;
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/users/me/');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await api.patch('/users/me/', data);
    return response.data;
  },

  bookRide: async (rideData: any) => {
    const response = await api.post('/rides/', rideData);
    return response.data;
  },

  getMyRides: async () => {
    const response = await api.get('/rides/');
    return response.data;
  },
};

// Driver API
export const driverAPI = {
  updateLocation: async (location: { lat: number; lng: number }) => {
    const response = await api.patch('/users/me/', { current_location: location });
    return response.data;
  },

  updateAvailability: async (isAvailable: boolean) => {
    const response = await api.patch('/users/me/', { is_available: isAvailable });
    return response.data;
  },

  getRides: async () => {
    const response = await api.get('/rides/');
    return response.data;
  },

  getAssignedRides: async () => {
    const response = await api.get('/rides/');
    return response.data;
  },

  updateRideStatus: async (rideId: string, status: string) => {
    const response = await api.patch(`/rides/${rideId}/`, { status });
    return response.data;
  },

  updateCarDetails: async (carData: {
    car_type?: string;
    car_color?: string;
    license_plate?: string;
  }) => {
    const response = await api.patch('/users/me/', carData);
    return response.data;
  },

  acceptRide: async (rideId: string) => {
    const response = await api.post(`/rides/${rideId}/accept_ride/`);
    return response.data;
  },

  startRide: async (rideId: string) => {
    const response = await api.post(`/rides/${rideId}/start_ride/`);
    return response.data;
  },

  completeRide: async (rideId: string) => {
    const response = await api.post(`/rides/${rideId}/complete_ride/`);
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getUsers: async () => {
    const response = await api.get('/users/');
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get('/users/');
    return response.data;
  },

  getDrivers: async () => {
    const response = await api.get('/users/');
    return (response.data as any[]).filter((user: any) => user.role === 'driver');
  },

  getAllDrivers: async () => {
    const response = await api.get('/users/');
    return (response.data as any[]).filter((user: any) => user.role === 'driver');
  },

  getRides: async () => {
    const response = await api.get('/rides/');
    return response.data;
  },

  getRideHistory: async () => {
    const response = await api.get('/rides/');
    return response.data;
  },

  createDriver: async (driverData: {
    username: string;
    password: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    car_type: string;
    car_color: string;
    license_plate: string;
  }) => {
    const response = await api.post('/users/create_driver/', driverData);
    return response.data;
  },

  getDashboardStats: async () => {
    const [users, drivers, rides] = await Promise.all([
      api.get('/users/'),
      api.get('/users/'),
      api.get('/rides/'),
    ]);
    return {
      totalUsers: (users.data as any[]).filter((user: any) => user.role === 'user').length,
      totalDrivers: (drivers.data as any[]).filter((user: any) => user.role === 'driver').length,
      totalRides: (rides.data as any[]).length,
      activeRides: (rides.data as any[]).filter((ride: any) => ride.status === 'active').length,
      completedRides: (rides.data as any[]).filter((ride: any) => ride.status === 'completed').length,
    };
  },
};

// Payment API
export const paymentAPI = {
  createPaymentIntent: async (amount: number) => {
    const response = await api.post('/payments/create-intent/', { amount });
    return response.data;
  },

  confirmPayment: async (paymentIntentId: string) => {
    const response = await api.post('/payments/confirm/', { payment_intent_id: paymentIntentId });
    return response.data;
  },

  getPaymentHistory: async () => {
    const response = await api.get('/payments/history/');
    return response.data;
  },
};

export default api; 
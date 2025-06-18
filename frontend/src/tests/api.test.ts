import { authAPI, userAPI, driverAPI, adminAPI, paymentAPI } from '@/utils/api';

interface AuthResponse {
  token: string;
  role: string;
}

interface RideResponse {
  id: string;
  status: string;
}

interface LocationResponse {
  success: boolean;
}

interface PaymentIntentResponse {
  clientSecret: string;
}

interface PaymentConfirmationResponse {
  success: boolean;
}

describe('API Integration Tests', () => {
  let userToken: string;
  let driverToken: string;
  let adminToken: string;
  let testRideId: string;

  beforeAll(async () => {
    // Login as different user types
    const userResponse = await authAPI.login('user@test.com', 'password123') as AuthResponse;
    userToken = userResponse.token;

    const driverResponse = await authAPI.login('driver@test.com', 'password123') as AuthResponse;
    driverToken = driverResponse.token;

    const adminResponse = await authAPI.login('admin@test.com', 'password123') as AuthResponse;
    adminToken = adminResponse.token;
  });

  describe('User API', () => {
    test('Book a ride', async () => {
      const rideData = {
        pickup: 'Test Pickup Location',
        destination: 'Test Destination',
        time: new Date(),
      };

      const response = await userAPI.bookRide(rideData) as RideResponse;
      expect(response).toHaveProperty('id');
      testRideId = response.id;
    });

    test('Get user rides', async () => {
      const rides = await userAPI.getRides() as RideResponse[];
      expect(Array.isArray(rides)).toBe(true);
      expect(rides.length).toBeGreaterThan(0);
    });

    test('Cancel ride', async () => {
      const response = await userAPI.cancelRide(testRideId) as RideResponse;
      expect(response.status).toBe('cancelled');
    });
  });

  describe('Driver API', () => {
    test('Get available rides', async () => {
      const rides = await driverAPI.getAvailableRides() as RideResponse[];
      expect(Array.isArray(rides)).toBe(true);
    });

    test('Accept and complete ride', async () => {
      // Book a new ride first
      const rideData = {
        pickup: 'New Pickup',
        destination: 'New Destination',
        time: new Date(),
      };
      const ride = await userAPI.bookRide(rideData) as RideResponse;

      // Accept the ride
      const acceptResponse = await driverAPI.acceptRide(ride.id) as RideResponse;
      expect(acceptResponse.status).toBe('accepted');

      // Complete the ride
      const completeResponse = await driverAPI.completeRide(ride.id) as RideResponse;
      expect(completeResponse.status).toBe('completed');
    });

    test('Update location', async () => {
      const location = {
        latitude: 40.7128,
        longitude: -74.0060,
      };
      const response = await driverAPI.updateLocation(location) as LocationResponse;
      expect(response.success).toBe(true);
    });
  });

  describe('Admin API', () => {
    test('Get all users', async () => {
      const users = await adminAPI.getUsers() as any[];
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
    });

    test('Get all drivers', async () => {
      const drivers = await adminAPI.getDrivers() as any[];
      expect(Array.isArray(drivers)).toBe(true);
    });

    test('Get all rides', async () => {
      const rides = await adminAPI.getRides() as RideResponse[];
      expect(Array.isArray(rides)).toBe(true);
    });
  });

  describe('Payment API', () => {
    test('Create payment intent', async () => {
      const amount = 2000; // $20.00
      const response = await paymentAPI.createPaymentIntent(amount) as PaymentIntentResponse;
      expect(response).toHaveProperty('clientSecret');
    });

    test('Confirm payment', async () => {
      // This is a mock test since we can't actually confirm payments in test environment
      const mockPaymentIntentId = 'pi_mock_123';
      const response = await paymentAPI.confirmPayment(mockPaymentIntentId) as PaymentConfirmationResponse;
      expect(response.success).toBe(true);
    });
  });
}); 
import { jest } from '@jest/globals';

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
  [Symbol.iterator]: function* () {
    yield* [];
  },
} as unknown as Storage;

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

Object.defineProperty(global, 'window', {
  value: {
    location: {
      origin: 'http://localhost:3000',
    },
  },
});

process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api';
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_mock_key'; 
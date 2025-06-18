# 🚖 Taxi Booking Web Application

A full-stack taxi booking system built with Next.js, Django REST Framework, and PostgreSQL. This application provides three role-based portals for users, drivers, and administrators.

## Features

### User Portal
- Sign up and log in functionality
- Book rides by selecting pickup and destination locations
- View driver details and ride status
- Multiple payment options (Razorpay, PayPal, Google Pay, Cash)
- Submit ride feedback and ratings

### Driver Portal
- Secure login (credentials managed by admin)
- View and manage assigned rides
- Real-time ride status updates
- Confirm cash payments
- Track earnings and performance

### Admin Portal
- Comprehensive dashboard with statistics
- User and driver management
- View ride history and feedback
- Reset driver credentials
- Monitor system activity

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Google Maps API
- Payment integrations (Razorpay, PayPal, Google Pay)

### Backend
- Django REST Framework
- PostgreSQL
- JWT Authentication
- Real-time updates

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- Python (v3.8 or higher)
- PostgreSQL
- Git

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Frontend Environment Variables
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Backend Environment Variables (for Django)
DATABASE_URL=postgresql://username:password@localhost:5432/taxi_booking
SECRET_KEY=your_django_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ORIGIN_WHITELIST=http://localhost:3000
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/taxi-booking-app.git
cd taxi-booking-app
```

2. Install frontend dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
taxi-booking-app/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── user/
│   │   │   ├── book/
│   │   │   └── rides/
│   │   ├── driver/
│   │   └── admin/
│   ├── components/
│   │   ├── Map.tsx
│   │   └── PaymentModal.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   └── utils/
│       └── api.ts
├── public/
├── .env.local
├── package.json
└── README.md
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production application
- `npm start` - Start the production server
- `npm run lint` - Run ESLint for code quality
- `npm run test` - Run tests (when implemented)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Google Maps API for location services
- Payment gateway providers for seamless transactions
- The open-source community for various tools and libraries used in this project 
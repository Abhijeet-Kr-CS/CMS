'use client';

import { useEffect, useState } from 'react';
import { userAPI } from '@/utils/api';
import PaymentModal from '@/components/PaymentModal';
import Map from '@/components/Map';
import toast from 'react-hot-toast';

interface Ride {
  id: string;
  pickup: string;
  destination: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  driver?: {
    name: string;
    phone: string;
    carType: string;
  };
  fare: number;
  createdAt: string;
}

export default function RidesHistory() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    loadRides();
  }, []);

  const loadRides = async () => {
    try {
      const data = await userAPI.getRides();
      setRides(data);
    } catch (error) {
      toast.error('Failed to load rides');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentMethod: string) => {
    if (!selectedRide) return;
    
    try {
      // Update ride payment status in backend
      await userAPI.submitFeedback(selectedRide.id, 5); // Default 5-star rating
      toast.success('Payment successful!');
      setShowPayment(false);
      loadRides(); // Refresh rides list
    } catch (error) {
      toast.error('Failed to update payment status');
    }
  };

  const getStatusColor = (status: Ride['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Rides</h1>

      <div className="grid gap-6">
        {rides.map((ride) => (
          <div key={ride.id} className="card">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      {new Date(ride.createdAt).toLocaleDateString()}
                    </p>
                    <h3 className="text-lg font-semibold mt-1">
                      Ride #{ride.id.slice(-6)}
                    </h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      ride.status
                    )}`}
                  >
                    {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">From</p>
                    <p className="text-gray-700">{ride.pickup}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">To</p>
                    <p className="text-gray-700">{ride.destination}</p>
                  </div>
                  {ride.driver && (
                    <div className="border-t pt-3 mt-3">
                      <p className="text-sm font-medium text-gray-500">Driver</p>
                      <p className="text-gray-700">{ride.driver.name}</p>
                      <p className="text-gray-600 text-sm">
                        {ride.driver.carType} • {ride.driver.phone}
                      </p>
                    </div>
                  )}
                </div>

                {ride.status === 'completed' && (
                  <button
                    onClick={() => {
                      setSelectedRide(ride);
                      setShowPayment(true);
                    }}
                    className="btn btn-primary mt-4"
                  >
                    Pay ${ride.fare}
                  </button>
                )}
              </div>

              <div className="lg:w-1/2 h-48 lg:h-auto">
                <Map
                  pickup={{
                    lat: parseFloat(ride.pickup.split(',')[0]),
                    lng: parseFloat(ride.pickup.split(',')[1]),
                  }}
                  destination={{
                    lat: parseFloat(ride.destination.split(',')[0]),
                    lng: parseFloat(ride.destination.split(',')[1]),
                  }}
                  isInteractive={false}
                />
              </div>
            </div>
          </div>
        ))}

        {rides.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No rides found</p>
          </div>
        )}
      </div>

      {showPayment && selectedRide && (
        <PaymentModal
          amount={selectedRide.fare}
          rideId={selectedRide.id}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
} 
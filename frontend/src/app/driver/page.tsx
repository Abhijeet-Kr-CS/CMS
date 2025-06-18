'use client';

import { useEffect, useState } from 'react';
import { driverAPI } from '@/utils/api';
import Map from '@/components/Map';
import toast from 'react-hot-toast';

interface Ride {
  id: string;
  pickup: string;
  destination: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  user: {
    name: string;
    phone: string;
  };
  fare: number;
  createdAt: string;
}

export default function DriverDashboard() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [carInfo, setCarInfo] = useState({
    carType: '',
    carColor: '',
    licensePlate: '',
    carImage: null,
  });
  const [isUpdatingCar, setIsUpdatingCar] = useState(false);

  useEffect(() => {
    loadRides();
    // Poll for new rides every 30 seconds
    const interval = setInterval(loadRides, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadRides = async () => {
    try {
      const data = await driverAPI.getAssignedRides();
      setRides(data);
    } catch (error) {
      toast.error('Failed to load rides');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (rideId: string, status: string) => {
    try {
      await driverAPI.updateRideStatus(rideId, status);
      toast.success(`Ride ${status} successfully`);
      loadRides();
    } catch (error) {
      toast.error('Failed to update ride status');
    }
  };

  const handlePaymentConfirmation = async (rideId: string) => {
    try {
      await driverAPI.confirmPayment(rideId, 'cash');
      toast.success('Payment confirmed');
      loadRides();
    } catch (error) {
      toast.error('Failed to confirm payment');
    }
  };

  const handleCarChange = (e) => {
    const { name, value, files } = e.target;
    setCarInfo((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleUpdateCar = async (e) => {
    e.preventDefault();
    setIsUpdatingCar(true);
    try {
      const formData = new FormData();
      Object.entries(carInfo).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      await driverAPI.updateCarInfo(formData);
      toast.success('Car info updated!');
    } catch (err) {
      toast.error('Failed to update car info.');
    } finally {
      setIsUpdatingCar(false);
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {rides.map((ride) => (
            <div
              key={ride.id}
              className={`card cursor-pointer transition-shadow hover:shadow-lg ${
                selectedRide?.id === ride.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedRide(ride)}
            >
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
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    ride.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : ride.status === 'accepted'
                      ? 'bg-blue-100 text-blue-800'
                      : ride.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Customer</p>
                  <p className="text-gray-700">{ride.user.name}</p>
                  <p className="text-gray-600 text-sm">{ride.user.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">From</p>
                  <p className="text-gray-700">{ride.pickup}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">To</p>
                  <p className="text-gray-700">{ride.destination}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Fare</p>
                  <p className="text-gray-700">${ride.fare}</p>
                </div>
              </div>

              <div className="mt-6 space-x-4">
                {ride.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(ride.id, 'accepted')}
                      className="btn btn-primary"
                    >
                      Accept Ride
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(ride.id, 'cancelled')}
                      className="btn bg-red-600 text-white hover:bg-red-700"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {ride.status === 'accepted' && (
                  <button
                    onClick={() => handleStatusUpdate(ride.id, 'completed')}
                    className="btn btn-primary"
                  >
                    Complete Ride
                  </button>
                )}
                {ride.status === 'completed' && (
                  <button
                    onClick={() => handlePaymentConfirmation(ride.id)}
                    className="btn btn-primary"
                  >
                    Confirm Cash Payment
                  </button>
                )}
              </div>
            </div>
          ))}

          {rides.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No rides assigned yet</p>
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-8">
          {selectedRide ? (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Route Map</h2>
              <Map
                pickup={{
                  lat: parseFloat(selectedRide.pickup.split(',')[0]),
                  lng: parseFloat(selectedRide.pickup.split(',')[1]),
                }}
                destination={{
                  lat: parseFloat(selectedRide.destination.split(',')[0]),
                  lng: parseFloat(selectedRide.destination.split(',')[1]),
                }}
                isInteractive={false}
              />
            </div>
          ) : (
            <div className="card">
              <p className="text-gray-500 text-center">
                Select a ride to view the route map
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="card mt-8 max-w-lg mx-auto">
        <h2 className="text-xl font-bold mb-2">Update Car Information</h2>
        <form className="space-y-3" onSubmit={handleUpdateCar}>
          <select name="carType" value={carInfo.carType} onChange={handleCarChange} className="input w-full">
            <option value="">Select Car Type</option>
            <option value="mini">Mini</option>
            <option value="sedan">Sedan</option>
            <option value="prime sedan">Prime Sedan</option>
          </select>
          <input type="text" name="carColor" placeholder="Car Color" value={carInfo.carColor} onChange={handleCarChange} className="input w-full" required />
          <input type="text" name="licensePlate" placeholder="License Plate" value={carInfo.licensePlate} onChange={handleCarChange} className="input w-full" required />
          <input type="file" name="carImage" accept="image/*" onChange={handleCarChange} className="input w-full" />
          <button type="submit" className="btn btn-primary w-full" disabled={isUpdatingCar}>{isUpdatingCar ? 'Updating...' : 'Update Car Info'}</button>
        </form>
      </div>
    </div>
  );
} 
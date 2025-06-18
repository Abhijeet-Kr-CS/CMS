'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userAPI } from '@/utils/api';

interface Ride {
  id: number;
  pickup_location: string;
  dropoff_location: string;
  status: string;
  requested_at: string;
  driver?: {
    first_name: string;
    last_name: string;
    phone_number: string;
    car_type: string;
    car_color: string;
    license_plate: string;
  };
}

export default function UserBookingPage() {
  const { user, logout } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBookRide, setShowBookRide] = useState(false);
  const [newRide, setNewRide] = useState({
    pickup_location: '',
    dropoff_location: '',
  });

  useEffect(() => {
    if (user?.role !== 'user') {
      window.location.href = '/login';
      return;
    }
    loadRides();
  }, [user]);

  const loadRides = async () => {
    try {
      const ridesData = await userAPI.getMyRides();
      setRides(ridesData as Ride[]);
    } catch (error) {
      console.error('Error loading rides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookRide = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userAPI.bookRide(newRide);
      setShowBookRide(false);
      setNewRide({
        pickup_location: '',
        dropoff_location: '',
      });
      loadRides();
      alert('Ride booked successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to book ride');
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Book a Ride</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span>Welcome, {user?.first_name}</span>
              <button
                onClick={() => setShowBookRide(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Book New Ride
              </button>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Book Ride Modal */}
        {showBookRide && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Book a New Ride</h3>
                <form onSubmit={handleBookRide} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Pickup Location"
                    value={newRide.pickup_location}
                    onChange={(e) => setNewRide({...newRide, pickup_location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Dropoff Location"
                    value={newRide.dropoff_location}
                    onChange={(e) => setNewRide({...newRide, dropoff_location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Book Ride
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBookRide(false)}
                      className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* My Rides */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">My Rides</h3>
          </div>
          {rides.length === 0 ? (
            <div className="px-4 py-5 text-center text-gray-500">
              No rides yet. Book your first ride!
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {rides.map((ride) => (
                <li key={ride.id} className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          Ride #{ride.id}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ride.status === 'completed' ? 'bg-green-100 text-green-800' :
                          ride.status === 'started' ? 'bg-blue-100 text-blue-800' :
                          ride.status === 'accepted' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {ride.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        From: {ride.pickup_location}
                      </p>
                      <p className="text-sm text-gray-500">
                        To: {ride.dropoff_location}
                      </p>
                      {ride.driver && (
                        <div className="mt-2 p-2 bg-gray-50 rounded">
                          <p className="text-sm font-medium text-gray-900">
                            Driver: {ride.driver.first_name} {ride.driver.last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Car: {ride.driver.car_type} • {ride.driver.car_color} • {ride.driver.license_plate}
                          </p>
                          <p className="text-sm text-gray-500">
                            Phone: {ride.driver.phone_number}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
} 
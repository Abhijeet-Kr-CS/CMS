'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/utils/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Driver extends User {
  carType: string;
  phone: string;
  totalRides: number;
  rating: number;
  is_available: boolean;
}

interface Ride {
  id: string;
  pickup: string;
  destination: string;
  status: string;
  fare: number;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  driver?: {
    name: string;
    email: string;
  };
}

interface Stats {
  totalUsers: number;
  totalDrivers: number;
  totalRides: number;
  activeRides: number;
  completedRides: number;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'drivers' | 'rides'>('users');
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [newDriver, setNewDriver] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    car_type: '',
    car_color: '',
    license_plate: '',
  });
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      window.location.href = '/login';
      return;
    }
    loadData();
    fetchRecentUsers();
  }, [user]);

  const loadData = async () => {
    try {
      const [usersData, driversData, ridesData, statsData] = await Promise.all([
        adminAPI.getAllUsers(),
        adminAPI.getAllDrivers(),
        adminAPI.getRideHistory(),
        adminAPI.getDashboardStats(),
      ]);
      setUsers(usersData);
      setDrivers(driversData);
      setRides(ridesData);
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentUsers = async () => {
    setLoadingUsers(true);
    try {
      const users = await adminAPI.getUsers();
      setUsers(users);
    } catch (err) {
      // Optionally handle error
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleResetDriverCredentials = async (driverId: string) => {
    try {
      await adminAPI.resetDriverCredentials(driverId);
      toast.success('Driver credentials reset successfully');
    } catch (error) {
      toast.error('Failed to reset driver credentials');
    }
  };

  const handleDriverChange = (e) => {
    const { name, value, files } = e.target;
    setNewDriver((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAPI.createDriver(newDriver);
      setShowAddDriver(false);
      setNewDriver({
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        car_type: '',
        car_color: '',
        license_plate: '',
      });
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create driver');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span>Welcome, {user?.first_name}</span>
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
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
                    <div className="text-sm font-medium text-gray-500">Total Users</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl font-bold text-gray-900">{stats.totalDrivers}</div>
                    <div className="text-sm font-medium text-gray-500">Total Drivers</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl font-bold text-gray-900">{stats.totalRides}</div>
                    <div className="text-sm font-medium text-gray-500">Total Rides</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl font-bold text-gray-900">{stats.activeRides}</div>
                    <div className="text-sm font-medium text-gray-500">Active Rides</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl font-bold text-gray-900">{stats.completedRides}</div>
                    <div className="text-sm font-medium text-gray-500">Completed Rides</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Driver Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddDriver(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Add New Driver
          </button>
        </div>

        {/* Add Driver Modal */}
        {showAddDriver && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Driver</h3>
                <form onSubmit={handleAddDriver} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Username"
                    value={newDriver.username}
                    onChange={(e) => setNewDriver({...newDriver, username: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={newDriver.password}
                    onChange={(e) => setNewDriver({...newDriver, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                  <input
                    type="text"
                    placeholder="First Name"
                    value={newDriver.first_name}
                    onChange={(e) => setNewDriver({...newDriver, first_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={newDriver.last_name}
                    onChange={(e) => setNewDriver({...newDriver, last_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={newDriver.phone_number}
                    onChange={(e) => setNewDriver({...newDriver, phone_number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Car Type"
                    value={newDriver.car_type}
                    onChange={(e) => setNewDriver({...newDriver, car_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Car Color"
                    value={newDriver.car_color}
                    onChange={(e) => setNewDriver({...newDriver, car_color: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                  <input
                    type="text"
                    placeholder="License Plate"
                    value={newDriver.license_plate}
                    onChange={(e) => setNewDriver({...newDriver, license_plate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Add Driver
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddDriver(false)}
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

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('drivers')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'drivers'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Drivers
              </button>
              <button
                onClick={() => setActiveTab('rides')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'rides'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Rides
              </button>
            </nav>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'drivers' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Car Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {drivers.map((driver) => (
                    <tr key={driver.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {driver.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{driver.email}</div>
                        <div className="text-sm text-gray-500">{driver.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {driver.carType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {driver.totalRides} rides
                        </div>
                        <div className="text-sm text-gray-500">
                          {driver.rating.toFixed(1)} ⭐
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleResetDriverCredentials(driver.id.toString())}
                          className="text-primary hover:text-primary/80"
                        >
                          Reset Password
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'rides' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ride ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fare
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rides.map((ride) => (
                    <tr key={ride.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{ride.id.slice(-6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {ride.user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {ride.user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {ride.driver ? (
                          <>
                            <div className="text-sm text-gray-900">
                              {ride.driver.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {ride.driver.email}
                            </div>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500">
                            Not assigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            ride.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : ride.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : ride.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {ride.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${ride.fare}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(ride.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4">Recent Signups</h2>
          {loadingUsers ? (
            <div>Loading users...</div>
          ) : users.length === 0 ? (
            <div>No users found.</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left">Name</th>
                  <th className="px-2 py-1 text-left">Mobile</th>
                  <th className="px-2 py-1 text-left">Signup Date</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr key={user.id} className="border-t">
                    <td className="px-2 py-1">{user.name}</td>
                    <td className="px-2 py-1">{user.phone}</td>
                    <td className="px-2 py-1">{user.createdAt ? new Date(user.createdAt).toLocaleString() : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
} 
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:8000';

class SocketService {
  private socket: Socket | null = null;
  private locationUpdateInterval: NodeJS.Timeout | null = null;

  connect(token: string) {
    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      this.stopLocationUpdates();
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.stopLocationUpdates();
  }

  // Start sending location updates (for drivers)
  startLocationUpdates() {
    if (!this.socket) return;

    this.locationUpdateInterval = setInterval(() => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.socket?.emit('location_update', {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            console.error('Error getting location:', error);
          }
        );
      }
    }, 10000); // Update every 10 seconds
  }

  // Stop sending location updates
  stopLocationUpdates() {
    if (this.locationUpdateInterval) {
      clearInterval(this.locationUpdateInterval);
      this.locationUpdateInterval = null;
    }
  }

  // Subscribe to driver location updates (for users)
  subscribeToDriverLocation(driverId: string, callback: (location: any) => void) {
    if (!this.socket) return;

    this.socket.on(`driver_location_${driverId}`, callback);
    this.socket.emit('subscribe_to_driver', { driverId });
  }

  // Unsubscribe from driver location updates
  unsubscribeFromDriverLocation(driverId: string) {
    if (!this.socket) return;

    this.socket.off(`driver_location_${driverId}`);
    this.socket.emit('unsubscribe_from_driver', { driverId });
  }
}

export const socketService = new SocketService(); 
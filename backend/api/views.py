from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Ride, RideLocation, Payment
from .serializers import (
    UserSerializer,
    DriverUpdateSerializer,
    RideSerializer,
    RideLocationSerializer,
    PaymentSerializer
)
from rest_framework.permissions import IsAuthenticated

User = get_user_model()

class IsDriverOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['driver', 'admin']

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'admin'

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return User.objects.all()
        return User.objects.filter(id=user.id)

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update'] and self.request.user.role == 'driver':
            return DriverUpdateSerializer
        return UserSerializer

    @action(detail=False, methods=['get'])
    def available_drivers(self, request):
        drivers = User.objects.filter(role='driver', is_available=True)
        serializer = self.get_serializer(drivers, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsAdmin])
    def create_driver(self, request):
        """Admin endpoint to create a new driver"""
        data = request.data.copy()
        data['role'] = 'driver'
        
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            # Set password if provided
            password = data.get('password')
            if password:
                user.set_password(password)
                user.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_car_details(self, request, pk=None):
        """Driver endpoint to update car details"""
        if request.user.role != 'driver':
            return Response({'error': 'Only drivers can update car details'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        user = self.get_object()
        if user.id != request.user.id:
            return Response({'error': 'You can only update your own details'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        serializer = DriverUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get current user details"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class RideViewSet(viewsets.ModelViewSet):
    queryset = Ride.objects.all()
    serializer_class = RideSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Ride.objects.all()
        elif user.role == 'driver':
            return Ride.objects.filter(driver=user)
        return Ride.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def accept_ride(self, request, pk=None):
        ride = self.get_object()
        if ride.status != 'requested':
            return Response(
                {'error': 'Ride cannot be accepted'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        ride.driver = request.user
        ride.status = 'accepted'
        ride.save()
        return Response(RideSerializer(ride).data)

    @action(detail=True, methods=['post'])
    def start_ride(self, request, pk=None):
        ride = self.get_object()
        if ride.status != 'accepted':
            return Response(
                {'error': 'Ride cannot be started'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        ride.status = 'started'
        ride.started_at = timezone.now()
        ride.save()
        return Response(RideSerializer(ride).data)

    @action(detail=True, methods=['post'])
    def complete_ride(self, request, pk=None):
        ride = self.get_object()
        if ride.status != 'started':
            return Response(
                {'error': 'Ride cannot be completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        ride.status = 'completed'
        ride.completed_at = timezone.now()
        ride.save()
        return Response(RideSerializer(ride).data)

    @action(detail=True, methods=['post'])
    def cancel_ride(self, request, pk=None):
        ride = self.get_object()
        if ride.status in ['completed', 'cancelled']:
            return Response(
                {'error': 'Ride cannot be cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        ride.status = 'cancelled'
        ride.cancellation_reason = request.data.get('reason', '')
        ride.save()
        return Response(RideSerializer(ride).data)

class RideLocationViewSet(viewsets.ModelViewSet):
    queryset = RideLocation.objects.all()
    serializer_class = RideLocationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RideLocation.objects.filter(ride_id=self.kwargs['ride_pk'])

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Payment.objects.all()
        elif user.role == 'driver':
            return Payment.objects.filter(ride__driver=user)
        return Payment.objects.filter(ride__user=user)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

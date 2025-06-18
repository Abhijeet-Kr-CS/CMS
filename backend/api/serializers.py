from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Ride, RideLocation, Payment

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role',
                 'phone_number', 'profile_picture', 'car_type', 'car_color',
                 'license_plate', 'is_available', 'current_location', 'address')
        read_only_fields = ('id',)
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

class DriverUpdateSerializer(serializers.ModelSerializer):
    """Serializer for drivers to update their car details"""
    class Meta:
        model = User
        fields = ('car_type', 'car_color', 'license_plate', 'is_available', 'current_location')

class RideLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = RideLocation
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

class RideSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    driver = UserSerializer(read_only=True)
    locations = RideLocationSerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)

    class Meta:
        model = Ride
        fields = '__all__'
        read_only_fields = ('id', 'user', 'driver', 'requested_at', 'started_at',
                           'completed_at', 'status', 'payment_status', 'final_fare',
                           'payment_id', 'locations', 'payments') 
from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username_or_phone = request.data.get('username') or request.data.get('phone_number')
    password = request.data.get('password')
    
    if not username_or_phone or not password:
        return Response({'error': 'Username/phone number and password are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Try to authenticate with username first, then phone number
    user = authenticate(username=username_or_phone, password=password)
    
    if user is None:
        # Try to find user by phone number
        try:
            user = User.objects.get(phone_number=username_or_phone)
            if user.check_password(password):
                # User found by phone number and password is correct
                pass
            else:
                user = None
        except User.DoesNotExist:
            user = None
    
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'role': user.role,
                'phone_number': user.phone_number,
            }
        })
    else:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    first_name = request.data.get('first_name')
    last_name = request.data.get('last_name')
    phone_number = request.data.get('phone_number')
    role = request.data.get('role', 'user')
    
    if not username or not password:
        return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if user already exists
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    if phone_number and User.objects.filter(phone_number=phone_number).exists():
        return Response({'error': 'Phone number already exists'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Create user
    user = User.objects.create_user(
        username=username,
        password=password,
        email=email,
        first_name=first_name,
        last_name=last_name,
        phone_number=phone_number,
        role=role
    )
    
    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'role': user.role,
            'phone_number': user.phone_number,
        }
    }, status=status.HTTP_201_CREATED) 
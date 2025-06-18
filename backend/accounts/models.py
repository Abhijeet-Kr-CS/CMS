from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('driver', 'Driver'),
        ('admin', 'Admin'),
    ]
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    phone_number = models.CharField(max_length=15, unique=True, null=True, blank=True)
    
    # Driver-specific fields
    car_type = models.CharField(max_length=50, null=True, blank=True)
    car_color = models.CharField(max_length=50, null=True, blank=True)
    license_plate = models.CharField(max_length=20, null=True, blank=True)
    car_image = models.ImageField(upload_to='car_images/', null=True, blank=True)
    is_available = models.BooleanField(default=True)
    current_location = models.JSONField(null=True, blank=True)
    
    # Additional fields
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    
    class Meta:
        db_table = 'accounts_user'
    
    def __str__(self):
        return f"{self.username} ({self.role})" 
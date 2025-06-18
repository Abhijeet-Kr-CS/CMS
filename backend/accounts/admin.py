from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'phone_number', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'phone_number')
    ordering = ('username',)
    
    fieldsets = UserAdmin.fieldsets + (
        ('Taxi App Fields', {
            'fields': ('role', 'phone_number', 'car_type', 'car_color', 'license_plate', 
                      'car_image', 'is_available', 'current_location', 'profile_picture', 'address')
        }),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Taxi App Fields', {
            'fields': ('role', 'phone_number', 'car_type', 'car_color', 'license_plate', 
                      'car_image', 'is_available', 'current_location', 'profile_picture', 'address')
        }),
    ) 
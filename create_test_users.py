#!/usr/bin/env python
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'taxi_project.settings')
django.setup()

from accounts.models import User

def create_test_users():
    # Create admin user
    admin_user, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@example.com',
            'first_name': 'Admin',
            'last_name': 'User',
            'role': 'admin',
            'phone_number': '1234567890',
            'is_staff': True,
            'is_superuser': True,
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print(f"Created admin user: {admin_user.username}")
    else:
        print(f"Admin user already exists: {admin_user.username}")

    # Create driver user
    driver_user, created = User.objects.get_or_create(
        username='driver',
        defaults={
            'email': 'driver@example.com',
            'first_name': 'Driver',
            'last_name': 'User',
            'role': 'driver',
            'phone_number': '1234567891',
            'is_available': True,
        }
    )
    if created:
        driver_user.set_password('driver123')
        driver_user.save()
        print(f"Created driver user: {driver_user.username}")
    else:
        print(f"Driver user already exists: {driver_user.username}")

    # Create regular user
    user_user, created = User.objects.get_or_create(
        username='user',
        defaults={
            'email': 'user@example.com',
            'first_name': 'Regular',
            'last_name': 'User',
            'role': 'user',
            'phone_number': '1234567892',
        }
    )
    if created:
        user_user.set_password('user123')
        user_user.save()
        print(f"Created user: {user_user.username}")
    else:
        print(f"User already exists: {user_user.username}")

if __name__ == '__main__':
    create_test_users()
    print("\nTest users created successfully!")
    print("You can now use these credentials to test the application:")
    print("Admin: username=admin, password=admin123")
    print("Driver: username=driver, password=driver123")
    print("User: username=user, password=user123") 
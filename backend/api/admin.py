from django.contrib import admin
from .models import Ride, RideLocation, Payment

@admin.register(Ride)
class RideAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'driver', 'status', 'payment_status', 'requested_at')
    list_filter = ('status', 'payment_status')
    search_fields = ('user__username', 'driver__username')
    date_hierarchy = 'requested_at'

@admin.register(RideLocation)
class RideLocationAdmin(admin.ModelAdmin):
    list_display = ('ride', 'latitude', 'longitude', 'timestamp')
    list_filter = ('timestamp',)
    search_fields = ('ride__id',)

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('ride', 'amount', 'payment_method', 'status', 'timestamp')
    list_filter = ('payment_method', 'status', 'timestamp')
    search_fields = ('ride__id', 'transaction_id')

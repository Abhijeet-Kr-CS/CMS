from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'rides', views.RideViewSet)
router.register(r'ride-locations', views.RideLocationViewSet)
router.register(r'payments', views.PaymentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/', include('accounts.urls')),  # This includes token endpoints
    path('users/me/', views.get_current_user, name='current-user'),
] 
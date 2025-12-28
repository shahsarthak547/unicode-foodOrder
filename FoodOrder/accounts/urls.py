from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('auth/login/', TokenObtainPairView.as_view(), name='staff-login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
]

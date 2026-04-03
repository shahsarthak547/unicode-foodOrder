from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

urlpatterns = [
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='staff-login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
]

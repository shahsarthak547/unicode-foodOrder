from django.urls import path
from .views import OrderStatusView, CreateOrderView

urlpatterns = [
    path('orders/<int:order_id>/', OrderStatusView.as_view()),
]

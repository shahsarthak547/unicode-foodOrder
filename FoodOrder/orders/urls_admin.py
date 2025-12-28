# orders/urls_admin.py
from django.urls import path
from .views_admin import AdminOrderListView, AdminOrderUpdateView

urlpatterns = [
    path('orders/', AdminOrderListView.as_view(), name='admin-orders'),
    path('orders/<int:order_id>/', AdminOrderUpdateView.as_view(), name='admin-order-update'),
]

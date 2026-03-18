from django.urls import path
from .views import OrderStatusView, OrderReviewView, OrderAnalyticsView, OrderVerifyPaymentView

urlpatterns = [
    path('orders/<int:order_id>/', OrderStatusView.as_view()),
    path('orders/<int:order_id>/review/', OrderReviewView.as_view()),
    path('orders/<int:order_id>/verify/', OrderVerifyPaymentView.as_view()),
    path('restaurants/<int:restaurant_id>/analytics/', OrderAnalyticsView.as_view()),
]

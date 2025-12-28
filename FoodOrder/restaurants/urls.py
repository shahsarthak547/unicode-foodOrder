from django.urls import path
from .views import RestaurantMenuView, RestaurantDetailView
from orders.views import CreateOrderView
urlpatterns = [
    path('restaurants/<int:restaurant_id>/menu/', RestaurantMenuView.as_view(), name='restaurant-menu'),
    path('restaurants/<int:restaurant_id>/', RestaurantDetailView.as_view(), name='restaurant-detail'),
    path('restaurants/<int:restaurant_id>/orders/', CreateOrderView.as_view(), name='create-order'),
]

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Order
from .serializers import OrderSerializer
from accounts.permissions import IsRestaurantStaff
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

class AdminOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsRestaurantStaff]

    def get_queryset(self):
        restaurant = self.request.user.restaurant
        return Order.objects.filter(restaurant=restaurant).order_by('-created_at')


class AdminOrderUpdateView(generics.UpdateAPIView):
    serializer_class = OrderSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsRestaurantStaff]
    lookup_url_kwarg = 'order_id'

    def get_queryset(self):
        return Order.objects.filter(restaurant=self.request.user.restaurant)

    def update(self, request, *args, **kwargs):
        order = self.get_object()

        status_value = request.data.get("status")
        valid_statuses = dict(Order.STATUS_CHOICES).keys()

        if status_value not in valid_statuses:
            return Response({"detail": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)

        order.status = status_value
        order.save()

        order_data = OrderSerializer(order).data

        # Broadcast order status update to the restaurant group
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'restaurant_{order.restaurant.id}_orders',
            {
                'type': 'order_message',
                'message': {
                    'action': 'order_updated',
                    'order': order_data
                }
            }
        )

        return Response(order_data)

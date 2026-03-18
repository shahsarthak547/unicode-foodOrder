from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from restaurants.models import Restaurant
from .serializers import OrderCreateSerializer, OrderSerializer, OrderReviewSerializer
from .models import Order
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db.models import Count, Sum, Avg

class CreateOrderView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request, restaurant_id):
        try:
            restaurant = Restaurant.objects.get(id=restaurant_id)
        except Restaurant.DoesNotExist:
            return Response({'detail': 'Restaurant not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = OrderCreateSerializer(data=request.data, context={'restaurant': restaurant})
        if serializer.is_valid():
            order = serializer.save()
            order_data = OrderSerializer(order).data
            
            # Broadcast to staff that a new order arrived
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'restaurant_{restaurant_id}_orders',
                {
                    'type': 'order_message',
                    'message': {
                        'action': 'order_created',
                        'order': order_data
                    }
                }
            )

            return Response(order_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OrderStatusView(generics.RetrieveAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'order_id'

class OrderReviewView(generics.UpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderReviewSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'order_id'
    authentication_classes = []
    permission_classes = []

    def patch(self, request, *args, **kwargs):
        # Allow patching only if order is COMPLETED
        order = self.get_object()
        if order.status != 'COMPLETED':
            return Response({'detail': 'Can only review completed orders'}, status=status.HTTP_400_BAD_REQUEST)
        return super().patch(request, *args, **kwargs)

from django.db.models import Count, Sum, Avg, F

class OrderVerifyPaymentView(APIView):
    authentication_classes = []
    permission_classes = []

    def patch(self, request, order_id):
        try:
            order = Order.objects.get(id=order_id)
            order.payment_status = 'PAID'
            order.save()
            
            # Broadcast update
            order_data = OrderSerializer(order).data
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
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

class OrderAnalyticsView(APIView):
    def get(self, request, restaurant_id):
        # We need to sum (price * quantity)
        orders = Order.objects.filter(restaurant_id=restaurant_id, payment_status='PAID')
        
        # Calculate revenue by summing (OrderItem.price_at_order * OrderItem.quantity)
        from .models import OrderItem
        revenue_data = OrderItem.objects.filter(order__restaurant_id=restaurant_id, order__payment_status='PAID') \
            .aggregate(total=Sum(F('price_at_order') * F('quantity')))
            
        total_revenue = revenue_data['total'] or 0
        order_count = orders.count()
        avg_rating = orders.aggregate(avg=Avg('rating'))['avg'] or 0
        
        # Most popular items
        popular_items = OrderItem.objects.filter(order__restaurant_id=restaurant_id, order__payment_status='PAID') \
            .values('menu_item__name') \
            .annotate(total_sold=Sum('quantity')) \
            .order_by('-total_sold')[:5]

        return Response({
            'total_revenue': float(total_revenue),
            'order_count': order_count,
            'average_rating': round(float(avg_rating), 1),
            'popular_items': list(popular_items)
        })
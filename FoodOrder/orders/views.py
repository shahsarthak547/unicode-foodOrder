from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from restaurants.models import Restaurant
from .serializers import OrderCreateSerializer, OrderSerializer
from .models import Order
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
            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class OrderStatusView(generics.RetrieveAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'order_id'
# restaurants/views_customer.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Restaurant, MenuCategory, MenuItem
from .serializers import MenuItemSerializer   # ✅ IMPORT SERIALIZER


class RestaurantMenuView(APIView):
    """
    Customer menu API
    GET /api/restaurants/<restaurant_id>/menu/
    """

    def get(self, request, restaurant_id):
        try:
            restaurant = Restaurant.objects.get(id=restaurant_id)
        except Restaurant.DoesNotExist:
            return Response(
                {"detail": "Restaurant not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        response_data = {
            "restaurant": restaurant.name,
            "menu": []
        }
        # 1️⃣ Get categories
        categories = MenuCategory.objects.filter(restaurant=restaurant)

        for category in categories:
            items_qs = MenuItem.objects.filter(
                restaurant=restaurant,
                category=category,
                is_available=True
            )

            # ✅ SERIALIZE WITH REQUEST CONTEXT
            items_serializer = MenuItemSerializer(
                items_qs,
                many=True,
                context={"request": request}
            )

            response_data["menu"].append({
                "id": category.id,
                "name": category.name,
                "items": items_serializer.data
            })

        # 2️⃣ Uncategorized → Others
        uncategorized_qs = MenuItem.objects.filter(
            restaurant=restaurant,
            category__isnull=True,
            is_available=True
        )

        if uncategorized_qs.exists():
            uncategorized_serializer = MenuItemSerializer(
                uncategorized_qs,
                many=True,
                context={"request": request}
            )

            response_data["menu"].append({
                "id": None,
                "name": "Others",
                "items": uncategorized_serializer.data
            })

        return Response(response_data)
class RestaurantDetailView(APIView):
    """
    GET /api/restaurants/<id>/
    """

    def get(self, request, restaurant_id):
        try:
            restaurant = Restaurant.objects.get(id=restaurant_id)
        except Restaurant.DoesNotExist:
            return Response(
                {"detail": "Restaurant not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response({
            "id": restaurant.id,
            "name": restaurant.name,
            "tagline": getattr(restaurant, "tagline", ""),
            # "logo": restaurant.logo.url if getattr(restaurant, "logo", None) else None
        })
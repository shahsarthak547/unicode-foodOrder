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
        categories = MenuCategory.objects.filter(restaurant=restaurant)

        for category in categories:
            items_qs = MenuItem.objects.filter(
                restaurant=restaurant,
                category=category,
                is_available=True
            )
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

        # Custom priority-based sorting for categories
        def get_priority(name):
            name = name.lower()
            # 0: Hot/Cold Brews & Basic Drinks first
            if any(k in name for k in ["brew", "coffee", "tea", "drink", "beverage", "hot", "cold"]):
                return 0
            # 4: Add-ons / Extras last
            if any(k in name for k in ["add-on", "addon", "extra", "add ons"]):
                return 4
            # 2: Desserts and Sweets at the end (before add-ons)
            if any(k in name for k in ["dessert", "sweet", "cake", "pastry", "bakery", "shake"]):
                return 2
            # 3: "Others" category
            if name == "others":
                return 3
            # 1: All other food items (Burgers, Pasta, etc.)
            return 1

        response_data["menu"].sort(key=lambda x: get_priority(x["name"]))

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
        })
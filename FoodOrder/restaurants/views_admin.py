import csv
import io
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import MultiPartParser, FormParser
from .models import MenuItem
from .serializers import MenuItemSerializer
from accounts.permissions import IsRestaurantStaff


class AdminMenuListCreateView(generics.ListCreateAPIView):
    serializer_class = MenuItemSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsRestaurantStaff]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return MenuItem.objects.filter(
            restaurant=self.request.user.restaurant
        )

    def perform_create(self, serializer):
        serializer.save(
            restaurant=self.request.user.restaurant
        )

class AdminMenuUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MenuItemSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsRestaurantStaff]
    parser_classes = [MultiPartParser, FormParser]
    def get_queryset(self):
        return MenuItem.objects.filter(
            restaurant=self.request.user.restaurant
        )
class AdminMenuCSVUploadView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsRestaurantStaff]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get("file")

        if not file:
            return Response(
                {"detail": "CSV file required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            decoded_file = file.read().decode("utf-8")
            reader = csv.DictReader(io.StringIO(decoded_file))

            restaurant = request.user.restaurant
            created = 0

            for row in reader:
                # Handle boolean conversion for is_available
                is_avail = str(row.get("is_available", "true")).lower() == "true"
                
                MenuItem.objects.create(
                    restaurant=restaurant,
                    name=row["name"],
                    description=row.get("description", ""),
                    price=row["price"],
                    category_id=row.get("category"),  # Map CSV "category" to model "category_id"
                    is_available=is_avail
                )
                created += 1

            return Response(
                {"detail": f"{created} items uploaded successfully"},
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {"detail": f"Error parsing CSV: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
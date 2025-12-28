from rest_framework import serializers
from .models import MenuItem, MenuCategory

class MenuItemSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)
    class Meta:
        model = MenuItem
        fields = [
            "id",
            "name",
            "description",
            "price",
            "image",       
            "is_available",
            "category",
        ]
        read_only_fields = ['restaurant']
    def update(self, instance, validated_data):
        validated_data.setdefault(
            "is_available", instance.is_available
        )
        validated_data.setdefault(
            "restaurant", instance.restaurant
        )
        return super().update(instance, validated_data)
    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

class MenuCategorySerializer(serializers.ModelSerializer):
    items = MenuItemSerializer(many=True, read_only=True)

    class Meta:
        model = MenuCategory
        fields = ['id', 'name', 'items']
    

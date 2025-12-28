from rest_framework import serializers
from .models import Order, OrderItem
from restaurants.models import MenuItem


# ----------------------------
# Order Item (CREATE)
# ----------------------------
class OrderItemCreateSerializer(serializers.Serializer):
    menu_item_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


# ----------------------------
# Order (CREATE)
# ----------------------------
class OrderCreateSerializer(serializers.Serializer):
    table_number = serializers.CharField()
    phone_number = serializers.CharField(required=False, allow_blank=True)
    note = serializers.CharField(required=False, allow_blank=True)
    items = OrderItemCreateSerializer(many=True)

    def create(self, validated_data):
        restaurant = self.context['restaurant']
        items_data = validated_data.pop('items')

        order = Order.objects.create(
            restaurant=restaurant,
            table_number=validated_data.get("table_number"),
            phone_number=validated_data.get("phone_number"),
            note=validated_data.get("note", "")
        )

        for item_data in items_data:
            menu_item = MenuItem.objects.get(
                id=item_data['menu_item_id'],
                restaurant=restaurant,
                is_available=True
            )

            OrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                quantity=item_data['quantity'],
                price_at_order=menu_item.price
            )

        return order


# ----------------------------
# Order Item (READ)
# ----------------------------
class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(
        source='menu_item.name',
        read_only=True
    )

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'menu_item',
            'menu_item_name',
            'quantity',
            'price_at_order'
        ]


# ----------------------------
# Order (READ / STATUS)
# ----------------------------
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'restaurant',
            'table_number',
            'phone_number',
            'status',
            'note',
            'created_at',
            'items'
        ]
        read_only_fields = ['restaurant', 'created_at']

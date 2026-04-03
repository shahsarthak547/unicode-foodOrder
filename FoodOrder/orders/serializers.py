from rest_framework import serializers
from .models import Order, OrderItem, Coupon
from restaurants.models import MenuItem

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ['code', 'discount_type', 'value', 'active', 'restaurant']
        read_only_fields = ['restaurant']


class OrderItemCreateSerializer(serializers.Serializer):
    menu_item_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.Serializer):
    table_number = serializers.CharField()
    phone_number = serializers.CharField(required=False, allow_blank=True)
    note = serializers.CharField(required=False, allow_blank=True)
    payment_status = serializers.CharField(required=False, default='PENDING')
    payment_method = serializers.CharField(required=False, allow_blank=True)
    coupon_code = serializers.CharField(required=False, allow_blank=True)
    items = OrderItemCreateSerializer(many=True)

    def create(self, validated_data):
        from django.db import transaction
        restaurant = self.context['restaurant']
        items_data = validated_data.pop('items')
        
        # Handle Coupon
        coupon_code = validated_data.get('coupon_code')
        coupon = None
        discount_amount = 0
        
        if coupon_code:
            try:
                # Filter by current restaurant
                from django.db.models import Q
                coupon = Coupon.objects.get(
                    Q(code=coupon_code, active=True) & 
                    (Q(restaurant=restaurant) | Q(restaurant__isnull=True))
                )
            except Coupon.DoesNotExist:
                pass

        with transaction.atomic():
            order = Order.objects.create(
                restaurant=restaurant,
                table_number=validated_data.get("table_number"),
                phone_number=validated_data.get("phone_number"),
                note=validated_data.get("note", ""),
                payment_status=validated_data.get("payment_status", "PENDING"),
                payment_method=validated_data.get("payment_method", ""),
                coupon=coupon
            )

            total_before_discount = 0
            for item_data in items_data:
                # Use select_for_update to handle concurrent orders safely
                menu_item = MenuItem.objects.select_for_update().get(
                    id=item_data['menu_item_id'],
                    restaurant=restaurant,
                    is_available=True
                )

                if menu_item.track_inventory:
                    if menu_item.stock_quantity < item_data['quantity']:
                        raise serializers.ValidationError(
                            f"Insufficient stock for {menu_item.name}. Available: {menu_item.stock_quantity}"
                        )
                    menu_item.stock_quantity -= item_data['quantity']
                    if menu_item.stock_quantity == 0:
                        menu_item.is_available = False
                    menu_item.save()

                OrderItem.objects.create(
                    order=order,
                    menu_item=menu_item,
                    quantity=item_data['quantity'],
                    price_at_order=menu_item.price
                )
                total_before_discount += menu_item.price * item_data['quantity']
            
            # Finalize Discount
            if coupon:
                if coupon.discount_type == 'FIXED':
                    discount_amount = min(coupon.value, total_before_discount)
                else:
                    discount_amount = (total_before_discount * coupon.value) / 100
            
            order.discount_amount = discount_amount
            order.save()

        return order

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
            'payment_status',
            'payment_method',
            'rating',
            'feedback_text',
            'note',
            'created_at',
            'coupon',
            'discount_amount',
            'items'
        ]
        read_only_fields = ['restaurant', 'created_at']

class OrderReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['rating', 'feedback_text']
        extra_kwargs = {
            'rating': {'required': True, 'min_value': 1, 'max_value': 5},
            'feedback_text': {'required': False, 'allow_blank': True}
        }

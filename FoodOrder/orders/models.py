from django.db import models

class Coupon(models.Model):
    CODE_TYPES = [
        ('FIXED', 'Fixed Amount'),
        ('PERCENTAGE', 'Percentage'),
    ]
    restaurant = models.ForeignKey('restaurants.Restaurant', on_delete=models.CASCADE, related_name='coupons', null=True, blank=True)
    code = models.CharField(max_length=50)
    discount_type = models.CharField(max_length=20, choices=CODE_TYPES)
    value = models.DecimalField(max_digits=10, decimal_places=2)
    active = models.BooleanField(default=True)
    valid_from = models.DateTimeField(auto_now_add=True)
    valid_to = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('restaurant', 'code')

    def __str__(self):
        return self.code

class Order(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    # ... existing choices ...
    restaurant = models.ForeignKey('restaurants.Restaurant', on_delete=models.CASCADE, related_name='orders')
    table_number = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='PENDING'
    )
    payment_status = models.CharField(max_length=20, choices=[
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('FAILED', 'Failed'),
    ], default='PENDING')
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    rating = models.PositiveSmallIntegerField(blank=True, null=True)
    feedback_text = models.TextField(blank=True)
    note = models.TextField(blank=True)
    phone_number = models.CharField(max_length=10, blank=True, null=True)
    
    # New Fields for Coupons
    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    def __str__(self):
        return f"Order #{self.id} - {self.phone_number or 'No Phone'}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey('restaurants.MenuItem', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price_at_order = models.DecimalField(max_digits=8, decimal_places=2)

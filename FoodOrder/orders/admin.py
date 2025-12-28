from django.contrib import admin
from .models import Order

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "restaurant", "table_number", "phone_number", "status", "created_at")
    search_fields = ("phone_number", "table_number")

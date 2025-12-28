from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    restaurant = models.ForeignKey(
        'restaurants.Restaurant',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='staff_users'
    )

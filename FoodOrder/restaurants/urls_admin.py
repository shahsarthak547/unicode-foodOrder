from django.urls import path
from .views_admin import (
    AdminMenuListCreateView,
    AdminMenuUpdateDeleteView,
    AdminMenuCSVUploadView
)

urlpatterns = [
    path('menu/', AdminMenuListCreateView.as_view()),
    path('menu/<int:pk>/', AdminMenuUpdateDeleteView.as_view()),
    path('menu/csv-upload/', AdminMenuCSVUploadView.as_view()),
]

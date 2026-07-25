from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceRequestViewSet, CategoryViewSet

router = DefaultRouter()
router.register('categories', CategoryViewSet)
router.register('', ServiceRequestViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, ServiceViewSet, WashRecordViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'services', ServiceViewSet)
router.register(r'washrecords', WashRecordViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

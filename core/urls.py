from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, ServiceViewSet, WashRecordViewSet, EmployeeViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'services', ServiceViewSet)
router.register(r'washrecords', WashRecordViewSet)
router.register(r'employees', EmployeeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

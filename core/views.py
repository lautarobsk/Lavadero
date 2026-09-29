from rest_framework import viewsets, permissions
from django.contrib.auth.models import User
from .models import Service, WashRecord
from .serializers import UserSerializer, EmployeeSerializer, ServiceSerializer, WashRecordSerializer
from .permissions import IsAdminOrReadOnly, IsEmployeeOrAdmin

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

class WashRecordViewSet(viewsets.ModelViewSet):
    queryset = WashRecord.objects.all().order_by('-date')
    serializer_class = WashRecordSerializer

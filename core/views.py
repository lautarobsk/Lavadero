from rest_framework import viewsets, permissions
from django.contrib.auth.models import User
from .models import Service, WashRecord, Employee
from .serializers import UserSerializer, EmployeeSerializer, ServiceSerializer, WashRecordSerializer
from .permissions import IsAdminOrReadOnly, IsEmployeeOrAdmin

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminOrReadOnly]


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permissions_classes = [IsAdminOrReadOnly]


class WashRecordViewSet(viewsets.ModelViewSet):
    queryset = WashRecord.objects.all().order_by('-date')
    serializer_class = WashRecordSerializer
    permission_classes = [IsEmployeeOrAdmin]

    def get_queryset(self):
        queryset = WashRecord.objects.all().order_by('-date')
        date = self.request.query_params.get('date', None)
        if date is not None:
            queryset = queryset.filter(date__date=date)
        return queryset

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsEmployeeOrAdmin]
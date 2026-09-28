from rest_framework import viewsets, permissions
from django.contrib.auth.models import User
from .models import Service, WashRecord
from .serializers import UserSerializer, EmployeeSerializer, ServiceSerializer, WashRecordSerializer
from .permissions import IsAdminOrReadOnly, IsEmployeeOrAdmin

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        # Cualquiera puede registrarse (POST)
        if self.action == 'create':
            return [permissions.AllowAny()]
        # Solo los administradores pueden ver la lista o editar usuarios
        return [permissions.IsAdminUser()]

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsAdminOrReadOnly]

class WashRecordViewSet(viewsets.ModelViewSet):
    queryset = WashRecord.objects.all().order_by('-date')
    serializer_class = WashRecordSerializer
    permission_classes = [IsEmployeeOrAdmin]

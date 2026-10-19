from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .models import Service, WashRecord, Employee
from .serializers import (
    UserSerializer, EmployeeSerializer, ServiceSerializer, WashRecordSerializer, RegisterSerializer
)
from .permissions import IsAdminOrReadOnly, IsEmployeeOrAdmin


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Usuario registrado exitosamente',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'email': user.email,
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        employee = getattr(user, 'employee', None)
        return Response({
            'id': user.id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'is_staff': user.is_staff or user.is_superuser,
            'employee_id': employee.id if employee else None,
            'phone': employee.phone if employee else None,
        })

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [IsEmployeeOrAdmin]


class WashRecordViewSet(viewsets.ModelViewSet):
    queryset = WashRecord.objects.all().order_by('-date')
    serializer_class = WashRecordSerializer
    permission_classes = [IsEmployeeOrAdmin]

    def get_queryset(self):
        queryset = WashRecord.objects.all().order_by('-date')
        user = self.request.user
        params = getattr(self.request, 'query_params', self.request.GET)

        date = params.get('date', None)
        if date is not None:
            queryset = queryset.filter(date__date=date)
        start_date = params.get('start_date', None)
        if start_date is not None:
            queryset = queryset.filter(date__date__gte=start_date)
        end_date = params.get('end_date', None)
        if end_date is not None:
            queryset = queryset.filter(date__date__lte=end_date)

        employee_param = params.get('employee', None) or params.get('employee_id', None)
        mine_param = params.get('mine', None)
        panel_param = params.get('panel', None)

        if user.is_authenticated:
            # Si el usuario NO es staff/admin (es empleado)
            if not (user.is_staff or user.is_superuser):
                employee = getattr(user, 'employee', None)
                # Si solicita sus lavados, filtra por empleado o está en el panel
                if mine_param == 'true' or panel_param == 'true' or employee_param is not None:
                    if employee:
                        queryset = queryset.filter(employees=employee)
                    else:
                        queryset = queryset.none()
            else:
                # El administrador puede ver todos o filtrar por cualquier empleado específico
                if employee_param is not None and employee_param != 'ALL':
                    queryset = queryset.filter(employees__id=employee_param)

        return queryset

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsEmployeeOrAdmin]
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Employee, Service, WashRecord

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'email']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class EmployeeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True
    )

    class Meta:
        model = Employee
        fields = ['id', 'user', 'user_id', 'phone']

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'name', 'price_auto', 'price_camioneta', 'price_moto']

class WashRecordSerializer(serializers.ModelSerializer):
    service_detail = ServiceSerializer(source='service', read_only=True)
    employees_detail = EmployeeSerializer(source='employees', many=True, read_only=True)
    
    commission_per_employee = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = WashRecord
        fields = [
            'id', 'date', 'vehicle_plate', 'vehicle_type', 'service', 'service_detail',
            'employees', 'employees_detail', 'extra_charge', 'price_charged',
            'total_commission', 'commission_per_employee'
        ]
        read_only_fields = ['price_charged', 'total_commission']

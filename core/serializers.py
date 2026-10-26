from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Employee, Service, WashRecord

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    dni = serializers.CharField(source='username', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'dni', 'password', 'first_name', 'last_name', 'email']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


import re

class RegisterSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(
        required=True,
        allow_blank=False,
        error_messages={'required': 'El nombre es obligatorio.', 'blank': 'El nombre es obligatorio.'}
    )
    last_name = serializers.CharField(
        required=True,
        allow_blank=False,
        error_messages={'required': 'El apellido es obligatorio.', 'blank': 'El apellido es obligatorio.'}
    )
    dni = serializers.CharField(
        required=False,
        write_only=True,
        error_messages={'blank': 'El DNI es obligatorio.'}
    )
    username = serializers.CharField(
        required=False,
        allow_blank=True
    )
    phone = serializers.CharField(
        required=False,
        allow_blank=True,
        write_only=True,
        default=''
    )
    email = serializers.EmailField(
        required=False,
        allow_blank=True,
        default=''
    )
    password = serializers.CharField(
        write_only=True,
        min_length=4,
        error_messages={'min_length': 'La contraseña debe tener al menos 4 caracteres.'}
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'dni', 'password', 'first_name', 'last_name', 'email', 'phone']
        extra_kwargs = {
            'username': {'validators': []},
        }

    def validate(self, attrs):
        dni = attrs.pop('dni', None)
        username = attrs.get('username')

        raw_dni = dni if dni is not None else username
        if not raw_dni or not str(raw_dni).strip():
            raise serializers.ValidationError({'dni': 'El DNI es obligatorio.'})

        # Limpiar espacios, puntos y guiones del DNI
        clean_dni = re.sub(r'[\s.-]', '', str(raw_dni).strip())

        if not clean_dni.isdigit():
            raise serializers.ValidationError({'dni': 'El DNI debe contener únicamente números.'})

        if len(clean_dni) < 6 or len(clean_dni) > 10:
            raise serializers.ValidationError({'dni': 'El DNI debe tener entre 6 y 10 dígitos.'})

        if User.objects.filter(username__iexact=clean_dni).exists():
            raise serializers.ValidationError({'dni': 'Este DNI ya se encuentra registrado.'})

        attrs['username'] = clean_dni
        return attrs

    def create(self, validated_data):
        phone = validated_data.pop('phone', '')
        user = User.objects.create_user(**validated_data)
        Employee.objects.create(user=user, phone=phone)
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
            'id', 'date', 'vehicle', 'vehicle_plate', 'vehicle_type', 'service', 'service_detail',
            'employees', 'employees_detail', 'extra_charge', 'price_charged',
            'total_commission', 'commission_per_employee'
        ]
        read_only_fields = ['total_commission']

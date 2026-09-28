from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal

VEHICLE_CHOICES = [
    ('AUTO', 'Auto'),
    ('CAMIONETA', 'Camioneta / SUV'),
    ('MOTO', 'Moto'),
]

class Employee(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employee')
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Teléfono")

    def __str__(self):
        return self.user.get_full_name() or self.user.username


class Service(models.Model):
    name = models.CharField(max_length=100, verbose_name="Servicio")
    price_auto = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio Auto", default=0)
    price_camioneta = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio Camioneta", default=0)
    price_moto = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio Moto", default=0)

    def __str__(self):
        return self.name


class WashRecord(models.Model):
    date = models.DateTimeField(auto_now_add=True)
    vehicle_plate = models.CharField(max_length=20)
    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_CHOICES, verbose_name="Tipo de Vehículo", default='AUTO')
    service = models.ForeignKey(Service, on_delete=models.RESTRICT) 
    employees = models.ManyToManyField(Employee, related_name='washes_participated')
    extra_charge = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Cobro Extra", default=0)
    price_charged = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    total_commission = models.DecimalField(max_digits=10, decimal_places=2, default=0, editable=False)

    def save(self, *args, **kwargs):
        if self.price_charged is None and self.service:
            if self.vehicle_type == 'AUTO':
                base_price = self.service.price_auto
            elif self.vehicle_type == 'CAMIONETA':
                base_price = self.service.price_camioneta
            elif self.vehicle_type == 'MOTO':
                base_price = self.service.price_moto
            else:
                base_price = Decimal('0')
                
            self.price_charged = base_price + (self.extra_charge or Decimal('0'))
            
        # El total de la comisión a repartir es siempre el 40% del precio cobrado
        if self.price_charged:
            self.total_commission = self.price_charged * Decimal('0.40')
            
        super().save(*args, **kwargs)

    @property
    def commission_per_employee(self):
        """
        Divide la comisión total (40%) entre la cantidad de empleados que participaron.
        """
        count = self.employees.count()
        if count > 0:
            return round(self.total_commission / Decimal(count), 2)
        return Decimal('0.00')

    def __str__(self):
        return f"Lavado {self.vehicle_plate} - {self.date.strftime('%d/%m/%Y')}"

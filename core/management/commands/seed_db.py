from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from decimal import Decimal
from core.models import Service, Employee, WashRecord

class Command(BaseCommand):
    help = 'Inicializa la base de datos con servicios predeterminados y superusuario admin'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Elimina registros viejos de lavados y datos de prueba antes de sembrar',
        )
        parser.add_argument(
            '--admin-user',
            type=str,
            default='admin',
            help='Nombre de usuario para el superusuario (por defecto: admin)',
        )
        parser.add_argument(
            '--admin-pass',
            type=str,
            default='admin123',
            help='Contraseña para el superusuario (por defecto: admin123)',
        )

    def handle(self, *args, **options):
        if options['reset']:
            self.stdout.write(self.style.WARNING('Borrando datos de lavados viejos...'))
            WashRecord.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Registros de lavados eliminados correctamente.'))

        # Crear o actualizar servicios estándar
        default_services = [
            {
                'name': 'Lavado Básico',
                'price_auto': Decimal('20000.00'),
                'price_camioneta': Decimal('25000.00'),
                'price_moto': Decimal('10000.00'),
            },
            {
                'name': 'Lavado Completo',
                'price_auto': Decimal('30000.00'),
                'price_camioneta': Decimal('38000.00'),
                'price_moto': Decimal('15000.00'),
            },
            {
                'name': 'Lavado de Motor y Chasis',
                'price_auto': Decimal('15000.00'),
                'price_camioneta': Decimal('20000.00'),
                'price_moto': Decimal('8000.00'),
            },
        ]

        self.stdout.write('Configurando servicios iniciales...')
        for s_data in default_services:
            service, created = Service.objects.update_or_create(
                name=s_data['name'],
                defaults={
                    'price_auto': s_data['price_auto'],
                    'price_camioneta': s_data['price_camioneta'],
                    'price_moto': s_data['price_moto'],
                }
            )
            action = 'Creado' if created else 'Actualizado'
            self.stdout.write(f" - {action}: {service.name} (Auto: ${service.price_auto}, Camioneta: ${service.price_camioneta}, Moto: ${service.price_moto})")

        # Crear Superusuario
        username = options['admin_user']
        password = options['admin_pass']
        user, created = User.objects.get_or_create(username=username, defaults={'email': f"{username}@lavadero.com"})
        user.is_superuser = True
        user.is_staff = True
        user.is_active = True
        user.set_password(password)
        user.save()

        # Asegurar que tenga perfil de empleado opcional
        Employee.objects.get_or_create(user=user, defaults={'phone': ''})

        status = 'creado' if created else 'actualizado'
        self.stdout.write(self.style.SUCCESS(
            f"\nSuperusuario '{username}' {status} con éxito.\n"
            f"Usuario: {username}\n"
            f"Contraseña: {password}\n"
        ))
        self.stdout.write(self.style.SUCCESS('Base de datos inicializada y lista para producción.'))

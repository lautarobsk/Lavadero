from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Employee, Service, WashRecord

class EmployeeInline(admin.StackedInline):
    model = Employee
    can_delete = False
    verbose_name = 'Perfil de Empleado'
    verbose_name_plural = 'Perfil de Empleado (Lavadero)'
    fk_name = 'user'
    extra = 0

admin.site.unregister(User)

@admin.register(User)
class CustomUserAdmin(BaseUserAdmin):
    inlines = (EmployeeInline,)
    list_display = ('username', 'get_full_name_display', 'get_phone', 'is_staff', 'is_superuser')
    list_filter = ('is_staff', 'is_superuser', 'is_active')
    search_fields = ('username', 'first_name', 'last_name', 'email')

    def get_full_name_display(self, obj):
        return obj.get_full_name() or "-"
    get_full_name_display.short_description = 'Nombre y Apellido'

    def get_phone(self, obj):
        emp = getattr(obj, 'employee', None)
        return emp.phone if emp and emp.phone else "-"
    get_phone.short_description = 'Teléfono'

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        if 'username' in form.base_fields:
            form.base_fields['username'].label = 'DNI / Nombre de usuario'
            form.base_fields['username'].help_text = 'Para empleados, ingrese el número de DNI (sin puntos ni espacios). Este valor se usa para iniciar sesión.'
        return form

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('get_dni', 'get_full_name', 'phone')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'phone')

    def get_dni(self, obj):
        return obj.user.username
    get_dni.short_description = 'DNI (Usuario)'

    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
    get_full_name.short_description = 'Nombre y Apellido'

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'price_auto', 'price_camioneta', 'price_moto')

@admin.register(WashRecord)
class WashRecordAdmin(admin.ModelAdmin):
    list_display = ('date', 'vehicle_plate', 'vehicle_type', 'service', 'extra_charge', 'price_charged', 'total_commission', 'commission_per_employee_display')
    list_filter = ('date', 'vehicle_type', 'service', 'employees')
    search_fields = ('vehicle_plate',)
    filter_horizontal = ('employees',)

    def commission_per_employee_display(self, obj):
        return f"${obj.commission_per_employee}"
    commission_per_employee_display.short_description = 'Comisión c/u'

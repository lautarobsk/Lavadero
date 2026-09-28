from django.contrib import admin
from .models import Employee, Service, WashRecord

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone')

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

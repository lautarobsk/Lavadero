from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and (request.user.is_staff or request.user.is_superuser))


class IsEmployeeOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if not bool(request.user and request.user.is_authenticated):
            return False
        
        if request.user.is_staff or request.user.is_superuser:
            return True
            
        is_employee = hasattr(request.user, 'employee')
        
        if is_employee and request.method in permissions.SAFE_METHODS:
            return True
            
        return False

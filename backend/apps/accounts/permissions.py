from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role and request.user.role.name == 'admin'

class IsOfficer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role and request.user.role.name == 'officer'

class IsStudentOrStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        role_name = request.user.role.name if request.user.role else ''
        return role_name in ['student', 'staff']

class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role and request.user.role.name == 'admin':
            return True
        if hasattr(obj, 'requester'):
            return obj.requester == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False

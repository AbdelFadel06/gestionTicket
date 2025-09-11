from rest_framework import permissions
from django.contrib.auth import get_user_model

User = get_user_model()
    
class IsPermitted(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_active)

class IsDeveloper(permissions.BasePermission):
    def has_permission(self, request, view):
        if IsPermitted().has_permission(request, view):
            return bool(request.user.is_staff and request.user.is_developer)
        return False

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if IsPermitted().has_permission(request, view):
            return bool(request.user.is_staff and request.user.is_superuser)
        return False

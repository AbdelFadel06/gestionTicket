from rest_framework import permissions
from .user import IsDeveloper, IsPermitted, IsAdmin
from ticket_app.models import Ticket

class IsAuthor(permissions.BasePermission):
    def has_permission(self, request, view):
        return True
    def has_object_permission(self, request, view, obj):
        return obj.author_id == request.user.id
    
class HasNoDeveloper(permissions.BasePermission):
    def has_permission(self, request, view):
        return True
    def has_object_permission(self, request, view, obj):
        return not obj.developer
    
class IsRealDeveloper(permissions.BasePermission):
    def has_permission(self, request, view):
        # if IsDeveloper().has_permission(request=request, view=view):
        #     return True
        # return False
        return True
    def has_object_permission(self, request, view, obj):
        return obj.developer_id == request.user.id

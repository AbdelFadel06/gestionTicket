from rest_framework import permissions
from .user import IsDeveloper, IsPermitted, IsAdmin
from ticket_app.models import Ticket

class IsAuthor(permissions.BasePermission):
    def has_permission(self, request, view):
        try:
            obj = Ticket.objects.get(pk=view.kwargs.get('pk'))
        except Ticket.DoesNotExist:
            return False
        if IsPermitted().has_permission(request=request, view=view):
            return obj.author_id == request.user.id
        return False
    def has_object_permission(self, request, view, obj):
        return obj.author_id == request.user.id

class IsAminOrDeveloper(permissions.BasePermission):
    def has_permission(self, request, view):
        try:
            obj = Ticket.objects.get(pk=view.kwargs.get('pk'))
        except Ticket.DoesNotExist:
            return False
        if IsDeveloper().has_permission(request, view) or IsAdmin().has_permission(request, view):
            return obj.developer_id == request.user.id
        return False
    def has_object_permission(self, request, view, obj):
        return obj.developer_id == request.user.id
    
class IsRealDeveloper(permissions.BasePermission):
    def has_permission(self, request, view):
        try:
            obj = Ticket.objects.get(pk=view.kwargs.get('pk'))
        except Ticket.DoesNotExist:
            return False
        if IsDeveloper().has_permission(request, view):
            return obj.developer_id == request.user.id
        return False
    def has_object_permission(self, request, view, obj):
        return obj.developer_id == request.user.id
    
class AcceptPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        try:
            obj = Ticket.objects.get(pk=view.kwargs.get('pk'))
        except Ticket.DoesNotExist:
            return False
        
        if request.method == 'PATCH':
            if IsDeveloper().has_permission(request, view):
                return not obj.developer or obj.developer_id == request.user.id
            return False
            # else:
            #     return request.user.is_superuser
        return True
    def has_object_permission(self, request, view, obj):
        return obj.developer_id != request.user.id
    
class ClosePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        try:
            obj = Ticket.objects.get(pk=view.kwargs.get('pk'))
        except Ticket.DoesNotExist:
            return False
        
        if request.method == 'PATCH':
            if request.user.is_superuser:
                return True
            elif IsDeveloper().has_permission(request, view):
                return obj.developer_id == request.user.id
            elif IsAuthor().has_permission(request, view):
                return True
            else:
                return False
        return True
    
class RetrievePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        has_auth = bool(request.user and request.user.is_active) # bool(user.is_active and not user.is_developer)
        return has_auth
    
    def has_object_permission(self, request, view, obj):
        # IsAuthor().has_object_permission(request, view, obj)
        return False

        # if permissions.IsAdminUser().has_permission(request, view):
        #     return True
        
        # if request.user.is_superuser:
        #     return True
        # elif not request.user.is_developer:
        #     return obj.user.id == request.user.id
        # else:
        #     return not obj.developer or request.user.id == obj.developer.id
    
class CommentPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method == 'POST':
            if IsRealDeveloper().has_permission(request, view):
                return True
            elif IsAuthor().has_permission(request, view):
                return True
            else:
                return False
        return True
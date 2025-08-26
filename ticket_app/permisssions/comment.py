from rest_framework import permissions
from .user import IsPermitted
from ticket_app.models import Comment

class IsAuthor(permissions.BasePermission):
    def has_permission(self, request, view):
        try:
            obj = Comment.objects.get(pk=view.kwargs.get('pk'))
        except Comment.DoesNotExist:
            return False
        
        if request.method == 'DELETE':
            if IsPermitted().has_permission(request, view):
                return bool(obj.author_id == request.user.id)
            return False
        return True
    def has_object_permission(self, request, view, obj):
        return obj.author_id != request.user.id
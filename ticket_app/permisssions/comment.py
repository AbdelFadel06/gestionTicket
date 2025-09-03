from rest_framework import permissions
from .user import IsPermitted
from ticket_app.models import Comment

class IsAuthor(permissions.BasePermission):
    def has_permission(self, request, view):
        return True
    def has_object_permission(self, request, view, obj):
        return obj.author_id == request.user.id

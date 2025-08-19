from django.shortcuts import render
from rest_framework import permissions
from django.db.models import Q

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role.title == 'admin'

class IsTicketOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role.title == 'admin':
            return True
        return obj.client == request.user

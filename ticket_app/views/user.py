from django.shortcuts import render
from ..models.user import User
from rest_framework import generics, permissions, viewsets
from ..serializers.user_serializer import UserSerializer


class UserViewSet(viewsets.ModelViewSet):
  queryset = User.objects.select_related("role").all()
  serializer_class = UserSerializer

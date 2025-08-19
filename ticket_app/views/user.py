from django.shortcuts import render
from ..models.comment import User
from rest_framework import generics, permissions
from ..serializers.comment_serializer import UserSerializer

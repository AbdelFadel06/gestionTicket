from django.shortcuts import render
from .models import Ticket, Attachment, Comment
from rest_framework import generics, permissions
from django.db.models import Q
from .serializers import TicketSerializer, AttachmentSerializer, CommentSerializer

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
    
class TicketListCreateView(generics.ListCreateAPIView):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role.title == 'admin':
            return Ticket.objects.all()
        elif user.role.title == 'developer':
            return Ticket.objects.filter(
                Q(developer=user) | Q(developer__isnull=True)
            )
        return Ticket.objects.filter(client=user)
    def perform_create(self, serializer):
        serializer.save(client=self.request.user)

class TicketDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TicketSerializer
    permission_classes = [IsTicketOwnerOrAdmin]
    
    def get_queryset(self):
        return Ticket.objects.all()


class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        ticket_id = self.kwargs.get('ticket_id')
        return Comment.objects.filter(ticket_id=ticket_id)
    
    def perform_create(self, serializer):
        ticket_id = self.kwargs.get('ticket_id')
        serializer.save(
            author=self.request.user,
            ticket_id=ticket_id
        )


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset =  Comment.objects.all()
    serializer_class  = CommentSerializer


class AttachmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        ticket_id = self.kwargs.get('ticket_id')
        return Attachment.objects.filter(ticket_id=ticket_id)
    
    def perform_create(self, serializer):
        ticket_id = self.kwargs.get('ticket_id')
        serializer.save(ticket_id=ticket_id)


class AttachmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset =  Attachment.objects.all()
    serializer_class  = AttachmentSerializer

from django.shortcuts import render
from ..models.ticket import Ticket
from rest_framework import generics, permissions
from django.db.models import Q
from ..serializers.ticket_serializer import TicketSerializer
from .permissions import IsTicketOwnerOrAdmin

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

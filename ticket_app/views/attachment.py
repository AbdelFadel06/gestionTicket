from django.shortcuts import render
from ..models.attachment import Attachment
from rest_framework import generics, permissions
from ..serializers.attachment_serializer import AttachmentSerializer


class AttachmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['title']
    filterset_fields = ['title','ticket','comment']

    def get_queryset(self):
        ticket_id = self.kwargs.get('ticket_id')
        return Attachment.objects.filter(ticket_id=ticket_id)

    def perform_create(self, serializer):
        ticket_id = self.kwargs.get('ticket_id')
        serializer.save(ticket_id=ticket_id)


class AttachmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset =  Attachment.objects.all()
    serializer_class  = AttachmentSerializer

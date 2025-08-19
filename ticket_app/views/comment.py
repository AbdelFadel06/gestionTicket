from django.shortcuts import render
from ..models.comment import Comment
from rest_framework import generics, permissions
from ..serializers.comment_serializer import CommentSerializer


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

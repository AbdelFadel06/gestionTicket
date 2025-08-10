from django.shortcuts import render
from .models import Ticket, Attachment, Comment
from rest_framework import generics
from .serializers import TicketSerializer, AttachmentSerializer, CommentSerializer


class TicketListCreateView(generics.ListCreateAPIView):
    queryset =  Ticket.objects.all()
    serializer_class  = TicketSerializer


class TicketDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset =  Ticket.objects.all()
    serializer_class  = TicketSerializer



class CommentListCreateView(generics.ListCreateAPIView):
    queryset =      Comment.objects.all()
    serializer_class  = CommentSerializer


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset =  Comment.objects.all()
    serializer_class  = CommentSerializer


class AttachmentListCreateView(generics.ListCreateAPIView):
    queryset =  Attachment.objects.all()
    serializer_class  = AttachmentSerializer


class AttachmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset =  Attachment.objects.all()
    serializer_class  = AttachmentSerializer

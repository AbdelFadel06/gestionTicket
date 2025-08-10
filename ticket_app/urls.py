from django.urls import path
from .views import TicketDetailView, TicketListCreateView, AttachmentDetailView, AttachmentListCreateView, CommentDetailView, CommentListCreateView


urlpatterns = [
    path('tickets/', TicketListCreateView.as_view(), name='ticket-list'),
    path('tickets/<int:pk>/', TicketDetailView.as_view(), name='ticket-detail'),

    path('comments/', CommentListCreateView.as_view(), name='comment-list'),
    path('comments/<int:pk>/', CommentDetailView.as_view(), name='comment-detail'),

    path('attachments/', AttachmentListCreateView.as_view(), name='attachment-list'),
    path('attachments/<int:pk>/', AttachmentDetailView.as_view(), name='attachment-detail'),
   
]
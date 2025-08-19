from django.urls import path
from rest_framework.routers import DefaultRouter
# from .views import (
#     TicketListCreateView,
#     TicketDetailView,
#     CommentListCreateView,
#     AttachmentListCreateView
# )

from .views.attachment import AttachmentListCreateView
from .views.ticket import TicketDetailView,TicketListCreateView
from .views.comment import CommentListCreateView

from rest_framework.authtoken.views import obtain_auth_token
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

router = DefaultRouter()

urlpatterns = [
    # Auth
    path('api/login/', obtain_auth_token, name='api-login'),

    # Tickets
    path('tickets/', TicketListCreateView.as_view(), name='ticket-list'),
    path('tickets/<int:pk>/', TicketDetailView.as_view(), name='ticket-detail'),

    # Comments & Attachments
    path('tickets/<int:ticket_id>/comments/',
         CommentListCreateView.as_view(),
         name='ticket-comments'),

    path('tickets/<int:ticket_id>/attachments/',
         AttachmentListCreateView.as_view(),
         name='ticket-attachments'),

    # OpenAPI schema (JSON)
    path("schema/", SpectacularAPIView.as_view(), name="schema"),

    # Swagger UI
    path("swagger/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),

    # Redoc UI
    path("redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]

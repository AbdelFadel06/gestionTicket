from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from .views import (
    TicketListCreateView,
    TicketDetailView,
    CommentListCreateView,
    AttachmentListCreateView
)
from rest_framework.authtoken.views import obtain_auth_token
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
router = DefaultRouter()


schema_view = get_schema_view(
    openapi.Info(
        title="API Tickets",
        default_version='v1',
        description="Documentation de l'API de gestion des tickets",
        terms_of_service="https://www.example.com/terms/",
        contact=openapi.Contact(email="contact@example.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)


urlpatterns = [
    path('api/login/', obtain_auth_token, name='api-login'),
    path('tickets/', TicketListCreateView.as_view(), name='ticket-list'),
    path('tickets/<int:pk>/', TicketDetailView.as_view(), name='ticket-detail'),
    
    path('tickets/<int:ticket_id>/comments/', 
         CommentListCreateView.as_view(), 
         name='ticket-comments'),
    
    path('tickets/<int:ticket_id>/attachments/', 
         AttachmentListCreateView.as_view(), 
         name='ticket-attachments'),
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]
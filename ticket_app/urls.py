from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.attachment import AttachmentListCreateView
from .views.ticket import TicketDetailView,TicketListCreateView
from .views.comment import CommentListCreateView
from .views.user import UserViewSet
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from rest_framework.authtoken.views import obtain_auth_token
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),

    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('api/login/', obtain_auth_token, name='api-login'),

    path('tickets/', TicketListCreateView.as_view(), name='ticket-list'),
    path('tickets/<int:pk>/', TicketDetailView.as_view(), name='ticket-detail'),

    path('tickets/<int:ticket_id>/comments/', CommentListCreateView.as_view(), name='ticket-comments'),

    path('tickets/<int:ticket_id>/attachments/',  AttachmentListCreateView.as_view(),  name='ticket-attachments'),

    path("schema/", SpectacularAPIView.as_view(), name="schema"),

    path("swagger/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),

    path("redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),

    # path('accounts/', include('django.contrib.auth.urls')),
]

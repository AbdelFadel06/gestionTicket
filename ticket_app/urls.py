from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.attachment import AttachmentListCreateView
from .views import (
    TicketViewSet, 
    TicketListCreateView, 
    TicketRetrieveDestroyView, 
    accepted, 
    closed, 
    setstatus, 
    retrieveDestroyComment, 
    CommentCreateView,
    add_like_on_ticket,
    add_like_on_comment,
    get_all_like_for_ticket,
    get_all_like_for_comment
)
from .views.authentication import CustomeTokenObtainPairView, UserRegister, DeveloperRegister, registration, retrieve
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView, 
    TokenBlacklistView
)
from rest_framework.authtoken.views import obtain_auth_token
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

router = DefaultRouter()
# router.register(r'ticket', TicketViewSet, basename='ticket')

urlpatterns = [
    path('', include(router.urls)),

    ## Authentication
    # path('auth/register/developer/', registration, name="register_user_developer"),
    path('auth/register/developer/', DeveloperRegister.as_view(), name="register_user_developer"),
    path('auth/register/', UserRegister.as_view(), name="register_user"),
    path('auth/login/', CustomeTokenObtainPairView.as_view(), name='get_token'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name="token_refresh"),
    path('auth/token/verify/', TokenVerifyView.as_view(), name="token_verify"),
    # Déconnexion
    path('auth/token/blacklist/', TokenBlacklistView.as_view(), name="token_blacklist"),
    # Utilisateur authentifié
    path('auth/token/', retrieve, name="token_user"),

    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path("swagger/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),

    # path('accounts/', include('django.contrib.auth.urls')),
]

# Ticket
ticket_urlpatterns = [
    path('ticket/', TicketListCreateView.as_view(), name='ticket-list'),
    path('ticket/<int:pk>/', TicketRetrieveDestroyView.as_view(), name='retrieve-ticket'),

    path('ticket/<int:pk>/accepted/', accepted, name='accepted-ticket'),
    path('ticket/<int:pk>/closed/', closed, name='closed-ticket'),
    path('ticket/<int:pk>/status/', setstatus, name='status-ticket'),
    path('ticket/<int:pk>/comment/', CommentCreateView.as_view(), name='create_comment'),
    path('ticket/<int:pk>/like/', add_like_on_ticket, name='add_like_on_ticket'),
    path('ticket/<int:pk>/likes/', get_all_like_for_ticket, name='all_like_for_ticket'),

    path('comment/<int:pk>/', retrieveDestroyComment, name='retrieve_destroy_comment'),
    path('comment/<int:pk>/like/', add_like_on_comment, name='add_like_on_comment'),
    path('comment/<int:pk>/likes/', get_all_like_for_comment, name='all_like_for_comment'),
]
urlpatterns.extend(ticket_urlpatterns)


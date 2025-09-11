from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.attachment import AttachmentListCreateView
from .views import TicketViewSet, TicketMixinView, TicketRetrieveDestroyView, accepted, closed, setstatus, retrieveDestroyComment, CommentCreateView
from .views.authentication import CustomeTokenObtainPairView, UserRegister, registration, retrieve
from rest_framework_simplejwt.views import (TokenObtainPairView,TokenRefreshView,TokenVerifyView,TokenBlacklistView)
from rest_framework.authtoken.views import obtain_auth_token
from drf_spectacular.views import (SpectacularAPIView,SpectacularSwaggerView,SpectacularRedocView,)
from ticket_app.views.authentication import MeView
from .views.ticket import TicketStatsView, TicketChoicesView


from ticket_app.personnal_auth.auth_views import login_view, refresh_view, protected_view, register_view, debug_check_user, debug_check_password

router = DefaultRouter()
# router.register(r'ticket', TicketViewSet, basename='ticket')

urlpatterns = [
    path('', include(router.urls)),

      ## Authentication
    path('auth/me/', MeView.as_view(), name='auth_me'),
    path('auth/register/developer/', registration, name="register_user_developer"),
    path('auth/register/', UserRegister.as_view(), name="register_user"),
    path('auth/login/', CustomeTokenObtainPairView.as_view(), name='get_token'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name="token_refresh"),
    path('auth/token/verify/', TokenVerifyView.as_view(), name="token_verify"),
    path("tickets/stats/", TicketStatsView.as_view(), name="ticket-stats"),


    # path('api/login/', login_view, name='login'),
    # path('api/register/', register_view, name='register'),
    # path('api/refresh/', refresh_view, name='refresh'),
    # path('api/protected/', protected_view, name='protected'),path('api/login/', login_view, name='login'),
    # path('api/register/', register_view, name='register'),
    # path('api/refresh/', refresh_view, name='refresh'),
    # path('api/protected/', protected_view, name='protected'),


    path('api/debug/user/<str:email>/', debug_check_user, name='debug_user'),
    path('api/debug/check-password/', debug_check_password, name='debug_password'),



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
    path('ticket/', TicketMixinView.as_view(), name='ticket-list'),
    path('ticket/<int:pk>/', TicketRetrieveDestroyView.as_view(), name='retrieve-ticket'),

    path('ticket/<int:pk>/accepted/', accepted, name='accepted-ticket'),
    path('ticket/<int:pk>/closed/', closed, name='closed-ticket'),
    path('ticket/<int:pk>/status/', setstatus, name='status-ticket'),
    path('ticket/<int:pk>/comment/', CommentCreateView.as_view(), name='create_comment'),
    path("ticket/choices/", TicketChoicesView.as_view(), name="ticket-choices"),

    path('comment/<int:pk>/', retrieveDestroyComment, name='retrieve_destroy_comment'),
]
urlpatterns.extend(ticket_urlpatterns)


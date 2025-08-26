from rest_framework.decorators import api_view, renderer_classes, permission_classes, authentication_classes
from rest_framework import generics, mixins, status, serializers
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import authentication, permissions
from rest_framework_simplejwt.authentication import JWTAuthentication, JWTTokenUserAuthentication
from ticket_app.models import User
from ticket_app.serializers.authentication import UserRegisterSerializer
from ticket_app.serializers.user_serializer import UserSerializer
from django.contrib.auth import authenticate, hashers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from django.utils import timezone
from django.utils.translation import gettext as _

# Create your views here.

class CustomeTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({"error": _("Veuillez fournir un nom d'utilisateur et un mot de passe.")}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        if not user.check_password(password):
            return Response({"error": _("Identifiants invalides.")}, status=status.HTTP_401_UNAUTHORIZED)

        # user = authenticate(request, username=username, password=password)

        if user is not None:
            serializer = self.get_serializer(data=request.data)
            user.last_login = timezone.now()
            user.save()
            print(user)

            try:
                serializer.is_valid(raise_exception=True)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        else:
            return Response({"error": _("Identifiants invalides.")}, status=status.HTTP_401_UNAUTHORIZED)

class UserRegister(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer

@api_view(['POST'])
def registration(request: Request):
    serializer = UserRegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(is_staff=True, is_developer=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def retrieve(request):
    serializer = UserSerializer(instance=request.user)
    return Response(serializer.data)

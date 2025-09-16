from rest_framework import generics, permissions
from rest_framework.response import Response

from ticket_app.models import User
from ticket_app.serializers import UserSerializer

class UserUpdateAPIView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Si aucun pk n'est fourni dans l'URL, retourner l'utilisateur connecté
        pk = self.kwargs.get('pk')
        if pk is None:
            return self.request.user
        return super().get_object()

    def check_permissions(self, request):
        super().check_permissions(request)

        # Vérifier que l'utilisateur peut modifier cet utilisateur
        user = self.get_object()
        if request.user != user and not request.user.is_staff:
            self.permission_denied(
                request,
                message="Vous n'avez pas la permission de modifier cet utilisateur."
            )

    def perform_update(self, serializer):
        # Vous pouvez ajouter une logique supplémentaire ici avant la sauvegarde
        serializer.save()

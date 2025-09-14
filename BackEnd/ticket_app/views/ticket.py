from rest_framework import viewsets, status, serializers, mixins
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from ticket_app.models import Ticket, Comment, User
from rest_framework import generics, permissions
from django.db.models import Q
from django.utils import timezone
from ticket_app.serializers import CommentRetrieveSerializer, TicketCreateSerializer, TicketRetrieveSerializer, TicketStatusSerializer, CommentCreateSerializer, UserMeSerializer
from ticket_app.permisssions import IsAuthor, IsPermitted, AcceptPermission, ClosePermission, CommentPermission, IsRealDeveloper, RetrievePermission, IsCommentAuthor
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.utils.translation import gettext as _
from rest_framework.views import APIView



class TicketViewSet(viewsets.ViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketCreateSerializer

    def get_permissions(self):
        permission_classes = []

        if self.action == 'list':
            permission_classes = [permissions.IsAuthenticated]
        elif self.action == 'retrieve':
            permission_classes = [permissions.IsAuthenticated, IsPermitted]
        elif self.action == 'accepted':
            permission_classes = [permissions.IsAuthenticated, AcceptPermission]
        elif self.action == 'closed':
            permission_classes = [permissions.IsAuthenticated, ClosePermission]
        elif self.action == 'status':
            permission_classes = [permissions.IsAuthenticated, IsRealDeveloper]
        elif self.action == 'comment':
            permission_classes = [permissions.IsAuthenticated, CommentPermission]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]

    def list(self, request):
        user = request.user
        if user.is_developer:
            data = self.queryset.filter(Q(developer=user) | Q(developer__isnull=True))
        elif not user.is_staff and not user.is_developer:
            # CORRECTION: utiliser author au lieu de user
            data = self.queryset.filter(author=user)
        else:
            data = self.queryset.all()
        serializer = TicketRetrieveSerializer(instance=data, many=True)

        return Response(data={
            'success': True,
            'data': serializer.data,
        }, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        serializer = TicketCreateSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            # CORRECTION: utiliser author au lieu de user
            serializer.save(author=request.user)
        return Response({
            "success": True,
            "data": serializer.data,
        }, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None, *args, **kwargs):
        try:
            ticket = self.queryset.prefetch_related('comments').get(pk=pk)
        except Ticket.DoesNotExist as e:
            # CORRECTION: message d'erreur plus générique
            raise serializers.ValidationError(_("Ticket non trouvé"))

        serializer = TicketRetrieveSerializer(instance=ticket)

        return Response({
            "success": True,
            "data": serializer.data,
        }, status=status.HTTP_200_OK)

    def destroy(self, request, pk=None, *args, **kwargs):
        try:
            instance = self.queryset.get(pk=pk)
        except Ticket.DoesNotExist as e:
            # CORRECTION: message d'erreur plus générique
            raise serializers.ValidationError(_("Ticket non trouvé"))
        instance.delete()
        return Response({
            "success": True
        }, status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, url_path='accepted', methods=['patch'], name="Traiter le ticket")
    def accepted(self, request, pk=None):
        try:
            instance = self.queryset.get(pk=pk)
        except Ticket.DoesNotExist:
            raise serializers.ValidationError(_("Ticket non trouvé"))

        user = request.user
        dev_id = request.data.get("developer")

        # Cas 1 : admin assigne un dev
        if dev_id and user.is_staff:
            try:
                developer = User.objects.get(pk=dev_id, is_developer=True)
            except User.DoesNotExist:
                raise serializers.ValidationError(_("Développeur introuvable"))
            instance.developer = developer
            instance.save(update_fields=['developer'])

        # Cas 2 : un dev prend le ticket
        else:
            if instance.developer and user.id != instance.developer.id:
                raise serializers.ValidationError(_("Ticket déjà attribué."))
            if not instance.developer:
                instance.developer = user
                instance.save(update_fields=['developer'])

        serializer = TicketRetrieveSerializer(instance)
        return Response({
            "success": True,
            "data": serializer.data
        }, status=status.HTTP_200_OK)


    @action(detail=True, url_path='closed', url_name='closed-ticket', methods=['get','patch'], name="Fermer le ticket", description="fermé un ticket")
    def closed(self, request, pk=None):
        try:
            instance = self.queryset.get(pk=pk)
        except Ticket.DoesNotExist as e:
            # CORRECTION: message d'erreur plus générique
            raise serializers.ValidationError(_("Ticket non trouvé"))
        if request.method == 'PATCH':
            if not instance.closed_at:
                instance.status = 'closed'
                instance.save(update_fields=['status'])
        serializer = TicketRetrieveSerializer(instance=instance)
        return Response(data={
            "success": True,
            "data": serializer.data,
        }, status=status.HTTP_200_OK)

    @action(detail=True, url_path="status", url_name="status-ticket", methods=["get", "patch"], description="changement de statut")
    def status(self, request, pk=None):
        try:
            instance = self.queryset.get(pk=pk)
        except Ticket.DoesNotExist as e:
            # CORRECTION: message d'erreur plus générique
            raise serializers.ValidationError(_("Ticket non trouvé"))

        if request.method == 'PATCH':
            serializer = TicketStatusSerializer(instance=instance, data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(update_fields=['status'])
            instance = serializer.instance

        serializer = TicketRetrieveSerializer(instance)
        return Response(data={
            "success": True,
            "data": serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=True, url_path='comment', url_name='create_comment', methods=['post','get'], name="Ajouter un commentaire", description="ajouter un commentaire")
    def comment(self, request, pk=None, *args, **kwargs):
        try:
            instance = self.queryset.get(pk=pk)
        except Ticket.DoesNotExist as e:
            # CORRECTION: message d'erreur plus générique
            raise serializers.ValidationError(_("Ticket non trouvé"))

        if request.method == 'POST':
            serializer = CommentCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(ticket=instance, user=request.user)

        instance = self.queryset.prefetch_related('comments').get(pk=pk)
        serializer = TicketRetrieveSerializer(instance=instance)

        return Response(data={
            "success": True,
            "data": serializer.data,
        }, status=status.HTTP_200_OK)


class TicketMixinView(
    generics.GenericAPIView,
    mixins.ListModelMixin,
    mixins.CreateModelMixin,):
    queryset = Ticket.objects.all()
    serializer_class = TicketRetrieveSerializer
    permission_classes = [permissions.IsAuthenticated, IsPermitted]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title','author__username']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TicketCreateSerializer
        return super().get_serializer_class()

    def get_queryset(self):
        user = self.request.user
        if user.is_developer:
            data = self.queryset.filter(Q(developer=user) | Q(developer__isnull=True))
        elif not user.is_staff and not user.is_developer:
            # CORRECTION: utiliser author au lieu de user
            data = self.queryset.filter(author=user)
        else:
            data = self.queryset.all()
        return data

    def get(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        serializer = TicketCreateSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            # CORRECTION: utiliser author au lieu de user
            serializer.save(author=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class TicketRetrieveDestroyView(generics.RetrieveDestroyAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketRetrieveSerializer

    def get_permissions(self):
        permission_classes = [permissions.IsAuthenticated, IsPermitted]
        if self.request.method == 'DELETE':
            permission_classes = [permissions.IsAuthenticated, IsPermitted, IsAuthor]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        if user.is_developer:
            data = self.queryset.filter(Q(developer=user) | Q(developer__isnull=True))
        elif not user.is_staff and not user.is_developer:
            # CORRECTION: utiliser author au lieu de user
            data = self.queryset.filter(author=user)
        else:
            data = self.queryset.all()
        return data

class CommentCreateView(generics.GenericAPIView, mixins.CreateModelMixin, mixins.RetrieveModelMixin):
    queryset = Ticket.objects.all()
    serializer_class = TicketRetrieveSerializer
    permission_classes = [permissions.IsAuthenticated, CommentPermission]

    def get_queryset(self):
        # CORRECTION: ajouter le filtrage approprié
        user = self.request.user
        if user.is_developer:
            return self.queryset.filter(Q(developer=user) | Q(developer__isnull=True))
        elif not user.is_staff and not user.is_developer:
            return self.queryset.filter(author=user)
        else:
            return self.queryset.all()

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return TicketRetrieveSerializer
        else:
            return CommentCreateSerializer

    def get(self, request, pk = None, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    def post(self, request, pk = None):
        try:
            instance = Ticket.objects.get(pk=pk)
        except Ticket.DoesNotExist as e:
            # CORRECTION: message d'erreur plus générique
            raise serializers.ValidationError(_("Ticket non trouvé"))

        if request.method == 'POST':
            serializer = CommentCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(ticket=instance, author=request.user)

        instance = Ticket.objects.prefetch_related('comments').get(pk=pk)
        serializer = TicketRetrieveSerializer(instance=instance)

        return Response(data={
            "success": True,
            "data": serializer.data,
        }, status=status.HTTP_200_OK)

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated, AcceptPermission])
def accepted(request, pk=None):
    try:
        instance = Ticket.objects.get(pk=pk)
    except Ticket.DoesNotExist:
        raise serializers.ValidationError(_("Ticket non trouvé"))

    user = request.user
    dev_id = request.data.get("developer")  # 👈 récupère l’ID si envoyé

    # Cas 1 : un admin assigne un développeur
    if dev_id and user.is_staff:
        try:
            developer = User.objects.get(pk=dev_id)
        except User.DoesNotExist:
            raise serializers.ValidationError(_("Développeur introuvable"))
        instance.developer = developer
        instance.save(update_fields=['developer'])

    # Cas 2 : un développeur s’assigne lui-même (si libre)
    elif not dev_id:
        if instance.developer is not None and user.id != instance.developer.id:
            raise serializers.ValidationError(_("Ticket déjà attribué."))
        if not instance.developer:
            instance.developer = user
            instance.save(update_fields=['developer'])

    serializer = TicketRetrieveSerializer(instance)
    return Response({
        "success": True,
        "data": serializer.data
    }, status=status.HTTP_200_OK)



@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated, ClosePermission])
def closed(request, pk=None):
    try:
        instance = Ticket.objects.get(pk=pk)
    except Ticket.DoesNotExist as e:
        # CORRECTION: message d'erreur plus générique
        raise serializers.ValidationError(_("Ticket non trouvé"))
    if request.method == 'PATCH':
        if not instance.closed_at:
            instance.status = 'closed'
            instance.save(update_fields=['status'])
    serializer = TicketRetrieveSerializer(instance=instance)
    return Response(data={
        "success": True,
        "data": serializer.data,
    }, status=status.HTTP_200_OK)

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated, IsRealDeveloper])
def setstatus(request, pk=None):
    try:
        instance = Ticket.objects.get(pk=pk)
    except Ticket.DoesNotExist as e:
        # CORRECTION: message d'erreur plus générique
        raise serializers.ValidationError(_("Ticket non trouvé"))

    if request.method == 'PATCH':
        serializer = TicketStatusSerializer(instance=instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(update_fields=['status'])
        instance = serializer.instance

    serializer = TicketRetrieveSerializer(instance)
    return Response(data={
        "success": True,
        "data": serializer.data
    }, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated, IsCommentAuthor])
def retrieveDestroyComment(request, pk=None):
    try:
        instance = Comment.objects.prefetch_related('attachments').get(pk=pk)
    except Comment.DoesNotExist as e:
        # CORRECTION: message d'erreur plus générique
        raise serializers.ValidationError(_("Commentaire non trouvé"), code=status.HTTP_404_NOT_FOUND)
    if request.method == 'DELETE':
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    serializer = CommentRetrieveSerializer(instance=instance)
    return Response(serializer.data, status=status.HTTP_200_OK)





class TicketStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # Si c’est un simple utilisateur (non staff, non dev)
        if not user.is_staff and not user.is_developer:
            qs = Ticket.objects.filter(author=user)
        # Si c’est un développeur
        elif user.is_developer:
            qs = Ticket.objects.filter(Q(developer=user) | Q(developer__isnull=True))
        else:  # admin
            qs = Ticket.objects.all()

        stats = {
            "total": qs.count(),
            "completed": qs.filter(status="closed").count(),
            "in_progress": qs.filter(status="in_progress").count(),
            "unassigned": qs.filter(developer__isnull=True).count(),
        }

        return Response(stats, status=status.HTTP_200_OK)


class TicketChoicesView(APIView):
    def get(self, request):
        return Response({
            "priority": Ticket._meta.get_field("priority").choices,
            "status": Ticket._meta.get_field("status").choices,
        })














# Récupérer tous les utilisateurs ou seulement les développeurs
@api_view(['GET'])
def users_and_developers(request):
    users = User.objects.filter(
        is_staff=False,
        is_superuser=False,
        is_developer=False
    )
    developers = User.objects.filter(is_developer=True)

    return Response({
        "users": UserMeSerializer(users, many=True).data,
        "developers": UserMeSerializer(developers, many=True).data,
    })

# Tickets créés par un user spécifique
@api_view(['GET'])
def tickets_by_user(request, user_id):
    tickets = Ticket.objects.filter(author_id=user_id)
    serializer = TicketRetrieveSerializer(tickets, many=True)
    return Response(serializer.data)

# Tickets assignés à un développeur spécifique
@api_view(['GET'])
def tickets_by_developer(request, developer_id):
    tickets = Ticket.objects.filter(developer_id=developer_id)
    serializer = TicketRetrieveSerializer(tickets, many=True)
    return Response(serializer.data)





class TicketStatusUpdateView(generics.UpdateAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketStatusSerializer
    permission_classes = [permissions.IsAuthenticated, IsRealDeveloper]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            "success": True,
            "data": TicketRetrieveSerializer(instance).data
        }, status=status.HTTP_200_OK)



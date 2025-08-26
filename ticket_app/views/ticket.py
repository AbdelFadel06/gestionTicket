from rest_framework import viewsets, status, serializers, mixins
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from ticket_app.models import Ticket, Comment
from rest_framework import generics, permissions
from django.db.models import Q
from django.utils import timezone
from ticket_app.serializers import CommentRetrieveSerializer, TicketCreateSerializer, TicketRetrieveSerializer, TicketStatusSerializer, CommentCreateSerializer
from ticket_app.permisssions import IsAuthor, IsPermitted, AcceptPermission, ClosePermission, CommentPermission, IsRealDeveloper, RetrievePermission, IsCommentAuthor
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.utils.translation import gettext as _

class TicketViewSet(viewsets.ViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketCreateSerializer
    # authentication_classes = [authentication.SessionAuthentication, authentication.TokenAuthentication, jwt_authentication.JWTAuthentication]

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
            data = self.queryset.filter(user=user)
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
            serializer.save(user=request.user)
        return Response({
            "success": True,
            "data": serializer.data,
        }, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None, *args, **kwargs):
        try:
            ticket = self.queryset.prefetch_related('comments').get(pk=pk)
        except Ticket.DoesNotExist as e:
            raise serializers.ValidationError(_(f"{e}"))
        
        serializer = TicketRetrieveSerializer(instance=ticket)

        return Response({
            "success": True,
            "data": serializer.data,
        }, status=status.HTTP_200_OK)
    
    def destroy(self, request, pk=None, *args, **kwargs):
        try:
            intance = self.queryset.get(pk=pk)
        except Ticket.DoesNotExist as e:
            raise serializers.ValidationError(e)
        intance.delete()
        return Response({
            "success": True
        }, status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, url_path='accepted', url_name='accepted-ticket', methods=['patch', 'get'], name="Traiter le ticket", description="accepté/prendre un ticket")
    def accepted(self, request, pk=None):
        try:
            instance = self.queryset.get(pk=pk)
        except Ticket.DoesNotExist as e:
            raise serializers.ValidationError(e)
        if request.method == 'PATCH':
            user = request.user
            if instance.developer is not None and user.id != instance.developer.id:
                raise serializers.ValidationError(detail=_("Ticket déjà attribué."), code=status.HTTP_401_UNAUTHORIZED)
            if not instance.developer:
                instance.developer = user
                instance.save(update_fields=['developer'])

        serializer = TicketRetrieveSerializer(instance)
        
        return Response(data={
            "success": True,
            "data": serializer.data
        }, status=status.HTTP_200_OK)

    @action(detail=True, url_path='closed', url_name='closed-ticket', methods=['get','patch'], name="Fermer le ticket", description="fermé un ticket")
    def closed(self, request, pk=None):
        try:
            instance = self.queryset.get(pk=pk)
        except Ticket.DoesNotExist as e:
            raise serializers.ValidationError(e)
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
            raise serializers.ValidationError(e)
        
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
            raise serializers.ValidationError(_(f"{e}"))
        
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

    # authentication_classes = [authentication.SessionAuthentication, authentication.TokenAuthentication, jwt_authentication.JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated, IsPermitted]

    # filter_backends = [DjangoFilterBackend]
    # filter_backends = [filters.SearchFilter]
    
    filter_backends = [filters.SearchFilter]
    search_fields = ['title','author__username']

    # filterset_fields = ['title']
    # filter_backends = [filters.OrderingFilter]
    # ordering = ['title']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TicketCreateSerializer
        return super().get_serializer_class()

    def get_queryset(self):
        user = self.request.user
        if user.is_developer:
            data = self.queryset.filter(Q(developer=user) | Q(developer__isnull=True))
        elif not user.is_staff and not user.is_developer:
            data = self.queryset.filter(user=user)
        else:
            data = self.queryset.all()
        return data
    
    def get(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    def post(self, request, *args, **kwargs):
        serializer = TicketCreateSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save(author=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class TicketRetrieveDestroyView(generics.RetrieveDestroyAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketRetrieveSerializer

    # authentication_classes = [authentication.SessionAuthentication, authentication.TokenAuthentication, jwt_authentication.JWTAuthentication]
    # permission_classes = [permissions.IsAuthenticated, IsPermitted]

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
            data = self.queryset.filter(user=user)
        else:
            data = self.queryset.all()
        return data
    
    # def perform_destroy(self, instance):
    #     return super().perform_destroy(instance)

class CommentCreateView(generics.GenericAPIView, mixins.CreateModelMixin, mixins.RetrieveModelMixin):
    queryset = Ticket.objects.all()
    serializer_class = TicketRetrieveSerializer
    # queryset = Ticket.objects.all()
    permission_classes = [permissions.IsAuthenticated, CommentPermission]

    def get_queryset(self):
        return super().get_queryset()
    
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
            raise serializers.ValidationError(_(f"{e}"))
        
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

 
@api_view(['PATCH', 'GET'])
@permission_classes([permissions.IsAuthenticated, AcceptPermission])
def accepted(request, pk=None):
    # return Response("Yooo")
    try:
        instance = Ticket.objects.get(pk=pk)
    except Ticket.DoesNotExist as e:
        raise serializers.ValidationError(e)
    if request.method == 'PATCH':
        user = request.user
        if instance.developer is not None and user.id != instance.developer.id:
            raise serializers.ValidationError(detail=_("Ticket déjà attribué."), code=status.HTTP_401_UNAUTHORIZED)
        if not instance.developer:
            instance.developer = user
            instance.save(update_fields=['developer'])

    serializer = TicketRetrieveSerializer(instance)
    
    return Response(data={
        "success": True,
        "data": serializer.data
    }, status=status.HTTP_200_OK)

@api_view(['GET', 'PATCH'])
@permission_classes([permissions.IsAuthenticated, ClosePermission])
def closed(request, pk=None):
    try:
        instance = Ticket.objects.get(pk=pk)
    except Ticket.DoesNotExist as e:
        raise serializers.ValidationError(e)
    if request.method == 'PATCH':
        if not instance.closed_at:
            instance.status = 'closed'
            instance.save(update_fields=['status'])
    serializer = TicketRetrieveSerializer(instance=instance)
    return Response(data={
        "success": True,
        "data": serializer.data,
    }, status=status.HTTP_200_OK)

@api_view(['GET', 'PATCH'])
@permission_classes([permissions.IsAuthenticated, IsRealDeveloper])
def setstatus(request, pk=None):
    try:
        instance = Ticket.objects.get(pk=pk)
    except Ticket.DoesNotExist as e:
        raise serializers.ValidationError(e)
    
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

@api_view(['GET', 'DELETE'])
@permission_classes([permissions.IsAuthenticated, IsCommentAuthor])
def retrieveDestroyComment(request, pk=None):
    try:
        instance = Comment.objects.prefetch_related('attachments').get(pk=pk)
    except Comment.DoesNotExist as e:
        raise serializers.ValidationError(e, code=status.HTTP_404_NOT_FOUND)
    if request.method == 'DELETE':
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
        # raise serializers.ValidationError(code=status.HTTP_204_NO_CONTENT)
    serializer = CommentRetrieveSerializer(instance=instance)
    return Response(serializer.data, status=status.HTTP_200_OK)

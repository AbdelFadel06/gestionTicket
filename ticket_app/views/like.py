from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from ticket_app.models import Ticket, Comment, Like
from rest_framework.response import Response
from rest_framework import serializers
from ticket_app.serializers import LikeSerializer
from django.contrib.contenttypes.models import ContentType

@api_view(['POST'])
@permission_classes([])
def add_like_on_ticket(request, pk=None):
    user = request.user
    try:
        ticket = Ticket.objects.get(pk=pk)
    except Ticket.DoesNotExist as e:
        raise serializers.ValidationError(e, code=status.HTTP_404_NOT_FOUND)
    obj, created = Like.objects.get_or_create(
        user=user,
        content_type=ContentType.objects.get_for_model(ticket),
        object_id=ticket.pk
        # content_object=ticket
    )
    # obj = Like.objects.create(
    #     user=user,
    #     content_object=ticket
    # )
    if created:
        return Response(data={
            "success": True,
        }, status=status.HTTP_201_CREATED)
    else:
        obj.delete()
        return Response(data={
            "success": True,
            "message": "Like retiré"
        }, status=status.HTTP_200_OK)

@api_view(['POST'])
def add_like_on_comment(request, pk=None):
    user = request.user
    try:
        comment = Comment.objects.get(pk=pk)
    except Comment.DoesNotExist as e:
        raise serializers.ValidationError(detail=e, code=status.HTTP_404_NOT_FOUND)
    obj, created = Like.objects.get_or_create(
        user=user,
        content_type=ContentType.objects.get_for_model(Comment),
        object_id=comment.pk
    )
    # obj = Like.objects.create(
    #     user = user,
    #     content_object = comment
    # )
    if created:
        return Response(data={
            "success": True,
        }, status=status.HTTP_201_CREATED)
    else:
        obj.delete()
        return Response(data={
            "success": True,
            "message": "Like retiré"
        }, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_all_like_for_ticket(request, pk=None):
    try:
        ticket = Ticket.objects.get(pk=pk)
    except Ticket.DoesNotExist as e:
        raise serializers.ValidationError(e, code=status.HTTP_400_BAD_REQUEST)
    likes = Like.objects.filter(
        content_type=ContentType.objects.get_for_model(ticket),
        object_id=ticket.pk
    )
    serializer = LikeSerializer(likes, many=True)
    return Response(data={
        "success": True,
        "data": serializer.data,
        "count": likes.count()
    },status=status.HTTP_200_OK)

@api_view(['GET'])
def get_all_like_for_comment(request, pk=None):
    try:
        comment = Comment.objects.get(pk=pk)
    except Comment.DoesNotExist as e:
        raise serializers.ValidationError(e, code=status.HTTP_400_BAD_REQUEST)
    likes = Like.objects.filter(
        content_type = ContentType.objects.get_for_model(comment),
        object_id = comment.pk
    )
    serializer = LikeSerializer(likes, many=True)
    return Response(data={
        "success": True,
        "data": serializer.data,
        "count": likes.count()
    }, status=status.HTTP_200_OK)
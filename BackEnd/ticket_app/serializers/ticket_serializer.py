from rest_framework import serializers
from ticket_app.models import Ticket
from django.utils import timezone
from .user_serializer import UserSerializer
from .comment_serializer import CommentRetrieveSerializer
from .attachment_serializer import AttachmentSerializer
from django.core.validators import FileExtensionValidator
from ticket_app.validators.file_validators import validate_file_size

class TicketCreateSerializer(serializers.ModelSerializer):
    # file = AttachmentSerializer(required=False)
    author = UserSerializer(read_only=True)
    file = serializers.FileField(required=False, validators=[FileExtensionValidator(['png','jpeg','jpg','pdf','txt']), validate_file_size])
    class Meta:
        model = Ticket
        fields = 'id','title','description','priority','file','author'
        read_only_fields = 'id',
        extra_kwargs = {
            'file': {'many': True},
        }

    def validate_priority(self, value):
        if not value:
            return 'basse'
        return value
    
    def create(self, validated_data):
        file = None
        if 'file' in validated_data:
            file = validated_data.pop('file')
        obj = super().create(validated_data)
        if file is not None:
            obj.attachments.create(file=file, title=file.name)
        return obj

class TicketRetrieveSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    developer = UserSerializer(read_only=True)
    comments = CommentRetrieveSerializer(many=True, read_only=True)
    class Meta:
        model = Ticket
        fields = "__all__"
        extra_kwargs = {
            'created_at': {
                # 'format': '%Y',
                # 'length': 10,
                'read_only': True
            },
            'closed_at': {
                'read_only': True
            },
        }
        read_only_fields = 'status','updated_at',

class TicketStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = '__all__'
        read_only_fields = 'title','description','priority','author','developer','created_at','updated_at','closed_at',

    def update(self, instance, validated_data):
        # ['resolved', 'closed']
        if 'status' in validated_data and validated_data['status'] in ['resolved'] and not instance.closed_at:
            instance.closed_at = timezone.now()
        elif instance.closed_at:
            instance.closed_at = None
        return super().update(instance, validated_data)

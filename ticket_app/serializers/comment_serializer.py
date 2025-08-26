from rest_framework import serializers
from ticket_app.models import Comment, Attachment
from .attachment_serializer import AttachmentSerializer
from .user_serializer import UserSerializer
from django.core.validators import FileExtensionValidator
from ticket_app.validators.file_validators import validate_file_size

class CommentRetrieveSerializer(serializers.ModelSerializer):
    # author = UserSerializer()
    attachments = AttachmentSerializer(many=True)
    class Meta:
        model = Comment
        fields = "__all__"
        read_only_fields = 'created_at',

class CommentCreateSerializer(serializers.ModelSerializer):
    file = serializers.FileField(required=False, validators=[FileExtensionValidator(['png','jpg','jpeg']), validate_file_size])
    attachment = AttachmentSerializer(read_only=True)
    class Meta:
        model = Comment
        fields = 'content','ticket','file','attachment'
        read_only_fields = 'created_at','ticket','author',

    def create(self, validated_data):
        file_obj = None
        if 'file' in validated_data:
            file_obj = validated_data.pop('file')

        obj = super().create(validated_data)

        if file_obj is not None:
            obj.attachments.create(file=file_obj, title=file_obj.name)

        return obj


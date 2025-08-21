from rest_framework import serializers
from ..models.comment import Comment
from ..models.attachment import Attachment
from ticket_app.serializers.attachment_serializer import AttachmentSerializer

class CommentSerializer(serializers.ModelSerializer):
    author_info = serializers.SerializerMethodField()
    attachments = AttachmentSerializer(many=True, required=False)

    class Meta:
        model = Comment
        fields = [
            'id', 'content', 'created_at', 'ticket', 'author', 'author_info', 'attachments'
        ]
        read_only_fields = ['created_at', 'author', 'ticket']

    def get_author_info(self, obj):
        return {
            'id': obj.author.id,
            'fullname': obj.author.fullname,
            'role': obj.author.role.title if obj.author.role else None
        }

    def create(self, validated_data):
        attachments_data = validated_data.pop('attachments', [])
        validated_data['author'] = self.context['request'].user
        comment = super().create(validated_data)

        for attachment_data in attachments_data:
            Attachment.objects.create(comment=comment, **attachment_data)

        return comment

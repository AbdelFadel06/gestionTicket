from rest_framework import serializers
from ..models.comment import Comment

class CommentSerializer(serializers.ModelSerializer):
    author_info = serializers.SerializerMethodField()
    class Meta:
        model = Comment
        fields = [
            'id', 'content', 'created_at',
            'ticket', 'author', 'author_info'
        ]
        read_only_fields = ['created_at', 'author', 'ticket']

    def get_author_info(self, obj):
        return {
            'id': obj.author.id,
            'fullname': obj.author.fullname,
            'role': obj.author.role.title if obj.author.role else None
        }

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

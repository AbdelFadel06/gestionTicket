from rest_framework import serializers
from ..models.attachment import Attachment


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = '__all__'
        read_only_fields = ['uploaded_at']

    def validate_file(self, value):
        if value.size > 10 * 1024 * 1024:  # 10MB max
            raise serializers.ValidationError(
                "La taille du fichier ne doit pas dépasser 10MB."
            )
        return value

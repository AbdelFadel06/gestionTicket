from rest_framework import serializers
from ticket_app.models import Comment, Attachment
from .attachment_serializer import AttachmentSerializer
from .user_serializer import UserSerializer
from django.core.validators import FileExtensionValidator
from ticket_app.validators.file_validators import validate_file_size


class CommentRetrieveSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Comment
        fields = "__all__"
        read_only_fields = ("created_at",)


class CommentCreateSerializer(serializers.ModelSerializer):
    file = serializers.FileField(
        required=False,
        validators=[
            FileExtensionValidator(["png", "jpg", "jpeg"]),
            validate_file_size,
        ],
    )
    attachment = AttachmentSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ("content", "ticket", "file", "attachment")
        read_only_fields = ("created_at", "ticket", "author")

    def create(self, validated_data):
        file_obj = validated_data.pop("file", None)

        # Création du commentaire sans le fichier
        obj = super().create(validated_data)

        # Si un fichier a été fourni, on crée une pièce jointe
        if file_obj is not None:
            obj.attachments.create(file=file_obj, title=file_obj.name)

        return obj

    def to_representation(self, instance):
        """
        Après création, on renvoie la même structure que CommentRetrieveSerializer
        pour que le frontend reçoive author + attachments complets.
        """
        return CommentRetrieveSerializer(instance, context=self.context).data

from rest_framework import serializers
from ..models.ticket import Ticket
from ..models.attachment import Attachment
from ticket_app.serializers.attachment_serializer import AttachmentSerializer

class TicketSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    attachments = AttachmentSerializer(many=True, required=False)

    class Meta:
        model = Ticket
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'closed_at', 'client']

    def validate(self, data):
        user = self.context['request'].user

        if user.is_superuser:
          return data


        if user.role.title == 'client' and data.get('developer') is not None:
            raise serializers.ValidationError(
                "Seuls les administrateurs peuvent assigner un développeur."
            )

        developer = data.get('developer')
        if developer is not None:
            role_title = getattr(developer.role, 'title', None)
            if role_title != 'developer':
                raise serializers.ValidationError(
                    "Le développeur assigné doit avoir le rôle 'developer'."
                )

        return data

    def create(self, validated_data):
        attachments_data = validated_data.pop('attachments', [])
        validated_data['client'] = self.context['request'].user

        if validated_data['client'].role.title == 'client':
            validated_data['developer'] = None

        ticket = super().create(validated_data)

        for attachment_data in attachments_data:
            Attachment.objects.create(ticket=ticket, **attachment_data)

        return ticket

    def update(self, instance, validated_data):
        user = self.context['request'].user

        if user.role.title == 'client':
            validated_data['developer'] = None

        developer = validated_data.get('developer')
        if developer is not None:
            role_title = getattr(developer.role, 'title', None)
            if role_title != 'developer':
                raise serializers.ValidationError(
                    "Le développeur assigné doit avoir le rôle 'developer'."
                )

        return super().update(instance, validated_data)

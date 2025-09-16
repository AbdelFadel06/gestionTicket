from rest_framework import serializers
from ticket_app.models.user import User

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile_picture', 'full_name']
        extra_kwargs = {
            'password': {'write_only': True},
            'username': {'read_only': True},  # Empêche la modification du username
            'email': {'read_only': True},     # Empêche la modification de l'email
        }

    def get_full_name(self, obj):
        return obj.get_full_name()

    def update(self, instance, validated_data):
        # Logique personnalisée si nécessaire avant la mise à jour
        return super().update(instance, validated_data)

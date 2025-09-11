from rest_framework import serializers
from ticket_app.models.user import User
from django.contrib.auth.password_validation import validate_password
from django.utils.translation import gettext as _
from django.core.exceptions import ValidationError

class UserRegisterSerializer(serializers.ModelSerializer):
    confirmation = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'password', 'confirmation']
        extra_kwargs = {
            'password': {'write_only': True},
            'first_name': {'required': False, 'allow_blank': True},
            'last_name': {'required': False, 'allow_blank': True},
        }

    def create(self, validated_data):
        # Extraire la confirmation avant de créer l'utilisateur
        confirmation = validated_data.pop('confirmation')
        password = validated_data.pop('password')

        # Créer l'utilisateur
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        return user

    def validate(self, data):
        # Validation de la correspondance des mots de passe
        if data['password'] != data['confirmation']:
            raise serializers.ValidationError({'password': _('Les mots de passe ne correspondent pas.')})

        # Validation de la force du mot de passe
        try:
            validate_password(password=data['password'], user=None)
        except ValidationError as e:
            raise serializers.ValidationError({'password': e.messages})

        return data

from rest_framework import serializers
from ticket_app.models import *
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.utils.translation import gettext as _
from django.core.exceptions import ValidationError

User = get_user_model()

class UserRegisterSerializer(serializers.ModelSerializer):
    confirmation = serializers.CharField(write_only=True)
    full_name=serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = 'id','username', 'first_name', 'last_name', 'email', 'password', 'confirmation','full_name',
        extra_kwargs={
            'password': {'write_only': True},
        }

    def get_full_name(self, obj):
        return obj.get_full_name()

    def create(self, validated_data):
        password = validated_data.pop('password')
        confirmation = validated_data.pop('confirmation')
        user = User.objects.create_user(password=password, **validated_data)
        return user

    def validate(self, data):
        if data['password'] != data['confirmation']:
            raise serializers.ValidationError({'password': _('Mot de passe non conforme.')})
        try:
            validate_password(password=data['password'], user=None)
        except ValidationError as e:
            raise serializers.ValidationError({'password': e.messages})
        return data

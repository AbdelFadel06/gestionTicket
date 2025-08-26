from rest_framework import serializers
from ticket_app.models.user import  User
from django.contrib.auth.password_validation import validate_password
from django.utils.translation import gettext as _
from django.core.exceptions import ValidationError

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="get_full_name", read_only=True, required=False)
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'email', 'profile_picture', 'full_name']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

    def get_full_name(self, obj):
        return obj.get_full_name()


from rest_framework import serializers
from ticket_app.models.user import User

class UserMeSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile_picture', 'role']

    def get_role(self, obj):
        return obj.get_profile() 

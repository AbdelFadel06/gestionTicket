from rest_framework import serializers
from ticket_app.models import Like
from ticket_app.serializers import UserSerializer

class LikeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Like
        fields = "__all__"

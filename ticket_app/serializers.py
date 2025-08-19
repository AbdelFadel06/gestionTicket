from rest_framework import serializers
from .models import Role, User, Ticket, Comment, Attachment

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'fullname', 'email', 'role', 'profile_picture']
        extra_kwargs = {'password': {'write_only': True}}


    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            fullname=validated_data['fullname']
        )
        return user

# class TicketSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(
        source='get_status_display', 
        read_only=True
    )
    priority_display = serializers.CharField(
        source='get_priority_display', 
        read_only=True
    )
    class Meta:
        model = Ticket
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'closed_at', 'client']

    def validate(self, data):
        user = self.context['request'].user
        
        if user.role.title == 'client' and 'developer' in data:
            raise serializers.ValidationError(
                "Seuls les administrateurs peuvent assigner un développeur."
            )
        
        return data
    
    def create(self, validated_data):
        validated_data['client'] = self.context['request'].user
        return super().create(validated_data)


class TicketSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(
        source='get_status_display', 
        read_only=True
    )
    priority_display = serializers.CharField(
        source='get_priority_display', 
        read_only=True
    )
    
    class Meta:
        model = Ticket
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'closed_at', 'client']

    def validate(self, data):
        user = self.context['request'].user

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
        validated_data['client'] = self.context['request'].user
        
        if validated_data['client'].role.title == 'client':
            validated_data['developer'] = None
        
        return super().create(validated_data)
    
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
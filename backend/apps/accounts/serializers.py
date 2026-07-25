from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Role

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.name', read_only=True)
    user_type = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'phone_number', 'department', 'role', 'role_name', 'user_type']
        read_only_fields = ['id', 'date_joined']

    def validate_username(self, value):
        # Clean username: strip spaces, replace spaces with underscores, lowercase
        value = value.strip().replace(' ', '_').lower()
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        # Remove user_type (not a model field)
        user_type = validated_data.pop('user_type', None)
        # Determine role: if user_type is provided, use it; otherwise default to 'student'
        role_name = user_type if user_type else 'student'
        role, _ = Role.objects.get_or_create(name=role_name)
        validated_data['role'] = role
        return super().create(validated_data)

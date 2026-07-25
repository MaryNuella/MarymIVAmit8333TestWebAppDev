from rest_framework import serializers
from .models import ServiceRequest, Category, StatusUpdate

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class StatusUpdateSerializer(serializers.ModelSerializer):
    updated_by_name = serializers.CharField(source='updated_by.username', read_only=True)

    class Meta:
        model = StatusUpdate
        fields = ['id', 'request', 'status', 'notes', 'updated_by', 'updated_by_name', 'created_at']
        read_only_fields = ['id', 'request', 'updated_by', 'created_at']

class ServiceRequestSerializer(serializers.ModelSerializer):
    requester_name = serializers.CharField(source='requester.username', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    status_updates = StatusUpdateSerializer(many=True, read_only=True)
    
    class Meta:
        model = ServiceRequest
        fields = '__all__'
        read_only_fields = ['id', 'requester', 'created_at', 'updated_at', 'completed_at']
